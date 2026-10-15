# ── Existing resources ───────────────────────────────────────────────────────
# Created by hand before Terraform. They are only read here (data sources), so
# Terraform never changes or deletes them.

data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}

data "azurerm_cognitive_account" "form_recognizer" {
  name                = var.form_recognizer.name
  resource_group_name = var.form_recognizer.resource_group_name
}

data "azurerm_cognitive_account" "ai_services" {
  name                = var.ai_services.name
  resource_group_name = var.ai_services.resource_group_name
}

locals {
  video_container = "padel-videos"
  analysis_queue  = "padel-video-analysis"
}

# ── Video storage ────────────────────────────────────────────────────────────
# Videos filmed with the app are uploaded straight to the container with
# short-lived SAS links made by the website. New videos are kept in the hot
# tier, where watching is cheapest. Videos nobody watches move to cool and
# later cold, both of which can still be watched right away. Archive is never
# used, since an archived video has to be restored for hours before playing.

resource "random_string" "storage_suffix" {
  length  = 6
  upper   = false
  special = false
}

resource "azurerm_storage_account" "videos" {
  name                            = "st${var.project}vid${random_string.storage_suffix.result}"
  resource_group_name             = data.azurerm_resource_group.main.name
  location                        = data.azurerm_resource_group.main.location
  account_kind                    = "StorageV2"
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  access_tier                     = "Hot"
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false

  blob_properties {
    # Needed to move videos by when they were last watched
    last_access_time_enabled = true

    # Deleted videos can be restored for a week
    delete_retention_policy {
      days = 7
    }

    # The website uploads videos straight from the browser
    cors_rule {
      allowed_origins    = concat([var.app_url], var.extra_upload_origins)
      allowed_methods    = ["GET", "HEAD", "PUT", "OPTIONS"]
      allowed_headers    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }
}

resource "azurerm_storage_container" "videos" {
  name                  = local.video_container
  storage_account_id    = azurerm_storage_account.videos.id
  container_access_type = "private"
}

resource "azurerm_storage_queue" "analysis" {
  name                 = local.analysis_queue
  storage_account_name = azurerm_storage_account.videos.name
}

resource "azurerm_storage_management_policy" "videos" {
  storage_account_id = azurerm_storage_account.videos.id

  rule {
    name    = "videos-by-last-watched"
    enabled = true

    filters {
      blob_types   = ["blockBlob"]
      prefix_match = ["${local.video_container}/videos/"]
    }

    actions {
      base_blob {
        tier_to_cool_after_days_since_last_access_time_greater_than = var.video_cool_after_days
        auto_tier_to_hot_from_cool_enabled                          = true
        tier_to_cold_after_days_since_last_access_time_greater_than = var.video_cold_after_days
      }
    }
  }

  rule {
    name    = "analysis-files"
    enabled = true

    filters {
      blob_types   = ["blockBlob"]
      prefix_match = ["${local.video_container}/analysis/"]
    }

    actions {
      base_blob {
        tier_to_cool_after_days_since_modification_greater_than = var.video_cool_after_days
      }
    }
  }
}

# ── Analysis trigger ─────────────────────────────────────────────────────────
# Every uploaded video puts a message in the queue, which starts the analyzer.

resource "azurerm_eventgrid_system_topic" "videos" {
  name                = "evgt-${var.project}-videos"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  source_resource_id  = azurerm_storage_account.videos.id
  topic_type          = "Microsoft.Storage.StorageAccounts"
}

resource "azurerm_eventgrid_system_topic_event_subscription" "video_uploaded" {
  name                = "video-uploaded"
  system_topic        = azurerm_eventgrid_system_topic.videos.name
  resource_group_name = data.azurerm_resource_group.main.name

  included_event_types = ["Microsoft.Storage.BlobCreated"]

  subject_filter {
    subject_begins_with = "/blobServices/default/containers/${local.video_container}/blobs/videos/"
  }

  storage_queue_endpoint {
    storage_account_id = azurerm_storage_account.videos.id
    queue_name         = azurerm_storage_queue.analysis.name
  }
}

# ── Analyzer ─────────────────────────────────────────────────────────────────
# A Container Apps job that runs when there are messages in the queue, and
# costs nothing while the queue is empty. See /analyzer.

resource "random_password" "analyzer_secret" {
  length  = 48
  special = false
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-${var.project}"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${var.project}"
  resource_group_name        = data.azurerm_resource_group.main.name
  location                   = data.azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
}

resource "azurerm_container_app_job" "analyzer" {
  name                         = "caj-${var.project}-analyzer"
  resource_group_name          = data.azurerm_resource_group.main.name
  location                     = data.azurerm_resource_group.main.location
  container_app_environment_id = azurerm_container_app_environment.main.id

  # Long videos take a while. A failed run is tried again from the queue.
  replica_timeout_in_seconds = 6 * 60 * 60
  replica_retry_limit        = 0

  event_trigger_config {
    parallelism              = 1
    replica_completion_count = 1

    scale {
      min_executions              = 0
      max_executions              = 3
      polling_interval_in_seconds = 30

      rules {
        name             = "analysis-queue"
        custom_rule_type = "azure-queue"
        metadata = {
          accountName = azurerm_storage_account.videos.name
          queueName   = azurerm_storage_queue.analysis.name
          queueLength = "1"
        }
        authentication {
          secret_name       = "storage-connection-string"
          trigger_parameter = "connection"
        }
      }
    }
  }

  secret {
    name  = "storage-connection-string"
    value = azurerm_storage_account.videos.primary_connection_string
  }

  secret {
    name  = "analyzer-secret"
    value = random_password.analyzer_secret.result
  }

  dynamic "secret" {
    for_each = var.github_pat == "" ? [] : [1]
    content {
      name  = "ghcr-pat"
      value = var.github_pat
    }
  }

  dynamic "registry" {
    for_each = var.github_pat == "" ? [] : [1]
    content {
      server               = "ghcr.io"
      username             = var.github_username
      password_secret_name = "ghcr-pat"
    }
  }

  template {
    container {
      name   = "analyzer"
      image  = var.analyzer_image
      cpu    = 2
      memory = "4Gi"

      env {
        name        = "AZURE_STORAGE_CONNECTION_STRING"
        secret_name = "storage-connection-string"
      }
      env {
        name  = "VIDEO_CONTAINER_NAME"
        value = azurerm_storage_container.videos.name
      }
      env {
        name  = "ANALYSIS_QUEUE_NAME"
        value = azurerm_storage_queue.analysis.name
      }
      env {
        name  = "BRAGSTER_URL"
        value = var.app_url
      }
      env {
        name        = "PADEL_ANALYZER_SECRET"
        secret_name = "analyzer-secret"
      }
    }
  }
}

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "bragsterrgbackend"
    storage_account_name = "bragstersabackend"
    container_name       = "tfstate"
    key                  = "backend.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg_backend" {
  name     = var.backend_rg_name
  location = var.backend_rg_location
}

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "kv_backend" {
  name                        = var.backend_kv_name
  location                    = azurerm_resource_group.rg_backend.location
  resource_group_name         = azurerm_resource_group.rg_backend.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  sku_name                    = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get",
      "List",
      "Create",
    ]

    secret_permissions = [
      "Get",
      "List",
      "Set",
    ]

    storage_permissions = [
      "Get",
      "List",
      "Set",
    ]
  }
}

resource "azurerm_key_vault_secret" "sa_backend_access_key" {
  name         = var.sa_backend_access_key_name
  value        = azurerm_storage_account.sa_backend.primary_access_key
  key_vault_id = azurerm_key_vault.kv_backend.id
}

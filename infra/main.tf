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

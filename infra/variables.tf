variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "project" {
  description = "Short project name used in resource names (lowercase, no hyphens)"
  type        = string
  default     = "bragster"
}

variable "resource_group_name" {
  description = "The existing resource group the app's Azure services live in"
  type        = string
  default     = "Bragster"
}

# ── Existing services ────────────────────────────────────────────────────────
# Already used by the app. Terraform only reads them, it never changes them.

variable "form_recognizer" {
  description = "The Document Intelligence (Form Recognizer) account that scans receipts"
  type = object({
    name                = string
    resource_group_name = string
  })
  default = {
    name                = "bragster-dc-123"
    resource_group_name = "Bragster"
  }
}

variable "ai_services" {
  description = "The AI Services account with the OpenAI model that reads receipts"
  type = object({
    name                = string
    resource_group_name = string
  })
  default = {
    name                = "brage-mfmrm8yx-eastus2"
    resource_group_name = "Bragster"
  }
}

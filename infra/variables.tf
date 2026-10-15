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

# ── Padel videos ─────────────────────────────────────────────────────────────

variable "app_url" {
  description = "The public URL of the website, which the analyzer reports to"
  type        = string
  default     = "https://bragster.vercel.app"
}

variable "extra_upload_origins" {
  description = "More websites that may upload videos from the browser, like http://localhost:3000 for local development"
  type        = list(string)
  default     = []
}

variable "video_cool_after_days" {
  description = "Videos nobody has watched for this many days move to the cool tier. Watching one moves it back to hot."
  type        = number
  default     = 30
}

variable "video_cold_after_days" {
  description = "Videos nobody has watched for this many days move to the cold tier, the cheapest tier that can still be watched right away. Null keeps them in cool."
  type        = number
  default     = 180
  nullable    = true
}

variable "analyzer_image" {
  description = "The analyzer container image, built by .github/workflows/analyzer.yml"
  type        = string
  default     = "ghcr.io/terbau/bragster/analyzer:latest"
}

variable "github_username" {
  description = "GitHub username (lowercase), to pull a private analyzer image from ghcr.io. Leave empty when the image is public."
  type        = string
  default     = ""
}

variable "github_pat" {
  description = "GitHub PAT with read:packages, to pull a private analyzer image from ghcr.io. Leave empty when the image is public."
  type        = string
  default     = ""
  sensitive   = true
}

# Environment variables for the website (Vercel and ../.env). Show them with
#   terraform output -json website_env

output "website_env" {
  description = "Environment variables for the website"
  sensitive   = true
  value = {
    # Existing services
    AZURE_FORM_RECOGNIZER_ENDPOINT = data.azurerm_cognitive_account.form_recognizer.endpoint
    AZURE_AI_SERVICES_KEY          = data.azurerm_cognitive_account.form_recognizer.primary_access_key
    AZURE_AI_SERVICES_ENDPOINT     = "${trimsuffix(data.azurerm_cognitive_account.ai_services.endpoint, "/")}/openai/v1/"
    AZURE_AI_SERVICES_API_KEY      = data.azurerm_cognitive_account.ai_services.primary_access_key
  }
}

output "form_recognizer_endpoint" {
  description = "Endpoint of the existing Document Intelligence account"
  value       = data.azurerm_cognitive_account.form_recognizer.endpoint
}

output "ai_services_endpoint" {
  description = "Endpoint of the existing AI Services account"
  value       = data.azurerm_cognitive_account.ai_services.endpoint
}

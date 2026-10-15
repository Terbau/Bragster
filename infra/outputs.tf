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

    # Padel videos
    AZURE_STORAGE_CONNECTION_STRING = azurerm_storage_account.videos.primary_connection_string
    PADEL_VIDEO_CONTAINER           = azurerm_storage_container.videos.name
    PADEL_ANALYSIS_QUEUE            = azurerm_storage_queue.analysis.name
    PADEL_ANALYZER_SECRET           = random_password.analyzer_secret.result
  }
}

output "video_storage_account_name" {
  description = "Storage account with the padel videos"
  value       = azurerm_storage_account.videos.name
}

output "analyzer_job_name" {
  description = "Container Apps job that analyses the videos"
  value       = azurerm_container_app_job.analyzer.name
}

output "form_recognizer_endpoint" {
  description = "Endpoint of the existing Document Intelligence account"
  value       = data.azurerm_cognitive_account.form_recognizer.endpoint
}

output "ai_services_endpoint" {
  description = "Endpoint of the existing AI Services account"
  value       = data.azurerm_cognitive_account.ai_services.endpoint
}

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.0.0"
    }
  }
  
  backend "azurerm" {
    resource_group_name  = "bragebauoppg2rgbackend"
    storage_account_name = "bragebauoppg2sabackend"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}


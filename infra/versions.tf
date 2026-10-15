terraform {
  required_version = ">= 1.7"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Remote state. Bootstrap the storage account once (see README), then:
  #   terraform init -backend-config="storage_account_name=stbragstertfstate"
  backend "azurerm" {
    resource_group_name = "rg-bragster-tfstate"
    container_name      = "tfstate"
    key                 = "bragster.tfstate"
    # storage_account_name supplied via -backend-config
  }
}

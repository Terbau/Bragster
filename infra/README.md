# Infrastructure (Terraform)

Azure resources for Bragster, all in the existing `Bragster` resource group.

| Resource | Name | Managed by Terraform |
|---|---|---|
| Document Intelligence (receipt scanning) | `bragster-dc-123` | No, only read |
| AI Services (OpenAI model for receipts) | `brage-mfmrm8yx-eastus2` | No, only read |

Both are data sources: Terraform reads their endpoints and keys for the
outputs, and never changes or deletes them.

The padel video resources (storage account `stbragstervid<random>`, Event
Grid topic, Container Apps job and environment, Log Analytics workspace) were
removed from the configuration. The next `terraform apply` deletes them.

## Bootstrap (once)

Create the remote-state storage account (one-time, manual):

```bash
az group create --name rg-bragster-tfstate --location westeurope

az storage account create \
  --name stbragstertfstate \
  --resource-group rg-bragster-tfstate \
  --location westeurope \
  --sku Standard_LRS

az storage container create \
  --name tfstate \
  --account-name stbragstertfstate
```

## Deploy

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Fill in subscription_id:  az account show --query id -o tsv

terraform init -backend-config="storage_account_name=stbragstertfstate"
terraform plan
terraform apply
```

## Website environment variables

```bash
terraform output -json website_env
```

| Variable | What |
|---|---|
| `AZURE_FORM_RECOGNIZER_ENDPOINT`, `AZURE_AI_SERVICES_KEY` | Receipt scanning |
| `AZURE_AI_SERVICES_ENDPOINT`, `AZURE_AI_SERVICES_API_KEY` | Reading receipts |

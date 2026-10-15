# Infrastructure (Terraform)

Azure resources for Bragster, all in the existing `Bragster` resource group.

| Resource | Name | Managed by Terraform |
|---|---|---|
| Document Intelligence (receipt scanning) | `bragster-dc-123` | No, only read |
| AI Services (OpenAI model for receipts) | `brage-mfmrm8yx-eastus2` | No, only read |
| Storage account for padel videos | `stbragstervid<random>` | Yes |
| Blob container / queue | `padel-videos` / `padel-video-analysis` | Yes |
| Event Grid system topic + subscription | `evgt-bragster-videos` | Yes |
| Log Analytics + Container Apps environment | `log-bragster`, `cae-bragster` | Yes |
| Container Apps job (video analyzer) | `caj-bragster-analyzer` | Yes |

The two existing AI services are data sources: Terraform reads their
endpoints and keys for the outputs, and never changes or deletes them.

## How padel videos flow

1. The app films a match, or someone picks a video in the app or on the
   website, and asks the website for an upload link (a SAS link valid for 48
   hours, for that one blob).
2. The video is uploaded straight to `padel-videos/videos/<game>/<id>.mp4`:
   from the app in a background upload session, and from the website in
   blocks. Browser uploads are allowed from `app_url` and
   `extra_upload_origins` (CORS).
3. Event Grid puts a message in `padel-video-analysis` for every new video.
4. The queue starts the analyzer job (see `../analyzer`), which reads the
   video straight from storage, finds the rallies and posts them to `<app_url>/api/padel/video-analysis`, signed with
   `PADEL_ANALYZER_SECRET`.
5. The website and the app play videos with read links that last 6 hours.

### Storage tiers

New videos are **hot**, where watching is cheapest. A video nobody has
watched for 30 days moves to **cool**, and back to hot when someone watches
it. After 180 days unwatched it moves to **cold**. Cool and cold videos still
play right away, but reading them costs a little more. **Archive** is never
used, since an archived video has to be restored for hours before it plays.
Change the days with `video_cool_after_days` and `video_cold_after_days`
(null keeps videos in cool).

Deleted videos can be restored for 7 days (blob soft delete).

### Rough costs

A 90 minute match is about 3.4 GB (1080p at 5 Mbit/s). In West Europe with
LRS, that is roughly $0.07 per month while hot, half that in cool, and less
again in cold. The analyzer, Event Grid and Log Analytics fit within the free
monthly grants at this scale. Watching videos counts as outbound traffic, of
which the first 100 GB per month are free. Prices change, so check the Azure
pricing calculator.

## Bootstrap (once)

The resource providers (`Microsoft.Storage`, `Microsoft.EventGrid`,
`Microsoft.App`, `Microsoft.OperationalInsights`) are already registered in
the subscription. Terraform doesn't manage them, since other projects share
them.

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

The analyzer image is built by `.github/workflows/analyzer.yml` when
`analyzer/` changes on `main`, and pushed to
`ghcr.io/terbau/bragster/analyzer`. Either make that package public on GitHub
(Packages → analyzer → Package settings → Change visibility), or set
`github_username` and `github_pat` (a PAT with `read:packages`) in
`terraform.tfvars`.

## After apply

Add the website's environment variables, in Vercel and in `../.env`:

```bash
terraform output -json website_env
```

| Variable | What |
|---|---|
| `AZURE_STORAGE_CONNECTION_STRING` | Video storage. Without it, the video features are hidden. |
| `PADEL_VIDEO_CONTAINER`, `PADEL_ANALYSIS_QUEUE` | Defaults are `padel-videos` and `padel-video-analysis` |
| `PADEL_ANALYZER_SECRET` | Shared with the analyzer job |
| `AZURE_FORM_RECOGNIZER_ENDPOINT`, `AZURE_AI_SERVICES_KEY` | Existing, unchanged |
| `AZURE_AI_SERVICES_ENDPOINT`, `AZURE_AI_SERVICES_API_KEY` | Existing, unchanged |

Redeploy the website after adding them.

## Useful commands

```bash
# Runs of the analyzer, and their logs
az containerapp job execution list -n caj-bragster-analyzer -g Bragster -o table
az monitor log-analytics query -w <workspace id> \
  --analytics-query "ContainerAppConsoleLogs_CL | where ContainerJobName_s == 'caj-bragster-analyzer' | order by TimeGenerated desc | take 50"
```

To run a specific analyzer build instead of `:latest`, set
`analyzer_image = "ghcr.io/terbau/bragster/analyzer:<git sha>"` in
`terraform.tfvars` and apply.

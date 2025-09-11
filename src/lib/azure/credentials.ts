import { AzureKeyCredential } from "@azure/ai-form-recognizer";

export const createAzureCredentials = (): AzureKeyCredential => {
  const key = process.env.AZURE_AI_SERVICES_KEY;

  if (!key) {
    throw new Error("Missing Azure credentials in environment variables");
  }

  return new AzureKeyCredential(key);
};

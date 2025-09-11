import {
  type AnalyzedDocument,
  type AnalyzeResult,
  type AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";

export const AzureFormServicesModel = {
  PREBUILT_RECEIPT: "prebuilt-receipt",
} as const;

export const createDocumentAnalysisClient = (
  credential: AzureKeyCredential,
): DocumentAnalysisClient => {
  const formRecognizerEndpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;

  if (!formRecognizerEndpoint) {
    throw new Error(
      "Azure form recognizer endpoint not found in env variables",
    );
  }

  return new DocumentAnalysisClient(formRecognizerEndpoint, credential);
};

export const analyzeDocument = async (
  client: DocumentAnalysisClient,
  model: (typeof AzureFormServicesModel)[keyof typeof AzureFormServicesModel],
  file: File,
): Promise<AnalyzeResult<AnalyzedDocument>> => {
  const poller = await client.beginAnalyzeDocument(
    model,
    Buffer.from(await file.arrayBuffer()),
  );
  return await poller.pollUntilDone();
};

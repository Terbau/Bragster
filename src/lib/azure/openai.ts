import { OpenAI } from "openai";

export const OPENAI_MODEL_NAME = process.env.AZURE_OPENAI_MODEL ?? "gpt-5-mini";

const globalForOpenAI = globalThis as unknown as {
  openAI: OpenAI | undefined;
};

export const openAI =
  globalForOpenAI.openAI ??
  new OpenAI({
    baseURL: process.env.AZURE_AI_SERVICES_ENDPOINT,
    apiKey: process.env.AZURE_AI_SERVICES_API_KEY,
    // apiVersion: process.env.AZURE_OPENAI_VERSION,
    // deployment: process.env.AZURE_OPENAI_MODEL,
  });

if (process.env.NODE_ENV !== "production") globalForOpenAI.openAI = openAI;

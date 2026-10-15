import {
  BlobSASPermissions,
  BlobServiceClient,
  type ContainerClient,
} from "@azure/storage-blob";
import { QueueClient } from "@azure/storage-queue";

// Padel videos are kept in Azure Blob Storage, see /infra. Without a
// connection string the video features are turned off.

const VIDEO_CONTAINER = process.env.PADEL_VIDEO_CONTAINER ?? "padel-videos";
const ANALYSIS_QUEUE =
  process.env.PADEL_ANALYSIS_QUEUE ?? "padel-video-analysis";
const HOUR = 60 * 60 * 1000;

export const isVideoStorageEnabled = () =>
  Boolean(process.env.AZURE_STORAGE_CONNECTION_STRING);

const globalForStorage = globalThis as unknown as {
  videoContainer: ContainerClient | undefined;
};

const getContainer = () => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("Video storage isn't set up");
  }
  globalForStorage.videoContainer ??=
    BlobServiceClient.fromConnectionString(connectionString).getContainerClient(
      VIDEO_CONTAINER,
    );
  return globalForStorage.videoContainer;
};

/**
 * Links stay the same for an hour, so a page that refreshes doesn't load the
 * video again, and work for at least `hours` hours after that
 */
const linkExpiry = (hours: number) =>
  new Date((Math.floor(Date.now() / HOUR) + 1 + hours) * HOUR);

export interface VideoUpload {
  url: string;
  method: "PUT";
  headers: Record<string, string>;
}

/**
 * A link the app can upload a video to with a single PUT request. The link's
 * storage version allows single uploads of up to 5000 MiB.
 */
export const createVideoUpload = async (
  blobName: string,
  contentType: string,
): Promise<VideoUpload> => {
  const url = await getContainer()
    .getBlockBlobClient(blobName)
    .generateSasUrl({
      permissions: BlobSASPermissions.from({ create: true, write: true }),
      expiresOn: linkExpiry(48),
    });
  return {
    url,
    method: "PUT",
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": contentType,
      "x-ms-blob-content-type": contentType,
    },
  };
};

/** A link to watch or download a video */
export const createVideoUrl = (blobName: string) =>
  getContainer()
    .getBlobClient(blobName)
    .generateSasUrl({
      permissions: BlobSASPermissions.from({ read: true }),
      expiresOn: linkExpiry(6),
    });

/** The size of an uploaded video in bytes, or null when it isn't there */
export const getVideoSize = async (blobName: string) => {
  try {
    const properties = await getContainer()
      .getBlobClient(blobName)
      .getProperties();
    return properties.contentLength ?? null;
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 404) {
      return null;
    }
    throw error;
  }
};

export const deleteVideoFiles = async (blobNames: string[]) => {
  const container = getContainer();
  await Promise.all(
    blobNames.map((name) => container.getBlobClient(name).deleteIfExists()),
  );
};

/** Asks the analyzer to look at a video, see /analyzer */
export const queueVideoAnalysis = async (blobName: string) => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("Video storage isn't set up");
  }
  await new QueueClient(connectionString, ANALYSIS_QUEUE).sendMessage(
    JSON.stringify({ blobName }),
  );
};

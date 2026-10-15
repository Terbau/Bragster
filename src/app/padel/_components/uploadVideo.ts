// Uploads a video from the browser straight to Azure Blob Storage, in blocks
// of a few megabytes, so videos of any size can be uploaded and a failed
// block is tried again on its own. See src/lib/azure/storage.ts.

const BLOCK_SIZE = 8 * 1024 * 1024;
/** Azure allows at most 50 000 blocks in a blob */
const MAX_BLOCKS = 50_000;
const PARALLEL_UPLOADS = 4;
const ATTEMPTS = 3;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Block ids must all have the same length */
const blockId = (index: number) =>
  btoa(`block-${String(index).padStart(6, "0")}`);

/**
 * Uploads `file` to `uploadUrl`, a link with permission to write one blob.
 * `onProgress` is called with how much has been uploaded, from 0 to 1.
 */
export const uploadVideoInBlocks = async (
  uploadUrl: string,
  file: File,
  {
    contentType,
    onProgress,
    signal,
  }: {
    contentType: string;
    onProgress: (fraction: number) => void;
    signal?: AbortSignal;
  },
) => {
  const blockSize = Math.max(BLOCK_SIZE, Math.ceil(file.size / MAX_BLOCKS));
  const count = Math.max(1, Math.ceil(file.size / blockSize));
  const ids = Array.from({ length: count }, (_, index) => blockId(index));
  const uploaded = new Array<number>(count).fill(0);

  const putBlock = async (index: number) => {
    const block = file.slice(
      index * blockSize,
      Math.min(file.size, (index + 1) * blockSize),
    );
    for (let attempt = 1; ; attempt++) {
      try {
        const response = await fetch(
          `${uploadUrl}&comp=block&blockid=${encodeURIComponent(ids[index])}`,
          { method: "PUT", body: block, signal },
        );
        if (!response.ok) {
          throw new Error(`The upload failed (${response.status})`);
        }
        uploaded[index] = block.size;
        onProgress(
          uploaded.reduce((sum, size) => sum + size, 0) /
            Math.max(1, file.size),
        );
        return;
      } catch (error) {
        if (signal?.aborted || attempt >= ATTEMPTS) throw error;
        await wait(1000 * attempt);
      }
    }
  };

  let next = 0;
  const uploadBlocks = async () => {
    while (next < count) {
      const index = next++;
      await putBlock(index);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(PARALLEL_UPLOADS, count) }, uploadBlocks),
  );

  // Puts the blocks together into the video
  const response = await fetch(`${uploadUrl}&comp=blocklist`, {
    method: "PUT",
    body: `<?xml version="1.0" encoding="utf-8"?><BlockList>${ids
      .map((id) => `<Latest>${id}</Latest>`)
      .join("")}</BlockList>`,
    headers: {
      "Content-Type": "application/xml",
      "x-ms-blob-content-type": contentType,
    },
    signal,
  });
  if (!response.ok) {
    throw new Error(`The upload failed (${response.status})`);
  }
};

/** The length of a video in seconds, or undefined when the browser can't tell */
export const readVideoDuration = (file: File) =>
  new Promise<number | undefined>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const done = (duration?: number) => {
      URL.revokeObjectURL(url);
      resolve(
        duration !== undefined && Number.isFinite(duration)
          ? duration
          : undefined,
      );
    };
    const timer = setTimeout(() => done(), 5000);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      clearTimeout(timer);
      done(video.duration);
    };
    video.onerror = () => {
      clearTimeout(timer);
      done();
    };
    video.src = url;
  });

export const formatFileSize = (bytes: number) =>
  bytes >= 1e9
    ? `${(bytes / 1e9).toFixed(1)} GB`
    : `${Math.max(1, Math.round(bytes / 1e6))} MB`;

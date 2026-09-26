import { API_URL } from "./config";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const NETWORK_ERROR_MESSAGE =
  "Could not reach Bragster. Check your internet connection.";

let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

/** Called when the API rejects the stored token, e.g. when it has expired */
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

export const authHeaders = (): Record<string, string> =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

const parseBody = (text: string): unknown => {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

const toResult = <T>(status: number, text: string): T => {
  const body = parseBody(text);

  if (status >= 200 && status < 300) {
    return body as T;
  }

  if (status === 401 && accessToken) {
    unauthorizedHandler?.();
  }

  const message =
    body && typeof body === "object" && "error" in body
      ? String(body.error)
      : `Request failed (${status})`;
  throw new ApiError(status, message);
};

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | undefined>;
}

export async function api<T>(
  path: string,
  { method = "GET", body, query }: RequestOptions = {},
): Promise<T> {
  const queryString = Object.entries(query ?? {})
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  let response: Response;
  try {
    response = await fetch(
      `${API_URL}${path}${queryString ? `?${queryString}` : ""}`,
      {
        method,
        headers: {
          Accept: "application/json",
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...authHeaders(),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      },
    );
  } catch {
    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  return toResult<T>(response.status, await response.text());
}

/**
 * Uploads an image with multipart form data. Uses XMLHttpRequest since fetch
 * doesn't report upload progress.
 */
export function uploadImage<T>(
  path: string,
  imageUri: string,
  onUploadProgress?: (fraction: number) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${API_URL}${path}`);
    request.setRequestHeader("Accept", "application/json");
    for (const [key, value] of Object.entries(authHeaders())) {
      request.setRequestHeader(key, value);
    }
    request.timeout = 120_000;

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onUploadProgress?.(event.loaded / event.total);
      }
    };
    request.onload = () => {
      try {
        resolve(toResult<T>(request.status, request.responseText));
      } catch (error) {
        reject(error);
      }
    };
    request.onerror = () => reject(new ApiError(0, NETWORK_ERROR_MESSAGE));
    request.ontimeout = () =>
      reject(new ApiError(0, "The request took too long. Please try again."));

    const formData = new FormData();
    // React Native reads the file from the uri when sending
    formData.append("file", {
      uri: imageUri,
      name: "receipt.jpg",
      type: "image/jpeg",
    } as unknown as Blob);
    request.send(formData);
  });
}

export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

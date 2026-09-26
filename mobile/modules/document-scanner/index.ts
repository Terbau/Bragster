import { requireOptionalNativeModule } from "expo";

export type ScanFilter = "original" | "auto" | "grayscale" | "blackwhite";

export interface ProcessOptions {
  filter?: ScanFilter;
  /** Detect the document in the image and crop/straighten it */
  autoCrop?: boolean;
  /** Longest side of the output image in pixels */
  maxDimension?: number;
  /** The output JPEG is compressed/downscaled until it is below this size */
  maxBytes?: number;
}

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  /** Whether a document was detected and the image was cropped to it */
  cropped: boolean;
  /** File size in bytes */
  size: number;
}

interface DocumentScannerNativeModule {
  isAvailable(): boolean;
  scanAsync(): Promise<{ pages: string[] } | null>;
  processAsync(uri: string, options: ProcessOptions): Promise<ProcessedImage>;
}

/** Only available on iOS, `null` elsewhere */
export const DocumentScanner =
  requireOptionalNativeModule<DocumentScannerNativeModule>("DocumentScanner");

import * as DocumentPicker from "expo-document-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import {
  DocumentScanner,
  type ProcessedImage,
  type ScanFilter,
} from "../../modules/document-scanner";

export type { ProcessedImage, ScanFilter };

export type ImageSource = "scanner" | "camera" | "photos" | "files";

export interface PickedImage {
  uri: string;
  source: ImageSource;
  /** The document scanner can capture several pages; only the first is used */
  pageCount: number;
}

/** Live document detection (VisionKit). Available on iOS devices, not in the simulator. */
export const isDocumentScannerAvailable = () =>
  DocumentScanner?.isAvailable() ?? false;

/** Whether images can be cropped and filtered on this device */
export const canEnhanceImages = () => DocumentScanner !== null;

/**
 * Opens the document scanner, which finds the receipt in the camera view,
 * outlines it and captures it (like Adobe Scan). Falls back to the regular
 * camera where the scanner isn't available.
 */
export async function scanWithCamera(): Promise<PickedImage | null> {
  if (DocumentScanner && isDocumentScannerAvailable()) {
    const result = await DocumentScanner.scanAsync();
    const [firstPage] = result?.pages ?? [];
    return firstPage
      ? { uri: firstPage, source: "scanner", pageCount: result?.pages.length ?? 1 }
      : null;
  }

  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Camera access is needed to scan receipts. You can allow it in Settings.");
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 1,
  });
  const asset = result.canceled ? null : result.assets[0];
  return asset ? { uri: asset.uri, source: "camera", pageCount: 1 } : null;
}

export async function pickFromPhotos(): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
  });
  const asset = result.canceled ? null : result.assets[0];
  return asset ? { uri: asset.uri, source: "photos", pageCount: 1 } : null;
}

export async function pickFromFiles(): Promise<PickedImage | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/*"],
    copyToCacheDirectory: true,
  });
  const asset = result.canceled ? null : result.assets[0];
  return asset ? { uri: asset.uri, source: "files", pageCount: 1 } : null;
}

const MAX_DIMENSION = 3500;
// Vercel rejects request bodies above 4.5 MB
const MAX_BYTES = 3_500_000;

/**
 * Crops, enhances and compresses the image into a JPEG that's ready to upload.
 * Also converts formats like HEIC that the website doesn't accept.
 */
export async function prepareImage(
  uri: string,
  options: { filter: ScanFilter; autoCrop: boolean },
): Promise<ProcessedImage> {
  if (DocumentScanner) {
    return DocumentScanner.processAsync(uri, {
      ...options,
      maxDimension: MAX_DIMENSION,
      maxBytes: MAX_BYTES,
    });
  }

  const context = ImageManipulator.manipulate(uri);
  const image = await context.renderAsync();
  const longestSide = Math.max(image.width, image.height);
  const output =
    longestSide > MAX_DIMENSION
      ? await context
          .resize(
            image.width >= image.height
              ? { width: MAX_DIMENSION }
              : { height: MAX_DIMENSION },
          )
          .renderAsync()
      : image;
  const saved = await output.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  return {
    uri: saved.uri,
    width: saved.width,
    height: saved.height,
    cropped: false,
    size: 0,
  };
}

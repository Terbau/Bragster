import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Camera,
  Crop,
  FolderOpen,
  Images,
  type LucideIcon,
  RotateCcw,
  ScanLine,
  Sparkles,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { getErrorMessage, uploadImage } from "@/lib/api";
import { queryKeys } from "@/lib/queries";
import {
  canEnhanceImages,
  type ImageSource,
  isDocumentScannerAvailable,
  type PickedImage,
  pickFromFiles,
  pickFromPhotos,
  prepareImage,
  type ProcessedImage,
  type ScanFilter,
  scanWithCamera,
} from "@/lib/scanner";
import { toast } from "@/lib/toast";
import type { SmartReceiptWithItemsUsers } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: { value: ScanFilter; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "auto", label: "Enhanced" },
  { value: "grayscale", label: "Grayscale" },
  { value: "blackwhite", label: "B&W" },
];

type UploadState =
  | { stage: "idle" }
  | { stage: "uploading"; progress: number }
  | { stage: "analyzing" }
  | { stage: "error"; message: string };

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [filter, setFilter] = useState<ScanFilter>("auto");
  const [autoCrop, setAutoCrop] = useState(true);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upload, setUpload] = useState<UploadState>({ stage: "idle" });
  const processingRun = useRef(0);

  const isUploading = upload.stage === "uploading" || upload.stage === "analyzing";
  const enhancementsAvailable = canEnhanceImages();

  const pick = useCallback(async (source: ImageSource) => {
    try {
      const image =
        source === "photos"
          ? await pickFromPhotos()
          : source === "files"
            ? await pickFromFiles()
            : await scanWithCamera();
      if (!image) {
        return;
      }

      // The document scanner already crops and enhances the page
      setFilter(image.source === "scanner" ? "original" : "auto");
      setAutoCrop(image.source !== "scanner");
      setProcessed(null);
      setUpload({ stage: "idle" });
      setPicked(image);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, []);

  // Re-process the image whenever the source or options change
  useEffect(() => {
    if (!picked) {
      return;
    }
    const run = ++processingRun.current;
    setIsProcessing(true);

    prepareImage(picked.uri, { filter, autoCrop })
      .then((result) => {
        if (run === processingRun.current) {
          setProcessed(result);
        }
      })
      .catch((error) => {
        if (run === processingRun.current) {
          toast.error(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (run === processingRun.current) {
          setIsProcessing(false);
        }
      });
  }, [picked, filter, autoCrop]);

  const handleUpload = async () => {
    if (!processed) {
      return;
    }

    setUpload({ stage: "uploading", progress: 0 });
    try {
      const smartReceipt = await uploadImage<SmartReceiptWithItemsUsers>(
        "/api/mobile/smart-receipts/scan",
        processed.uri,
        (fraction) =>
          setUpload(
            fraction >= 1
              ? { stage: "analyzing" }
              : { stage: "uploading", progress: fraction },
          ),
      );

      void queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
      router.replace({
        pathname: "/smart-receipt/[smartReceiptId]",
        params: { smartReceiptId: smartReceipt.id, setup: "true" },
      });
    } catch (error) {
      setUpload({ stage: "error", message: getErrorMessage(error) });
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          disabled={isUploading}
          onPress={() => router.back()}
          className={cn("h-10 w-10 items-center justify-center rounded-full bg-muted", isUploading && "opacity-40")}
        >
          <Icon as={X} size={20} />
        </Pressable>
        <Text className="text-base font-semibold">
          {picked ? "Review scan" : "Smart Receipt Scanner"}
        </Text>
        <View className="h-10 w-10" />
      </View>

      {!picked ? (
        <SourcePicker onPick={pick} />
      ) : (
        <View className="flex-1" style={{ paddingBottom: insets.bottom + 12 }}>
          <View className="mx-4 mt-2 flex-1 overflow-hidden rounded-2xl bg-muted">
            <Image
              source={{ uri: processed?.uri ?? picked.uri }}
              style={{ flex: 1 }}
              contentFit="contain"
              transition={150}
            />
            {(isProcessing || isUploading) && (
              <View className="absolute inset-0 items-center justify-center bg-background/60">
                {isUploading ? (
                  <UploadProgress upload={upload} />
                ) : (
                  <Spinner size="large" />
                )}
              </View>
            )}
          </View>

          <View className="gap-4 px-4 pt-4">
            {upload.stage === "error" && (
              <Alert variant="destructive" title="Could not scan the receipt">
                {upload.message}
              </Alert>
            )}

            {picked.pageCount > 1 && (
              <Text className="text-center text-xs text-muted-foreground">
                You scanned {picked.pageCount} pages. Only the first page is used.
              </Text>
            )}

            {enhancementsAvailable && (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2"
                >
                  {FILTERS.map((option) => (
                    <Pressable
                      key={option.value}
                      disabled={isUploading}
                      onPress={() => setFilter(option.value)}
                      className={cn(
                        "rounded-full border px-4 py-2",
                        filter === option.value
                          ? "border-primary bg-primary"
                          : "border-border bg-background active:bg-accent",
                      )}
                    >
                      <Text
                        className={cn(
                          "text-sm font-medium",
                          filter === option.value && "text-primary-foreground",
                        )}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {picked.source !== "scanner" && (
                  <View className="flex-row items-center gap-3">
                    <Icon as={Crop} size={18} className="text-muted-foreground" />
                    <View className="flex-1">
                      <Text className="text-sm font-medium">Auto-crop receipt</Text>
                      <Text className="text-xs text-muted-foreground">
                        {autoCrop && processed && !processed.cropped && !isProcessing
                          ? "No receipt edges found, using the whole image."
                          : "Finds the receipt edges and straightens it."}
                      </Text>
                    </View>
                    <Switch
                      value={autoCrop}
                      onValueChange={setAutoCrop}
                      disabled={isUploading}
                    />
                  </View>
                )}
              </>
            )}

            <View className="flex-row gap-3">
              <Button
                variant="outline"
                icon={RotateCcw}
                className="flex-1"
                disabled={isUploading}
                onPress={() => void pick(picked.source)}
              >
                {picked.source === "scanner" || picked.source === "camera"
                  ? "Retake"
                  : "Choose another"}
              </Button>
              <Button
                icon={ScanLine}
                className="flex-1"
                disabled={!processed || isProcessing}
                isLoading={isUploading}
                onPress={handleUpload}
              >
                {upload.stage === "error" ? "Try again" : "Scan"}
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function SourcePicker({ onPick }: { onPick: (source: ImageSource) => void }) {
  const scannerAvailable = isDocumentScannerAvailable();

  return (
    <ScrollView contentContainerClassName="gap-6 px-5 pb-10 pt-4">
      <View className="gap-1.5">
        <Text className="text-2xl font-bold tracking-tight">Scan a receipt</Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          A smart receipt will be created based on the scanned data, so you
          can split it with others.
        </Text>
      </View>

      <View className="gap-3">
        <SourceOption
          icon={Camera}
          title="Scan with camera"
          description={
            scannerAvailable
              ? "Finds the receipt, outlines it and takes the picture automatically. The flash turns on when needed; tap ⚡ in the scanner to override."
              : "Take a photo of the receipt."
          }
          highlighted
          onPress={() => onPick("scanner")}
        />
        <SourceOption
          icon={Images}
          title="Choose from Photos"
          description="Pick a photo from your camera roll."
          onPress={() => onPick("photos")}
        />
        <SourceOption
          icon={FolderOpen}
          title="Choose from Files"
          description="Pick an image from the Files app."
          onPress={() => onPick("files")}
        />
      </View>

      <Alert variant="tip" title="Tip">
        Place the receipt flat on a surface that contrasts with the paper, in
        even light. Imported photos are cropped and enhanced automatically.
      </Alert>
    </ScrollView>
  );
}

function SourceOption({
  icon,
  title,
  description,
  highlighted = false,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  highlighted?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-4 rounded-2xl border p-4 active:opacity-70",
        highlighted ? "border-primary bg-primary" : "border-border bg-card",
      )}
    >
      <View
        className={cn(
          "h-12 w-12 items-center justify-center rounded-xl",
          highlighted ? "bg-primary-foreground/15" : "bg-muted",
        )}
      >
        <Icon
          as={icon}
          size={22}
          className={highlighted ? "text-primary-foreground" : "text-foreground"}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          className={cn(
            "text-base font-semibold",
            highlighted && "text-primary-foreground",
          )}
        >
          {title}
        </Text>
        <Text
          className={cn(
            "text-xs leading-4",
            highlighted ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

function UploadProgress({ upload }: { upload: UploadState }) {
  const isAnalyzing = upload.stage === "analyzing";
  const progress = upload.stage === "uploading" ? upload.progress : 1;

  return (
    <View className="w-64 items-center gap-3 rounded-2xl bg-background px-6 py-5 shadow-lg shadow-black/10">
      <Icon
        as={isAnalyzing ? Sparkles : ScanLine}
        size={22}
        className="text-muted-foreground"
      />
      <Text className="text-center text-sm font-medium">
        {isAnalyzing
          ? "Reading the receipt with AI…"
          : `Uploading… ${Math.round(progress * 100)}%`}
      </Text>
      {isAnalyzing ? <Spinner /> : <Progress value={progress * 100} />}
    </View>
  );
}

import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { authHeaders } from "@/lib/api";
import { API_URL } from "@/lib/config";
import {
  type DraftGroup,
  type EditStatus,
  groupChanges,
  isFieldEdited,
  type ReceiptDraft,
  type ReceiptField,
} from "@/lib/receipt-draft";
import type { ReceiptRegions, RegionRect } from "@/lib/types";
import { cn } from "@/lib/utils";
import { boxClasses } from "./status";

interface ReceiptImageEditorProps {
  receiptId: string;
  regions: ReceiptRegions | null;
  draft: ReceiptDraft;
  original: ReceiptDraft;
  onEditGroup: (key: string, focus?: "description" | "price") => void;
  onEditField: (field: ReceiptField) => void;
}

// Boxes are drawn slightly larger than the text they cover
const PADDING = 3;
const MARGIN = 12;

/** The scanned image with tappable, colored boxes on everything that can be edited */
export function ReceiptImageEditor({
  receiptId,
  regions,
  draft,
  original,
  onEditGroup,
  onEditField,
}: ReceiptImageEditorProps) {
  const [width, setWidth] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  const imageWidth = Math.max(0, width - MARGIN * 2);
  const imageHeight = aspectRatio ? imageWidth / aspectRatio : 0;
  const originals = new Map(original.groups.map((group) => [group.key, group]));

  const box = (key: string, rect: RegionRect, status: EditStatus, onPress: () => void) => (
    <Pressable
      key={key}
      onPress={onPress}
      hitSlop={4}
      className={cn("absolute rounded-sm border", boxClasses[status])}
      style={{
        left: rect.x * imageWidth - PADDING,
        top: rect.y * imageHeight - PADDING,
        width: rect.w * imageWidth + PADDING * 2,
        height: rect.h * imageHeight + PADDING * 2,
      }}
    />
  );

  const fieldBox = (field: ReceiptField, rect: RegionRect | undefined) =>
    rect &&
    box(field, rect, isFieldEdited(draft, original, field) ? "edited" : "unchanged", () =>
      onEditField(field),
    );

  const groupBoxes = (group: DraftGroup) => {
    const scanned = originals.get(group.key);
    const changes = groupChanges(group, scanned);
    const statusFor = (changed: boolean): EditStatus =>
      group.removed ? "removed" : changed ? "edited" : "unchanged";

    return group.regions.flatMap((region, index) => {
      if (region.kind === "supplement") {
        return region.line
          ? [box(`${group.key}-${index}`, region.line, statusFor(changes.supplements), () => onEditGroup(group.key))]
          : [];
      }
      const boxes = [];
      if (region.description) {
        boxes.push(
          box(`${group.key}-${index}-d`, region.description, statusFor(changes.description), () =>
            onEditGroup(group.key, "description"),
          ),
        );
      }
      if (region.price) {
        boxes.push(
          box(
            `${group.key}-${index}-p`,
            region.price,
            statusFor(changes.price || changes.quantity),
            () => onEditGroup(group.key, "price"),
          ),
        );
      }
      if (boxes.length === 0 && region.line) {
        boxes.push(
          box(`${group.key}-${index}-l`, region.line, statusFor(Object.values(changes).some(Boolean)), () =>
            onEditGroup(group.key),
          ),
        );
      }
      return boxes;
    });
  };

  return (
    <View className="flex-1" onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {failed ? (
        <Text className="p-6 text-center text-sm text-muted-foreground">
          Could not load the receipt image. Use the list instead.
        </Text>
      ) : (
        <ScrollView
          maximumZoomScale={5}
          minimumZoomScale={1}
          bouncesZoom
          contentContainerStyle={{ padding: MARGIN }}
        >
          <View
            className="overflow-hidden rounded-lg bg-muted"
            style={{ width: imageWidth, height: imageHeight || imageWidth * 1.6 }}
          >
            {width > 0 && (
              <Image
                source={{
                  uri: `${API_URL}/api/mobile/receipts/${receiptId}/image`,
                  headers: authHeaders(),
                }}
                style={{ width: "100%", height: "100%" }}
                contentFit="fill"
                transition={150}
                onLoad={(event) => setAspectRatio(event.source.width / event.source.height)}
                onError={() => setFailed(true)}
              />
            )}
            {aspectRatio ? (
              <>
                {fieldBox("merchantName", regions?.merchantName)}
                {fieldBox("receiptDate", regions?.date)}
                {fieldBox("totalPrice", regions?.total)}
                {draft.groups.flatMap(groupBoxes)}
              </>
            ) : (
              <View className="absolute inset-0 items-center justify-center">
                <Spinner />
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

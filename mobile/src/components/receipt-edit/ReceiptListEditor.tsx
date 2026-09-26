import { Plus, RotateCcw } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatAmount, formatDate } from "@/lib/format";
import {
  type DraftGroup,
  groupChanges,
  groupStatus,
  isFieldEdited,
  type ReceiptDraft,
  type ReceiptField,
} from "@/lib/receipt-draft";
import { cn } from "@/lib/utils";
import { EditablePill, statusLabel } from "./status";

interface ReceiptListEditorProps {
  draft: ReceiptDraft;
  original: ReceiptDraft;
  onEditGroup: (key: string, focus?: "description" | "price") => void;
  onEditField: (field: ReceiptField) => void;
  onRestoreGroup: (key: string) => void;
  onAddGroup: () => void;
}

/** Every editable value as a list, including the ones that aren't on the image */
export function ReceiptListEditor({
  draft,
  original,
  onEditGroup,
  onEditField,
  onRestoreGroup,
  onAddGroup,
}: ReceiptListEditorProps) {
  const originals = new Map(original.groups.map((group) => [group.key, group]));
  const fieldStatus = (field: ReceiptField) =>
    isFieldEdited(draft, original, field) ? "edited" : "unchanged";

  return (
    <ScrollView contentContainerClassName="gap-6 p-4 pb-10">
      <View className="gap-3 rounded-xl border border-border p-4">
        <Row label="Store">
          <EditablePill status={fieldStatus("merchantName")} onPress={() => onEditField("merchantName")}>
            {draft.merchantName}
          </EditablePill>
        </Row>
        <Row label="Date">
          <EditablePill status={fieldStatus("receiptDate")} onPress={() => onEditField("receiptDate")}>
            {draft.receiptDate
              ? `${formatDate(draft.receiptDate)} ${new Date(draft.receiptDate).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`
              : "No date"}
          </EditablePill>
        </Row>
        <Row label="Currency">
          <EditablePill status={fieldStatus("currencyCode")} onPress={() => onEditField("currencyCode")}>
            {draft.currencyCode ?? "Not set"}
          </EditablePill>
        </Row>
        <Row label="Total">
          <EditablePill status={fieldStatus("totalPrice")} onPress={() => onEditField("totalPrice")}>
            {formatAmount(draft.totalPrice, draft.currencyCode)}
          </EditablePill>
        </Row>
      </View>

      <View className="gap-4">
        {draft.groups.map((group) => (
          <GroupRow
            key={group.key}
            group={group}
            original={originals.get(group.key)}
            currencyCode={draft.currencyCode}
            onEdit={(focus) => onEditGroup(group.key, focus)}
            onRestore={() => onRestoreGroup(group.key)}
          />
        ))}
        <Button variant="outline" icon={Plus} onPress={onAddGroup}>
          Add item
        </Button>
      </View>
    </ScrollView>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      {children}
    </View>
  );
}

function GroupRow({
  group,
  original,
  currencyCode,
  onEdit,
  onRestore,
}: {
  group: DraftGroup;
  original: DraftGroup | undefined;
  currencyCode: string | null;
  onEdit: (focus?: "description" | "price") => void;
  onRestore: () => void;
}) {
  const status = groupStatus(group, original);
  const changes = groupChanges(group, original);
  const valueStatus = (changed: boolean) =>
    status === "removed" ? "removed" : changed ? (original ? "edited" : "new") : "unchanged";
  const label = statusLabel[status];

  return (
    <Pressable
      onPress={() => onEdit()}
      className={cn("gap-2 active:opacity-70", status === "removed" && "opacity-50")}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <EditablePill status={valueStatus(changes.description)} onPress={() => onEdit("description")}>
            {group.description || "Unnamed item"}
          </EditablePill>
          {(group.quantity !== 1 || group.quantityUnit) && (
            <EditablePill
              status={valueStatus(changes.quantity)}
              onPress={() => onEdit()}
              textClassName="text-xs"
            >
              {`${group.quantity}${group.quantityUnit ? ` ${group.quantityUnit}` : " ×"}`}
            </EditablePill>
          )}
        </View>
        <EditablePill status={valueStatus(changes.price)} onPress={() => onEdit("price")}>
          {formatAmount(group.price, currencyCode)}
        </EditablePill>
      </View>

      {group.supplements.map((supplement, index) => (
        <View key={index} className="ml-3 flex-row items-center justify-between">
          <EditablePill
            status={valueStatus(changes.supplements)}
            onPress={() => onEdit()}
            textClassName="text-xs"
          >
            {`+ ${supplement.description}`}
          </EditablePill>
          <EditablePill
            status={valueStatus(changes.supplements)}
            onPress={() => onEdit()}
            textClassName="text-xs"
          >
            {`${formatAmount(supplement.price, currencyCode)}${group.quantity > 1 && Number.isInteger(group.quantity) ? " each" : ""}`}
          </EditablePill>
        </View>
      ))}

      {label && (
        <View className="flex-row items-center gap-3">
          <Text
            className={cn(
              "text-xs font-medium",
              status === "removed" ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400",
            )}
          >
            {label}
          </Text>
          {status === "removed" && (
            <Pressable hitSlop={8} onPress={onRestore} className="flex-row items-center gap-1">
              <Icon as={RotateCcw} size={12} />
              <Text className="text-xs font-medium">Restore</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

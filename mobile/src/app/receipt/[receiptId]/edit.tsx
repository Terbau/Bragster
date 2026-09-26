import { router, Stack, useLocalSearchParams } from "expo-router";
import { CircleCheck, Info, TriangleAlert } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { ItemEditorSheet } from "@/components/receipt-edit/ItemEditorSheet";
import { ReceiptFieldsSheet } from "@/components/receipt-edit/ReceiptFieldsSheet";
import { ReceiptImageEditor } from "@/components/receipt-edit/ReceiptImageEditor";
import { ReceiptListEditor } from "@/components/receipt-edit/ReceiptListEditor";
import { Legend } from "@/components/receipt-edit/status";
import { Icon } from "@/components/ui/icon";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import { formatAmount } from "@/lib/format";
import { useEditReceipt, useReceipt } from "@/lib/queries";
import {
  type DraftGroup,
  draftFromReceipt,
  isDraftDirty,
  itemsTotal,
  newDraftGroup,
  type ReceiptDraft,
  type ReceiptField,
  toEditPayload,
} from "@/lib/receipt-draft";
import { isSumCorrect } from "@/lib/smart-receipt";
import type { ReceiptDetailResponse } from "@/lib/types";

const HELP_TEXT = `• Blue values are what the scanner read. Tap one to fix it.
• Amber means you changed it, grey means it will be removed.
• The list shows everything, also values that aren't on the image, and lets you add items the scanner missed.
• Nothing is saved until you tap Save. Smart receipts made from this receipt are updated too.`;

export default function EditReceiptScreen() {
  const { receiptId } = useLocalSearchParams<{ receiptId: string }>();
  const { data, error, isPending, refetch } = useReceipt(receiptId);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  if (!data.isOwner) {
    return <ErrorState error={new Error("Only the owner can edit this receipt.")} />;
  }
  return <ReceiptEditor data={data} />;
}

function ReceiptEditor({ data }: { data: ReceiptDetailResponse }) {
  const { receiptId, itemGroupId } = useLocalSearchParams<{
    receiptId: string;
    itemGroupId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const editReceipt = useEditReceipt(receiptId);

  const original = useMemo(() => draftFromReceipt(data.receipt), [data.receipt]);
  const [draft, setDraft] = useState<ReceiptDraft>(original);
  const [view, setView] = useState<"image" | "list">(data.hasImage ? "image" : "list");
  const [editingGroup, setEditingGroup] = useState<{
    group: DraftGroup;
    focus?: "description" | "price";
  } | null>(() => {
    const group = itemGroupId && original.groups.find((g) => g.key === itemGroupId);
    return group ? { group } : null;
  });
  const [editingField, setEditingField] = useState<ReceiptField | null>(null);

  const originals = useMemo(
    () => new Map(original.groups.map((group) => [group.key, group])),
    [original],
  );
  const isDirty = isDraftDirty(draft, original);
  const sum = itemsTotal(draft);
  const sumMatches = isSumCorrect(sum, draft.totalPrice);
  const changeCount = draft.groups.filter((group) => {
    const scanned = originals.get(group.key);
    return group.removed || !scanned || JSON.stringify(group) !== JSON.stringify(scanned);
  }).length;

  const openGroup = (key: string, focus?: "description" | "price") => {
    const group = draft.groups.find((g) => g.key === key);
    if (group) setEditingGroup({ group, focus });
  };

  const applyGroup = (updated: DraftGroup) => {
    setDraft((current) => {
      const exists = current.groups.some((g) => g.key === updated.key);
      // Removing an item that was added while editing just drops it
      if (!originals.has(updated.key) && updated.removed) {
        return { ...current, groups: current.groups.filter((g) => g.key !== updated.key) };
      }
      return {
        ...current,
        groups: exists
          ? current.groups.map((g) => (g.key === updated.key ? updated : g))
          : [...current.groups, updated],
      };
    });
    setEditingGroup(null);
  };

  const cancel = () => {
    if (!isDirty) {
      router.back();
      return;
    }
    Alert.alert("Discard changes?", "Your changes to the receipt will be lost.", [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => router.back() },
    ]);
  };

  const save = () =>
    editReceipt.mutate(toEditPayload(draft), { onSuccess: () => router.back() });

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable hitSlop={10} onPress={cancel} className="active:opacity-50">
              <Text className="text-base">Cancel</Text>
            </Pressable>
          ),
          headerRight: () =>
            editReceipt.isPending ? (
              <ActivityIndicator color={colors.foreground} />
            ) : (
              <Pressable
                hitSlop={10}
                onPress={save}
                disabled={!isDirty}
                className={isDirty ? "active:opacity-50" : "opacity-40"}
              >
                <Text className="text-base font-semibold">Save</Text>
              </Pressable>
            ),
        }}
      />

      <View className="flex-1 bg-background">
        <View className="gap-3 border-b border-border px-4 pb-3 pt-2">
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <Legend />
            </View>
            <Pressable
              hitSlop={10}
              accessibilityLabel="How editing works"
              onPress={() => Alert.alert("How editing works", HELP_TEXT)}
            >
              <Icon as={Info} size={20} className="text-muted-foreground" />
            </Pressable>
          </View>
          {data.hasImage ? (
            <SegmentedControl
              value={view}
              onChange={setView}
              options={[
                { value: "image", label: "Receipt image" },
                { value: "list", label: "All values" },
              ]}
            />
          ) : (
            <Text className="text-xs text-muted-foreground">
              No image is stored for this receipt (receipts scanned before the app
              update have none), so it can only be edited as a list.
            </Text>
          )}
        </View>

        {view === "image" && data.hasImage ? (
          <ReceiptImageEditor
            receiptId={receiptId}
            regions={data.receipt.regions}
            draft={draft}
            original={original}
            onEditGroup={openGroup}
            onEditField={setEditingField}
          />
        ) : (
          <ReceiptListEditor
            draft={draft}
            original={original}
            onEditGroup={openGroup}
            onEditField={setEditingField}
            onRestoreGroup={(key) =>
              setDraft((current) => ({
                ...current,
                groups: current.groups.map((g) => (g.key === key ? { ...g, removed: false } : g)),
              }))
            }
            onAddGroup={() => setEditingGroup({ group: newDraftGroup() })}
          />
        )}

        <Pressable
          onPress={() => setEditingField("totalPrice")}
          className="flex-row items-center gap-3 border-t border-border px-4 pt-3 active:opacity-70"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Icon
            as={sumMatches ? CircleCheck : TriangleAlert}
            size={20}
            className={sumMatches ? "text-green-600" : "text-orange-400"}
          />
          <View className="flex-1">
            <Text className="text-sm font-medium">
              {sumMatches
                ? `Items add up to the total, ${formatAmount(sum, draft.currencyCode)}`
                : `Items add up to ${formatAmount(sum, draft.currencyCode)}, the total is ${formatAmount(draft.totalPrice, draft.currencyCode)}`}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {!sumMatches
                ? "Fix an item, or tap here to change the total. "
                : ""}
              {isDirty
                ? `${changeCount > 0 ? `${changeCount} item${changeCount === 1 ? "" : "s"} changed. ` : ""}Not saved yet.`
                : "No changes yet."}
            </Text>
          </View>
        </Pressable>
      </View>

      <ItemEditorSheet
        group={editingGroup?.group ?? null}
        original={editingGroup ? originals.get(editingGroup.group.key) : undefined}
        currencyCode={draft.currencyCode}
        focus={editingGroup?.focus}
        onDone={applyGroup}
        onCancel={() => setEditingGroup(null)}
      />
      <ReceiptFieldsSheet
        visible={editingField !== null}
        draft={draft}
        itemsTotal={sum}
        focus={editingField ?? undefined}
        onCancel={() => setEditingField(null)}
        onDone={(fields) => {
          setDraft((current) => ({ ...current, ...fields }));
          setEditingField(null);
        }}
      />
    </>
  );
}

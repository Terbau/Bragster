import type { ItemGroupRegion, ReceiptWithItems } from "./types";

// A local copy of a receipt that is edited in edit mode and saved at once.

export interface DraftSupplement {
  description: string;
  price: number;
}

export interface DraftGroup {
  /** Stable key, also for items added while editing */
  key: string;
  /** Missing for new items */
  id?: string;
  description: string;
  /** Price of the whole line, without supplements */
  price: number;
  quantity: number;
  quantityUnit: string | null;
  /** Added to each unit, e.g. bottle deposit */
  supplements: DraftSupplement[];
  removed: boolean;
  regions: ItemGroupRegion[];
}

export interface ReceiptDraft {
  merchantName: string;
  receiptDate: string | null;
  totalPrice: number;
  currencyCode: string | null;
  groups: DraftGroup[];
}

export type ReceiptField = "merchantName" | "receiptDate" | "totalPrice" | "currencyCode";

export type EditStatus = "unchanged" | "edited" | "removed" | "new";

export function draftFromReceipt(receipt: ReceiptWithItems): ReceiptDraft {
  return {
    merchantName: receipt.merchantName,
    receiptDate: receipt.receiptDate,
    totalPrice: receipt.totalPrice,
    currencyCode: receipt.currencyCode,
    groups: receipt.itemGroups.map((group) => ({
      key: group.id,
      id: group.id,
      description: group.description,
      price: group.price,
      quantity: group.quantity,
      quantityUnit: group.quantityUnit,
      // Every unit of a group has the same supplements
      supplements: (group.items[0]?.supplements ?? []).map(({ description, price }) => ({
        description,
        price,
      })),
      removed: false,
      regions: group.regions ?? [],
    })),
  };
}

let newKeyCounter = 0;

export const newDraftGroup = (): DraftGroup => ({
  key: `new-${newKeyCounter++}`,
  description: "",
  price: 0,
  quantity: 1,
  quantityUnit: null,
  supplements: [],
  removed: false,
  regions: [],
});

/** Whole quantities are split into that many assignable units */
export const unitCount = (quantity: number) =>
  Number.isInteger(quantity) ? quantity : 1;

export const groupTotal = (group: DraftGroup) =>
  group.price +
  group.supplements.reduce((sum, supplement) => sum + supplement.price, 0) *
    unitCount(group.quantity);

export const itemsTotal = (draft: ReceiptDraft) =>
  draft.groups
    .filter((group) => !group.removed)
    .reduce((sum, group) => sum + groupTotal(group), 0);

const sameSupplements = (a: DraftSupplement[], b: DraftSupplement[]) =>
  a.length === b.length &&
  a.every(
    (supplement, index) =>
      supplement.description === b[index].description &&
      supplement.price === b[index].price,
  );

/** Which parts of a group differ from the scanned receipt */
export function groupChanges(group: DraftGroup, original: DraftGroup | undefined) {
  return {
    description: !original || group.description !== original.description,
    price: !original || group.price !== original.price,
    quantity:
      !original ||
      group.quantity !== original.quantity ||
      (group.quantityUnit ?? "") !== (original.quantityUnit ?? ""),
    supplements: !original || !sameSupplements(group.supplements, original.supplements),
  };
}

export function groupStatus(group: DraftGroup, original: DraftGroup | undefined): EditStatus {
  if (group.removed) return "removed";
  if (!original) return "new";
  return Object.values(groupChanges(group, original)).some(Boolean) ? "edited" : "unchanged";
}

export const isFieldEdited = (
  draft: ReceiptDraft,
  original: ReceiptDraft,
  field: ReceiptField,
) => draft[field] !== original[field];

export function isDraftDirty(draft: ReceiptDraft, original: ReceiptDraft) {
  const originals = new Map(original.groups.map((group) => [group.key, group]));
  return (
    (["merchantName", "receiptDate", "totalPrice", "currencyCode"] as const).some((field) =>
      isFieldEdited(draft, original, field),
    ) ||
    draft.groups.some((group) => groupStatus(group, originals.get(group.key)) !== "unchanged")
  );
}

/** Body for PUT /api/mobile/receipts/:id */
export const toEditPayload = (draft: ReceiptDraft) => ({
  merchantName: draft.merchantName.trim(),
  receiptDate: draft.receiptDate,
  totalPrice: draft.totalPrice,
  currencyCode: draft.currencyCode,
  itemGroups: draft.groups
    .filter((group) => !group.removed)
    .map((group) => ({
      id: group.id,
      description: group.description.trim(),
      price: group.price,
      quantity: group.quantity,
      quantityUnit: group.quantityUnit?.trim() || null,
      supplements: group.supplements,
    })),
});

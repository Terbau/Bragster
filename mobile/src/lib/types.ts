// JSON shapes returned by the website's mobile API (src/app/api/mobile)

export interface User {
  id: string;
  email: string;
  createdAt: string;
  avatarUrl: string | null;
  admin: boolean;
}

export interface Translation {
  id: string;
  label: string;
  description: string;
  language: string;
  lightModeLabelHexColor: string;
  darkModeLabelHexColor: string;
}

export interface ReceiptItemSupplement {
  id: string;
  itemId: string;
  description: string;
  price: number;
  translations: Translation[];
}

export interface ReceiptItem {
  id: string;
  itemGroupId: string;
  price: number;
  supplements: ReceiptItemSupplement[];
}

export interface ReceiptItemGroup {
  id: string;
  receiptId: string;
  description: string;
  price: number;
  quantity: number;
  quantityUnit: string | null;
  unitPrice: number;
  items: ReceiptItem[];
  translations: Translation[];
}

export interface Receipt {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  merchantName: string;
  receiptType: string | null;
  receiptDate: string | null;
  totalPrice: number;
  currencyCode: string | null;
}

export interface ReceiptWithItems extends Receipt {
  createdBy: User;
  itemGroups: ReceiptItemGroup[];
}

export type AllowedPaymentEditor =
  | "OWNER"
  | "AUTHENTICATED_USERS"
  | "GUESTS"
  | "ANYONE";

export interface SmartReceiptGuest {
  id: string;
  smartReceiptId: string;
  name: string;
  createdAt: string;
}

export interface SmartReceiptPayment {
  id: string;
  userId: string;
  smartReceiptId: string;
  receiptItemId: string;
  user: User;
}

export interface SmartReceiptGuestPayment {
  id: string;
  guestId: string;
  smartReceiptId: string;
  receiptItemId: string;
  guest: SmartReceiptGuest;
}

export interface SmartReceipt {
  id: string;
  receiptId: string;
  createdAt: string;
  updatedAt: string;
  updatedTotalPrice: number | null;
  updatedCurrencyCode: string | null;
  allowedPaymentEditors: AllowedPaymentEditor;
}

export interface SmartReceiptWithUsers extends SmartReceipt {
  users: User[];
  guests: SmartReceiptGuest[];
  receipt: Receipt;
}

export interface SmartReceiptWithItemsUsers extends SmartReceipt {
  receipt: ReceiptWithItems;
  users: User[];
  guests: SmartReceiptGuest[];
  payments: SmartReceiptPayment[];
  guestPayments: SmartReceiptGuestPayment[];
}

export interface ReceiptsResponse {
  receipts: ReceiptWithItems[];
  smartReceipts: SmartReceiptWithItemsUsers[];
}

export interface ReceiptDetailResponse {
  receipt: ReceiptWithItems & { smartReceipts: SmartReceiptWithUsers[] };
  isOwner: boolean;
}

export interface SmartReceiptDetailResponse {
  smartReceipt: SmartReceiptWithItemsUsers;
  viewer: {
    isOwner: boolean;
    isParticipant: boolean;
    canEditPayments: boolean;
  };
  isTranslating: boolean;
}

export interface GuestNameValidity {
  valid: boolean;
  existing: boolean;
  reason?: string;
}

export type InviteLinkExpiration =
  | "ONE_HOUR"
  | "ONE_DAY"
  | "SEVEN_DAYS"
  | "THIRTY_DAYS"
  | "NEVER";

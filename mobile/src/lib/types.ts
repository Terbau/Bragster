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

/** Position on the scanned image, relative to the image size (0-1) */
export interface RegionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ItemGroupRegion {
  kind: "item" | "supplement";
  line?: RegionRect;
  description?: RegionRect;
  price?: RegionRect;
}

export interface ReceiptRegions {
  merchantName?: RegionRect;
  date?: RegionRect;
  total?: RegionRect;
}

export interface ReceiptItemGroup {
  id: string;
  receiptId: string;
  description: string;
  price: number;
  quantity: number;
  quantityUnit: string | null;
  unitPrice: number;
  regions: ItemGroupRegion[] | null;
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
  regions: ReceiptRegions | null;
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
  /** Whether the scanned image is stored (receipts scanned before September 2026 have none) */
  hasImage: boolean;
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

// Padel Americano

export interface PadelPlayer {
  id: string;
  gameId: string;
  name: string;
  position: number;
}

export interface PadelMatch {
  id: string;
  roundId: string;
  court: number;
  /** Player ids */
  team1: string[];
  team2: string[];
  team1Score: number | null;
  team2Score: number | null;
}

export interface PadelRound {
  id: string;
  gameId: string;
  position: number;
  /** Every series is a complete Americano, see `useAddPadelSeries` */
  series: number;
  matches: PadelMatch[];
}

export interface PadelGame {
  id: string;
  userId: string;
  name: string;
  courts: number;
  pointsPerMatch: number;
  createdAt: string;
  updatedAt: string;
  players: PadelPlayer[];
  rounds: PadelRound[];
}

export interface PreviousPadelPlayer {
  name: string;
  games: number;
  lastPlayedAt: string;
}

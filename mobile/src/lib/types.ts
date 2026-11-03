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
  "OWNER" | "AUTHENTICATED_USERS" | "GUESTS" | "ANYONE";

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
  "ONE_HOUR" | "ONE_DAY" | "SEVEN_DAYS" | "THIRTY_DAYS" | "NEVER";

// Padel Americano

export interface PadelPlayer {
  id: string;
  gameId: string;
  name: string;
  position: number;
  /** Sits out the extra round when not everyone can sit out equally often */
  sitsOutMore?: boolean;
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
  /** Not played, because the round or series was ended early */
  isSkipped: boolean;
}

export interface PadelRound {
  id: string;
  gameId: string;
  position: number;
  /** Every series is a complete Americano, see `useAddPadelSeries` */
  series: number;
  matches: PadelMatch[];
}

export type PadelFormat = "AMERICANO" | "ELO_AMERICANO" | "MEXICANO";

export interface PadelGame {
  id: string;
  spaceId: string;
  /** Who created the game, null when their account is deleted */
  userId: string | null;
  name: string;
  format: PadelFormat;
  courts: number;
  /** Optional names in court order, empty ones are "Court 1", ... */
  courtNames: string[];
  pointsPerMatch: number;
  /** Mexicano rounds are drawn one at a time, until this many are played */
  plannedRounds: number | null;
  /** Set when the game has a live link */
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
  players: PadelPlayer[];
  rounds: PadelRound[];
  /** The user's role in the game's space. Not in lists of games. */
  role?: PadelSpaceRole;
}

// Padel spaces, see the website's src/app/padel/actions.ts

/**
 * - `OWNER` made the space, and can change everything in it
 * - `HOST` can create games and keep score
 * - `PLAYER` has their name linked to their account, and can only look
 */
export type PadelSpaceRole = "OWNER" | "HOST" | "PLAYER";

export interface PadelSpaceUser {
  id: string;
  email: string;
  avatarUrl: string | null;
}

export interface PadelSpaceSummary {
  id: string;
  name: string;
  role: PadelSpaceRole;
  owner: PadelSpaceUser;
  games: number;
  /** When the latest game was played, null without games */
  lastPlayedAt: string | null;
  createdAt: string;
}

export interface PadelSpaceDetails extends PadelSpaceSummary {
  hosts: PadelSpaceUser[];
  /** Players' names linked to their accounts */
  links: { key: string; name: string; user: PadelSpaceUser }[];
  /** Everyone who has played in the space, the most recent first */
  players: string[];
}

export interface PreviousPadelPlayer {
  name: string;
  games: number;
  lastPlayedAt: string;
}

// Padel player statistics, see the website's src/utils/padelStats.ts

export interface PadelRecord {
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  pointsWon: number;
  pointsLost: number;
}

export interface PadelPlayerSummary extends PadelRecord {
  /** The name in lower case, the same player across games */
  key: string;
  name: string;
  rating: number;
  games: number;
  /** Finished games won */
  gamesWon: number;
  lastPlayedAt: string;
  /**
   * Every game the player has played, oldest first, to look back at earlier
   * days. Missing from older versions of the website.
   */
  timeline?: PadelTimelineGame[];
}

/** A game in a player's timeline */
export interface PadelTimelineGame {
  gameId: string;
  createdAt: string;
  /** Rounded, like `rating` */
  ratingBefore: number;
  /** Matches played in the game */
  matches: number;
  wins: number;
  /** Won the game, once it's finished */
  wonGame: boolean;
}

/** A player as they were at the end of a day, see `getPlayersOnDay` */
export interface PadelPlayerOnDay extends Pick<
  PadelPlayerSummary,
  "key" | "name" | "rating" | "games" | "matches" | "wins" | "gamesWon"
> {
  /** How much the rating changed during the day, null when they didn't play */
  change: number | null;
}

/**
 * The ratings in a match, as they were when it was played. For a match that
 * hasn't been played yet, they're the ratings now, and nothing has changed.
 * Older versions of the website only send played matches.
 */
export interface PadelMatchRating {
  /** Each team's average rating before the match */
  team1Rating: number;
  team2Rating: number;
  /** Each player's rating before the match and how much it changed, by id */
  players: Record<string, { before: number; change: number }>;
}

export interface PadelPlayerRelation extends PadelRecord {
  key: string;
  name: string;
}

export interface PadelPlayerGame {
  gameId: string;
  name: string;
  format: PadelFormat;
  createdAt: string;
  rank: number;
  playerCount: number;
  total: number;
  matches: number;
  wins: number;
  isFinished: boolean;
  /** Rounded, like `rating`. Missing from older versions of the website. */
  ratingBefore?: number;
  ratingChange: number;
}

export type PadelMatchOutcome = "W" | "D" | "L";

export interface PadelPlayerProfile extends Omit<
  PadelPlayerSummary,
  "timeline"
> {
  ratingRank: number;
  playerCount: number;
  /** Newest first */
  form: PadelMatchOutcome[];
  partners: PadelPlayerRelation[];
  opponents: PadelPlayerRelation[];
  bestPartner: PadelPlayerRelation | null;
  toughestOpponent: PadelPlayerRelation | null;
  favouriteOpponent: PadelPlayerRelation | null;
  /** Newest first */
  history: PadelPlayerGame[];
}

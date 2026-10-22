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
  userId: string;
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

export interface PadelPlayerProfile extends PadelPlayerSummary {
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
  /** Null when the player hasn't been filmed */
  video?: PadelPlayerVideoStats | null;
}

// Padel videos, see the website's src/utils/padelVideo.ts and
// src/app/padel/_lib/videos.ts

export type PadelTeamNumber = 1 | 2;

export type PadelRecordingStatus =
  | "UPLOADING"
  | "UPLOADED"
  | "ANALYZING"
  | "READY"
  | "FAILED";

export interface PadelVideoRally {
  id: string;
  /** 1 is the first rally of the match, 0 when it isn't a point */
  number: number;
  /** Seconds into the video */
  start: number;
  end: number;
  duration: number;
  winnerTeam: PadelTeamNumber | null;
  /** "manual" when someone said who won, "guess" when it was worked out */
  winnerSource: "manual" | "guess" | null;
  team1WinProbability: number | null;
  isIgnored: boolean;
}

export interface PadelVideoStats {
  rallies: number;
  /** Seconds */
  playTime: number;
  averageRally: number;
  longestRally: { id: string; duration: number } | null;
  decided: number;
  shortDecided: number;
  longDecided: number;
}

export interface PadelVideoTeamStats {
  won: number;
  shortWon: number;
  longWon: number;
}

export interface PadelVideoMatch {
  matchId: string;
  series: number;
  roundNumber: number;
  court: number;
  team1: string[];
  team2: string[];
  team1Score: number | null;
  team2Score: number | null;
  nearTeam: PadelTeamNumber | null;
  isNearTeamGuess: boolean;
  rallies: PadelVideoRally[];
  stats: PadelVideoStats & { team1: PadelVideoTeamStats; team2: PadelVideoTeamStats };
}

export interface PadelRecording {
  id: string;
  gameId: string;
  court: number;
  firstMatchId: string | null;
  status: PadelRecordingStatus;
  error: string | null;
  duration: number | null;
  sizeBytes: number | null;
  recordedAt: string;
  /** Null until the video has been uploaded */
  videoUrl: string | null;
  matchCount: number;
  isMatchCountGuess: boolean;
  maxMatchCount: number;
  matches: PadelVideoMatch[];
  unplaced: PadelVideoRally[];
}

export interface PadelGameVideos {
  /** False when video storage isn't set up on the website */
  isEnabled: boolean;
  recordings: PadelRecording[];
  stats: PadelVideoStats;
}

export interface PadelVideoUpload {
  url: string;
  method: "PUT";
  headers: Record<string, string>;
}

export interface PadelPlayerVideoStats extends PadelVideoStats {
  matches: number;
  won: number;
  shortWon: number;
  longWon: number;
  longestRallyWon: {
    duration: number;
    gameId: string;
    recordingId: string;
    rallyId: string;
  } | null;
}

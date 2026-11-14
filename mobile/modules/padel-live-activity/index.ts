import { requireOptionalNativeModule } from "expo";

/** What a Live Activity shows, see PadelMatchAttributes.swift */
export interface PadelLiveActivityState {
  team1: string[];
  team2: string[];
  /** Each team's average rating, null until the ratings have loaded */
  team1Rating: number | null;
  team2Rating: number | null;
  /** Counted within the series, from 1 */
  matchNumber: number;
  matchCount: number;
  /** Only set when the game has more than one series */
  series: number | null;
  /** Only set when the game has more than one court, or named courts */
  court: string | null;
  /** Set once every match has been played */
  finished: string | null;
  /** The match shown, so tapping the activity opens its score */
  matchId: string | null;
  /** Set when the court has no match to play yet */
  waiting: string | null;
}

/** Each court has its own Live Activity */
export interface PadelLiveActivityCourt {
  /** The court number, from 1 */
  court: number;
  state: PadelLiveActivityState;
}

interface PadelLiveActivityNativeModule {
  isSupported(): boolean;
  isActive(gameId: string): boolean;
  showAsync(
    gameId: string,
    gameName: string,
    courtsJson: string,
  ): Promise<void>;
  updateAsync(gameId: string, courtsJson: string): Promise<number>;
  endAsync(gameId: string, stateJson: string | null): Promise<void>;
}

const native =
  requireOptionalNativeModule<PadelLiveActivityNativeModule>(
    "PadelLiveActivity",
  );

/** Only on iOS, `null` elsewhere */
export const PadelLiveActivity = native && {
  isSupported: () => native.isSupported(),
  /** Whether any of the game's courts is showing */
  isActive: (gameId: string) => native.isActive(gameId),
  /** Shows every court, in place of any other game's */
  show: (gameId: string, gameName: string, courts: PadelLiveActivityCourt[]) =>
    native.showAsync(gameId, gameName, JSON.stringify(courts)),
  /** Resolves with how many of the game's courts are showing */
  update: (gameId: string, courts: PadelLiveActivityCourt[]) =>
    native.updateAsync(gameId, JSON.stringify(courts)),
  end: (gameId: string, finalState?: PadelLiveActivityState) =>
    native.endAsync(gameId, finalState ? JSON.stringify(finalState) : null),
};

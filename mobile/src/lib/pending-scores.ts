import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QueryClient } from "@tanstack/react-query";
import * as Network from "expo-network";
import { useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { ApiError, api, getErrorMessage } from "./api";
import { toast } from "./toast";
import type { PadelGame } from "./types";

/**
 * Scores are kept on the phone until the server has them, so none are lost
 * when there's no signal at the court, even if the app is closed. They're
 * sent in the order they were entered, one at a time, and sent again when
 * the phone is back online, when the app is opened, and every little while.
 */

const STORAGE_KEY = "bragster.padel-pending-scores";
const RETRY_MS = 20_000;

export interface PendingScore {
  /** Tells a newer score for the same match apart from an older one */
  id: string;
  gameId: string;
  matchId: string;
  team1Score: number | null;
  team2Score: number | null;
}

/**
 * "waiting" is still on the phone, to be sent again later. Scores after one
 * that couldn't reach the server aren't tried, and have no outcome.
 */
type Outcome = "sent" | "waiting" | Error;

export interface SendResult {
  /** By the pending score's id */
  outcomes: Map<string, Outcome>;
  /** Scores the server refused, which are given up */
  failed: { score: PendingScore; error: Error }[];
}

let pending: PendingScore[] = [];
const listeners = new Set<() => void>();

const isPendingScore = (value: unknown): value is PendingScore =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  "gameId" in value &&
  "matchId" in value;

const loaded: Promise<void> = AsyncStorage.getItem(STORAGE_KEY)
  .then((stored) => {
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    pending = Array.isArray(parsed) ? parsed.filter(isPendingScore) : [];
  })
  .catch(() => {
    pending = [];
  });

const setPending = async (next: PendingScore[]) => {
  pending = next;
  for (const listener of listeners) listener();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pending)).catch(
    () => {},
  );
};

const remove = (id: string) =>
  setPending(pending.filter((score) => score.id !== id));

/** Whether the score is still kept on the phone, waiting to be sent */
export const isScorePending = (id: string) =>
  pending.some((score) => score.id === id);

/** Resolves once the scores kept from earlier are loaded */
export const pendingScoresLoaded = () => loaded;

/** Keeps a score on the phone, in place of an older one for the same match */
export async function addPendingScore(
  score: Omit<PendingScore, "id">,
): Promise<PendingScore> {
  await loaded;
  const entry: PendingScore = {
    ...score,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
  await setPending([
    ...pending.filter((other) => other.matchId !== score.matchId),
    entry,
  ]);
  return entry;
}

/**
 * The game with the scores that haven't reached the server yet, so a game
 * fetched in the meantime doesn't show the old scores.
 */
export function applyPendingScores(game: PadelGame): PadelGame {
  const scores = new Map(
    pending
      .filter((score) => score.gameId === game.id)
      .map((score) => [score.matchId, score]),
  );
  if (scores.size === 0) return game;
  return {
    ...game,
    rounds: game.rounds.map((round) => ({
      ...round,
      matches: round.matches.map((match) => {
        const score = scores.get(match.id);
        return score
          ? {
              ...match,
              team1Score: score.team1Score,
              team2Score: score.team2Score,
            }
          : match;
      }),
    })),
  };
}

/**
 * Worth trying again: no connection, a server error, or a sign in that has
 * run out. The server refusing the score itself (it's invalid, or the game is
 * gone) won't change, so those scores are given up.
 */
const canRetry = (error: unknown) =>
  !(error instanceof ApiError) ||
  error.status === 0 ||
  error.status === 401 ||
  error.status === 408 ||
  error.status === 429 ||
  error.status >= 500;

let queryClient: QueryClient | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

const refreshGame = (gameId: string) => {
  if (!queryClient) return;
  void queryClient.invalidateQueries({ queryKey: ["padel-game", gameId] });
  void queryClient.invalidateQueries({ queryKey: ["padel-games"] });
  void queryClient.invalidateQueries({ queryKey: ["padel-stats"] });
};

async function sendAll(): Promise<SendResult> {
  await loaded;
  const result: SendResult = { outcomes: new Map(), failed: [] };
  const changedGames = new Set<string>();

  for (const score of pending.slice()) {
    // Replaced by a newer score for the match, which is sent after this
    if (!isScorePending(score.id)) continue;
    try {
      await api(
        `/api/mobile/padel/games/${score.gameId}/matches/${score.matchId}`,
        {
          method: "PUT",
          body: { team1Score: score.team1Score, team2Score: score.team2Score },
        },
      );
      result.outcomes.set(score.id, "sent");
      await remove(score.id);
      changedGames.add(score.gameId);
    } catch (error) {
      if (canRetry(error)) {
        result.outcomes.set(score.id, "waiting");
        // Without a connection the rest won't get through either
        if (error instanceof ApiError && error.status === 0) break;
        continue;
      }
      const failure = error instanceof Error ? error : new Error(String(error));
      result.outcomes.set(score.id, failure);
      result.failed.push({ score, error: failure });
      await remove(score.id);
      changedGames.add(score.gameId);
    }
  }

  // Saved scores change the leaderboard and ratings, and can draw the next
  // Mexicano round. Refused ones go back to what the server has.
  for (const gameId of changedGames) refreshGame(gameId);
  scheduleRetry();
  return result;
}

let queue: Promise<unknown> = Promise.resolve();

/**
 * Sends the scores kept on the phone, after any sending already going on.
 * Scores the server refuses are given up, and are in the result.
 */
export function sendPendingScores(): Promise<SendResult> {
  const run = queue.then(sendAll, sendAll);
  queue = run.catch(() => {});
  return run;
}

/** Tells about scores that were given up, except `ownScoreId`'s */
export function reportFailedScores(result: SendResult, ownScoreId?: string) {
  for (const { score, error } of result.failed) {
    if (score.id === ownScoreId) continue;
    toast.error(`A score couldn't be saved: ${getErrorMessage(error)}`);
  }
}

/** Sends what's waiting first, for changes to a game that need its scores */
export async function sendPendingScoresFirst() {
  reportFailedScores(await sendPendingScores());
}

function scheduleRetry() {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
  if (pending.length === 0) return;
  retryTimer = setTimeout(() => void sendPendingScoresFirst(), RETRY_MS);
}

/**
 * Starts sending the scores kept from earlier, and keeps trying while there
 * are any. Sent scores refresh the game through `client`.
 */
export function startSendingPendingScores(client: QueryClient) {
  queryClient = client;
  const appState = AppState.addEventListener("change", (state) => {
    if (state === "active" && pending.length > 0) {
      void sendPendingScoresFirst();
    }
  });
  const network = Network.addNetworkStateListener((state) => {
    if (state.isConnected && pending.length > 0) {
      void sendPendingScoresFirst();
    }
  });
  void loaded.then(() => {
    if (pending.length > 0) void sendPendingScoresFirst();
  });
  return () => {
    appState.remove();
    network.remove();
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = null;
    queryClient = null;
  };
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getPending = () => pending;

/** The game's scores that haven't reached the server yet */
export function usePendingScores(gameId: string) {
  const all = useSyncExternalStore(subscribe, getPending);
  return all.filter((score) => score.gameId === gameId);
}

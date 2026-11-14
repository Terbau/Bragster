import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import {
  PadelLiveActivity,
  type PadelLiveActivityCourt,
  type PadelLiveActivityState,
} from "../../modules/padel-live-activity";
import {
  courtName,
  getCurrentSeries,
  getGameStatus,
  getPadelStandings,
  isMatchDone,
  isMatchSkipped,
} from "./padel";
import type { PadelGame, PadelMatchRating } from "./types";

/** Games whose activity has been shown once, so it isn't forced back */
const STARTED_KEY = "bragster.padel-live-activity.started";

export interface LiveActivityStates {
  /** One for each court of the series being played, in court order */
  courts: PadelLiveActivityCourt[];
  /** Set once every match has been played, shown in place of the courts */
  finished: PadelLiveActivityState | null;
}

/**
 * What the Lock Screen shows for a game: a card for each court, with the
 * first match on it that doesn't have a score yet. A court without one waits,
 * for the other courts or for the next Mexicano round to be drawn.
 */
export function getLiveActivityStates(
  game: PadelGame,
  matchRatings: Record<string, PadelMatchRating> | undefined,
): LiveActivityStates {
  const status = getGameStatus(game);
  const series = status.seriesCount > 1 ? status.series : null;
  const empty = {
    team1: [],
    team2: [],
    team1Rating: null,
    team2Rating: null,
    court: null,
    series,
    matchId: null,
    finished: null,
    waiting: null,
  };

  if (status.isFinished) {
    const winner = getPadelStandings(game.players, game.rounds)[0];
    return {
      courts: [],
      finished: {
        ...empty,
        matchNumber: status.matchesTotal,
        matchCount: status.matchesTotal,
        finished: winner
          ? `${winner.name} won with ${winner.total} points`
          : "The game is finished",
      },
    };
  }

  const rounds = getCurrentSeries(game.rounds).rounds;
  // In play order: round by round, and court by court within a round
  const matches = rounds.flatMap((round) =>
    [...round.matches]
      .sort((a, b) => a.court - b.court)
      .filter((match) => !isMatchSkipped(match)),
  );
  // Mexicano rounds are drawn one at a time, so not all matches exist yet
  const matchCount = Math.max(status.matchesTotal, matches.length);
  const courtNumbers = [...new Set(matches.map((match) => match.court))].sort(
    (a, b) => a - b,
  );
  const showCourt = courtNumbers.length > 1 || game.courtNames.length > 0;
  const isAnyLeft = matches.some((match) => !isMatchDone(match));
  const names = (team: string[]) =>
    team.map(
      (id) => game.players.find((player) => player.id === id)?.name ?? "?",
    );

  const courts = courtNumbers.map((court): PadelLiveActivityCourt => {
    const label = showCourt ? courtName(game.courtNames, court) : null;
    const index = matches.findIndex(
      (match) => match.court === court && !isMatchDone(match),
    );
    if (index === -1) {
      return {
        court,
        state: {
          ...empty,
          court: label,
          matchNumber: matches.filter(isMatchDone).length,
          matchCount,
          waiting: isAnyLeft
            ? "Waiting for the other courts"
            : "Waiting for the next round",
        },
      };
    }
    const match = matches[index];
    const rating = matchRatings?.[match.id];
    return {
      court,
      state: {
        ...empty,
        team1: names(match.team1),
        team2: names(match.team2),
        team1Rating: rating ? Math.round(rating.team1Rating) : null,
        team2Rating: rating ? Math.round(rating.team2Rating) : null,
        matchNumber: index + 1,
        matchCount,
        court: label,
        matchId: match.id,
      },
    };
  });
  return { courts, finished: null };
}

async function wasStarted(gameId: string) {
  const stored = await AsyncStorage.getItem(STARTED_KEY).catch(() => null);
  const ids: string[] = stored ? JSON.parse(stored) : [];
  return ids.includes(gameId);
}

async function markStarted(gameId: string) {
  const stored = await AsyncStorage.getItem(STARTED_KEY).catch(() => null);
  const ids: string[] = stored ? JSON.parse(stored) : [];
  // Only the latest games are remembered
  const next = [gameId, ...ids.filter((id) => id !== gameId)].slice(0, 50);
  await AsyncStorage.setItem(STARTED_KEY, JSON.stringify(next)).catch(() => {});
}

/**
 * Keeps a card for each court on the Lock Screen while the game is open.
 * They're shown by themselves the first time a game in progress is opened.
 * Once all of them have been swiped away, they only come back with `show`.
 */
export function usePadelLiveActivity(
  game: PadelGame,
  matchRatings: Record<string, PadelMatchRating> | undefined,
) {
  const isSupported = useMemo(
    () => PadelLiveActivity?.isSupported() ?? false,
    [],
  );
  const [isActive, setIsActive] = useState(
    () => isSupported && (PadelLiveActivity?.isActive(game.id) ?? false),
  );
  const states = getLiveActivityStates(game, matchRatings);
  // Effects only rerun when what's shown changes
  const statesJson = JSON.stringify(states);
  // Nothing is shown while every court waits, like for a Mexicano draw
  const hasMatch = states.courts.some((court) => court.state.waiting === null);

  // They can be swiped away while the app is in the background
  useEffect(() => {
    if (!isSupported) return;
    const subscription = AppState.addEventListener("change", (appState) => {
      if (appState === "active") {
        setIsActive(PadelLiveActivity?.isActive(game.id) ?? false);
      }
    });
    return () => subscription.remove();
  }, [isSupported, game.id]);

  useEffect(() => {
    const activity = PadelLiveActivity;
    if (!isSupported || !activity) return;
    const next: LiveActivityStates = JSON.parse(statesJson);
    if (!next.finished && next.courts.length === 0) return;
    let cancelled = false;

    (async () => {
      if (next.finished) {
        await activity.end(game.id, next.finished);
        if (!cancelled) setIsActive(false);
        return;
      }
      const showing = await activity.update(game.id, next.courts);
      if (showing > 0 || cancelled) {
        if (!cancelled) setIsActive(showing > 0);
        return;
      }
      const canStart = next.courts.some((court) => court.state.waiting === null);
      if (!canStart || (await wasStarted(game.id))) {
        if (!cancelled) setIsActive(false);
        return;
      }
      await activity.show(game.id, game.name, next.courts);
      await markStarted(game.id);
      if (!cancelled) setIsActive(true);
    })().catch(() => {
      // Live Activities can be turned off in Settings, the game still works
    });

    return () => {
      cancelled = true;
    };
  }, [isSupported, game.id, game.name, statesJson]);

  /** Brings every court back, for example after some were swiped away */
  const show = useCallback(async () => {
    const activity = PadelLiveActivity;
    if (!activity) return;
    const { courts }: LiveActivityStates = JSON.parse(statesJson);
    if (courts.length === 0) return;
    await activity.show(game.id, game.name, courts);
    await markStarted(game.id);
    setIsActive(true);
  }, [game.id, game.name, statesJson]);

  return {
    /** False on Android, before iOS 16.2, or when turned off in Settings */
    isSupported,
    isActive,
    /** Whether there is a match to show */
    canShow: isSupported && hasMatch,
    show,
  };
}

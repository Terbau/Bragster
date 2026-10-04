"use client";

import { BackArrow } from "@/components/BackArrow/BackArrow";
import { ConfirmModal } from "@/components/ConfirmModal/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { PadelGameWithRounds } from "@/types/padel";
import {
  getPadelProgress,
  getPadelStandings,
  getSittingOut,
  isPadelMatchPlayed,
  isPadelRoundPlayed,
} from "@/utils/padel";
import { cn } from "@/utils/utils";
import { ArrowUpDown, Check, Coffee, Trash2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deletePadelGame,
  reorderPadelRounds,
  updatePadelMatchScore,
} from "../actions";
import { PadelLeaderboard } from "./PadelLeaderboard";
import { RoundOrderDialog } from "./RoundOrderDialog";
import { ScoreDialog } from "./ScoreDialog";

type Match = PadelGameWithRounds["rounds"][number]["matches"][number];
type Score = { team1Score: number | null; team2Score: number | null };

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

const withScore = (
  game: PadelGameWithRounds,
  matchId: string,
  score: Score,
): PadelGameWithRounds => ({
  ...game,
  rounds: game.rounds.map((round) =>
    round.matches.some((match) => match.id === matchId)
      ? {
          ...round,
          matches: round.matches.map((match) =>
            match.id === matchId ? { ...match, ...score } : match,
          ),
        }
      : round,
  ),
});

export const PadelGameView = ({
  game: serverGame,
}: {
  game: PadelGameWithRounds;
}) => {
  const router = useRouter();
  const [game, setGame] = useState(serverGame);
  const [scoring, setScoring] = useState<{
    match: Match;
    roundNumber: number;
  } | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSavingOrder, startSavingOrder] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const progress = getPadelProgress(game);
  const [view, setView] = useState<"rounds" | "standings">(
    progress.isFinished ? "standings" : "rounds",
  );
  const currentRoundRef = useRef<HTMLLIElement>(null);

  useEffect(() => setGame(serverGame), [serverGame]);

  // Start at the round being played
  // biome-ignore lint/correctness/useExhaustiveDependencies: only on open
  useEffect(() => {
    if (progress.currentRoundIndex > 0) {
      currentRoundRef.current?.scrollIntoView({ block: "center" });
    }
  }, []);

  const playerNames: Record<string, string> = {};
  for (const player of game.players) playerNames[player.id] = player.name;
  const winner = progress.isFinished ? getPadelStandings(game)[0] : undefined;

  const saveScore = async (score: Score) => {
    if (!scoring) return;
    const { match } = scoring;
    setScoring(null);
    const previous = game;
    setGame(withScore(game, match.id, score));
    try {
      await updatePadelMatchScore(game.id, match.id, score);
      router.refresh();
    } catch (error) {
      setGame(previous);
      toast.error(errorMessage(error));
    }
  };

  const saveOrder = (roundIds: string[]) =>
    startSavingOrder(async () => {
      try {
        setGame(await reorderPadelRounds(game.id, { roundIds }));
        setOrderOpen(false);
        toast.success("Order of rounds saved");
        router.refresh();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });

  const deleteGame = () =>
    startDeleting(async () => {
      try {
        await deletePadelGame(game.id);
        router.push("/padel");
        router.refresh();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });

  return (
    <div className="max-w-5xl w-full mx-auto px-3 sm:px-6 py-10 space-y-8">
      <div className="space-y-4">
        <BackArrow href="/padel" label="All games" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{game.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {game.players.length} players · {game.courts}{" "}
              {game.courts === 1 ? "court" : "courts"} · {game.pointsPerMatch}{" "}
              points per match
            </p>
          </div>
          <div className="flex gap-2">
            {!progress.isFinished && (
              <Button variant="outline" onClick={() => setOrderOpen(true)}>
                <ArrowUpDown className="w-4 h-4 mr-1.5" />
                Order of rounds
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDeleteOpen(true)}
              aria-label="Delete game"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {winner ? (
          <div className="flex items-center gap-3 rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-3">
            <Trophy className="w-6 h-6 text-amber-500 shrink-0" />
            <p className="text-sm">
              <span className="font-semibold">{winner.name}</span> won with{" "}
              {winner.total} points!
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {progress.currentRoundIndex >= 0 &&
                  `Round ${progress.currentRoundIndex + 1} of ${game.rounds.length}`}
              </span>
              <span>
                {progress.played} of {progress.total} matches played
              </span>
            </div>
            <Progress
              value={(progress.played / Math.max(1, progress.total)) * 100}
              className="h-2"
            />
          </div>
        )}
      </div>

      <div className="flex bg-muted rounded-lg p-1 gap-1 lg:hidden">
        {(
          [
            ["rounds", "Rounds"],
            ["standings", "Leaderboard"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              view === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <ol className={cn("space-y-3", view !== "rounds" && "hidden lg:block")}>
          {game.rounds.map((round, index) => {
            const isPlayed = isPadelRoundPlayed(round);
            const isCurrent = index === progress.currentRoundIndex;
            const resting = getSittingOut(game.players, round);
            return (
              <li
                key={round.id}
                ref={isCurrent ? currentRoundRef : undefined}
                className={cn(
                  "rounded-xl border bg-card p-3 space-y-1 scroll-mt-24",
                  isCurrent
                    ? "border-foreground/40 shadow-sm"
                    : "border-border",
                  isPlayed && "opacity-75",
                )}
              >
                <div className="flex items-center gap-2 px-1 pb-1">
                  <h2 className="text-sm font-semibold">Round {index + 1}</h2>
                  {isPlayed ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    isCurrent && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                        Now
                      </span>
                    )
                  )}
                </div>
                {round.matches.map((match) => (
                  <MatchRow
                    key={match.id}
                    match={match}
                    showCourt={round.matches.length > 1}
                    playerNames={playerNames}
                    onPress={() =>
                      setScoring({ match, roundNumber: index + 1 })
                    }
                  />
                ))}
                {resting.length > 0 && (
                  <p className="flex items-center gap-1.5 px-1 pt-1 text-xs text-muted-foreground">
                    <Coffee className="w-3.5 h-3.5 shrink-0" />
                    Sitting out: {resting.map((p) => p.name).join(", ")}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <aside
          className={cn(
            "space-y-3 lg:sticky lg:top-6",
            view !== "standings" && "hidden lg:block",
          )}
        >
          <h2 className="font-semibold flex items-center gap-1.5">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </h2>
          <PadelLeaderboard game={game} />
        </aside>
      </div>

      <ScoreDialog
        match={scoring?.match ?? null}
        roundNumber={scoring?.roundNumber ?? 0}
        pointsPerMatch={game.pointsPerMatch}
        playerNames={playerNames}
        onSave={saveScore}
        onClose={() => setScoring(null)}
      />
      <RoundOrderDialog
        open={orderOpen}
        game={game}
        isSaving={isSavingOrder}
        onSave={saveOrder}
        onClose={() => setOrderOpen(false)}
      />
      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        type="delete"
        title="Delete game?"
        description={`${game.name} and all its scores will be deleted. This can't be undone.`}
        isLoading={isDeleting}
        onConfirm={deleteGame}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
};

const MatchRow = ({
  match,
  showCourt,
  playerNames,
  onPress,
}: {
  match: Match;
  showCourt: boolean;
  playerNames: Record<string, string>;
  onPress: () => void;
}) => {
  const isPlayed = isPadelMatchPlayed(match);
  const team1Won =
    isPlayed && (match.team1Score ?? 0) > (match.team2Score ?? 0);
  const team2Won =
    isPlayed && (match.team2Score ?? 0) > (match.team1Score ?? 0);
  const names = (ids: string[]) => ids.map((id) => playerNames[id]).join(" & ");

  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full rounded-lg px-1 py-2 text-sm hover:bg-accent transition-colors text-left group"
    >
      {showCourt && (
        <span className="block text-[11px] text-muted-foreground text-center mb-1">
          Court {match.court}
        </span>
      )}
      <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span
          className={cn(
            "text-right",
            team1Won && "font-semibold",
            team2Won && "text-muted-foreground",
          )}
        >
          {names(match.team1)}
        </span>
        <span
          className={cn(
            "min-w-[4.5rem] rounded-md px-2 py-1 text-center tabular-nums font-semibold",
            isPlayed
              ? "bg-muted"
              : "border border-dashed border-border text-muted-foreground font-normal group-hover:border-foreground/40",
          )}
        >
          {isPlayed ? `${match.team1Score} – ${match.team2Score}` : "Score"}
        </span>
        <span
          className={cn(
            team2Won && "font-semibold",
            team1Won && "text-muted-foreground",
          )}
        >
          {names(match.team2)}
        </span>
      </span>
    </button>
  );
};

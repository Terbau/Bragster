"use client";

import { BackArrow } from "@/components/BackArrow/BackArrow";
import { ConfirmModal } from "@/components/ConfirmModal/ConfirmModal";
import { LoadingButton } from "@/components/LoadingButton/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PadelGameVideos as Videos } from "@/app/padel/_lib/videos";
import type { PadelGameWithRounds } from "@/types/padel";
import {
  getCurrentPadelSeries,
  getPadelGameStatus,
  isPadelRoundStarted,
  padelCourtName,
  padelFormatLabel,
} from "@/utils/padel";
import type { PadelMatchRating } from "@/utils/padelStats";
import { cn } from "@/utils/utils";
import {
  ArrowUpDown,
  CopyPlus,
  Ellipsis,
  Flag,
  ListX,
  Pencil,
  Plus,
  Repeat,
  Share2,
  Trash2,
  Trophy,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { PadelGameSummary } from "../_components/PadelGameSummary";
import { PadelGameVideos } from "../_components/PadelGameVideos";
import { PadelLeaderboard } from "../_components/PadelLeaderboard";
import { padelPlayerNames } from "../_components/PadelRoundCard";
import { PadelRoundsList } from "../_components/PadelRoundsList";
import { PadelUpNext } from "../_components/PadelUpNext";
import { videoHref } from "../_components/padelFormat";
import {
  addPadelSeries,
  deletePadelGame,
  endPadelRound,
  endPadelSeries,
  removePadelSeries,
  reorderPadelRounds,
  updatePadelGame,
  updatePadelMatchScore,
} from "../actions";
import { EditGameDialog } from "./EditGameDialog";
import { RoundOrderDialog } from "./RoundOrderDialog";
import { ScoreDialog } from "./ScoreDialog";
import { ShareDialog } from "./ShareDialog";
import { UploadVideoDialog } from "./UploadVideoDialog";

type Round = PadelGameWithRounds["rounds"][number];
type Match = Round["matches"][number];
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

/** The video of each filmed match */
const matchVideoHrefs = (gameId: string, videos: Videos) => {
  const hrefs: Record<string, string> = {};
  for (const recording of videos.recordings) {
    for (const match of recording.matches) {
      if (match.rallies.length > 0) {
        hrefs[match.matchId] ??= videoHref(gameId, recording.id, {
          matchId: match.matchId,
        });
      }
    }
  }
  return hrefs;
};

export const PadelGameView = ({
  game: serverGame,
  videos,
  matchRatings,
}: {
  game: PadelGameWithRounds;
  videos: Videos;
  /** The ratings in played matches, by match id */
  matchRatings: Record<string, PadelMatchRating>;
}) => {
  const router = useRouter();
  const [game, setGame] = useState(serverGame);
  const [scoring, setScoring] = useState<{
    match: Match;
    roundNumber: number;
  } | null>(null);
  const [dialog, setDialog] = useState<
    | "order"
    | "delete"
    | "edit"
    | "share"
    | "upload"
    | "endSeries"
    | "removeSeries"
    | null
  >(null);
  const [ending, setEnding] = useState<{
    round: Round;
    roundNumber: number;
  } | null>(null);
  const [isEnding, startEnding] = useTransition();
  const [isSavingOrder, startSavingOrder] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isContinuing, startContinuing] = useTransition();
  const status = getPadelGameStatus(game);
  const isMexicano = game.format === "MEXICANO";
  // A series nobody has played yet can be taken back, unless it's the only one
  const canRemoveSeries =
    !isMexicano &&
    status.seriesCount > 1 &&
    !getCurrentPadelSeries(game.rounds).rounds.some(isPadelRoundStarted);
  const [view, setView] = useState<"rounds" | "standings">(
    status.isFinished ? "standings" : "rounds",
  );

  useEffect(() => setGame(serverGame), [serverGame]);

  const playerNames = padelPlayerNames(game);
  const closeDialog = () => setDialog(null);

  const saveScore = async (match: Match, score: Score, isUndo = false) => {
    const previous = {
      team1Score: match.team1Score,
      team2Score: match.team2Score,
    };
    setGame((current) => withScore(current, match.id, score));
    try {
      await updatePadelMatchScore(game.id, match.id, score);
      router.refresh();
      if (!isUndo) {
        toast.success(
          score.team1Score === null
            ? "Score cleared"
            : `Score saved: ${score.team1Score}–${score.team2Score}`,
          {
            duration: 6000,
            action: {
              label: "Undo",
              onClick: () => saveScore({ ...match, ...score }, previous, true),
            },
          },
        );
      }
    } catch (error) {
      setGame((current) => withScore(current, match.id, previous));
      toast.error(errorMessage(error));
    }
  };

  const saveOrder = (roundIds: string[]) =>
    startSavingOrder(async () => {
      try {
        setGame(await reorderPadelRounds(game.id, { roundIds }));
        closeDialog();
        toast.success("Order of rounds saved");
        router.refresh();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });

  // A new series of an Americano, or one more round of a Mexicano
  const playMore = () =>
    startContinuing(async () => {
      try {
        setGame(
          isMexicano
            ? await updatePadelGame(game.id, {
                plannedRounds: status.totalRounds + 1,
              })
            : await addPadelSeries(game.id),
        );
        setView("rounds");
        toast.success(isMexicano ? "Round added" : "New series started");
        router.refresh();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });

  const endRound = (round: Round) =>
    startEnding(async () => {
      try {
        setGame(await endPadelRound(game.id, round.id));
        setEnding(null);
        toast.success("Round ended");
        router.refresh();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });

  const endSeries = () =>
    startEnding(async () => {
      try {
        setGame(await endPadelSeries(game.id));
        closeDialog();
        setView("standings");
        toast.success(isMexicano ? "Game ended" : "Series ended");
        router.refresh();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });

  const removeSeries = () =>
    startEnding(async () => {
      try {
        setGame(await removePadelSeries(game.id));
        closeDialog();
        toast.success("Series removed");
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

  const onPressMatch = (match: Match, roundNumber: number) =>
    setScoring({ match, roundNumber });

  return (
    <div className="max-w-5xl w-full mx-auto px-3 sm:px-6 py-10 space-y-8">
      <div className="space-y-4">
        <BackArrow href="/padel" label="All games" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{game.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {padelFormatLabel(game.format)} · {game.players.length} players ·{" "}
              {game.courts} {game.courts === 1 ? "court" : "courts"} ·{" "}
              {game.pointsPerMatch} points per match
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDialog("share")}>
              <Share2 className="w-4 h-4 mr-1.5" />
              Share
            </Button>
            {!isMexicano && !status.isFinished && (
              <Button variant="outline" onClick={() => setDialog("order")}>
                <ArrowUpDown className="w-4 h-4 mr-1.5" />
                Order of rounds
              </Button>
            )}
            {/* Not modal, so the dialogs it opens get the focus */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More">
                  <Ellipsis className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setDialog("edit")}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit game
                </DropdownMenuItem>
                {videos.isEnabled && (
                  <DropdownMenuItem onSelect={() => setDialog("upload")}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload a video
                  </DropdownMenuItem>
                )}
                {!status.isFinished && status.matchesPlayed > 0 && (
                  <DropdownMenuItem onSelect={() => setDialog("endSeries")}>
                    <Flag className="w-4 h-4 mr-2" />
                    {isMexicano ? "End game early" : "End series early"}
                  </DropdownMenuItem>
                )}
                {canRemoveSeries && (
                  <DropdownMenuItem onSelect={() => setDialog("removeSeries")}>
                    <ListX className="w-4 h-4 mr-2" />
                    Remove series {status.series}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/padel/new?from=${game.id}`}>
                    <CopyPlus className="w-4 h-4 mr-2" />
                    Play again
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setDialog("delete")}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete game
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <PadelGameSummary
          game={game}
          finishedAction={
            <LoadingButton
              variant="outline"
              isLoading={isContinuing}
              onClick={playMore}
            >
              {isMexicano ? (
                <Plus className="w-4 h-4 mr-1.5" />
              ) : (
                <Repeat className="w-4 h-4 mr-1.5" />
              )}
              {isMexicano ? "Play one more round" : "Play another series"}
            </LoadingButton>
          }
        />
      </div>

      <PadelUpNext
        game={game}
        onPressMatch={onPressMatch}
        onEndRound={(round, roundNumber) => setEnding({ round, roundNumber })}
        matchRatings={matchRatings}
      />

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
        <div className={cn(view !== "rounds" && "hidden lg:block")}>
          <PadelRoundsList
            game={game}
            onPressMatch={onPressMatch}
            videoHrefs={matchVideoHrefs(game.id, videos)}
            matchRatings={matchRatings}
          />
        </div>

        <aside
          className={cn(
            "space-y-3 lg:sticky lg:top-6",
            view !== "standings" && "hidden lg:block",
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </h2>
            <Link
              href="/padel/players"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              All players
            </Link>
          </div>
          <PadelLeaderboard game={game} linkPlayers />
        </aside>
      </div>

      <PadelGameVideos
        gameId={game.id}
        courtNames={game.courtNames}
        videos={videos}
        onUpload={() => setDialog("upload")}
      />

      <ScoreDialog
        match={scoring?.match ?? null}
        roundNumber={scoring?.roundNumber ?? 0}
        courtName={
          scoring ? padelCourtName(game.courtNames, scoring.match.court) : ""
        }
        pointsPerMatch={game.pointsPerMatch}
        playerNames={playerNames}
        onSave={(score) => {
          if (scoring) void saveScore(scoring.match, score);
          setScoring(null);
        }}
        onClose={() => setScoring(null)}
      />
      {!isMexicano && (
        <RoundOrderDialog
          open={dialog === "order"}
          game={game}
          isSaving={isSavingOrder}
          onSave={saveOrder}
          onClose={closeDialog}
        />
      )}
      <EditGameDialog
        open={dialog === "edit"}
        game={game}
        onSaved={(updated) => {
          setGame(updated);
          closeDialog();
          router.refresh();
        }}
        onClose={closeDialog}
      />
      <ShareDialog
        open={dialog === "share"}
        game={game}
        onGameChange={(updated) => {
          setGame(updated);
          router.refresh();
        }}
        onClose={closeDialog}
      />
      {videos.isEnabled && (
        <UploadVideoDialog
          open={dialog === "upload"}
          game={game}
          onClose={() => {
            closeDialog();
            router.refresh();
          }}
        />
      )}
      <ConfirmModal
        open={ending !== null}
        onOpenChange={(open) => !open && setEnding(null)}
        title={`End round ${ending?.roundNumber ?? ""}?`}
        description="Matches without a score won't be played. Their players get their average points per match for them, so nobody falls behind. You can still enter a score for them later."
        isLoading={isEnding}
        onConfirm={() => ending && endRound(ending.round)}
        onCancel={() => setEnding(null)}
      />
      <ConfirmModal
        open={dialog === "endSeries"}
        onOpenChange={(open) => !open && closeDialog()}
        title={isMexicano ? "End the game now?" : "End the series now?"}
        description={`Rounds that haven't started are removed, and matches without a score won't be played. Players who end up with fewer matches than the others get their average points per match for each missing one. ${
          isMexicano
            ? "You can still play more rounds afterwards."
            : "You can still play another series afterwards."
        }`}
        isLoading={isEnding}
        onConfirm={endSeries}
        onCancel={closeDialog}
      />
      <ConfirmModal
        open={dialog === "removeSeries"}
        onOpenChange={(open) => !open && closeDialog()}
        type="delete"
        title={`Remove series ${status.series}?`}
        description={`None of its matches have been played. Its rounds are removed, and the game is back to where it was after series ${status.series - 1}. You can start a new series afterwards.`}
        isLoading={isEnding}
        onConfirm={removeSeries}
        onCancel={closeDialog}
      />
      <ConfirmModal
        open={dialog === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
        type="delete"
        title="Delete game?"
        description={`${game.name} and all its scores will be deleted. This can't be undone.`}
        isLoading={isDeleting}
        onConfirm={deleteGame}
        onCancel={closeDialog}
      />
    </div>
  );
};

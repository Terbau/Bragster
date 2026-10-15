"use client";

import type { PadelRecordingView } from "@/app/padel/_lib/videos";
import { BackArrow } from "@/components/BackArrow/BackArrow";
import { ConfirmModal } from "@/components/ConfirmModal/ConfirmModal";
import { LoadingButton } from "@/components/LoadingButton/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PadelGameWithRounds } from "@/types/padel";
import { formatDateWithTime } from "@/utils/date";
import { padelCourtName } from "@/utils/padel";
import {
  LONG_RALLY_SECONDS,
  padelCourtMatches,
  type PadelTeamNumber,
  type PadelVideoMatch,
  type PadelVideoRally,
} from "@/utils/padelVideo";
import { cn } from "@/utils/utils";
import {
  ArrowLeftRight,
  Check,
  Download,
  Ellipsis,
  Layers,
  ListVideo,
  Loader2,
  Play,
  RefreshCw,
  SkipForward,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { padelPlayerNames } from "../../../_components/PadelRoundCard";
import { VideoMatchChooser } from "../../../_components/VideoMatchChooser";
import {
  formatClock,
  formatPlayTime,
  formatRallyLength,
} from "../../../_components/padelFormat";
import {
  matchRoundLabel,
  recordingRounds,
  recordingStatus,
} from "../../../_components/padelVideoLabels";
import {
  analyzePadelRecording,
  deletePadelRecording,
  updatePadelRally,
  updatePadelRecording,
} from "../../../videoActions";

type Filter = "all" | "team1" | "team2" | "unsure" | "long";

interface PadelVideoViewProps {
  game: PadelGameWithRounds;
  recording: PadelRecordingView;
  initialMatchId?: string;
  initialRallyId?: string;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export const PadelVideoView = ({
  game,
  recording: serverRecording,
  initialMatchId,
  initialRallyId,
}: PadelVideoViewProps) => {
  const router = useRouter();
  const [recording, setRecording] = useState(serverRecording);
  useEffect(() => setRecording(serverRecording), [serverRecording]);
  // A new link would load the video again, so the first one is kept
  const [videoUrl, setVideoUrl] = useState(serverRecording.videoUrl);
  useEffect(() => {
    if (!videoUrl && serverRecording.videoUrl) {
      setVideoUrl(serverRecording.videoUrl);
    }
  }, [serverRecording.videoUrl, videoUrl]);

  const status = recordingStatus(recording);
  // Check again while the video is uploaded and analysed
  useEffect(() => {
    if (!status.isBusy) return;
    const timer = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(timer);
  }, [status.isBusy, router]);

  const playerNames = padelPlayerNames(game);
  const names = (ids: string[]) => ids.map((id) => playerNames[id]).join(" & ");

  const [matchId, setMatchId] = useState(
    () =>
      (
        recording.matches.find((m) => m.matchId === initialMatchId) ??
        recording.matches.find((m) =>
          m.rallies.some((r) => r.id === initialRallyId),
        ) ??
        recording.matches[0]
      )?.matchId,
  );
  const match =
    recording.matches.find((m) => m.matchId === matchId) ??
    recording.matches[0] ??
    null;
  const rallies = match ? match.rallies : recording.unplaced;

  const [filter, setFilter] = useState<Filter>("all");
  const visible = rallies.filter((rally) => {
    switch (filter) {
      case "team1":
        return rally.winnerTeam === 1;
      case "team2":
        return rally.winnerTeam === 2;
      case "unsure":
        return !rally.isIgnored && rally.winnerTeam === null;
      case "long":
        return !rally.isIgnored && rally.duration >= LONG_RALLY_SECONDS;
      default:
        return true;
    }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlay, setCanPlay] = useState(true);
  const [clip, setClip] = useState<{
    id: string;
    start: number;
    end: number;
    playAll: boolean;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<"match" | "matches" | "delete" | null>(
    null,
  );
  const [isReviewing, setIsReviewing] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);

  const playRally = (rally: PadelVideoRally, playAll = false) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = rally.start;
    void video.play().catch(() => {});
    setClip({ id: rally.id, start: rally.start, end: rally.end, playAll });
  };

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (clip && video.currentTime >= clip.end) {
      if (clip.playAll) {
        const next = visible[visible.findIndex((r) => r.id === clip.id) + 1];
        if (next) {
          playRally(next, true);
          return;
        }
      }
      video.pause();
      setClip(null);
    }
  };

  // Jumping elsewhere in the video stops the clip
  const onSeeked = () => {
    const time = videoRef.current?.currentTime ?? 0;
    if (clip && (time < clip.start - 0.5 || time > clip.end)) {
      setClip(null);
    }
  };

  // A link to a rally starts there
  const startedAtRally = useRef(false);
  const onLoadedMetadata = () => {
    if (startedAtRally.current || !initialRallyId) return;
    startedAtRally.current = true;
    const rally = rallies.find((r) => r.id === initialRallyId);
    if (rally && videoRef.current) {
      videoRef.current.currentTime = rally.start;
      setClip({
        id: rally.id,
        start: rally.start,
        end: rally.end,
        playAll: false,
      });
    }
  };

  const currentRally = rallies.find(
    (rally) => currentTime >= rally.start && currentTime < rally.end,
  );

  const update = (action: () => Promise<PadelRecordingView>, done?: string) =>
    startTransition(async () => {
      try {
        setRecording(await action());
        if (done) toast.success(done);
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });

  const setWinner = (rally: PadelVideoRally, team: PadelTeamNumber | null) =>
    match &&
    update(() =>
      updatePadelRally(game.id, recording.id, rally.id, {
        winner: team ? { matchId: match.matchId, team } : null,
      }),
    );

  const setIgnored = (rally: PadelVideoRally, isIgnored: boolean) =>
    update(() =>
      updatePadelRally(game.id, recording.id, rally.id, { isIgnored }),
    );

  const setNearTeam = (team: PadelTeamNumber | null) =>
    match &&
    update(() =>
      updatePadelRecording(game.id, recording.id, {
        nearTeam: { matchId: match.matchId, team },
      }),
    );

  const analyzeAgain = () =>
    update(
      () => analyzePadelRecording(game.id, recording.id),
      "The rallies will be found again in a few minutes",
    );

  const deleteVideo = () =>
    startTransition(async () => {
      try {
        await deletePadelRecording(game.id, recording.id);
        router.push(`/padel/${game.id}`);
        router.refresh();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });

  // Going through the rallies where it isn't known who won
  const toReview = rallies.filter(
    (rally) =>
      !rally.isIgnored &&
      rally.winnerTeam === null &&
      !skipped.includes(rally.id),
  );
  const reviewing = isReviewing ? toReview[0] : undefined;
  // biome-ignore lint/correctness/useExhaustiveDependencies: play each new rally once
  useEffect(() => {
    if (reviewing) playRally(reviewing);
  }, [reviewing?.id]);

  const courtName = padelCourtName(game.courtNames, recording.court);
  const rounds = recordingRounds(recording);

  return (
    <div className="max-w-6xl w-full mx-auto px-3 sm:px-6 py-10 space-y-6">
      <div className="space-y-4">
        <BackArrow href={`/padel/${game.id}`} label={game.name} />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {courtName}
              {rounds && (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  · {rounds}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {formatDateWithTime(new Date(recording.recordedAt))}
              {recording.duration !== null &&
                ` · ${formatPlayTime(recording.duration)}`}
              {" · "}
              {status.text}
            </p>
          </div>
          {/* Not modal, so the dialogs it opens get the focus */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More">
                <Ellipsis className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setDialog("match")}>
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Change match
              </DropdownMenuItem>
              {recording.maxMatchCount > 1 && (
                <DropdownMenuItem onSelect={() => setDialog("matches")}>
                  <Layers className="w-4 h-4 mr-2" />
                  Matches in the video
                </DropdownMenuItem>
              )}
              {recording.status !== "UPLOADING" && (
                <DropdownMenuItem onSelect={analyzeAgain}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Find the rallies again
                </DropdownMenuItem>
              )}
              {videoUrl && (
                <DropdownMenuItem asChild>
                  <a href={videoUrl} download>
                    <Download className="w-4 h-4 mr-2" />
                    Download video
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setDialog("delete")}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete video
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {recording.status !== "READY" && (
        <StatusBanner
          recording={recording}
          isPending={isPending}
          onRetry={analyzeAgain}
        />
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
        <div className="space-y-3 lg:sticky lg:top-6">
          <div className="rounded-xl bg-black overflow-hidden flex justify-center">
            {videoUrl ? (
              // biome-ignore lint/a11y/useMediaCaption: filmed padel matches have no captions
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                playsInline
                preload="metadata"
                onTimeUpdate={onTimeUpdate}
                onSeeked={onSeeked}
                onLoadedMetadata={onLoadedMetadata}
                onError={() => setCanPlay(false)}
                className="max-h-[75vh] w-full object-contain"
              />
            ) : (
              <div className="aspect-video w-full flex items-center justify-center text-sm text-white/70">
                The video shows up here when it has been uploaded.
              </div>
            )}
          </div>
          {!canPlay && (
            <p className="text-sm text-muted-foreground">
              This browser can't play the video, which is likely because it's
              HEVC, the iPhone camera's format. Try Safari, Chrome or Edge, or
              download it.
            </p>
          )}
          {visible.length > 0 && videoUrl && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => playRally(visible[0], true)}
              >
                <ListVideo className="w-4 h-4 mr-1.5" />
                Play {filter === "all" ? "all rallies" : "these rallies"}
              </Button>
              {currentRally && (
                <p className="text-sm text-muted-foreground">
                  {currentRally.isIgnored
                    ? "Not a point"
                    : `Rally ${currentRally.number}`}
                  {clip?.playAll && " · playing the rallies one after another"}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {recording.matches.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {recording.matches.map((m) => (
                <button
                  key={m.matchId}
                  type="button"
                  onClick={() => {
                    setMatchId(m.matchId);
                    setIsReviewing(false);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    m.matchId === match?.matchId
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-accent",
                  )}
                >
                  {matchRoundLabel(m)}
                </button>
              ))}
            </div>
          )}

          {match ? (
            <MatchCard
              match={match}
              names={names}
              isPending={isPending}
              onNearTeam={setNearTeam}
              onReview={() => {
                setSkipped([]);
                setIsReviewing(true);
              }}
            />
          ) : (
            recording.status === "READY" && (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  The match this video started with is no longer in the game.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialog("match")}
                >
                  Choose the match
                </Button>
              </div>
            )
          )}

          {isReviewing && match && (
            <div className="rounded-xl border border-foreground/30 bg-card p-4 space-y-3 shadow-sm">
              {reviewing ? (
                <>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold">
                      Who won rally {reviewing.number}?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {toReview.length} left
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {([1, 2] as const).map((team) => (
                      <Button
                        key={team}
                        variant="outline"
                        disabled={isPending}
                        onClick={() => setWinner(reviewing, team)}
                        className="h-auto py-2 whitespace-normal"
                      >
                        {names(team === 1 ? match.team1 : match.team2)}
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playRally(reviewing)}
                    >
                      <Play className="w-4 h-4 mr-1.5" />
                      Watch again
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => setIgnored(reviewing, true)}
                    >
                      Not a point
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSkipped((ids) => [...ids, reviewing.id])
                      }
                    >
                      <SkipForward className="w-4 h-4 mr-1.5" />
                      Skip
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setIsReviewing(false)}
                    >
                      Done
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm">
                    <Check className="inline w-4 h-4 mr-1 text-green-600" />
                    {skipped.length > 0
                      ? "You've been through every rally."
                      : "It's known who won every rally."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReviewing(false)}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          )}

          {rallies.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["all", "All"],
                    ...(match
                      ? ([
                          ["team1", `${names(match.team1)} won`],
                          ["team2", `${names(match.team2)} won`],
                        ] as const)
                      : []),
                    ["unsure", "Not sure"],
                    ["long", "Long rallies"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs transition-colors",
                      filter === value
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {visible.length === 0 ? (
                <p className="text-sm text-muted-foreground px-2 py-4">
                  No rallies here.
                </p>
              ) : (
                <ol className="rounded-xl border border-border bg-card divide-y divide-border lg:max-h-[60vh] lg:overflow-y-auto">
                  {visible.map((rally) => (
                    <RallyRow
                      key={rally.id}
                      rally={rally}
                      match={match}
                      names={names}
                      isCurrent={rally.id === currentRally?.id}
                      canPlay={Boolean(videoUrl)}
                      onPlay={() => playRally(rally)}
                      onWinner={(team) => setWinner(rally, team)}
                      onIgnored={(isIgnored) => setIgnored(rally, isIgnored)}
                    />
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>

      <ChangeMatchDialog
        open={dialog === "match"}
        game={game}
        recording={recording}
        isPending={isPending}
        onSave={(firstMatchId) => {
          update(
            () =>
              updatePadelRecording(game.id, recording.id, {
                matchId: firstMatchId,
              }),
            "Match changed",
          );
          setMatchId(firstMatchId);
          setDialog(null);
        }}
        onClose={() => setDialog(null)}
      />
      <MatchCountDialog
        open={dialog === "matches"}
        recording={recording}
        isPending={isPending}
        onSave={(matchCount) => {
          update(() =>
            updatePadelRecording(game.id, recording.id, { matchCount }),
          );
          setDialog(null);
        }}
        onClose={() => setDialog(null)}
      />
      <ConfirmModal
        open={dialog === "delete"}
        onOpenChange={(open) => !open && setDialog(null)}
        type="delete"
        title="Delete video?"
        description="The video and its rallies will be deleted. The scores of the game stay. This can't be undone."
        isLoading={isPending}
        onConfirm={deleteVideo}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
};

const StatusBanner = ({
  recording,
  isPending,
  onRetry,
}: {
  recording: PadelRecordingView;
  isPending: boolean;
  onRetry: () => void;
}) => {
  if (recording.status === "FAILED") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3">
        <TriangleAlert className="w-5 h-5 text-destructive shrink-0" />
        <p className="flex-1 text-sm">
          The rallies couldn't be found
          {recording.error ? `: ${recording.error}` : "."}
        </p>
        <LoadingButton
          variant="outline"
          size="sm"
          isLoading={isPending}
          onClick={onRetry}
        >
          Try again
        </LoadingButton>
      </div>
    );
  }
  const text =
    recording.status === "UPLOADING"
      ? "The video is still uploading. If it was uploaded from this browser and the page was closed, delete it and upload it again."
      : recording.status === "UPLOADED"
        ? "The video is waiting to be analysed. The rallies usually show up within a few minutes."
        : "Finding the rallies. This takes a few minutes for a long video.";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground shrink-0" />
      <p className="text-sm">{text}</p>
    </div>
  );
};

const MatchCard = ({
  match,
  names,
  isPending,
  onNearTeam,
  onReview,
}: {
  match: PadelVideoMatch;
  names: (ids: string[]) => string;
  isPending: boolean;
  onNearTeam: (team: PadelTeamNumber | null) => void;
  onReview: () => void;
}) => {
  const { stats } = match;
  const hasScore = match.team1Score !== null && match.team2Score !== null;
  const points = (match.team1Score ?? 0) + (match.team2Score ?? 0);
  const unsure = stats.rallies - stats.decided;
  const nearChoice = match.isNearTeamGuess ? "guess" : match.nearTeam;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <p className="text-xs text-muted-foreground">
          {matchRoundLabel(match)}
        </p>
        <p className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-1 text-sm">
          <span className="text-right font-medium">{names(match.team1)}</span>
          <span className="rounded-md bg-muted px-2 py-1 tabular-nums font-semibold">
            {hasScore ? `${match.team1Score} – ${match.team2Score}` : "–"}
          </span>
          <span className="font-medium">{names(match.team2)}</span>
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <SmallStat label="Rallies" value={stats.rallies} />
        <SmallStat label="In play" value={formatPlayTime(stats.playTime)} />
        <SmallStat
          label="Average"
          value={stats.rallies ? formatRallyLength(stats.averageRally) : "–"}
        />
        <SmallStat
          label="Longest"
          value={
            stats.longestRally
              ? formatRallyLength(stats.longestRally.duration)
              : "–"
          }
        />
      </div>

      {hasScore && stats.rallies > 0 && stats.rallies !== points && (
        <p className="text-xs text-muted-foreground">
          {stats.rallies} rallies were found for {points} points.{" "}
          {stats.rallies > points
            ? "Mark the ones that weren't points, like the warm up."
            : "The video may not have the whole match, or some points weren't found."}
        </p>
      )}

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Nearest the camera</p>
        <div className="flex bg-muted rounded-lg p-1 gap-1">
          {(
            [
              [1, names(match.team1)],
              [2, names(match.team2)],
              ["guess", "Guess"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={isPending}
              onClick={() => onNearTeam(value === "guess" ? null : value)}
              className={cn(
                "flex-1 px-2 py-1 rounded-md text-xs font-medium transition-all truncate",
                nearChoice === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {match.isNearTeamGuess && (
          <p className="text-xs text-muted-foreground">
            {match.nearTeam
              ? `Guessed: ${names(match.nearTeam === 1 ? match.team1 : match.team2)}`
              : "Not enough to go on yet. Choose the team, or say who won a few rallies."}
          </p>
        )}
      </div>

      {stats.rallies > 0 && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span>Who won</span>
            <span className="text-muted-foreground text-xs">
              Known for {stats.decided} of {stats.rallies} rallies
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground/70"
              style={{ width: `${(stats.decided / stats.rallies) * 100}%` }}
            />
          </div>
          {stats.decided > 0 && (
            <p className="text-xs text-muted-foreground">
              {names(match.team1)} won {stats.team1.won}, {names(match.team2)}{" "}
              won {stats.team2.won}
            </p>
          )}
          {unsure > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onReview}
            >
              Go through the {unsure} {unsure === 1 ? "rally" : "rallies"} where
              it's not sure
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const SmallStat = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="rounded-lg bg-muted/60 px-1 py-2">
    <p className="text-[11px] text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold">{value}</p>
  </div>
);

const RallyRow = ({
  rally,
  match,
  names,
  isCurrent,
  canPlay,
  onPlay,
  onWinner,
  onIgnored,
}: {
  rally: PadelVideoRally;
  match: PadelVideoMatch | null;
  names: (ids: string[]) => string;
  isCurrent: boolean;
  canPlay: boolean;
  onPlay: () => void;
  onWinner: (team: PadelTeamNumber | null) => void;
  onIgnored: (isIgnored: boolean) => void;
}) => {
  const winnerNames =
    match && rally.winnerTeam
      ? names(rally.winnerTeam === 1 ? match.team1 : match.team2)
      : null;

  return (
    <li
      className={cn(
        "flex items-center gap-1 pr-1 transition-colors",
        isCurrent && "bg-accent",
      )}
    >
      <button
        type="button"
        disabled={!canPlay}
        onClick={onPlay}
        className="flex-1 min-w-0 flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent/60 disabled:hover:bg-transparent"
      >
        <span className="w-7 shrink-0 text-xs text-muted-foreground tabular-nums">
          {rally.isIgnored ? "–" : rally.number}
        </span>
        <span className="w-14 shrink-0 tabular-nums">
          {formatClock(rally.start)}
        </span>
        <span className="w-10 shrink-0 text-xs text-muted-foreground tabular-nums">
          {formatRallyLength(rally.duration)}
        </span>
        <span className="min-w-0 truncate">
          {rally.isIgnored ? (
            <span className="text-xs text-muted-foreground line-through">
              Not a point
            </span>
          ) : winnerNames ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                rally.winnerSource === "manual"
                  ? "bg-foreground text-background"
                  : "border border-dashed border-foreground/40",
              )}
              title={
                rally.winnerSource === "manual"
                  ? "Set by you"
                  : "Guessed from the video and the score"
              }
            >
              {rally.winnerSource === "manual" && <Check className="w-3 h-3" />}
              {winnerNames}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Not sure</span>
          )}
        </span>
      </button>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            aria-label={`Change rally ${rally.number}`}
          >
            <Ellipsis className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {match && !rally.isIgnored && (
            <>
              <DropdownMenuItem onSelect={() => onWinner(1)}>
                {names(match.team1)} won
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onWinner(2)}>
                {names(match.team2)} won
              </DropdownMenuItem>
              {rally.winnerSource === "manual" && (
                <DropdownMenuItem onSelect={() => onWinner(null)}>
                  Not sure who won
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onSelect={() => onIgnored(!rally.isIgnored)}>
            {rally.isIgnored ? "It was a point" : "Not a point"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
};

const ChangeMatchDialog = ({
  open,
  game,
  recording,
  isPending,
  onSave,
  onClose,
}: {
  open: boolean;
  game: PadelGameWithRounds;
  recording: PadelRecordingView;
  isPending: boolean;
  onSave: (matchId: string) => void;
  onClose: () => void;
}) => {
  const [court, setCourt] = useState(recording.court);
  const [matchId, setMatchId] = useState(recording.firstMatchId ?? undefined);
  const chosen =
    padelCourtMatches(game, court).find(({ match }) => match.id === matchId) ??
    padelCourtMatches(game, court)[0];

  // Start from the video's match every time the dialog opens
  useEffect(() => {
    if (open) {
      setCourt(recording.court);
      setMatchId(recording.firstMatchId ?? undefined);
    }
  }, [open, recording.court, recording.firstMatchId]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change match</DialogTitle>
          <DialogDescription>
            Choose the court and the match the video starts with. The rallies
            are placed in the matches again, and who won the rallies you
            labelled is kept for those matches.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <VideoMatchChooser
            game={game}
            court={court}
            matchId={chosen?.match.id}
            disabled={isPending}
            onCourtChange={(c) => {
              setCourt(c);
              setMatchId(undefined);
            }}
            onMatchChange={setMatchId}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            type="button"
            isLoading={isPending}
            disabled={!chosen || chosen.match.id === recording.firstMatchId}
            onClick={() => chosen && onSave(chosen.match.id)}
          >
            Save
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MatchCountDialog = ({
  open,
  recording,
  isPending,
  onSave,
  onClose,
}: {
  open: boolean;
  recording: PadelRecordingView;
  isPending: boolean;
  onSave: (matchCount: number | null) => void;
  onClose: () => void;
}) => (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Matches in the video</DialogTitle>
        <DialogDescription>
          A video can go on with the next matches on the same court. The rallies
          are split between them at the longest breaks.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: recording.maxMatchCount }, (_, i) => i + 1).map(
          (count) => (
            <Button
              key={count}
              variant={
                !recording.isMatchCountGuess && recording.matchCount === count
                  ? "default"
                  : "outline"
              }
              disabled={isPending}
              onClick={() => onSave(count)}
            >
              {count}
            </Button>
          ),
        )}
      </div>
      <Button
        variant={recording.isMatchCountGuess ? "default" : "ghost"}
        disabled={isPending}
        onClick={() => onSave(null)}
      >
        Guess from the rallies
        {recording.isMatchCountGuess && ` (${recording.matchCount})`}
      </Button>
    </DialogContent>
  </Dialog>
);

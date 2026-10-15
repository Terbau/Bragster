"use client";

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
import { Progress } from "@/components/ui/progress";
import type { PadelGameWithRounds } from "@/types/padel";
import { padelCourtMatches, type PadelTeamNumber } from "@/utils/padelVideo";
import { cn } from "@/utils/utils";
import { FileVideo } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { padelPlayerNames } from "../_components/PadelRoundCard";
import { formatPlayTime, videoHref } from "../_components/padelFormat";
import { VideoMatchChooser } from "../_components/VideoMatchChooser";
import {
  formatFileSize,
  readVideoDuration,
  uploadVideoInBlocks,
} from "../_components/uploadVideo";
import {
  createPadelRecording,
  deletePadelRecording,
  markPadelRecordingUploaded,
} from "../videoActions";

/** Bigger videos work, but take long to upload and analyse */
const LARGE_VIDEO_BYTES = 10e9;

interface UploadVideoDialogProps {
  open: boolean;
  game: PadelGameWithRounds;
  onClose: () => void;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export const UploadVideoDialog = ({
  open,
  game,
  onClose,
}: UploadVideoDialogProps) => {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | undefined>();
  const [court, setCourt] = useState(1);
  const [matchId, setMatchId] = useState<string | undefined>();
  const [nearTeam, setNearTeam] = useState<PadelTeamNumber | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  const isUploading = progress !== null;

  const playerNames = padelPlayerNames(game);
  const names = (ids: string[]) => ids.map((id) => playerNames[id]).join(" & ");
  const matches = padelCourtMatches(game, court);
  const chosen =
    matches.find(({ match }) => match.id === matchId) ?? matches[0];

  // Start over every time the dialog opens
  useEffect(() => {
    if (open) {
      setFile(null);
      setDuration(undefined);
      setCourt(1);
      setMatchId(undefined);
      setNearTeam(null);
      setProgress(null);
    }
  }, [open]);

  // Leaving the page stops the upload
  useEffect(() => {
    if (!isUploading) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isUploading]);

  const chooseFile = async (picked: File | undefined) => {
    if (!picked) return;
    setFile(picked);
    setDuration(await readVideoDuration(picked));
  };

  const upload = async () => {
    if (!file || !chosen) return;
    const controller = new AbortController();
    abort.current = controller;
    setProgress(0);
    let recordingId: string | null = null;
    try {
      const { recording, upload: target } = await createPadelRecording(
        game.id,
        {
          matchId: chosen.match.id,
          recordedAt: new Date(file.lastModified || Date.now()),
          duration,
          sizeBytes: file.size,
          nearTeam: nearTeam ?? undefined,
        },
      );
      recordingId = recording.id;
      await uploadVideoInBlocks(target.url, file, {
        contentType: target.headers["Content-Type"] ?? "video/mp4",
        onProgress: setProgress,
        signal: controller.signal,
      });
      await markPadelRecordingUploaded(game.id, recording.id);
      toast.success("Video uploaded. The rallies show up in a few minutes.");
      onClose();
      router.push(videoHref(game.id, recording.id));
    } catch (error) {
      // A video that wasn't uploaded is removed again
      if (recordingId) {
        await deletePadelRecording(game.id, recordingId).catch(() => {});
      }
      if (!controller.signal.aborted) {
        toast.error(errorMessage(error));
      }
      setProgress(null);
    }
  };

  const close = () => {
    if (isUploading) {
      abort.current?.abort();
      return;
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload a video</DialogTitle>
          <DialogDescription>
            A video of one court, filmed from behind the glass at one end. It
            can go on with the next matches on the court.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <input
            ref={input}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(event) => void chooseFile(event.target.files?.[0])}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => input.current?.click()}
            className="w-full flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-4 text-left hover:bg-accent/50 transition-colors disabled:opacity-60"
          >
            <FileVideo className="w-6 h-6 shrink-0 text-muted-foreground" />
            {file ? (
              <span className="min-w-0">
                <span className="block text-sm font-medium truncate">
                  {file.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                  {duration !== undefined && ` · ${formatPlayTime(duration)}`}
                  {" · "}Choose another
                </span>
              </span>
            ) : (
              <span className="text-sm">Choose a video</span>
            )}
          </button>
          {file && file.size > LARGE_VIDEO_BYTES && (
            <p className="text-xs text-muted-foreground">
              This is a big video. It works, but takes a while to upload and
              analyse. 1080p is enough to find the rallies.
            </p>
          )}

          <VideoMatchChooser
            game={game}
            court={court}
            matchId={chosen?.match.id}
            disabled={isUploading}
            onCourtChange={(c) => {
              setCourt(c);
              setMatchId(undefined);
              setNearTeam(null);
            }}
            onMatchChange={(value) => {
              setMatchId(value);
              setNearTeam(null);
            }}
          />

          {chosen && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">
                Nearest the camera{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </p>
              <div className="flex bg-muted rounded-lg p-1 gap-1">
                {([1, 2] as const).map((team) => (
                  <button
                    key={team}
                    type="button"
                    disabled={isUploading}
                    onClick={() => setNearTeam(nearTeam === team ? null : team)}
                    className={cn(
                      "flex-1 px-2 py-1.5 rounded-md text-sm font-medium transition-all truncate",
                      nearTeam === team
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {names(
                      team === 1 ? chosen.match.team1 : chosen.match.team2,
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isUploading && file && (
            <div className="space-y-1.5">
              <Progress value={progress * 100} />
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size * progress)} of{" "}
                {formatFileSize(file.size)} · {Math.floor(progress * 100)}%.
                Keep this page open until it's done.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            {isUploading ? "Stop upload" : "Cancel"}
          </Button>
          <LoadingButton
            type="button"
            isLoading={isUploading}
            disabled={!file || !chosen}
            onClick={() => void upload()}
          >
            Upload
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

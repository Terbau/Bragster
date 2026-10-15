import type { PadelGameVideos as Videos } from "@/app/padel/_lib/videos";
import { formatDateWithTime } from "@/utils/date";
import { padelCourtName } from "@/utils/padel";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Loader2,
  TriangleAlert,
  Upload,
  Video,
} from "lucide-react";
import Link from "next/link";
import { formatPlayTime, formatRallyLength, videoHref } from "./padelFormat";
import { recordingRounds, recordingStatus } from "./padelVideoLabels";

interface PadelGameVideosProps {
  gameId: string;
  courtNames: string[];
  videos: Videos;
  onUpload: () => void;
}

/** The videos filmed with the app, and what they tell about the game */
export const PadelGameVideos = ({
  gameId,
  courtNames,
  videos,
  onUpload,
}: PadelGameVideosProps) => {
  const { recordings, stats } = videos;
  if (recordings.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold flex items-center gap-1.5">
          <Video className="w-4 h-4" />
          Videos
        </h2>
        <Button variant="outline" size="sm" onClick={onUpload}>
          <Upload className="w-4 h-4 mr-1.5" />
          Upload
        </Button>
      </div>
      {stats.rallies > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Tile label="Rallies filmed" value={stats.rallies} />
          <Tile label="Ball in play" value={formatPlayTime(stats.playTime)} />
          <Tile
            label="Average rally"
            value={formatRallyLength(stats.averageRally)}
          />
          <Tile
            label="Longest rally"
            value={
              stats.longestRally
                ? formatRallyLength(stats.longestRally.duration)
                : "–"
            }
          />
        </div>
      )}
      <ul className="rounded-xl border border-border bg-card divide-y divide-border">
        {recordings.map((recording) => {
          const status = recordingStatus(recording);
          const rounds = recordingRounds(recording);
          return (
            <li key={recording.id}>
              <Link
                href={videoHref(gameId, recording.id)}
                className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors"
              >
                <span className="w-10 h-10 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                  {status.isBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : status.isFailed ? (
                    <TriangleAlert className="w-4 h-4 text-destructive" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">
                    {padelCourtName(courtNames, recording.court)}
                    {rounds && ` · ${rounds}`}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatDateWithTime(new Date(recording.recordedAt))}
                    {recording.duration !== null &&
                      ` · ${formatPlayTime(recording.duration)}`}{" "}
                    · {status.text}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const Tile = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl border border-border bg-card px-4 py-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-xl font-semibold mt-0.5">{value}</p>
  </div>
);

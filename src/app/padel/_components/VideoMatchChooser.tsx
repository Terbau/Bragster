import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PadelGameWithRounds } from "@/types/padel";
import { isPadelMatchPlayed, padelCourtName } from "@/utils/padel";
import { padelCourtMatches } from "@/utils/padelVideo";
import { padelPlayerNames } from "./PadelRoundCard";
import { matchRoundLabel } from "./padelVideoLabels";

interface VideoMatchChooserProps {
  game: PadelGameWithRounds;
  court: number;
  matchId: string | undefined;
  disabled?: boolean;
  onCourtChange: (court: number) => void;
  onMatchChange: (matchId: string) => void;
}

/** The court a video is of, and the match it starts with */
export const VideoMatchChooser = ({
  game,
  court,
  matchId,
  disabled,
  onCourtChange,
  onMatchChange,
}: VideoMatchChooserProps) => {
  const playerNames = padelPlayerNames(game);
  const names = (ids: string[]) => ids.map((id) => playerNames[id]).join(" & ");

  return (
    <>
      {game.courts > 1 && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Court</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: game.courts }, (_, i) => i + 1).map((c) => (
              <Button
                key={c}
                type="button"
                size="sm"
                variant={c === court ? "default" : "outline"}
                disabled={disabled}
                onClick={() => onCourtChange(c)}
              >
                {padelCourtName(game.courtNames, c)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium">The video starts with</p>
        <Select
          value={matchId}
          disabled={disabled}
          onValueChange={onMatchChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a match" />
          </SelectTrigger>
          <SelectContent>
            {padelCourtMatches(game, court).map(
              ({ match, series, roundNumber }) => (
                <SelectItem key={match.id} value={match.id}>
                  {matchRoundLabel({ series, roundNumber })}:{" "}
                  {names(match.team1)} vs {names(match.team2)}
                  {isPadelMatchPlayed(match) &&
                    ` (${match.team1Score}–${match.team2Score})`}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

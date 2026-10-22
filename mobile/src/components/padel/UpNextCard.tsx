import { Coffee, Flag } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  courtName,
  getGameStatus,
  getSittingOut,
  getUpNext,
  teamNames,
} from "@/lib/padel";
import type {
  PadelGame,
  PadelMatch,
  PadelMatchRating,
  PadelPlayer,
  PadelRound,
} from "@/lib/types";
import { MatchRow } from "./RoundCard";

interface UpNextCardProps {
  game: PadelGame;
  onPressMatch: (match: PadelMatch, roundNumber: number) => void;
  onEndRound: (round: PadelRound, roundNumber: number) => void;
  /** The ratings in played matches, by match id */
  matchRatings?: Record<string, PadelMatchRating>;
}

/** Who plays where right now, and who plays in the round after */
export function UpNextCard({
  game,
  onPressMatch,
  onEndRound,
  matchRatings,
}: UpNextCardProps) {
  const upNext = getUpNext(game.rounds);
  if (!upNext) return null;
  const { round, number, next } = upNext;
  const status = getGameStatus(game);
  const showCourts = round.matches.length > 1 || game.courtNames.length > 0;

  return (
    <View className="gap-1 rounded-2xl border border-border bg-card p-3 shadow-sm shadow-black/5">
      <View className="flex-row items-center gap-2 px-1 pb-1">
        <View className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <Text className="text-sm font-semibold">
          Now playing · Round {number}
        </Text>
        <Text className="flex-1 text-sm text-muted-foreground">
          of {status.totalRounds}
        </Text>
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          onPress={() => onEndRound(round, number)}
          className="flex-row items-center gap-1 active:opacity-50"
        >
          <Icon as={Flag} size={14} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">End round</Text>
        </Pressable>
      </View>

      {round.matches.map((match) => (
        <MatchRow
          key={match.id}
          match={match}
          players={game.players}
          court={
            showCourts ? courtName(game.courtNames, match.court) : undefined
          }
          rating={matchRatings?.[match.id]}
          onPress={() => onPressMatch(match, number)}
        />
      ))}
      <SittingOut players={getSittingOut(game.players, round)} />

      <View className="mx-1 mt-2 gap-1 border-t border-border pt-3">
        <Text className="text-xs font-medium text-muted-foreground">
          {next ? `Up next · Round ${number + 1}` : "Up next"}
        </Text>
        {next ? (
          <>
            {next.matches.map((match) => (
              <Text key={match.id} className="text-sm">
                {showCourts && (
                  <Text className="text-sm text-muted-foreground">
                    {courtName(game.courtNames, match.court)}:{" "}
                  </Text>
                )}
                {teamNames(match.team1, game.players)}
                <Text className="text-sm text-muted-foreground"> vs </Text>
                {teamNames(match.team2, game.players)}
              </Text>
            ))}
            <SittingOut players={getSittingOut(game.players, next)} />
          </>
        ) : (
          <Text className="text-sm text-muted-foreground">
            {number < status.totalRounds
              ? `Round ${number + 1} is drawn from the leaderboard when this round is finished.`
              : `This is the last round${
                  status.seriesCount > 1 ? ` of series ${status.series}` : ""
                }.`}
          </Text>
        )}
      </View>
    </View>
  );
}

function SittingOut({ players }: { players: PadelPlayer[] }) {
  if (players.length === 0) return null;
  return (
    <View className="flex-row items-center gap-1.5 px-1 pt-1">
      <Icon as={Coffee} size={14} className="text-muted-foreground" />
      <Text className="flex-1 text-xs text-muted-foreground">
        Sitting out: {players.map((player) => player.name).join(", ")}
      </Text>
    </View>
  );
}

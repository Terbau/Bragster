import { Check, Coffee } from "lucide-react-native";
import { Pressable, View, type ViewProps } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  courtName,
  getSittingOut,
  isMatchPlayed,
  isMatchSkipped,
  isRoundPlayed,
  signed,
} from "@/lib/padel";
import type {
  PadelMatch,
  PadelMatchRating,
  PadelPlayer,
  PadelRound,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoundCardProps extends Pick<ViewProps, "onLayout"> {
  round: PadelRound;
  number: number;
  isCurrent: boolean;
  players: PadelPlayer[];
  courtNames: string[];
  /** The ratings in played matches, by match id */
  matchRatings?: Record<string, PadelMatchRating>;
  onPressMatch: (match: PadelMatch) => void;
}

export function RoundCard({
  round,
  number,
  isCurrent,
  players,
  courtNames,
  matchRatings,
  onPressMatch,
  onLayout,
}: RoundCardProps) {
  const isPlayed = isRoundPlayed(round);
  const isEndedEarly = round.matches.some(isMatchSkipped);
  const resting = getSittingOut(players, round);

  return (
    <View
      onLayout={onLayout}
      className={cn(
        "gap-1 rounded-xl border bg-card p-3",
        isCurrent ? "border-foreground/40" : "border-border",
        isPlayed && "opacity-75",
      )}
    >
      <View className="flex-row items-center gap-2 px-1 pb-1">
        <Text className="text-sm font-semibold">Round {number}</Text>
        {isPlayed ? (
          <>
            <Icon as={Check} size={16} className="text-green-600" />
            {isEndedEarly && (
              <Text className="text-xs text-muted-foreground">Ended early</Text>
            )}
          </>
        ) : (
          isCurrent && (
            <View className="rounded-full bg-primary px-2 py-0.5">
              <Text className="text-[11px] font-medium text-primary-foreground">
                Now
              </Text>
            </View>
          )
        )}
      </View>

      {round.matches.map((match) => (
        <MatchRow
          key={match.id}
          match={match}
          players={players}
          court={
            round.matches.length > 1 || courtNames.length > 0
              ? courtName(courtNames, match.court)
              : undefined
          }
          rating={matchRatings?.[match.id]}
          onPress={() => onPressMatch(match)}
        />
      ))}

      {resting.length > 0 && (
        <View className="flex-row items-center gap-1.5 px-1 pt-1">
          <Icon as={Coffee} size={14} className="text-muted-foreground" />
          <Text className="flex-1 text-xs text-muted-foreground">
            Sitting out: {resting.map((player) => player.name).join(", ")}
          </Text>
        </View>
      )}
    </View>
  );
}

export function MatchRow({
  match,
  players,
  court,
  rating,
  onPress,
}: {
  match: PadelMatch;
  players: PadelPlayer[];
  /** Shown above the match when set */
  court?: string;
  /** Shown under the teams once the match is played */
  rating?: PadelMatchRating;
  onPress: () => void;
}) {
  const isPlayed = isMatchPlayed(match);
  const isSkipped = isMatchSkipped(match);
  const team1Won =
    isPlayed && (match.team1Score ?? 0) > (match.team2Score ?? 0);
  const team2Won =
    isPlayed && (match.team2Score ?? 0) > (match.team1Score ?? 0);
  const name = (id: string) =>
    players.find((player) => player.id === id)?.name ?? "?";

  const team = (
    ids: string[],
    teamRating: number | undefined,
    won: boolean,
    lost: boolean,
    align: "left" | "right",
  ) => (
    <View
      className={cn("flex-1", align === "right" ? "items-end" : "items-start")}
    >
      {ids.map((id) => (
        <Text
          key={id}
          numberOfLines={1}
          className={cn(
            "text-sm",
            won && "font-semibold",
            lost && "text-muted-foreground",
          )}
        >
          {name(id)}
        </Text>
      ))}
      {isPlayed && rating && teamRating !== undefined && (
        <TeamRating
          ids={ids}
          teamRating={teamRating}
          rating={rating}
          name={name}
        />
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${court ?? `Court ${match.court}`}, ${match.team1.map(name).join(" and ")} against ${match.team2.map(name).join(" and ")}${
        isPlayed
          ? `, ${match.team1Score} to ${match.team2Score}`
          : isSkipped
            ? ", not played"
            : ", add score"
      }`}
      onPress={onPress}
      className="rounded-lg px-1 py-2 active:bg-accent"
    >
      {court && (
        <Text className="mb-1 text-center text-[11px] text-muted-foreground">
          {court}
        </Text>
      )}
      <View className="flex-row items-center gap-3">
        {team(
          match.team1,
          rating?.team1Rating,
          team1Won,
          team2Won || isSkipped,
          "right",
        )}
        <View
          className={cn(
            "min-w-[72px] items-center rounded-md px-2 py-1.5",
            isPlayed ? "bg-muted" : "border border-dashed border-border",
          )}
        >
          <Text
            className={cn(
              "text-sm",
              isPlayed ? "font-semibold" : "text-muted-foreground",
            )}
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {isPlayed
              ? `${match.team1Score} – ${match.team2Score}`
              : isSkipped
                ? "Not played"
                : "Score"}
          </Text>
        </View>
        {team(
          match.team2,
          rating?.team2Rating,
          team2Won,
          team1Won || isSkipped,
          "left",
        )}
      </View>
    </Pressable>
  );
}

const changeClass = (change: number) =>
  change > 0
    ? "text-green-700 dark:text-green-400"
    : change < 0
      ? "text-red-700 dark:text-red-400"
      : "text-muted-foreground";

/**
 * The team's average rating when the match was played, and how much each
 * player's rating changed. Partners always change by the same amount.
 */
function TeamRating({
  ids,
  teamRating,
  rating,
  name,
}: {
  ids: string[];
  teamRating: number;
  rating: PadelMatchRating;
  name: (id: string) => string;
}) {
  const changes = ids.flatMap((id) =>
    rating.players[id] ? [{ id, change: rating.players[id].change }] : [],
  );
  const isSame = changes.every((p) => p.change === changes[0]?.change);
  return (
    <Text
      className="mt-0.5 text-xs text-muted-foreground"
      style={{ fontVariant: ["tabular-nums"] }}
      numberOfLines={1}
    >
      {teamRating} avg ·{" "}
      {isSame && changes.length > 0 ? (
        <Text className={cn("text-xs", changeClass(changes[0].change))}>
          {signed(changes[0].change)} each
        </Text>
      ) : (
        changes.map((p, index) => (
          <Text key={p.id} className="text-xs text-muted-foreground">
            {index > 0 && ", "}
            {name(p.id)}{" "}
            <Text className={cn("text-xs", changeClass(p.change))}>
              {signed(p.change)}
            </Text>
          </Text>
        ))
      )}
    </Text>
  );
}

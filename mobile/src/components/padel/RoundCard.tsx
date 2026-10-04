import { Check, Coffee } from "lucide-react-native";
import { Pressable, View, type ViewProps } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { getSittingOut, isMatchPlayed, isRoundPlayed } from "@/lib/padel";
import type { PadelMatch, PadelPlayer, PadelRound } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoundCardProps extends Pick<ViewProps, "onLayout"> {
  round: PadelRound;
  number: number;
  isCurrent: boolean;
  players: PadelPlayer[];
  onPressMatch: (match: PadelMatch) => void;
}

export function RoundCard({
  round,
  number,
  isCurrent,
  players,
  onPressMatch,
  onLayout,
}: RoundCardProps) {
  const isPlayed = isRoundPlayed(round);
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
          <Icon as={Check} size={16} className="text-green-600" />
        ) : (
          isCurrent && (
            <View className="rounded-full bg-primary px-2 py-0.5">
              <Text className="text-[11px] font-medium text-primary-foreground">Now</Text>
            </View>
          )
        )}
      </View>

      {round.matches.map((match) => (
        <MatchRow
          key={match.id}
          match={match}
          players={players}
          showCourt={round.matches.length > 1}
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

function MatchRow({
  match,
  players,
  showCourt,
  onPress,
}: {
  match: PadelMatch;
  players: PadelPlayer[];
  showCourt: boolean;
  onPress: () => void;
}) {
  const isPlayed = isMatchPlayed(match);
  const team1Won = isPlayed && (match.team1Score ?? 0) > (match.team2Score ?? 0);
  const team2Won = isPlayed && (match.team2Score ?? 0) > (match.team1Score ?? 0);
  const name = (id: string) => players.find((player) => player.id === id)?.name ?? "?";

  const team = (ids: string[], won: boolean, lost: boolean, align: "left" | "right") => (
    <View className={cn("flex-1", align === "right" ? "items-end" : "items-start")}>
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
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Court ${match.court}, ${match.team1.map(name).join(" and ")} against ${match.team2.map(name).join(" and ")}${
        isPlayed ? `, ${match.team1Score} to ${match.team2Score}` : ", add score"
      }`}
      onPress={onPress}
      className="rounded-lg px-1 py-2 active:bg-accent"
    >
      {showCourt && (
        <Text className="mb-1 text-center text-[11px] text-muted-foreground">
          Court {match.court}
        </Text>
      )}
      <View className="flex-row items-center gap-3">
        {team(match.team1, team1Won, team2Won, "right")}
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
            {isPlayed ? `${match.team1Score} – ${match.team2Score}` : "Score"}
          </Text>
        </View>
        {team(match.team2, team2Won, team1Won, "left")}
      </View>
    </Pressable>
  );
}

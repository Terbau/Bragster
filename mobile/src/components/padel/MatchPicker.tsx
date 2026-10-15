import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  courtMatches,
  courtName,
  isMatchPlayed,
  matchRoundLabel,
  teamNames,
} from "@/lib/padel";
import type { PadelGame } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Chip } from "./Chip";

interface MatchPickerProps {
  game: PadelGame;
  court: number;
  /** Index in the court's matches, in play order */
  matchIndex: number;
  onCourtChange: (court: number) => void;
  onMatchIndexChange: (index: number) => void;
}

/** The court a video is of, and the match it starts with */
export function MatchPicker({
  game,
  court,
  matchIndex,
  onCourtChange,
  onMatchIndexChange,
}: MatchPickerProps) {
  const matches = courtMatches(game, court);
  const current = matches[Math.min(matchIndex, matches.length - 1)];

  return (
    <>
      {game.courts > 1 && (
        <View className="gap-2">
          <Text className="text-sm font-medium">Court</Text>
          <View className="flex-row flex-wrap gap-2">
            {Array.from({ length: game.courts }, (_, i) => i + 1).map((c) => (
              <Chip
                key={c}
                label={courtName(game.courtNames, c)}
                selected={c === court}
                onPress={() => onCourtChange(c)}
              />
            ))}
          </View>
        </View>
      )}

      {current && (
        <View className="gap-2">
          <Text className="text-sm font-medium">The video starts with</Text>
          <View className="flex-row items-center gap-2 rounded-xl border border-border bg-card px-2 py-3">
            <StepButton
              icon={ChevronLeft}
              label="Earlier match"
              disabled={matchIndex === 0}
              onPress={() => onMatchIndexChange(matchIndex - 1)}
            />
            <View className="flex-1 items-center">
              <Text className="text-xs text-muted-foreground">
                {matchRoundLabel(current)}
                {isMatchPlayed(current.match)
                  ? ` · ${current.match.team1Score}–${current.match.team2Score}`
                  : ""}
              </Text>
              <Text className="text-center font-medium" numberOfLines={2}>
                {teamNames(current.match.team1, game.players)} vs{" "}
                {teamNames(current.match.team2, game.players)}
              </Text>
            </View>
            <StepButton
              icon={ChevronRight}
              label="Later match"
              disabled={matchIndex >= matches.length - 1}
              onPress={() => onMatchIndexChange(matchIndex + 1)}
            />
          </View>
        </View>
      )}
    </>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: typeof ChevronLeft;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      className={cn(
        "h-9 w-9 items-center justify-center rounded-full bg-muted active:opacity-60",
        disabled && "opacity-30",
      )}
    >
      <Icon as={icon} size={20} />
    </Pressable>
  );
}

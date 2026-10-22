import { router, Stack } from "expo-router";
import { ChevronRight, Share as ShareIcon, Users } from "lucide-react-native";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import { getDayRatingChange, percent, signed } from "@/lib/padel";
import { usePadelPlayerSummaries } from "@/lib/queries";
import type { PadelPlayerSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function PadelPlayersScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const { data, error, isPending, refetch, isRefetching } =
    usePadelPlayerSummaries();

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Share the players"
              onPress={() => router.push("/padel/players-share")}
              className="active:opacity-50"
            >
              <Icon as={ShareIcon} size={21} />
            </Pressable>
          ),
        }}
      />
      <FlatList
        className="flex-1 bg-background"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 24,
        }}
        data={data ?? []}
        keyExtractor={(player) => player.key}
        ListHeaderComponent={
          <Text className="pb-5 text-sm text-muted-foreground">
            Everyone you have played with, by rating. Winning more of the points
            than expected against the other team raises the rating, and beating
            a stronger team counts the most.
          </Text>
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item, index }) => (
          <PlayerRow player={item} rank={index + 1} />
        )}
        ListEmptyComponent={
          isPending ? (
            <Spinner className="py-16" />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : (
            <View className="items-center gap-1 px-6 py-16">
              <Icon
                as={Users}
                size={40}
                className="mb-2 text-muted-foreground opacity-30"
              />
              <Text className="text-sm font-medium text-muted-foreground">
                No players yet
              </Text>
              <Text className="text-center text-xs leading-5 text-muted-foreground">
                Ratings and stats show up here once a match has a score.
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.mutedForeground}
          />
        }
      />
    </>
  );
}

function PlayerRow({
  player,
  rank,
}: {
  player: PadelPlayerSummary;
  rank: number;
}) {
  const day = player.recentGames
    ? getDayRatingChange(
        { rating: player.rating, history: player.recentGames },
        new Date(),
      )
    : null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/padel/players/[playerKey]",
          params: { playerKey: player.key },
        })
      }
      className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 active:bg-accent"
    >
      <Text
        className="w-6 text-right text-sm text-muted-foreground"
        style={{ fontVariant: ["tabular-nums"] }}
      >
        {rank}
      </Text>
      <View className="min-w-0 flex-1">
        <Text className="text-base font-medium" numberOfLines={1}>
          {player.name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {player.matches} {player.matches === 1 ? "match" : "matches"} ·{" "}
          {percent(player.wins, player.matches)} won
          {player.gamesWon > 0
            ? ` · ${player.gamesWon} ${player.gamesWon === 1 ? "game" : "games"} won`
            : ""}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className="text-lg font-semibold"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {player.rating}
        </Text>
        {day?.isToday && (
          <Text
            className={cn(
              "text-xs",
              day.change > 0
                ? "text-green-700 dark:text-green-400"
                : day.change < 0
                  ? "text-red-700 dark:text-red-400"
                  : "text-muted-foreground",
            )}
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {signed(day.change)} today
          </Text>
        )}
      </View>
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}

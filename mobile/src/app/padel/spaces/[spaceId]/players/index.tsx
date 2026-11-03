import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Share as ShareIcon,
  Users,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { DayPicker } from "@/components/padel/DayPicker";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { useColors } from "@/lib/color-scheme";
import {
  addDays,
  countGamesOnDay,
  dayLabel,
  getGameDays,
  getPlayersOnDay,
  isSameDay,
  percent,
  signed,
  startOfDay,
} from "@/lib/padel";
import { usePadelPlayerSummaries, usePadelSpace } from "@/lib/queries";
import type { PadelPlayerOnDay } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function PadelPlayersScreen() {
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const { data, error, isPending, refetch, isRefetching } =
    usePadelPlayerSummaries(spaceId);
  const { data: space } = usePadelSpace(spaceId);
  const { user } = useAuth();
  const myKey = space?.links.find((link) => link.user.id === user?.id)?.key;
  // Only hosts can share the players
  const canShare = space !== undefined && space.role !== "PLAYER";

  /** Null for today, which moves on at midnight */
  const [pickedDay, setPickedDay] = useState<Date | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const gameDays = useMemo(() => getGameDays(data ?? []), [data]);
  const today = startOfDay(new Date());
  const firstDay = gameDays[0] ?? today;
  const day =
    pickedDay === null || pickedDay >= today
      ? today
      : pickedDay < firstDay
        ? firstDay
        : pickedDay;
  const isToday = isSameDay(day, today);
  // `day` is a new date on every render, so the memo goes by its time
  const dayTime = day.getTime();
  const players = useMemo(
    () =>
      getPlayersOnDay(
        data ?? [],
        new Date(dayTime),
        addDays(new Date(dayTime), 1),
      ),
    [data, dayTime],
  );
  const gamesOnDay = countGamesOnDay(data ?? [], day, addDays(day, 1));
  const label = dayLabel(day, today);
  const selectDay = (next: Date) => {
    setPickedDay(next >= today ? null : startOfDay(next));
    setIsPickerOpen(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () =>
            canShare && (
              <Pressable
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Share the players"
                onPress={() =>
                  router.push({
                    pathname: "/padel/spaces/[spaceId]/share",
                    params: { spaceId },
                  })
                }
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
        data={players}
        keyExtractor={(player) => player.key}
        ListHeaderComponent={
          <View className="gap-4 pb-4">
            <Text className="text-sm text-muted-foreground">
              Everyone who has played{space ? ` in ${space.name}` : ""}, by
              rating. Winning more of the points than expected against the other
              team raises the rating, and beating a stronger team counts the
              most.
            </Text>
            {players.length > 0 && (
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    icon={ChevronLeft}
                    accessibilityLabel="Previous day"
                    disabled={day <= firstDay}
                    onPress={() => selectDay(addDays(day, -1))}
                  />
                  <Button
                    variant="outline"
                    icon={CalendarDays}
                    className="h-10 flex-1"
                    accessibilityLabel={`Choose a day, ${label} is shown`}
                    onPress={() => setIsPickerOpen(true)}
                  >
                    {label}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    icon={ChevronRight}
                    accessibilityLabel="Next day"
                    disabled={isToday}
                    onPress={() => selectDay(addDays(day, 1))}
                  />
                </View>
                <Text className="text-xs text-muted-foreground">
                  {gamesOnDay === 0
                    ? `No games ${isToday ? "today" : "this day"}, so no ratings changed.`
                    : `${gamesOnDay} ${gamesOnDay === 1 ? "game" : "games"} ${isToday ? "today" : "this day"}. ${
                        isToday
                          ? "The change in rating is since the start of the day."
                          : "Ratings are from the end of the day, with the change during it."
                      }`}
                </Text>
              </View>
            )}
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item, index }) => (
          <PlayerRow
            spaceId={spaceId}
            player={item}
            rank={index + 1}
            isYou={item.key === myKey}
            isToday={isToday}
          />
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
      <DayPicker
        visible={isPickerOpen}
        selected={day}
        firstDay={firstDay}
        today={today}
        gameDays={gameDays}
        onSelect={selectDay}
        onClose={() => setIsPickerOpen(false)}
      />
    </>
  );
}

function PlayerRow({
  spaceId,
  player,
  rank,
  isYou,
  isToday,
}: {
  spaceId: string;
  player: PadelPlayerOnDay;
  rank: number;
  isYou: boolean;
  /** Whether the day shown is today */
  isToday: boolean;
}) {
  const { change } = player;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/padel/spaces/[spaceId]/players/[playerKey]",
          params: { spaceId, playerKey: player.key },
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
        <View className="flex-row items-center gap-1.5">
          <Text className="shrink text-base font-medium" numberOfLines={1}>
            {player.name}
          </Text>
          {isYou && (
            <Text className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              You
            </Text>
          )}
        </View>
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
        {change !== null && (
          <Text
            className={cn(
              "text-xs",
              change > 0
                ? "text-green-700 dark:text-green-400"
                : change < 0
                  ? "text-red-700 dark:text-red-400"
                  : "text-muted-foreground",
            )}
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {signed(change)}
            {isToday ? " today" : ""}
          </Text>
        )}
      </View>
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}

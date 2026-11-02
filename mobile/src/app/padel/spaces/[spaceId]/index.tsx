import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ChevronRight,
  Plus,
  Settings,
  Trophy,
  Users,
  Volleyball,
} from "lucide-react-native";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import { formatDate } from "@/lib/format";
import {
  formatLabel,
  getGameStatus,
  getPadelStandings,
  roleDescription,
} from "@/lib/padel";
import { usePadelGames, usePadelSpace } from "@/lib/queries";
import type { PadelGame } from "@/lib/types";

export default function PadelSpaceScreen() {
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const space = usePadelSpace(spaceId);
  const games = usePadelGames(spaceId);
  const canHost = space.data !== undefined && space.data.role !== "PLAYER";
  const error = space.error ?? games.error;
  const refetch = () => Promise.all([space.refetch(), games.refetch()]);

  return (
    <>
      <Stack.Screen
        options={{
          title: space.data?.name ?? "Space",
          headerRight: () => (
            <Pressable
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() =>
                router.push({
                  pathname: "/padel/spaces/[spaceId]/settings",
                  params: { spaceId },
                })
              }
              className="active:opacity-50"
            >
              <Icon as={Settings} size={21} />
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
        data={space.data ? (games.data ?? []) : []}
        keyExtractor={(game) => game.id}
        ListHeaderComponent={
          space.data ? (
            <View className="gap-4 pb-6">
              <Text className="text-sm text-muted-foreground">
                {roleDescription(space.data.role, space.data.owner.email)}
              </Text>
              <View className="flex-row gap-2">
                {canHost && (
                  <Button
                    icon={Plus}
                    size="lg"
                    className="flex-1"
                    onPress={() =>
                      router.push({
                        pathname: "/padel/spaces/[spaceId]/new",
                        params: { spaceId },
                      })
                    }
                  >
                    New game
                  </Button>
                )}
                <Button
                  icon={Users}
                  size="lg"
                  variant="outline"
                  className={canHost ? "px-4" : "flex-1"}
                  onPress={() =>
                    router.push({
                      pathname: "/padel/spaces/[spaceId]/players",
                      params: { spaceId },
                    })
                  }
                >
                  Players
                </Button>
              </View>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => <GameRow game={item} />}
        ListEmptyComponent={
          space.isPending || games.isPending ? (
            <Spinner className="py-16" />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : (
            <View className="items-center gap-1 px-6 py-16">
              <Icon
                as={Volleyball}
                size={40}
                className="mb-2 text-muted-foreground opacity-30"
              />
              <Text className="text-sm font-medium text-muted-foreground">
                No games yet
              </Text>
              <Text className="text-center text-xs leading-5 text-muted-foreground">
                {canHost
                  ? "Add the players, pick the number of courts and points per match, and the rounds are made for you."
                  : "The games show up here once a host has created one."}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={space.isRefetching || games.isRefetching}
            onRefresh={refetch}
            tintColor={colors.mutedForeground}
          />
        }
      />
    </>
  );
}

function GameRow({ game }: { game: PadelGame }) {
  const gameStatus = getGameStatus(game);
  const winner = gameStatus.isFinished
    ? getPadelStandings(game.players, game.rounds)[0]
    : undefined;
  const status = winner
    ? `Won by ${winner.name}`
    : `${gameStatus.seriesCount > 1 ? `Series ${gameStatus.series} · ` : ""}Round ${
        gameStatus.roundNumber
      } of ${gameStatus.totalRounds}`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/padel/[gameId]",
          params: { gameId: game.id },
        })
      }
      className="flex-row items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 active:bg-accent"
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon
          as={winner ? Trophy : Volleyball}
          size={16}
          className={winner ? "text-amber-500" : "text-muted-foreground"}
        />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {game.name}
        </Text>
        <Text
          className="mt-0.5 text-xs text-muted-foreground"
          numberOfLines={1}
        >
          {formatDate(game.createdAt)} · {formatLabel(game.format)} ·{" "}
          {game.players.length} players · {status}
        </Text>
      </View>
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}

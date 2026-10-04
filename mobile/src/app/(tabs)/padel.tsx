import { router } from "expo-router";
import { ChevronRight, Plus, Trophy, Volleyball } from "lucide-react-native";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { useColors } from "@/lib/color-scheme";
import { formatDate } from "@/lib/format";
import { getPadelProgress, getPadelStandings } from "@/lib/padel";
import { usePadelGames } from "@/lib/queries";
import type { PadelGame } from "@/lib/types";

export default function PadelScreen() {
  const { status } = useAuth();
  const insets = useSafeAreaInsets();

  if (status !== "signedIn") {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <SignInPrompt
          icon={Volleyball}
          title="Padel Americano"
          description="Sign in to make Americano rounds, keep score and see who wins."
        />
      </View>
    );
  }

  return <GameList />;
}

function GameList() {
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const { data, error, isPending, refetch, isRefetching } = usePadelGames();

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}
      data={data ?? []}
      keyExtractor={(game) => game.id}
      ListHeaderComponent={
        <View className="gap-4 pb-6">
          <View>
            <Text className="text-3xl font-bold tracking-tight">Padel Americano</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Everyone partners with everyone once, and the points are added up.
            </Text>
          </View>
          <Button icon={Plus} size="lg" onPress={() => router.push("/padel/new")}>
            New game
          </Button>
        </View>
      }
      ItemSeparatorComponent={() => <View className="h-2" />}
      renderItem={({ item }) => <GameRow game={item} />}
      ListEmptyComponent={
        isPending ? (
          <Spinner className="py-16" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <View className="items-center gap-1 px-6 py-16">
            <Icon as={Volleyball} size={40} className="mb-2 text-muted-foreground opacity-30" />
            <Text className="text-sm font-medium text-muted-foreground">No games yet</Text>
            <Text className="text-center text-xs leading-5 text-muted-foreground">
              Add the players, pick the number of courts and points per match, and the
              rounds are made for you.
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
  );
}

function GameRow({ game }: { game: PadelGame }) {
  const progress = getPadelProgress(game.rounds);
  const winner = progress.isFinished
    ? getPadelStandings(game.players, game.rounds)[0]
    : undefined;
  const status = winner
    ? `Won by ${winner.name}`
    : progress.currentRoundIndex >= 0
      ? `Round ${progress.currentRoundIndex + 1} of ${game.rounds.length}`
      : `${game.rounds.length} rounds`;

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/padel/[gameId]", params: { gameId: game.id } })
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
        <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={1}>
          {formatDate(game.createdAt)} · {game.players.length} players · {status}
        </Text>
      </View>
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}

import { router } from "expo-router";
import {
  ChevronRight,
  LayoutGrid,
  Plus,
  Volleyball,
} from "lucide-react-native";
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
import { roleLabel } from "@/lib/padel";
import { usePadelSpaces } from "@/lib/queries";
import type { PadelSpaceSummary } from "@/lib/types";

export default function PadelScreen() {
  const { status } = useAuth();
  const insets = useSafeAreaInsets();

  if (status !== "signedIn") {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <SignInPrompt
          icon={Volleyball}
          title="Padel"
          description="Sign in to make Americano and Mexicano rounds, keep score and see who wins."
        />
      </View>
    );
  }

  return <SpaceList />;
}

function SpaceList() {
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const { data, error, isPending, refetch, isRefetching } = usePadelSpaces();

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}
      data={data ?? []}
      keyExtractor={(space) => space.id}
      ListHeaderComponent={
        <View className="gap-4 pb-6">
          <View>
            <Text className="text-3xl font-bold tracking-tight">Padel</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Americano or Mexicano, in a space for each group you play with.
              The rounds are made for you, and everyone gets a rating.
            </Text>
          </View>
          <Button
            icon={Plus}
            size="lg"
            variant={data && data.length > 0 ? "outline" : "default"}
            onPress={() => router.push("/padel/spaces/new")}
          >
            New space
          </Button>
        </View>
      }
      ItemSeparatorComponent={() => <View className="h-2" />}
      renderItem={({ item }) => <SpaceRow space={item} />}
      ListEmptyComponent={
        isPending ? (
          <Spinner className="py-16" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <View className="items-center gap-1 px-6 py-16">
            <Icon
              as={LayoutGrid}
              size={40}
              className="mb-2 text-muted-foreground opacity-30"
            />
            <Text className="text-sm font-medium text-muted-foreground">
              No spaces yet
            </Text>
            <Text className="text-center text-xs leading-5 text-muted-foreground">
              Create a space for the people you play with. You can let others
              host games in it too.
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

function SpaceRow({ space }: { space: PadelSpaceSummary }) {
  const details = [
    roleLabel(space.role),
    `${space.games} ${space.games === 1 ? "game" : "games"}`,
    space.lastPlayedAt
      ? `Last played ${formatDate(space.lastPlayedAt)}`
      : undefined,
    space.role !== "OWNER" ? space.owner.email : undefined,
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/padel/spaces/[spaceId]",
          params: { spaceId: space.id },
        })
      }
      className="flex-row items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 active:bg-accent"
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon as={LayoutGrid} size={16} className="text-muted-foreground" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {space.name}
        </Text>
        <Text
          className="mt-0.5 text-xs text-muted-foreground"
          numberOfLines={1}
        >
          {details.join(" · ")}
        </Text>
      </View>
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}

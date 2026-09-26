import { useQuery } from "@tanstack/react-query";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { ArticleCard } from "@/components/vg/ArticleCard";
import { useSpoilerChecks } from "@/components/vg/useSpoilerChecks";
import { useColors } from "@/lib/color-scheme";
import { fetchVgFrontPage, type VgArticle } from "@/lib/vg";

const EMPTY: VgArticle[] = [];

export default function VgScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ["vg-articles"],
    queryFn: fetchVgFrontPage,
    staleTime: 0,
  });
  const { visible, hasMore, results, loadMore, retry } = useSpoilerChecks(
    data ?? EMPTY,
  );

  return (
    <View className="flex-1 bg-white dark:bg-[#0f0f0f]">
      {/* VG masthead strip */}
      <View
        className="flex-row items-center justify-between bg-[#e00000] px-4 pb-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center gap-3">
          <Text className="text-3xl font-black tracking-tight text-white">VG</Text>
          <View className="border-l border-white/30 pl-3">
            <Text className="text-sm font-medium text-white/75">
              Spoiler-free edition
            </Text>
          </View>
        </View>
        <Text className="text-xs text-white/60">VM 2026 skjult</Text>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(article) => article.id}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            status={results[item.id] ?? { status: "idle" }}
            onRetry={retry}
          />
        )}
        ListEmptyComponent={
          isPending ? (
            <Spinner className="py-20" />
          ) : (
            <View className="items-center px-4 py-20">
              <Text className="mb-1 text-lg font-medium text-muted-foreground">
                Kunne ikke laste VG
              </Text>
              <Text className="text-sm text-muted-foreground">
                {isError ? "Prøv igjen om litt." : "Ingen saker akkurat nå."}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          hasMore ? (
            <View className="items-center py-6">
              <Pressable
                onPress={loadMore}
                className="rounded-full border border-neutral-300 px-6 py-2.5 active:bg-neutral-50 dark:border-neutral-700 dark:active:bg-neutral-800"
              >
                <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Last inn flere
                </Text>
              </Pressable>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.mutedForeground}
          />
        }
      />
    </View>
  );
}

import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { formatTime } from "@/lib/format";
import type { VgArticle } from "@/lib/vg";

export type ArticleStatus =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "done"; isWorldCup: boolean }
  | { status: "error" };

function maskHeadline(headline: string): string {
  return headline.replace(/[^\s]/g, "*");
}

interface ArticleCardProps {
  article: VgArticle;
  status: ArticleStatus;
  onRetry: (id: string) => void;
}

export function ArticleCard({ article, status, onRetry }: ArticleCardProps) {
  const [revealed, setRevealed] = useState(false);

  const isLoading = status.status === "idle" || status.status === "checking";
  const isWC = status.status === "done" && status.isWorldCup;
  const isError = status.status === "error";
  const showContent =
    (status.status === "done" && !status.isWorldCup) || (isWC && revealed);
  const spoilerActive = (isWC && !revealed) || isError;

  const openArticle = () => {
    if (showContent) {
      void WebBrowser.openBrowserAsync(article.url);
    }
  };

  return (
    <View className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#0f0f0f]">
      {article.imageUrl && (
        <Pressable onPress={openArticle} disabled={!showContent}>
          <View className="aspect-video w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
            {!isLoading && (
              <Image
                source={{ uri: article.imageUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
              />
            )}
            {/* Hide the image of spoilers, like the website's brightness-0 */}
            {spoilerActive && <View className="absolute inset-0 bg-black" />}
          </View>
        </Pressable>
      )}

      <View className="px-3 py-2.5">
        {article.publishedAt && !isLoading && (
          <Text
            className="mb-1 text-xs text-neutral-400 dark:text-neutral-500"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {formatTime(article.publishedAt)}
          </Text>
        )}

        {isLoading && (
          <View className="gap-2">
            <View className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
            <View className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
          </View>
        )}

        {showContent && (
          <Pressable onPress={openArticle} className="active:opacity-60">
            <Text className="text-xl font-bold leading-6 text-neutral-900 dark:text-neutral-50">
              {article.headline}
            </Text>
          </Pressable>
        )}

        {isWC && !revealed && (
          <View>
            <Text className="text-xl font-bold leading-6 text-neutral-300 dark:text-neutral-700">
              {maskHeadline(article.headline)}
            </Text>
            <Pressable
              onPress={() => setRevealed(true)}
              className="mt-2 self-start rounded-full bg-amber-50 px-2 py-0.5 active:bg-amber-100 dark:bg-amber-950/50"
            >
              <Text className="text-xs font-semibold text-amber-700 dark:text-amber-500">
                ⚠ VM-spoiler — trykk for å vise
              </Text>
            </Pressable>
          </View>
        )}

        {isWC && revealed && (
          <Pressable onPress={() => setRevealed(false)} className="mt-2 self-start">
            <Text className="text-xs text-neutral-400 dark:text-neutral-600">
              Skjul igjen
            </Text>
          </Pressable>
        )}

        {isError && (
          <View>
            <Text className="text-xl font-bold leading-6 text-neutral-300 dark:text-neutral-700">
              {maskHeadline(article.headline)}
            </Text>
            <Pressable onPress={() => onRetry(article.id)} className="mt-2 self-start">
              <Text className="text-xs font-medium text-blue-600 underline dark:text-blue-400">
                Kunne ikke verifisere — trykk for å prøve igjen
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

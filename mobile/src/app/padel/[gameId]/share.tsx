import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { Copy, Radio, Share as ShareIcon } from "lucide-react-native";
import { Alert, ScrollView, Share, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { QrCode } from "@/components/padel/QrCode";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { formatResults, liveUrl } from "@/lib/padel";
import { usePadelGame, useSetPadelSharing } from "@/lib/queries";
import { toast } from "@/lib/toast";
import type { PadelGame } from "@/lib/types";

export default function SharePadelGameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data, error, isPending, refetch } = usePadelGame(gameId);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  return <ShareGame game={data} />;
}

function ShareGame({ game }: { game: PadelGame }) {
  const insets = useSafeAreaInsets();
  const setSharing = useSetPadelSharing(game.id);
  const url = liveUrl(game);
  const results = formatResults(game);

  const copy = async (text: string, message: string) => {
    await Clipboard.setStringAsync(text);
    toast.success(message);
  };

  const stopSharing = () =>
    Alert.alert(
      "Stop sharing?",
      "The link stops working. Turning sharing on again makes a new link.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop sharing",
          style: "destructive",
          onPress: () => setSharing.mutate(false),
        },
      ],
    );

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-8 p-5"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View className="gap-3">
        <View className="flex-row items-center gap-1.5">
          <Icon as={Radio} size={18} />
          <Text className="font-semibold">Live link</Text>
        </View>
        {url ? (
          <>
            <Text className="text-sm text-muted-foreground">
              Anyone with the link sees the rounds and the leaderboard update as
              you enter scores, without signing in. Let them scan the code:
            </Text>
            <View className="items-center">
              <View className="rounded-2xl bg-white p-3">
                <QrCode value={url} size={220} />
              </View>
            </View>
            <View className="rounded-lg border border-input bg-muted/40 px-3 py-3">
              <Text selectable className="text-sm">
                {url}
              </Text>
            </View>
            <View className="flex-row gap-3">
              <Button
                variant="outline"
                icon={Copy}
                className="flex-1"
                onPress={() => copy(url, "Link copied")}
              >
                Copy
              </Button>
              <Button
                icon={ShareIcon}
                className="flex-1"
                onPress={() =>
                  void Share.share({
                    message: `Follow ${game.name} live: ${url}`,
                    url,
                  })
                }
              >
                Share link
              </Button>
            </View>
            <Button
              variant="ghost"
              textClassName="text-destructive"
              isLoading={setSharing.isPending}
              onPress={stopSharing}
            >
              Stop sharing
            </Button>
          </>
        ) : (
          <>
            <Text className="text-sm text-muted-foreground">
              Make a link where everyone can follow the rounds and the
              leaderboard on their own phone, without signing in. Only you can
              change the scores.
            </Text>
            <Button
              isLoading={setSharing.isPending}
              onPress={() => setSharing.mutate(true)}
            >
              Create live link
            </Button>
          </>
        )}
      </View>

      <View className="gap-3 border-t border-border pt-6">
        <View className="flex-row items-center gap-1.5">
          <Icon as={ShareIcon} size={18} />
          <Text className="font-semibold">Results</Text>
        </View>
        <View className="rounded-lg bg-muted/60 p-3">
          <Text className="text-sm leading-6">{results}</Text>
        </View>
        <View className="flex-row gap-3">
          <Button
            variant="outline"
            icon={Copy}
            className="flex-1"
            onPress={() => copy(results, "Results copied")}
          >
            Copy
          </Button>
          <Button
            icon={ShareIcon}
            className="flex-1"
            onPress={() => void Share.share({ message: results })}
          >
            Share
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

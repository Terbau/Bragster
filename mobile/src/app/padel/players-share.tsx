import * as Clipboard from "expo-clipboard";
import { Copy, Radio, Share as ShareIcon } from "lucide-react-native";
import { Alert, ScrollView, Share, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { QrCode } from "@/components/padel/QrCode";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { playersLiveUrl } from "@/lib/padel";
import {
  usePadelPlayersSharing,
  useSetPadelPlayersSharing,
} from "@/lib/queries";
import { toast } from "@/lib/toast";

/** Turns the live link to the players list on or off, and shows it */
export default function SharePadelPlayersScreen() {
  const insets = useSafeAreaInsets();
  const { data, error, isPending, refetch } = usePadelPlayersSharing();
  const setSharing = useSetPadelPlayersSharing();

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  const url = playersLiveUrl(data.shareToken);

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    toast.success("Link copied");
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
      contentContainerClassName="gap-3 p-5"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-row items-center gap-1.5">
        <Icon as={Radio} size={18} />
        <Text className="font-semibold">Live link</Text>
      </View>
      {url ? (
        <>
          <Text className="text-sm text-muted-foreground">
            Anyone with the link sees the players list and every player&apos;s
            page, and they update as you enter scores. Your games and videos
            stay private. Let them scan the code:
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
              onPress={() => copy(url)}
            >
              Copy
            </Button>
            <Button
              icon={ShareIcon}
              className="flex-1"
              onPress={() =>
                void Share.share({ message: `Padel ratings: ${url}`, url })
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
            Make a link to the players list, where your friends can check their
            own and each other&apos;s rating, form, partners and opponents,
            without signing in. Your games and videos stay private, and only you
            can change anything.
          </Text>
          <Button
            isLoading={setSharing.isPending}
            onPress={() => setSharing.mutate(true)}
          >
            Create live link
          </Button>
        </>
      )}
    </ScrollView>
  );
}

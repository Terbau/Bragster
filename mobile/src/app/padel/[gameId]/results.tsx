import * as Sharing from "expo-sharing";
import { useLocalSearchParams } from "expo-router";
import { Share as ShareIcon } from "lucide-react-native";
import { useRef, useState } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { ErrorState } from "@/components/ErrorState";
import { ResultsCard } from "@/components/padel/ResultsCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { getErrorMessage } from "@/lib/api";
import { usePadelGame, usePadelMatchRatings } from "@/lib/queries";
import { toast } from "@/lib/toast";
import type { PadelGame } from "@/lib/types";

/** The widest the card gets, so the image looks the same on every phone */
const CARD_WIDTH = 380;

export default function PadelResultsScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data, error, isPending, refetch } = usePadelGame(gameId);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  return <Results game={data} />;
}

function Results({ game }: { game: PadelGame }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { data: matchRatings, isPending } = usePadelMatchRatings(game);
  const card = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const width = Math.min(CARD_WIDTH, windowWidth - 32);

  const share = async () => {
    setIsSharing(true);
    try {
      const uri = await captureRef(card, { format: "png", quality: 1 });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        UTI: "public.png",
        dialogTitle: game.name,
      });
    } catch (error) {
      toast.error(`Couldn't share the image: ${getErrorMessage(error)}`);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="items-center gap-5 p-4"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <ResultsCard
        ref={card}
        game={game}
        matchRatings={matchRatings}
        width={width}
      />
      <View className="w-full gap-2" style={{ maxWidth: width }}>
        <Button
          icon={ShareIcon}
          isLoading={isSharing}
          // The rating changes are part of the picture
          disabled={isPending}
          onPress={share}
        >
          Share image
        </Button>
        <Text className="text-center text-xs text-muted-foreground">
          Send it to the group chat, or save it to Photos from the share sheet.
        </Text>
      </View>
    </ScrollView>
  );
}

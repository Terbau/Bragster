import { CircleAlert } from "lucide-react-native";
import { View } from "react-native";
import { getErrorMessage } from "@/lib/api";
import { Button } from "./ui/button";
import { Icon } from "./ui/icon";
import { Text } from "./ui/text";

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-16">
      <Icon as={CircleAlert} size={32} className="text-muted-foreground" />
      <Text className="text-center text-sm text-muted-foreground">
        {getErrorMessage(error)}
      </Text>
      {onRetry && (
        <Button variant="outline" size="sm" onPress={onRetry}>
          Try again
        </Button>
      )}
    </View>
  );
}

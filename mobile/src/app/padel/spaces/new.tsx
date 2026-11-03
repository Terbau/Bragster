import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FormScrollView } from "@/components/FormScrollView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useCreatePadelSpace, useRenamePadelSpace } from "@/lib/queries";

const MAX_NAME_LENGTH = 60;

/** Creates a space, or renames one when `spaceId` and `name` are given */
export default function PadelSpaceNameScreen() {
  const params = useLocalSearchParams<{ spaceId?: string; name?: string }>();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(params.name ?? "");
  const createSpace = useCreatePadelSpace();
  const renameSpace = useRenamePadelSpace(params.spaceId ?? "");
  const isRename = Boolean(params.spaceId);
  const isPending = createSpace.isPending || renameSpace.isPending;
  const trimmed = name.trim();

  const save = () => {
    if (!trimmed) return;
    if (isRename) {
      renameSpace.mutate(trimmed, { onSuccess: () => router.back() });
    } else {
      createSpace.mutate(trimmed, {
        onSuccess: ({ id }) =>
          router.replace({
            pathname: "/padel/spaces/[spaceId]",
            params: { spaceId: id },
          }),
      });
    }
  };

  return (
    <FormScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-5 p-5"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {!isRename && (
        <Text className="text-sm text-muted-foreground">
          A space is for a group that plays together. Its games, players and
          ratings are kept apart from your other spaces.
        </Text>
      )}
      <View className="gap-2">
        <Text className="text-sm font-semibold">Name</Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Thursday padel"
          maxLength={MAX_NAME_LENGTH}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={save}
        />
      </View>
      <Button
        size="lg"
        disabled={!trimmed}
        isLoading={isPending}
        onPress={save}
      >
        {isRename ? "Save" : "Create space"}
      </Button>
    </FormScrollView>
  );
}

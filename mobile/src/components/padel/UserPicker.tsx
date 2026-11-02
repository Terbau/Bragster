import { useState } from "react";
import { Pressable, View } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useDebouncedValue } from "@/lib/hooks";
import { useUserSearch } from "@/lib/queries";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Finds a user by email. Users in `excludeIds` aren't shown. */
export function UserPicker({
  excludeIds = [],
  disabled = false,
  onPick,
}: {
  excludeIds?: string[];
  disabled?: boolean;
  onPick: (user: User) => void;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const { data, isFetching } = useUserSearch(debouncedQuery);
  const results = data?.filter((user) => !excludeIds.includes(user.id));

  return (
    <View className="gap-2">
      <Input
        placeholder="Search by email"
        value={query}
        onChangeText={setQuery}
        editable={!disabled}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      {debouncedQuery.length > 2 && (
        <View className="overflow-hidden rounded-lg border border-border">
          {isFetching && !results ? (
            <Spinner className="py-3" />
          ) : results && results.length > 0 ? (
            results.slice(0, 6).map((user, index) => (
              <Pressable
                key={user.id}
                accessibilityRole="button"
                disabled={disabled}
                onPress={() => {
                  onPick(user);
                  setQuery("");
                }}
                className={cn(
                  "flex-row items-center gap-3 px-3 py-2.5 active:bg-accent",
                  index > 0 && "border-t border-border",
                )}
              >
                <Avatar src={user.avatarUrl} email={user.email} size="sm" />
                <Text className="flex-1 text-sm" numberOfLines={1}>
                  {user.email}
                </Text>
              </Pressable>
            ))
          ) : (
            <Text className="px-3 py-3 text-center text-sm text-muted-foreground">
              Nobody found. They need to sign in to Bragster once first.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

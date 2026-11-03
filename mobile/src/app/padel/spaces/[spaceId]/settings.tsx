import { router, useLocalSearchParams } from "expo-router";
import { Link2, LogOut, Pencil, Trash2, X } from "lucide-react-native";
import { type ReactNode, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { FormScrollView } from "@/components/FormScrollView";
import { Chip } from "@/components/padel/Chip";
import { UserPicker } from "@/components/padel/UserPicker";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { playerKey, roleLabel } from "@/lib/padel";
import {
  useAddPadelHost,
  useLinkPadelPlayer,
  usePadelSpace,
  useRemovePadelHost,
  useRemovePadelSpace,
  useUnlinkPadelPlayer,
} from "@/lib/queries";
import type { PadelSpaceDetails, PadelSpaceUser } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function PadelSpaceSettingsScreen() {
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const { data, error, isPending, refetch } = usePadelSpace(spaceId);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  return <Settings space={data} />;
}

function Settings({ space }: { space: PadelSpaceDetails }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isOwner = space.role === "OWNER";
  const addHost = useAddPadelHost(space.id);
  const removeHost = useRemovePadelHost(space.id);
  const linkPlayer = useLinkPadelPlayer(space.id);
  const unlinkPlayer = useUnlinkPadelPlayer(space.id);
  const removeSpace = useRemovePadelSpace(
    space.id,
    isOwner ? "delete" : "leave",
  );
  const [linkName, setLinkName] = useState<string | null>(null);
  const isSaving =
    addHost.isPending ||
    removeHost.isPending ||
    linkPlayer.isPending ||
    unlinkPlayer.isPending;

  const linkedKeys = space.links.map((link) => link.key);
  const unlinked = space.players.filter(
    (name) => !linkedKeys.includes(playerKey(name)),
  );

  const confirmRemoveHost = (host: PadelSpaceUser) =>
    Alert.alert(
      "Remove host?",
      `${host.email} can no longer create games or keep score here.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeHost.mutate(host),
        },
      ],
    );

  const confirmRemoveSpace = () =>
    Alert.alert(
      isOwner ? `Delete ${space.name}?` : `Leave ${space.name}?`,
      isOwner
        ? `All ${space.games} ${space.games === 1 ? "game" : "games"} and every rating in the space are deleted. This can't be undone.`
        : "You stop hosting, and your name is no longer linked to your account. You won't see the space any more, unless the owner adds you again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isOwner ? "Delete" : "Leave",
          style: "destructive",
          onPress: () =>
            removeSpace.mutate(undefined, {
              onSuccess: () => router.dismissTo("/padel"),
            }),
        },
      ],
    );

  return (
    <FormScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-8 p-5"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <Section title="Space">
        <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <View className="min-w-0 flex-1">
            <Text className="text-xs text-muted-foreground">Name</Text>
            <Text className="font-medium">{space.name}</Text>
          </View>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              icon={Pencil}
              onPress={() =>
                router.push({
                  pathname: "/padel/spaces/new",
                  params: { spaceId: space.id, name: space.name },
                })
              }
            >
              Rename
            </Button>
          )}
        </View>
      </Section>

      <Section
        title="Hosts"
        description="Hosts can create games, keep score and share links. Only the owner can change who hosts."
      >
        <View className="overflow-hidden rounded-xl border border-border bg-card">
          <UserRow
            user={space.owner}
            isYou={space.owner.id === user?.id}
            badge={roleLabel("OWNER")}
          />
          {space.hosts.map((host) => (
            <UserRow
              key={host.id}
              hasDivider
              user={host}
              isYou={host.id === user?.id}
              badge={roleLabel("HOST")}
              onRemove={isOwner ? () => confirmRemoveHost(host) : undefined}
              disabled={isSaving}
            />
          ))}
        </View>
        {isOwner && (
          <View className="gap-2">
            <Text className="text-sm font-semibold">Add a host</Text>
            <UserPicker
              excludeIds={[space.owner.id, ...space.hosts.map((h) => h.id)]}
              disabled={isSaving}
              onPick={(picked) => addHost.mutate(picked)}
            />
          </View>
        )}
      </Section>

      <Section
        title="Players with an account"
        description="Players are just names, so nobody needs an account to play. A name linked to an account lets that person follow the games and ratings here, and marks them as you in the players list."
      >
        {space.links.length === 0 ? (
          <Text className="text-sm text-muted-foreground">
            No names are linked yet.
          </Text>
        ) : (
          <View className="overflow-hidden rounded-xl border border-border bg-card">
            {space.links.map((link, index) => (
              <UserRow
                key={link.key}
                hasDivider={index > 0}
                user={link.user}
                title={link.name}
                isYou={link.user.id === user?.id}
                removeLabel={`Unlink ${link.name}`}
                onRemove={isOwner ? () => unlinkPlayer.mutate(link) : undefined}
                disabled={isSaving}
              />
            ))}
          </View>
        )}
        {isOwner &&
          (space.players.length === 0 ? (
            <Text className="text-sm text-muted-foreground">
              Names can be linked once they have played a game here.
            </Text>
          ) : (
            <View className="gap-3 rounded-xl border border-dashed border-border p-4">
              <View className="flex-row items-center gap-1.5">
                <Icon as={Link2} size={16} />
                <Text className="text-sm font-semibold">
                  Link a name to an account
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {[...unlinked, ...space.links.map((link) => link.name)].map(
                  (name) => (
                    <Chip
                      key={name}
                      label={name}
                      selected={linkName === name}
                      disabled={isSaving}
                      onPress={() =>
                        setLinkName((current) =>
                          current === name ? null : name,
                        )
                      }
                    />
                  ),
                )}
              </View>
              {linkName ? (
                <UserPicker
                  disabled={isSaving}
                  onPick={(picked) => {
                    linkPlayer.mutate({ name: linkName, user: picked });
                    setLinkName(null);
                  }}
                />
              ) : (
                <Text className="text-xs text-muted-foreground">
                  Choose a player, then find their account.
                </Text>
              )}
            </View>
          ))}
      </Section>

      <Section title={isOwner ? "Delete space" : "Leave space"}>
        <Text className="text-sm text-muted-foreground">
          {isOwner
            ? "Deletes the space with all its games, players and ratings."
            : "You stop hosting, and your name is no longer linked to your account. The games and ratings stay."}
        </Text>
        <Button
          variant="outline"
          icon={isOwner ? Trash2 : LogOut}
          textClassName="text-destructive"
          isLoading={removeSpace.isPending}
          onPress={confirmRemoveSpace}
        >
          {isOwner ? "Delete space" : "Leave space"}
        </Button>
      </Section>
    </FormScrollView>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <View>
        <Text className="font-semibold">{title}</Text>
        {description && (
          <Text className="mt-0.5 text-sm text-muted-foreground">
            {description}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

function UserRow({
  hasDivider = false,
  user,
  isYou,
  title,
  badge,
  onRemove,
  removeLabel,
  disabled = false,
}: {
  /** A line above the row */
  hasDivider?: boolean;
  user: PadelSpaceUser;
  isYou: boolean;
  /** Shown above the email, like the player's name */
  title?: string;
  badge?: string;
  onRemove?: () => void;
  removeLabel?: string;
  disabled?: boolean;
}) {
  return (
    <View
      className={cn(
        "flex-row items-center gap-3 px-4 py-3",
        hasDivider && "border-t border-border",
      )}
    >
      <Avatar src={user.avatarUrl} email={user.email} size="sm" />
      <View className="min-w-0 flex-1">
        {title && (
          <Text className="text-sm font-medium" numberOfLines={1}>
            {title}
          </Text>
        )}
        <Text
          className={title ? "text-xs text-muted-foreground" : "text-sm"}
          numberOfLines={1}
        >
          {user.email}
          {isYou ? " (you)" : ""}
        </Text>
      </View>
      {badge && (
        <Text className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {badge}
        </Text>
      )}
      {onRemove && (
        <Pressable
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={removeLabel ?? `Remove ${user.email}`}
          disabled={disabled}
          onPress={onRemove}
          className="p-1 active:opacity-50"
        >
          <Icon as={X} size={18} className="text-muted-foreground" />
        </Pressable>
      )}
    </View>
  );
}

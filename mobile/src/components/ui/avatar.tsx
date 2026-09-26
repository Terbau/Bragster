import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const textClasses: Record<AvatarSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

interface AvatarProps {
  src?: string | null;
  /** Email or guest name, used for the fallback initials */
  email?: string;
  size?: AvatarSize;
  hasBorder?: boolean;
  className?: string;
}

export function Avatar({
  src,
  email,
  size = "md",
  hasBorder = false,
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const fallback = email ? email.substring(0, 2).toUpperCase() : "??";

  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden rounded-full bg-slate-300",
        sizeClasses[size],
        hasBorder && "border-2 border-foreground",
        className,
      )}
    >
      {src && !failed ? (
        <Image
          source={{ uri: src }}
          style={{ width: "100%", height: "100%" }}
          onError={() => setFailed(true)}
        />
      ) : (
        <Text className={cn("font-medium text-slate-900", textClasses[size])}>
          {fallback}
        </Text>
      )}
    </View>
  );
}

export function EmptyAvatar({ className }: { className?: string }) {
  return (
    <View
      className={cn(
        "h-10 w-10 rounded-full border border-dashed border-border bg-muted-foreground/5",
        className,
      )}
    />
  );
}

interface AvatarGroupProps {
  users: { id: string; email: string; avatarUrl: string | null }[];
  guests?: { id: string; name: string }[];
  maxVisible?: number;
  size?: AvatarSize;
}

export function AvatarGroup({
  users,
  guests = [],
  maxVisible = 3,
  size = "md",
}: AvatarGroupProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const visibleGuests = guests.slice(0, maxVisible - visibleUsers.length);
  const hiddenCount =
    users.length - visibleUsers.length + guests.length - visibleGuests.length;

  return (
    <View className="flex-row items-center">
      {visibleUsers.map((user, index) => (
        <View key={user.id} style={{ marginLeft: index > 0 ? -12 : 0 }}>
          <Avatar src={user.avatarUrl} email={user.email} hasBorder size={size} />
        </View>
      ))}
      {visibleGuests.map((guest, index) => (
        <View
          key={guest.id}
          style={{
            marginLeft: index > 0 || visibleUsers.length > 0 ? -12 : 0,
          }}
        >
          <Avatar email={guest.name} hasBorder size={size} />
        </View>
      ))}
      {hiddenCount > 0 && (
        <View
          style={{ marginLeft: -12 }}
          className={cn(
            "items-center justify-center rounded-full border border-foreground bg-slate-900 dark:bg-neutral-800",
            sizeClasses[size],
          )}
        >
          <Text className={cn("text-slate-100", textClasses[size])}>
            +{hiddenCount}
          </Text>
        </View>
      )}
    </View>
  );
}

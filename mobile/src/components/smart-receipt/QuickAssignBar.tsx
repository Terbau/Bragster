import * as Haptics from "expo-haptics";
import { Info } from "lucide-react-native";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import type { SmartReceiptGuest, User } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface QuickAssignState {
  active: boolean;
  userIds: string[];
  guestIds: string[];
}

export const QUICK_ASSIGN_BAR_HEIGHT = 80;

interface QuickAssignBarProps {
  users: User[];
  guests: SmartReceiptGuest[];
  value: QuickAssignState;
  onChange: (value: QuickAssignState) => void;
}

const toggle = (ids: string[], id: string) =>
  ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];

/**
 * Floating bar for assigning items with a single tap: select people, then tap
 * items to assign them to exactly those people.
 */
export function QuickAssignBar({ users, guests, value, onChange }: QuickAssignBarProps) {
  const insets = useSafeAreaInsets();

  const setActive = (active: boolean) =>
    onChange(
      active
        ? {
            active: true,
            userIds: users.map((user) => user.id),
            guestIds: guests.map((guest) => guest.id),
          }
        : { active: false, userIds: [], guestIds: [] },
    );

  const toggleUser = (userId: string) => {
    void Haptics.selectionAsync();
    onChange({ ...value, active: true, userIds: toggle(value.userIds, userId) });
  };

  const toggleGuest = (guestId: string) => {
    void Haptics.selectionAsync();
    onChange({ ...value, active: true, guestIds: toggle(value.guestIds, guestId) });
  };

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 items-center px-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View
        className="w-full flex-row items-center rounded-full border-2 border-border bg-background px-4 shadow-lg shadow-black/15"
        style={{ height: QUICK_ASSIGN_BAR_HEIGHT }}
      >
        <Switch value={value.active} onValueChange={setActive} />
        <View className="mx-3 h-10 w-px bg-border" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
          contentContainerClassName="items-center gap-2 py-1"
        >
          {users.map((user) => (
            <PersonToggle
              key={user.id}
              label={user.email.split("@")[0]}
              selected={value.userIds.includes(user.id)}
              onPress={() => toggleUser(user.id)}
            >
              <Avatar email={user.email} src={user.avatarUrl} size="sm" />
            </PersonToggle>
          ))}
          {guests.map((guest) => (
            <PersonToggle
              key={guest.id}
              label={guest.name}
              selected={value.guestIds.includes(guest.id)}
              onPress={() => toggleGuest(guest.id)}
            >
              <Avatar email={guest.name} size="sm" />
            </PersonToggle>
          ))}
        </ScrollView>

        <View className="mx-3 h-10 w-px bg-border" />
        <Pressable
          accessibilityLabel="About quick assign"
          hitSlop={10}
          onPress={() =>
            Alert.alert(
              "Quick Assign",
              "Toggle users you want to quickly assign to items. When clicking an item that is already assigned to someone, only the selected users will be assigned.",
            )
          }
        >
          <Icon as={Info} size={22} className="text-foreground/60" />
        </Pressable>
      </View>
    </View>
  );
}

function PersonToggle({
  label,
  selected,
  onPress,
  children,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        "items-center gap-0.5 rounded-xl border-2 px-1.5 py-1",
        selected ? "border-foreground/40" : "border-transparent opacity-20",
      )}
    >
      {children}
      <Text className="max-w-[52px] text-[10px] leading-3" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

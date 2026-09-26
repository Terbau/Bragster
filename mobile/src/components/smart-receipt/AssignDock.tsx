import * as Haptics from "expo-haptics";
import { Check, Users } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { formatAmount } from "@/lib/format";
import type { SmartReceiptGuest, User } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface AssignSelection {
  userIds: string[];
  guestIds: string[];
}

export const EMPTY_SELECTION: AssignSelection = { userIds: [], guestIds: [] };

/** Space the dock takes up, excluding the bottom safe area */
export const ASSIGN_DOCK_HEIGHT = 168;

interface AssignDockProps {
  users: User[];
  guests: SmartReceiptGuest[];
  selection: AssignSelection;
  onSelectionChange: (selection: AssignSelection) => void;
  /** What each person owes so far, by user/guest id */
  amounts: Record<string, number>;
  currencyCode: string;
  amountItemsPaid: number;
  amountItems: number;
}

const toggle = (ids: string[], id: string) =>
  ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];

const firstName = (name: string) => name.split(/[@\s]/)[0];

/**
 * Pick people like a brush, then tap items to add or remove them. Shows how
 * much everyone owes while assigning.
 */
export function AssignDock({
  users,
  guests,
  selection,
  onSelectionChange,
  amounts,
  currencyCode,
  amountItemsPaid,
  amountItems,
}: AssignDockProps) {
  const insets = useSafeAreaInsets();
  const selectedCount = selection.userIds.length + selection.guestIds.length;
  const totalPeople = users.length + guests.length;
  const everyoneSelected = selectedCount === totalPeople && totalPeople > 0;

  const selectedNames = [
    ...users.filter((u) => selection.userIds.includes(u.id)).map((u) => firstName(u.email)),
    ...guests.filter((g) => selection.guestIds.includes(g.id)).map((g) => firstName(g.name)),
  ];

  const update = (next: AssignSelection) => {
    void Haptics.selectionAsync();
    onSelectionChange(next);
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-border bg-background shadow-2xl shadow-black/20"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="flex-row items-center gap-3 px-5 pb-1 pt-3">
        <View className="flex-1">
          {selectedCount > 0 ? (
            <Text className="text-sm font-semibold" numberOfLines={1}>
              Tap items to add or remove{" "}
              {everyoneSelected ? "everyone" : selectedNames.join(", ")}
            </Text>
          ) : (
            <Text className="text-sm font-semibold">Pick people, then tap items</Text>
          )}
          <View className="mt-1.5 flex-row items-center gap-2">
            <Progress
              value={amountItems > 0 ? (amountItemsPaid / amountItems) * 100 : 0}
              className="h-1 flex-1"
            />
            <Text className="text-xs text-muted-foreground">
              {amountItemsPaid}/{amountItems} assigned
            </Text>
          </View>
        </View>
        {selectedCount > 0 && (
          <Pressable
            hitSlop={8}
            onPress={() => update(EMPTY_SELECTION)}
            className="rounded-full bg-primary px-4 py-2 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-primary-foreground">Done</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-1 px-3 pb-3 pt-2"
      >
        {totalPeople > 1 && (
          <PersonChip
            label="Everyone"
            selected={everyoneSelected}
            onPress={() =>
              update(
                everyoneSelected
                  ? EMPTY_SELECTION
                  : { userIds: users.map((u) => u.id), guestIds: guests.map((g) => g.id) },
              )
            }
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Icon as={Users} size={22} className="text-muted-foreground" />
            </View>
          </PersonChip>
        )}
        {users.map((user) => (
          <PersonChip
            key={user.id}
            label={firstName(user.email)}
            amount={formatAmount(amounts[user.id] ?? 0, currencyCode)}
            selected={selection.userIds.includes(user.id)}
            onPress={() =>
              update({ ...selection, userIds: toggle(selection.userIds, user.id) })
            }
          >
            <Avatar src={user.avatarUrl} email={user.email} size="lg" />
          </PersonChip>
        ))}
        {guests.map((guest) => (
          <PersonChip
            key={guest.id}
            label={firstName(guest.name)}
            amount={formatAmount(amounts[guest.id] ?? 0, currencyCode)}
            selected={selection.guestIds.includes(guest.id)}
            onPress={() =>
              update({ ...selection, guestIds: toggle(selection.guestIds, guest.id) })
            }
          >
            <Avatar email={guest.name} size="lg" />
          </PersonChip>
        ))}
      </ScrollView>
    </View>
  );
}

function PersonChip({
  label,
  amount,
  selected,
  onPress,
  children,
}: {
  label: string;
  amount?: string;
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
        "w-[76px] items-center gap-1 rounded-2xl px-1 py-2 active:opacity-70",
        selected && "bg-accent",
      )}
    >
      <View>
        <View
          className={cn(
            "rounded-full border-2 p-0.5",
            selected ? "border-green-600" : "border-transparent",
          )}
        >
          {children}
        </View>
        {selected && (
          <View className="absolute -right-0.5 -top-0.5 h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-green-600">
            <Icon as={Check} size={11} strokeWidth={3} className="text-white" />
          </View>
        )}
      </View>
      <Text className="text-xs font-medium" numberOfLines={1}>
        {label}
      </Text>
      {amount !== undefined && (
        <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>
          {amount}
        </Text>
      )}
    </Pressable>
  );
}

import * as Haptics from "expo-haptics";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { addDays, isSameDay, startOfDay } from "@/lib/padel";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, months: number) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

/** The weeks of the month, Monday first, with null before the 1st */
const monthWeeks = (month: Date) => {
  const first = startOfMonth(month);
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  // getDay() is 0 on Sundays
  const blanks = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = Array.from({ length: blanks }, () => null);
  for (let day = 0; day < daysInMonth; day++) cells.push(addDays(first, day));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

/**
 * A month calendar to pick a day between `firstDay` and `today`. Days with
 * games are bold with a dot under them, as only they change ratings.
 */
export function DayPicker({
  visible,
  selected,
  firstDay,
  today,
  gameDays,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: Date;
  firstDay: Date;
  today: Date;
  gameDays: Date[];
  onSelect: (day: Date) => void;
  onClose: () => void;
}) {
  const [month, setMonth] = useState(() => startOfMonth(selected));

  // Opens on the month of the chosen day
  useEffect(() => {
    if (visible) setMonth(startOfMonth(selected));
  }, [visible, selected]);

  const canGoBack = month > startOfMonth(firstDay);
  const canGoForward = month < startOfMonth(today);
  const isGameDay = (day: Date) => gameDays.some((d) => isSameDay(d, day));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityLabel="Close"
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/40 px-5"
      >
        {/* Taps inside the calendar don't close it */}
        <Pressable
          onPress={() => {}}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-4"
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Pressable
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              disabled={!canGoBack}
              onPress={() => setMonth((m) => addMonths(m, -1))}
              className={cn(
                "rounded-lg p-1.5 active:bg-accent",
                !canGoBack && "opacity-30",
              )}
            >
              <Icon as={ChevronLeft} size={20} />
            </Pressable>
            <Text className="text-base font-semibold">
              {month.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Pressable
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              disabled={!canGoForward}
              onPress={() => setMonth((m) => addMonths(m, 1))}
              className={cn(
                "rounded-lg p-1.5 active:bg-accent",
                !canGoForward && "opacity-30",
              )}
            >
              <Icon as={ChevronRight} size={20} />
            </Pressable>
          </View>

          <View className="flex-row">
            {WEEKDAYS.map((weekday) => (
              <Text
                key={weekday}
                className="flex-1 pb-1 text-center text-xs text-muted-foreground"
              >
                {weekday}
              </Text>
            ))}
          </View>
          {monthWeeks(month).map((week) => (
            <View key={week.find(Boolean)?.toISOString()} className="flex-row">
              {week.map((day, index) => {
                if (!day) {
                  return (
                    <View key={`blank-${index}`} className="h-11 flex-1" />
                  );
                }
                const isSelected = isSameDay(day, selected);
                const isPlayed = isGameDay(day);
                const isEnabled = day >= firstDay && day <= today;
                return (
                  <View key={day.toISOString()} className="h-11 flex-1 p-0.5">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${day.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}${isPlayed ? ", games played" : ""}`}
                      accessibilityState={{
                        selected: isSelected,
                        disabled: !isEnabled,
                      }}
                      disabled={!isEnabled}
                      onPress={() => {
                        Haptics.selectionAsync();
                        onSelect(startOfDay(day));
                      }}
                      className={cn(
                        "flex-1 items-center justify-center rounded-lg",
                        isSelected
                          ? "bg-primary"
                          : isSameDay(day, today)
                            ? "border border-border active:bg-accent"
                            : "active:bg-accent",
                        !isEnabled && "opacity-30",
                      )}
                    >
                      <Text
                        className={cn(
                          "text-sm",
                          isSelected
                            ? "text-primary-foreground"
                            : isPlayed
                              ? "text-foreground"
                              : "text-muted-foreground",
                          isPlayed && "font-bold",
                        )}
                        style={{ fontVariant: ["tabular-nums"] }}
                      >
                        {day.getDate()}
                      </Text>
                      <View
                        className={cn(
                          "mt-0.5 h-1 w-1 rounded-full",
                          !isPlayed
                            ? "bg-transparent"
                            : isSelected
                              ? "bg-primary-foreground"
                              : "bg-primary",
                        )}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ))}

          <View className="mt-3 flex-row items-center justify-between border-t border-border pt-3">
            <View className="flex-row items-center gap-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <Text className="text-xs text-muted-foreground">
                Days with games
              </Text>
            </View>
            <Button
              variant="ghost"
              size="sm"
              disabled={isSameDay(selected, today)}
              onPress={() => onSelect(today)}
            >
              Today
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

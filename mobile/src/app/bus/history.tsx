import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  RotateCcw,
  Trash2,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { JourneyReportView } from "@/components/bus/JourneyReportView";
import { LineBadge } from "@/components/bus/shared";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  clearJourneyHistory,
  type CompletedJourney,
  computeHistoryStats,
  removeJourneyHistory,
  useBusPreferences,
} from "@/lib/bus-preferences";
import { refreshJourneyReport, repeatJourney } from "@/lib/journey";
import { formatClockTime, formatDuration } from "@/lib/journey-report";
import { toast } from "@/lib/toast";

function formatTripDate(ms: number) {
  const date = new Date(ms);
  return `${date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })} · ${formatClockTime(ms)}`;
}

export default function BusHistoryScreen() {
  const { history } = useBusPreferences();
  const [expandedId, setExpandedId] = useState<string | null>(
    history[0]?.id ?? null,
  );
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [repeatingId, setRepeatingId] = useState<string | null>(null);

  const stats = useMemo(() => computeHistoryStats(history), [history]);

  const handleRepeat = async (entry: CompletedJourney) => {
    void Haptics.selectionAsync();
    setRepeatingId(entry.id);
    try {
      await repeatJourney(entry.journey);
      router.replace("/bus/journey");
    } finally {
      setRepeatingId(null);
    }
  };

  const handleRefresh = async (entry: CompletedJourney) => {
    setRefreshingId(entry.id);
    try {
      await refreshJourneyReport(entry.journey);
      toast.success("Report refreshed");
    } catch {
      toast.error("Couldn't refresh report");
    } finally {
      setRefreshingId(null);
    }
  };

  const confirmClear = () => {
    Alert.alert("Clear trip history?", "All saved trip reports will be removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => clearJourneyHistory(),
      },
    ]);
  };

  if (history.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
        <Icon
          as={Clock}
          size={40}
          className="text-muted-foreground opacity-30"
        />
        <Text className="text-center text-sm text-muted-foreground">
          Completed trips appear here, with time saved by dynamic rerouting and
          1-tap repeat.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
    >
      {/* Aggregate Stats */}
      <View className="gap-3 rounded-xl border border-border bg-card p-4">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Your stats
        </Text>
        <View className="flex-row gap-3">
          <StatBox label="Trips" value={String(stats.totalTrips)} />
          <StatBox
            label="Time saved"
            value={
              stats.totalSavedMs >= 60_000
                ? formatDuration(stats.totalSavedMs)
                : "0 min"
            }
          />
          <StatBox label="Reroutes" value={String(stats.reroutesCount)} />
        </View>
        {stats.topLines.length > 0 && (
          <View className="gap-1.5 border-t border-border pt-3">
            <Text className="text-xs text-muted-foreground">
              Most-taken lines
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {stats.topLines.map(({ line, rides }) => (
                <View
                  key={line}
                  className="flex-row items-center gap-1.5 rounded-lg bg-muted pr-2"
                >
                  <LineBadge line={line} />
                  <Text className="text-xs font-medium text-muted-foreground">
                    ×{rides}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Past Trips */}
      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Past trips
        </Text>
        {history.map((entry) => {
          const isOpen = expandedId === entry.id;
          const totalMs = entry.report.arrivedAt - entry.report.startedAt;
          return (
            <View
              key={entry.id}
              className="rounded-xl border border-border bg-card"
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => setExpandedId(isOpen ? null : entry.id)}
                className="flex-row items-center gap-3 p-4 active:bg-accent"
              >
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-semibold" numberOfLines={1}>
                    {entry.report.destination}
                  </Text>
                  <Text
                    className="mt-0.5 text-xs text-muted-foreground"
                    numberOfLines={1}
                  >
                    {formatTripDate(entry.report.startedAt)} ·{" "}
                    {formatDuration(totalMs)} · {entry.report.short}
                  </Text>
                </View>
                <Icon
                  as={isOpen ? ChevronUp : ChevronDown}
                  size={16}
                  className="text-muted-foreground"
                />
              </Pressable>

              {isOpen && (
                <View className="gap-4 border-t border-border p-4">
                  <JourneyReportView
                    report={entry.report}
                    onRefresh={() => void handleRefresh(entry)}
                    isRefreshing={refreshingId === entry.id}
                    onRepeat={() => void handleRepeat(entry)}
                  />
                  <View className="flex-row gap-2">
                    <Button
                      size="sm"
                      icon={RotateCcw}
                      className="flex-1"
                      isLoading={repeatingId === entry.id}
                      onPress={() => void handleRepeat(entry)}
                    >
                      Repeat trip
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      onPress={() => removeJourneyHistory(entry.id)}
                    >
                      Delete
                    </Button>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Button variant="ghost" icon={Trash2} onPress={confirmClear}>
        Clear history
      </Button>
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-lg bg-muted p-3">
      <Text className="text-lg font-bold tabular-nums">{value}</Text>
      <Text className="mt-0.5 text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

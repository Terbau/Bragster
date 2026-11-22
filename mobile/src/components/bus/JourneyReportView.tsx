import {
  Bus,
  Equal,
  Footprints,
  type LucideIcon,
  MapPin,
  RefreshCw,
  RotateCcw,
  Share2,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Share, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  formatClockTime,
  formatDuration,
  type JourneyActivity,
  type JourneyReport,
  type ReplayStep,
} from "@/lib/journey-report";
import { cn } from "@/lib/utils";

const ICONS: Record<JourneyActivity["kind"], LucideIcon> = {
  walk: Footprints,
  wait: Bus,
  ride: Bus,
  rental: Zap,
  stay: MapPin,
};

const TOTALS: [JourneyActivity["kind"], string][] = [
  ["walk", "Walking"],
  ["wait", "Waiting for buses"],
  ["ride", "On buses"],
  ["rental", "On scooters and bikes"],
  ["stay", "At stops on the way"],
];

/**
 * How a trip went, once you're there: whether the first route would have
 * been faster, where the time went, what you did, how the first route
 * really turned out, and what changed on the way
 */
export function JourneyReportView({
  report,
  onRefresh,
  isRefreshing,
  onRepeat,
}: {
  report: JourneyReport;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onRepeat?: () => void;
}) {
  const { baseline } = report;
  const total = report.arrivedAt - report.startedAt;

  const shareSummary = () => {
    const lines = [
      `Trip to ${report.destination} (${formatClockTime(report.startedAt)}–${formatClockTime(report.arrivedAt)}, ${formatDuration(total)})`,
      report.verdict,
    ];
    void Share.share({ message: lines.join("\n") });
  };

  return (
    <View className="gap-5">
      <View
        className={cn(
          "flex-row gap-3 rounded-xl border bg-card p-4",
          report.isBetter === true
            ? "border-green-600"
            : report.isBetter === false
              ? "border-orange-500"
              : "border-border",
        )}
      >
        <Icon
          as={
            report.isBetter === true
              ? TrendingUp
              : report.isBetter === false
                ? TrendingDown
                : Equal
          }
          size={20}
          className={cn(
            "mt-0.5",
            report.isBetter === true
              ? "text-green-600"
              : report.isBetter === false
                ? "text-orange-500"
                : "text-muted-foreground",
          )}
        />
        <Text className="flex-1 text-sm font-medium leading-5">
          {report.verdict}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={Share2}
          className="flex-1"
          onPress={shareSummary}
        >
          Share
        </Button>
        {onRepeat && (
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            className="flex-1"
            onPress={onRepeat}
          >
            Repeat trip
          </Button>
        )}
      </View>

      <Section title="Times">
        <Row label="Set off" value={formatClockTime(report.startedAt)} />
        <Row label="Got there" value={formatClockTime(report.arrivedAt)} />
        <Row label="The trip took" value={formatDuration(total)} />
        {baseline && (
          <>
            <Row
              label="The first route said"
              value={formatClockTime(baseline.predictedArrival)}
            />
            <Row
              label={
                baseline.isFinal
                  ? "The first route would have been there"
                  : "The first route is expected there"
              }
              value={
                baseline.arrival === null
                  ? "Not at all"
                  : formatClockTime(baseline.arrival)
              }
            />
            {report.differenceMs !== null && (
              <Row
                label="Difference"
                value={
                  Math.abs(report.differenceMs) < 60 * 1000
                    ? "None"
                    : report.differenceMs < 0
                      ? `You were ${formatDuration(-report.differenceMs)} faster`
                      : `You were ${formatDuration(report.differenceMs)} slower`
                }
                isStrong
              />
            )}
          </>
        )}
      </Section>

      <Section title="Where the time went">
        {TOTALS.filter(([kind]) => report.totals[kind] >= 30 * 1000).map(
          ([kind, label]) => (
            <Row
              key={kind}
              label={label}
              value={formatDuration(report.totals[kind])}
            />
          ),
        )}
      </Section>

      <Section title="What you did">
        {report.activities.length === 0 ? (
          <Note>Nothing was noted before you got there.</Note>
        ) : (
          report.activities.map((activity) => (
            <Line
              key={`${activity.start}/${activity.text}`}
              icon={ICONS[activity.kind]}
              title={
                activity.kind === "ride"
                  ? `Took ${activity.text}`
                  : activity.text
              }
              detail={formatDuration(activity.end - activity.start)}
              time={`${formatClockTime(activity.start)}–${formatClockTime(activity.end)}`}
            />
          ))
        )}
      </Section>

      {baseline && (
        <Section title="The first route, as it turned out">
          {baseline.steps.map((step, index) => (
            <Line
              // biome-ignore lint/suspicious/noArrayIndexKey: steps have no id and keep their order
              key={index}
              icon={ICONS[step.kind]}
              title={step.text}
              detail={stepDetail(step)}
              time={
                step.start !== null && step.end !== null
                  ? `${formatClockTime(step.start)}–${formatClockTime(step.end)}`
                  : "–"
              }
              isMuted={step.start === null}
            />
          ))}
          {baseline.failure && (
            <Note>
              It stops there: {baseline.failure}. The rest of it wouldn’t have
              happened.
            </Note>
          )}
          {!baseline.isFinal && (
            <View className="gap-2 py-2">
              <Text className="text-xs text-muted-foreground">
                One of its buses is still on its way, or its real times couldn’t
                be got, so the timetable is used for it.
              </Text>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  isLoading={isRefreshing}
                  onPress={onRefresh}
                >
                  Refresh actual times
                </Button>
              )}
            </View>
          )}
          {report.followedBaseline && <Note>This is the route you took.</Note>}
        </Section>
      )}

      <Section title="Changes on the way">
        {report.changes.length === 0 ? (
          <Note>The route wasn’t changed.</Note>
        ) : (
          report.changes.map((change) => (
            <View key={`${change.at}/${change.text}`} className="py-2">
              <View className="flex-row gap-3">
                <Text className="flex-1 text-sm">{change.text}</Text>
                <Text className="text-xs tabular-nums text-muted-foreground">
                  {formatClockTime(change.at)}
                </Text>
              </View>
              {change.reason && (
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  {change.reason}
                </Text>
              )}
            </View>
          ))
        )}
      </Section>
    </View>
  );
}

/** How a step of the first route went, next to how it was planned */
function stepDetail(step: ReplayStep) {
  const planned = `Planned ${formatClockTime(step.plannedStart)}–${formatClockTime(step.plannedEnd)}`;
  return step.note ? `${step.note} · ${planned}` : planned;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </Text>
      <View className="rounded-xl border border-border bg-card px-4 py-2">
        {children}
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  isStrong,
}: {
  label: string;
  value: string;
  isStrong?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between gap-4 py-2">
      <Text className="flex-1 text-sm text-muted-foreground">{label}</Text>
      <Text className={cn("text-sm tabular-nums", isStrong && "font-semibold")}>
        {value}
      </Text>
    </View>
  );
}

function Line({
  icon,
  title,
  detail,
  time,
  isMuted,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  time: string;
  isMuted?: boolean;
}) {
  return (
    <View className={cn("flex-row gap-3 py-2", isMuted && "opacity-50")}>
      <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-muted">
        <Icon as={icon} size={13} className="text-muted-foreground" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm">{title}</Text>
        <Text className="mt-0.5 text-xs text-muted-foreground">{detail}</Text>
      </View>
      <Text className="text-xs tabular-nums text-muted-foreground">{time}</Text>
    </View>
  );
}

const Note = ({ children }: { children: ReactNode }) => (
  <Text className="py-2 text-xs text-muted-foreground">{children}</Text>
);

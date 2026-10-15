import type { PadelRecordingView } from "@/app/padel/_lib/videos";
import type { PadelVideoMatch } from "@/utils/padelVideo";

type Recording = Pick<PadelRecordingView, "status" | "matches" | "error"> & {
  matches: Pick<PadelVideoMatch, "series" | "roundNumber" | "rallies">[];
};

const roundLabel = (
  match: Pick<PadelVideoMatch, "series" | "roundNumber">,
  withSeries: boolean,
) =>
  withSeries ? `${match.series}.${match.roundNumber}` : `${match.roundNumber}`;

/** The rounds a video covers, like "Round 2" or "Rounds 2–4" */
export const recordingRounds = (recording: Pick<Recording, "matches">) => {
  const { matches } = recording;
  if (matches.length === 0) return null;
  const first = matches[0];
  const last = matches[matches.length - 1];
  const withSeries = first.series > 1 || last.series > 1;
  return matches.length === 1
    ? `Round ${roundLabel(first, withSeries)}`
    : `Rounds ${roundLabel(first, withSeries)}–${roundLabel(last, withSeries)}`;
};

export const matchRoundLabel = (
  match: Pick<PadelVideoMatch, "series" | "roundNumber">,
) =>
  match.series > 1
    ? `Series ${match.series}, round ${match.roundNumber}`
    : `Round ${match.roundNumber}`;

/** What is happening to a video */
export const recordingStatus = (recording: Recording) => {
  const rallies = recording.matches.reduce(
    (sum, match) => sum + match.rallies.filter((r) => !r.isIgnored).length,
    0,
  );
  switch (recording.status) {
    case "UPLOADING":
      return { text: "Uploading", isBusy: true, isFailed: false };
    case "UPLOADED":
      return { text: "Waiting to be analysed", isBusy: true, isFailed: false };
    case "ANALYZING":
      return { text: "Finding the rallies", isBusy: true, isFailed: false };
    case "FAILED":
      return { text: "Analysis failed", isBusy: false, isFailed: true };
    default:
      return {
        text: rallies === 1 ? "1 rally" : `${rallies} rallies`,
        isBusy: false,
        isFailed: false,
      };
  }
};

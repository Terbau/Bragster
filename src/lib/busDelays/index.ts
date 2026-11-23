import { BigQuery } from "@google-cloud/bigquery";

/**
 * How late AtB buses really are, from Entur's history of real-time data in
 * BigQuery. A weekly job sums it up per line, stop, kind of day and timetable
 * minute in a small table of our own, which the app looks things up in.
 *
 * Env: BUS_DELAYS_PROJECT (Google Cloud project, defaults to
 * bragster-transit) and GOOGLE_BIGQUERY_CREDENTIALS (a service account key as
 * JSON). Without the key, the machine's own Google login is used, like after
 * `gcloud auth application-default login`.
 */

const PROJECT = process.env.BUS_DELAYS_PROJECT ?? "bragster-transit";
const TABLE = `${PROJECT}.bus_delays.slots`;
/** How many days back the history goes */
const HISTORY_DAYS = 60;

let client: BigQuery | null = null;

function getClient() {
  if (client) return client;
  const key = process.env.GOOGLE_BIGQUERY_CREDENTIALS;
  client = new BigQuery({
    projectId: PROJECT,
    location: "EU",
    ...(key ? { credentials: JSON.parse(key) } : {}),
  });
  return client;
}

const AGGREGATE_SQL = `
WITH calls AS (
  SELECT
    operatingDate,
    lineRef,
    stopPointRef AS quay,
    serviceJourneyId,
    sequenceNr,
    ANY_VALUE(AimedDepartureTime) AS aimedDeparture,
    -- NULL when it was the same as the timetable
    ANY_VALUE(COALESCE(departureTime, AimedDepartureTime)) AS departure,
    ANY_VALUE(AimedArrivalTime) AS aimedArrival,
    ANY_VALUE(COALESCE(arrivalTime, AimedArrivalTime)) AS arrival,
    MAX(IF(timeDeltaMinutes = 10, estimatedDepartureTime, NULL)) AS shown10,
    MAX(IF(timeDeltaMinutes = 5, estimatedDepartureTime, NULL)) AS shown5,
    MAX(IF(timeDeltaMinutes = 1, estimatedDepartureTime, NULL)) AS shown1
  FROM \`ent-data-sharing-ext-prd.realtime_siri_et.siri_et_estimated_times\`
  WHERE operatingDate >= DATE_SUB(CURRENT_DATE('Europe/Oslo'), INTERVAL @days DAY)
    AND dataSource = 'ATB'
  GROUP BY operatingDate, lineRef, quay, serviceJourneyId, sequenceNr
),
timed AS (
  SELECT
    *,
    CASE EXTRACT(DAYOFWEEK FROM operatingDate)
      WHEN 1 THEN 'sun' WHEN 7 THEN 'sat' ELSE 'weekday'
    END AS dayKind,
    DATETIME(COALESCE(aimedDeparture, aimedArrival), 'Europe/Oslo') AS aimedLocal,
    TIMESTAMP_DIFF(departure, aimedDeparture, SECOND) AS depDelay,
    TIMESTAMP_DIFF(arrival, aimedArrival, SECOND) AS arrDelay,
    TIMESTAMP_DIFF(shown10, aimedDeparture, SECOND) AS shown10Delay,
    TIMESTAMP_DIFF(shown5, aimedDeparture, SECOND) AS shown5Delay,
    TIMESTAMP_DIFF(shown1, aimedDeparture, SECOND) AS shown1Delay
  FROM calls
)
SELECT
  lineRef,
  quay,
  dayKind,
  EXTRACT(HOUR FROM aimedLocal) * 60 + EXTRACT(MINUTE FROM aimedLocal) AS minute,
  COUNT(*) AS n,
  APPROX_QUANTILES(depDelay, 20 IGNORE NULLS) AS depQ,
  APPROX_QUANTILES(arrDelay, 20 IGNORE NULLS) AS arrQ,
  -- Left at least 2 min before what it showed 10 min earlier
  COUNTIF(shown10Delay - depDelay >= 120) AS early10,
  COUNTIF(shown10Delay IS NOT NULL) AS shown10N,
  -- Showed 3+ min late 5 min before, then about the timetable 1 min before,
  -- yet still left 2+ min later than that
  COUNTIF(
    shown5Delay >= 180
    AND shown1Delay <= shown5Delay - 180
    AND depDelay >= shown1Delay + 120
  ) AS snapBack,
  COUNTIF(shown5Delay IS NOT NULL AND shown1Delay IS NOT NULL) AS snapN
FROM timed
GROUP BY lineRef, quay, dayKind, minute
HAVING n >= 5`;

/**
 * Starts summing up the history again, into the table the app looks things
 * up in. Takes a couple of minutes; it's not waited for. Scans about 14 GB.
 */
export async function startRefresh() {
  const [job] = await getClient().createQueryJob({
    query: `CREATE OR REPLACE TABLE \`${TABLE}\`
      CLUSTER BY quay, lineRef
      AS ${AGGREGATE_SQL}`,
    params: { days: HISTORY_DAYS },
    // A runaway query is stopped rather than billed
    maximumBytesBilled: String(40e9),
  });
  return job.id;
}

export type DayKind = "weekday" | "sat" | "sun";

/** How late a departure at a timetable minute was, in seconds */
export interface DelaySlot {
  lineRef: string;
  quay: string;
  /** Minutes since midnight, local time, by the timetable */
  minute: number;
  /** How many days it's from */
  n: number;
  /** p10, p25, p50, p75, p90 of how late it left. Null at the last stop. */
  departure: number[] | null;
  /** The same for when it got there. Null at the first stop. */
  arrival: number[] | null;
  /** Share of days, 0-1, it left 2+ min earlier than shown 10 min before */
  early10: number | null;
  /**
   * Share of days, 0-1, it showed 3+ min late, went back to about the
   * timetable right before leaving, and still left late
   */
  snapBack: number | null;
}

interface Row {
  lineRef: string;
  quay: string;
  minute: number;
  n: number;
  depQ: number[];
  arrQ: number[];
  early10: number;
  shown10N: number;
  snapBack: number;
  snapN: number;
}

/** p10, p25, p50, p75, p90 of 21 quantiles */
const pickQuantiles = (q: number[]) =>
  q.length === 21 ? [q[2], q[5], q[10], q[15], q[18]].map(Number) : null;

const share = (count: number, of: number) =>
  Number(of) >= 5 ? Number(count) / Number(of) : null;

/** Every timetable minute of these lines at these stops on a kind of day */
export async function getDelaySlots(
  pairs: { lineRef: string; quay: string }[],
  dayKind: DayKind,
): Promise<DelaySlot[]> {
  if (pairs.length === 0) return [];
  const [rows] = await getClient().query({
    query: `SELECT lineRef, quay, minute, n, depQ, arrQ, early10, shown10N, snapBack, snapN
      FROM \`${TABLE}\`
      WHERE quay IN UNNEST(@quays) AND lineRef IN UNNEST(@lines) AND dayKind = @dayKind`,
    params: {
      quays: Array.from(new Set(pairs.map((pair) => pair.quay))),
      lines: Array.from(new Set(pairs.map((pair) => pair.lineRef))),
      dayKind,
    },
    maximumBytesBilled: String(500e6),
  });
  const wanted = new Set(pairs.map((pair) => `${pair.lineRef}|${pair.quay}`));
  return (rows as Row[])
    .filter((row) => wanted.has(`${row.lineRef}|${row.quay}`))
    .map((row) => ({
      lineRef: row.lineRef,
      quay: row.quay,
      minute: Number(row.minute),
      n: Number(row.n),
      departure: pickQuantiles(row.depQ),
      arrival: pickQuantiles(row.arrQ),
      early10: share(row.early10, row.shown10N),
      snapBack: share(row.snapBack, row.snapN),
    }));
}

import { z } from "zod";

/** At most this many hours of video */
export const MAX_PADEL_VIDEO_HOURS = 6;

const TeamSchema = z.union([z.literal(1), z.literal(2)]);

export const CreatePadelRecordingSchema = z.object({
  /** The match the video starts with */
  matchId: z.string().min(1),
  recordedAt: z.coerce.date(),
  /** Seconds */
  duration: z
    .number()
    .min(0)
    .max(MAX_PADEL_VIDEO_HOURS * 60 * 60)
    .optional(),
  sizeBytes: z.number().int().min(0).optional(),
  /** The team nearest the camera in the first match, if known */
  nearTeam: TeamSchema.optional(),
});
export type CreatePadelRecordingInput = z.input<
  typeof CreatePadelRecordingSchema
>;

export const UpdatePadelRecordingSchema = z.object({
  /** The match the video starts with, which also sets the court */
  matchId: z.string().min(1).optional(),
  /** Null guesses it from the rallies */
  matchCount: z.number().int().min(1).max(50).nullable().optional(),
  /** Null guesses it from the rallies and the score */
  nearTeam: z
    .object({ matchId: z.string().min(1), team: TeamSchema.nullable() })
    .optional(),
});
export type UpdatePadelRecordingInput = z.input<
  typeof UpdatePadelRecordingSchema
>;

export const UpdatePadelRallySchema = z.object({
  /** Who won, null when not known */
  winner: z
    .object({ matchId: z.string().min(1), team: TeamSchema })
    .nullable()
    .optional(),
  /** It wasn't a point, like the warm up */
  isIgnored: z.boolean().optional(),
});
export type UpdatePadelRallyInput = z.input<typeof UpdatePadelRallySchema>;

/** What the analyzer reports, see /analyzer/padel_analyzer/worker.py */
export const PadelVideoAnalysisSchema = z.discriminatedUnion("status", [
  z.object({ recordingId: z.string().min(1), status: z.literal("ANALYZING") }),
  z.object({
    recordingId: z.string().min(1),
    status: z.literal("FAILED"),
    error: z.string().max(1000).optional(),
  }),
  z.object({
    recordingId: z.string().min(1),
    status: z.literal("READY"),
    result: z.object({
      version: z.number().int(),
      duration: z.number().min(0),
      rallies: z
        .array(
          z.object({
            start: z.number().min(0),
            end: z.number().min(0),
            nearWinProbability: z.number().min(0).max(1),
          }),
        )
        .max(5000),
    }),
  }),
]);

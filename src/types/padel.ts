import { Prisma } from "@/lib/generated/prisma";
import {
  MAX_PADEL_COURT_NAME_LENGTH,
  MAX_PADEL_PLAYERS,
  MAX_PADEL_POINTS,
  MAX_PADEL_ROUNDS,
  MIN_PADEL_PLAYERS,
  MIN_PADEL_POINTS,
  MIN_PADEL_ROUNDS,
  maxPadelCourts,
} from "@/utils/padel";
import { z } from "zod";

export const padelGameInclude = Prisma.validator<Prisma.PadelGameInclude>()({
  players: { orderBy: { position: "asc" } },
  rounds: {
    orderBy: { position: "asc" },
    include: { matches: { orderBy: { court: "asc" } } },
  },
});

export type PadelGameWithRounds = Prisma.PadelGameGetPayload<{
  include: typeof padelGameInclude;
}>;

export type PadelRoundWithMatches = PadelGameWithRounds["rounds"][number];

export const PadelPlayerNameSchema = z.string().trim().min(1).max(30);
const PadelGameNameSchema = z.string().trim().min(1).max(60);
const PadelPlannedRoundsSchema = z
  .number()
  .int()
  .min(MIN_PADEL_ROUNDS)
  .max(MAX_PADEL_ROUNDS);
/** Empty names use the default "Court 1", "Court 2", ... */
const PadelCourtNamesSchema = z
  .array(z.string().trim().max(MAX_PADEL_COURT_NAME_LENGTH))
  .transform((names) => {
    const result = names.slice();
    // Trailing empty names aren't stored
    while (result.length > 0 && !result[result.length - 1]) result.pop();
    return result;
  });

const hasDuplicateNames = (names: string[]) => {
  const lower = names.map((name) => name.toLowerCase());
  return new Set(lower).size !== lower.length;
};

export const CreatePadelGameSchema = z
  .object({
    name: PadelGameNameSchema,
    format: z.enum(["AMERICANO", "MEXICANO"]).default("AMERICANO"),
    playerNames: z
      .array(PadelPlayerNameSchema)
      .min(MIN_PADEL_PLAYERS, `Add at least ${MIN_PADEL_PLAYERS} players`)
      .max(MAX_PADEL_PLAYERS, `At most ${MAX_PADEL_PLAYERS} players can play`),
    courts: z.number().int().min(1),
    courtNames: PadelCourtNamesSchema.default([]),
    pointsPerMatch: z
      .number()
      .int()
      .min(MIN_PADEL_POINTS)
      .max(MAX_PADEL_POINTS),
    /** Mexicano only */
    plannedRounds: PadelPlannedRoundsSchema.optional(),
  })
  .superRefine((game, ctx) => {
    if (hasDuplicateNames(game.playerNames)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Two players have the same name",
        path: ["playerNames"],
      });
    }
    if (game.courts > maxPadelCourts(game.playerNames.length)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Too many courts for the number of players",
        path: ["courts"],
      });
    }
    if (game.courtNames.length > game.courts) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "There are more court names than courts",
        path: ["courtNames"],
      });
    }
    if (game.format === "MEXICANO" && game.plannedRounds === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose the number of rounds",
        path: ["plannedRounds"],
      });
    }
  });

export type CreatePadelGameInput = z.input<typeof CreatePadelGameSchema>;

/** `null` scores clear the result */
export const PadelMatchScoreSchema = z
  .object({
    team1Score: z.number().int().min(0).nullable(),
    team2Score: z.number().int().min(0).nullable(),
  })
  .refine(
    (score) => (score.team1Score === null) === (score.team2Score === null),
    "Enter the score of both teams",
  );

export const ReorderPadelRoundsSchema = z.object({
  roundIds: z.array(z.string()).min(1),
});

/** Every field is optional, only the ones given are changed */
export const UpdatePadelGameSchema = z
  .object({
    name: PadelGameNameSchema.optional(),
    /** New names for players, by id */
    players: z
      .array(z.object({ id: z.string(), name: PadelPlayerNameSchema }))
      .optional(),
    courtNames: PadelCourtNamesSchema.optional(),
    /** Mexicano only */
    plannedRounds: PadelPlannedRoundsSchema.optional(),
  })
  .superRefine((input, ctx) => {
    if (input.players && hasDuplicateNames(input.players.map((p) => p.name))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Two players have the same name",
        path: ["players"],
      });
    }
  });

export type UpdatePadelGameInput = z.input<typeof UpdatePadelGameSchema>;

import { Prisma } from "@/lib/generated/prisma";
import {
  MAX_PADEL_PLAYERS,
  MAX_PADEL_POINTS,
  MIN_PADEL_PLAYERS,
  MIN_PADEL_POINTS,
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

export const CreatePadelGameSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    playerNames: z
      .array(PadelPlayerNameSchema)
      .min(MIN_PADEL_PLAYERS, `Add at least ${MIN_PADEL_PLAYERS} players`)
      .max(MAX_PADEL_PLAYERS, `At most ${MAX_PADEL_PLAYERS} players can play`),
    courts: z.number().int().min(1),
    pointsPerMatch: z
      .number()
      .int()
      .min(MIN_PADEL_POINTS)
      .max(MAX_PADEL_POINTS),
  })
  .superRefine((game, ctx) => {
    const names = game.playerNames.map((name) => name.toLowerCase());
    if (new Set(names).size !== names.length) {
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
  });

export type CreatePadelGameInput = z.infer<typeof CreatePadelGameSchema>;

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

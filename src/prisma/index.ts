import { PrismaClient } from "@/lib/generated/prisma";
export type * from "@prisma/client";

export const prisma = new PrismaClient();

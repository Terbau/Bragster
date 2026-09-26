import {
  createMobileAccessToken,
  verifyMobileAuthCode,
} from "@/lib/mobileAuth";
import { prisma } from "@/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const TokenRequestSchema = z.object({
  code: z.string().min(1),
  codeVerifier: z.string().min(43).max(128),
});

export async function POST(request: NextRequest) {
  const parsed = TokenRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const userId = await verifyMobileAuthCode(
    parsed.data.code,
    parsed.data.codeVerifier,
  );
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired sign in code" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    token: await createMobileAccessToken(user.id),
    user,
  });
}

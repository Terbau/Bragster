import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/prisma";
import { PadelVideoAnalysisSchema } from "@/types/padelVideo";
import { type NextRequest, NextResponse } from "next/server";

// The analyzer (see /analyzer) reports here while it analyses a video, and
// sends the rallies it found. It signs in with PADEL_ANALYZER_SECRET.

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.PADEL_ANALYZER_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret || !header.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice("Bearer ".length));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
};

/** How much of the shorter of two rallies they share */
const overlap = (
  a: { start: number; end: number },
  b: { start: number; end: number },
) => {
  const shared = Math.min(a.end, b.end) - Math.max(a.start, b.start);
  const shorter = Math.min(a.end - a.start, b.end - b.start);
  return shorter > 0 ? Math.max(0, shared) / shorter : 0;
};

export const POST = async (request: NextRequest) => {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = PadelVideoAnalysisSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const report = parsed.data;

  const recording = await prisma.padelRecording.findUnique({
    where: { id: report.recordingId },
    include: { rallies: true },
  });
  if (!recording) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  if (report.status === "ANALYZING") {
    await prisma.padelRecording.update({
      where: { id: recording.id },
      data: { status: "ANALYZING", error: null },
    });
  } else if (report.status === "FAILED") {
    await prisma.padelRecording.update({
      where: { id: recording.id },
      data: {
        status: "FAILED",
        error: report.error ?? "The video couldn't be analysed",
      },
    });
  } else {
    const { result } = report;
    // Who won is kept for rallies that are found again
    const rallies = result.rallies
      .filter((rally) => rally.end > rally.start)
      .map((rally) => {
        const previous = recording.rallies
          .filter((old) => overlap(old, rally) >= 0.5)
          .sort((a, b) => overlap(b, rally) - overlap(a, rally))[0];
        return {
          recordingId: recording.id,
          start: rally.start,
          end: rally.end,
          nearWinProbability: rally.nearWinProbability,
          winnerMatchId: previous?.winnerMatchId ?? null,
          winnerTeam: previous?.winnerTeam ?? null,
          isIgnored: previous?.isIgnored ?? false,
        };
      });
    await prisma.$transaction([
      prisma.padelRally.deleteMany({ where: { recordingId: recording.id } }),
      prisma.padelRally.createMany({ data: rallies }),
      prisma.padelRecording.update({
        where: { id: recording.id },
        data: {
          status: "READY",
          error: null,
          duration: result.duration,
          analysisVersion: result.version,
          analyzedAt: new Date(),
        },
      }),
    ]);
  }
  return NextResponse.json({ success: true });
};

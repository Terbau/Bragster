import { startRefresh } from "@/lib/busDelays";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Sums up how late AtB buses have really been again, from Entur's history.
 * Run once a week by Vercel Cron (vercel.json), which sends CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const jobId = await startRefresh();
    return NextResponse.json({ started: jobId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Couldn't start the refresh" },
      { status: 500 },
    );
  }
}

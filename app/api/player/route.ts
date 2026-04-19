import { NextRequest, NextResponse } from "next/server";
import { getVideoPlayer } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId") || "";

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId parameter" }, { status: 400 });
  }

  try {
    const player = await getVideoPlayer(videoId);
    return NextResponse.json(player);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch player data",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

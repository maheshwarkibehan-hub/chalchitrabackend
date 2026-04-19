import { NextRequest, NextResponse } from "next/server";
import { getPlaylist } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const playlistId = request.nextUrl.searchParams.get("playlistId") || "";
  const continuation = request.nextUrl.searchParams.get("continuation") || undefined;

  if (!playlistId && !continuation) {
    return NextResponse.json({ error: "Missing playlistId or continuation" }, { status: 400 });
  }

  try {
    const data = await getPlaylist(playlistId, continuation);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch playlist",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

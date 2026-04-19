import { NextRequest, NextResponse } from "next/server";
import { getTranscript } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId") || "";
  const params = request.nextUrl.searchParams.get("params") || undefined;

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId parameter" }, { status: 400 });
  }

  try {
    const transcript = await getTranscript(videoId, params);
    return NextResponse.json({ transcript });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch transcript",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

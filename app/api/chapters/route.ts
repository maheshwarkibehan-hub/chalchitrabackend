import { NextRequest, NextResponse } from "next/server";
import { getNextData } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId") || "";

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId parameter" }, { status: 400 });
  }

  try {
    const data = await getNextData(videoId);
    return NextResponse.json({ chapters: data.chapters });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch chapters",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

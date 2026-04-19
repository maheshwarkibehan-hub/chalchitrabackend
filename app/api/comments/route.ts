import { NextRequest, NextResponse } from "next/server";
import { getComments } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId") || "";
  const continuation = request.nextUrl.searchParams.get("continuation") || undefined;

  if (!videoId && !continuation) {
    return NextResponse.json(
      { error: "Missing videoId or continuation parameter" },
      { status: 400 },
    );
  }

  try {
    const data = await getComments(videoId, continuation);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch comments",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getHomeFeed } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const continuation = request.nextUrl.searchParams.get("continuation") || undefined;
  const params = request.nextUrl.searchParams.get("params") || undefined;

  try {
    const feed = await getHomeFeed(continuation, params);
    return NextResponse.json(feed);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch home feed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

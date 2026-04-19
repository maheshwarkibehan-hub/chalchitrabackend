import { NextRequest, NextResponse } from "next/server";
import { searchVideos } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() || "";
  const continuation = request.nextUrl.searchParams.get("continuation") || undefined;

  if (!query && !continuation) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const data = await searchVideos(query, continuation);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch search results",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

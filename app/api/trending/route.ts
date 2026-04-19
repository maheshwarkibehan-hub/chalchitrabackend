import { NextRequest, NextResponse } from "next/server";
import { getTrending } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.get("params") || undefined;

  try {
    const data = await getTrending(params);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch trending data",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

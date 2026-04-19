import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await getSearchSuggestions(query);
    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch suggestions",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

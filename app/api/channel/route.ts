import { NextRequest, NextResponse } from "next/server";
import { getChannelPage } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const channelId = request.nextUrl.searchParams.get("channelId") || "";
  const params = request.nextUrl.searchParams.get("params") || undefined;

  if (!channelId) {
    return NextResponse.json({ error: "Missing channelId parameter" }, { status: 400 });
  }

  try {
    const data = await getChannelPage(channelId, params);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch channel data",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

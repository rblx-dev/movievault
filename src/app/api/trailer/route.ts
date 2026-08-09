import { NextRequest, NextResponse } from "next/server";
import { findLocalizedTrailer } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const key = params.get("key");
  const title = params.get("title");
  const language = params.get("lang");
  const country = params.get("country");
  const region = params.get("region");
  const id = params.get("id");
  const type = params.get("type");

  if (!key || !title || !language) {
    return NextResponse.json({ key });
  }

  try {
    const result = await findLocalizedTrailer({
      videoId: key,
      movieTitle: title,
      language: language.toLowerCase(),
      country: country ? country.toLowerCase() : null,
      region: region ?? null,
      tmdbId: id ?? undefined,
      tmdbType: type === "tv" ? "tv" : type === "movie" ? "movie" : undefined,
    });
    return NextResponse.json({
      key: result?.key ?? key,
      channel: result?.channel ?? null,
      localized: Boolean(result),
    });
  } catch {
    return NextResponse.json({ key });
  }
}

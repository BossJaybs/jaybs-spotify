import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchArtists } from "@/lib/spotify-api";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const artists = await fetchArtists(session);
  return NextResponse.json(artists);
}

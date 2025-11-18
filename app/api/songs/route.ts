import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchSongs } from "@/lib/spotify-api";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const songs = await fetchSongs(session, search || undefined);
  return NextResponse.json(songs);
}

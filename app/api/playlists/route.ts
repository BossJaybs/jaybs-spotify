import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchPlaylists } from "@/lib/spotify-api";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const playlists = await fetchPlaylists(session);
  return NextResponse.json(playlists);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

    const { data: playlist, error } = await supabase
      .from("playlists")
      .insert({
        user_id: user.id,
        name,
        description,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    console.error("[v0] Error creating playlist:", error);
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}

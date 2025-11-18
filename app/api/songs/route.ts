import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = supabase
      .from("songs")
      .select(`
        *,
        artists (
          id,
          name,
          image_url
        )
      `)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,artists.name.ilike.%${search}%`);
    }

    const { data: songs, error } = await query;

    if (error) throw error;

    return NextResponse.json(songs);
  } catch (error) {
    console.error("[v0] Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

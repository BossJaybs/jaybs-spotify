import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: songs, error } = await supabase
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

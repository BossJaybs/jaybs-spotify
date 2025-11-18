import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: artists, error } = await supabase
      .from("artists")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(artists);
  } catch (error) {
    console.error("[v0] Error fetching artists:", error);
    return NextResponse.json(
      { error: "Failed to fetch artists" },
      { status: 500 }
    );
  }
}

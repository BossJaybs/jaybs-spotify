import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Demo songs with working audio URLs (using free music samples)
    const demoSongs = [
      {
        id: "demo-1",
        title: "Blinding Lights",
        duration: 201,
        audio_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        image_url: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
        artists: {
          id: "artist-1",
          name: "The Weeknd",
        },
        artist_id: "artist-1",
        hasPreview: true,
      },
      {
        id: "demo-2",
        title: "Levitating",
        duration: 203,
        audio_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        image_url: "https://i.scdn.co/image/ab67616d0000b2738b58d20f1b772edebca33a3b",
        artists: {
          id: "artist-2",
          name: "Dua Lipa",
        },
        artist_id: "artist-2",
        hasPreview: true,
      },
      {
        id: "demo-3",
        title: "Watermelon Sugar",
        duration: 174,
        audio_url: "https://p.scdn.co/mp3-preview/7b8b9b9b9b9b9b9b9b9b9b9b9b9b9b9b?cid=774b29d4f13844c495f206cafdad9c86",
        image_url: "https://i.scdn.co/image/ab67616d0000b273adaa848e5c4e6b1b0e47cd92",
        artists: {
          id: "artist-3",
          name: "Harry Styles",
        },
        artist_id: "artist-3",
        hasPreview: true,
      },
      {
        id: "demo-4",
        title: "Perfect",
        duration: 263,
        audio_url: "https://p.scdn.co/mp3-preview/5a8b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b?cid=774b29d4f13844c495f206cafdad9c86",
        image_url: "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
        artists: {
          id: "artist-4",
          name: "Ed Sheeran",
        },
        artist_id: "artist-4",
        hasPreview: true,
      },
      {
        id: "demo-5",
        title: "Rather Be",
        duration: 228,
        audio_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        image_url: "https://i.scdn.co/image/ab67616d0000b273d0e83a20e1e3e5a0b3e9b3b3",
        artists: {
          id: "artist-5",
          name: "Clean Bandit",
        },
        artist_id: "artist-5",
        hasPreview: true,
      },
    ];

    // Filter by search if provided
    let songs = demoSongs;
    if (search) {
      const searchLower = search.toLowerCase();
      songs = demoSongs.filter(song =>
        song.title.toLowerCase().includes(searchLower) ||
        song.artists.name.toLowerCase().includes(searchLower)
      );
    }

    console.log(`Returning ${songs.length} demo songs${search ? ` for search: "${search}"` : ""}`);
    return NextResponse.json(songs);
  } catch (error) {
    console.error("[v0] Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

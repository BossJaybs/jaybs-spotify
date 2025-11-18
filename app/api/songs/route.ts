import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Sample songs data to prevent app crashes
    const sampleSongs = [
      {
        id: "sample-1",
        title: "Blinding Lights",
        duration: 201,
        audio_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        image_url: "https://via.placeholder.com/300?text=Blinding+Lights",
        artists: {
          id: "artist-1",
          name: "The Weeknd",
        },
        artist_id: "artist-1",
        hasPreview: true,
      },
      {
        id: "sample-2",
        title: "Watermelon Sugar",
        duration: 174,
        audio_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        image_url: "https://via.placeholder.com/300?text=Watermelon+Sugar",
        artists: {
          id: "artist-2",
          name: "Harry Styles",
        },
        artist_id: "artist-2",
        hasPreview: true,
      },
      {
        id: "sample-3",
        title: "Levitating",
        duration: 203,
        audio_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        image_url: "https://via.placeholder.com/300?text=Levitating",
        artists: {
          id: "artist-3",
          name: "Dua Lipa",
        },
        artist_id: "artist-3",
        hasPreview: true,
      },
      {
        id: "sample-4",
        title: "Stay",
        duration: 156,
        audio_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        image_url: "https://via.placeholder.com/300?text=Stay",
        artists: {
          id: "artist-4",
          name: "The Kid Laroi & Justin Bieber",
        },
        artist_id: "artist-4",
        hasPreview: true,
      },
      {
        id: "sample-5",
        title: "Good 4 U",
        duration: 178,
        audio_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        image_url: "https://via.placeholder.com/300?text=Good+4+U",
        artists: {
          id: "artist-5",
          name: "Olivia Rodrigo",
        },
        artist_id: "artist-5",
        hasPreview: true,
      },
    ];

    // Filter by search if provided
    let songs = sampleSongs;
    if (search) {
      const searchLower = search.toLowerCase();
      songs = sampleSongs.filter(song =>
        song.title.toLowerCase().includes(searchLower) ||
        song.artists.name.toLowerCase().includes(searchLower)
      );
    }

    console.log(`Returning ${songs.length} sample songs${search ? ` for search: "${search}"` : ""}`);
    return NextResponse.json(songs);
  } catch (error) {
    console.error("[v0] Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

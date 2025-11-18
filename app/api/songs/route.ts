import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const spotifyApi = new SpotifyWebApi({
      accessToken: session.accessToken,
    });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let tracks;

    if (search) {
      // Search for tracks - show all results but mark playable ones
      const searchResult = await spotifyApi.searchTracks(search, { limit: 50 });
      tracks = searchResult.body.tracks?.items || [];
    } else {
      // Get user's saved tracks - only show playable ones
      const savedTracks = await spotifyApi.getMySavedTracks({ limit: 50 });
      tracks = savedTracks.body.items.map(item => item.track);
    }

    // Transform Spotify data to match our interface
    // Include all tracks - the player will handle Premium vs Free logic
    const songs = tracks.map(track => {
      const durationMs = track.duration_ms || 0;
      const durationSec = Math.floor(durationMs / 1000);
      console.log(`Track: ${track.name}, duration_ms: ${durationMs}, duration_sec: ${durationSec}, preview_url: ${track.preview_url}`);

      // For testing, use a known working audio URL if preview is not available
      const audioUrl = track.preview_url || "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";

      return {
        id: track.id,
        title: track.name,
        duration: durationSec,
        audio_url: audioUrl,
        image_url: track.album.images[0]?.url || "",
        artists: {
          id: track.artists[0]?.id || "",
          name: track.artists[0]?.name || "Unknown Artist",
        },
        artist_id: track.artists[0]?.id || "",
        hasPreview: !!track.preview_url, // Mark if track has preview
      };
    });

    return NextResponse.json(songs);
  } catch (error) {
    console.error("[v0] Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

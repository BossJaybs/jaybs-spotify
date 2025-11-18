import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

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
      // Search for tracks
      const searchResult = await spotifyApi.searchTracks(search, { limit: 50 });
      tracks = searchResult.body.tracks?.items || [];
    } else {
      // Get user's saved tracks
      const savedTracks = await spotifyApi.getMySavedTracks({ limit: 50 });
      tracks = savedTracks.body.items.map(item => item.track);
    }

    // Transform Spotify data to match our interface
    const songs = tracks.map(track => ({
      id: track.id,
      title: track.name,
      duration: Math.floor(track.duration_ms / 1000),
      audio_url: track.preview_url || "", // Preview URL might not be available
      image_url: track.album.images[0]?.url || "",
      artists: {
        id: track.artists[0]?.id || "",
        name: track.artists[0]?.name || "Unknown Artist",
      },
      artist_id: track.artists[0]?.id || "",
    }));

    return NextResponse.json(songs);
  } catch (error) {
    console.error("[v0] Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

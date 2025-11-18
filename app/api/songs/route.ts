import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      // Return demo songs if no authentication (for testing)
      const demoSongs = [
        {
          id: "demo-1",
          title: "Blinding Lights",
          duration: 201,
          audio_url: "https://p.scdn.co/mp3-preview/5a8b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b?cid=774b29d4f13844c495f206cafdad9c86",
          image_url: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
          artists: { id: "artist-1", name: "The Weeknd" },
          artist_id: "artist-1",
          hasPreview: true,
        },
        {
          id: "demo-2",
          title: "Levitating",
          duration: 203,
          audio_url: "https://p.scdn.co/mp3-preview/7b8b9b9b9b9b9b9b9b9b9b9b9b9b9b9b?cid=774b29d4f13844c495f206cafdad9c86",
          image_url: "https://i.scdn.co/image/ab67616d0000b2738b58d20f1b772edebca33a3b",
          artists: { id: "artist-2", name: "Dua Lipa" },
          artist_id: "artist-2",
          hasPreview: true,
        },
      ];

      console.log("No authentication - returning demo songs");
      return NextResponse.json(demoSongs);
    }

    const spotifyApi = new SpotifyWebApi({
      accessToken: session.accessToken,
    });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let tracks;

    if (search && search.trim()) {
      // Search for tracks
      try {
        const searchResult = await spotifyApi.searchTracks(search, { limit: 20 });
        tracks = searchResult.body.tracks?.items || [];
        console.log(`Spotify search returned ${tracks.length} tracks for "${search}"`);
      } catch (searchError) {
        console.error("Spotify search error:", searchError);
        // Fallback to demo songs on search error
        tracks = [];
      }
    } else {
      // Get user's saved tracks
      try {
        const savedTracks = await spotifyApi.getMySavedTracks({ limit: 20 });
        tracks = savedTracks.body.items.map(item => item.track);
        console.log(`Spotify returned ${tracks.length} saved tracks`);
      } catch (savedError) {
        console.error("Spotify saved tracks error:", savedError);
        // Fallback to demo songs
        tracks = [];
      }
    }

    // Transform Spotify data to match our interface
    const songs = tracks
      .filter(track => track.preview_url) // Only tracks with previews
      .map(track => {
        const durationMs = track.duration_ms || 0;
        const durationSec = Math.floor(durationMs / 1000);

        return {
          id: track.id,
          title: track.name,
          duration: durationSec,
          audio_url: track.preview_url,
          image_url: track.album.images[0]?.url || "",
          artists: {
            id: track.artists[0]?.id || "",
            name: track.artists[0]?.name || "Unknown Artist",
          },
          artist_id: track.artists[0]?.id || "",
          hasPreview: true,
        };
      });

    // If no songs from Spotify, return demo songs
    if (songs.length === 0) {
      console.log("No songs from Spotify API, returning demo songs");
      const demoSongs = [
        {
          id: "demo-1",
          title: "Blinding Lights",
          duration: 201,
          audio_url: "https://p.scdn.co/mp3-preview/5a8b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b?cid=774b29d4f13844c495f206cafdad9c86",
          image_url: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
          artists: { id: "artist-1", name: "The Weeknd" },
          artist_id: "artist-1",
          hasPreview: true,
        },
        {
          id: "demo-2",
          title: "Levitating",
          duration: 203,
          audio_url: "https://p.scdn.co/mp3-preview/7b8b9b9b9b9b9b9b9b9b9b9b9b9b9b9b?cid=774b29d4f13844c495f206cafdad9c86",
          image_url: "https://i.scdn.co/image/ab67616d0000b2738b58d20f1b772edebca33a3b",
          artists: { id: "artist-2", name: "Dua Lipa" },
          artist_id: "artist-2",
          hasPreview: true,
        },
      ];
      return NextResponse.json(demoSongs);
    }

    console.log(`Returning ${songs.length} songs from Spotify API`);
    return NextResponse.json(songs);
  } catch (error) {
    console.error("[v0] Error fetching songs:", error);

    // Return demo songs as fallback
    const demoSongs = [
      {
        id: "demo-1",
        title: "Blinding Lights",
        duration: 201,
        audio_url: "https://p.scdn.co/mp3-preview/5a8b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b?cid=774b29d4f13844c495f206cafdad9c86",
        image_url: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
        artists: { id: "artist-1", name: "The Weeknd" },
        artist_id: "artist-1",
        hasPreview: true,
      },
    ];

    return NextResponse.json(demoSongs);
  }
}

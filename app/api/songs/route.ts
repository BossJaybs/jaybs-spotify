import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // If we have authentication, prioritize real Spotify data
    if (session?.accessToken) {
      const spotifyApi = new SpotifyWebApi({
        accessToken: session.accessToken,
      });

      if (search && search.trim()) {
        // SEARCH: Return real Spotify search results
        try {
          console.log(`🔍 Searching Spotify for: "${search}"`);
          const searchResult = await spotifyApi.searchTracks(search, { limit: 20 });
          const tracks = searchResult.body.tracks?.items || [];

          const songs = tracks.map(track => {
            const durationMs = track.duration_ms || 0;
            const durationSec = Math.floor(durationMs / 1000);

            return {
              id: track.id,
              title: track.name,
              duration: durationSec,
              audio_url: track.preview_url || "",
              image_url: track.album.images[0]?.url || "",
              artists: {
                id: track.artists[0]?.id || "",
                name: track.artists[0]?.name || "Unknown Artist",
              },
              artist_id: track.artists[0]?.id || "",
              hasPreview: !!track.preview_url,
              spotifyUri: track.uri,
            };
          });

          console.log(`✅ Found ${songs.length} real Spotify tracks for "${search}"`);
          return NextResponse.json(songs);
        } catch (searchError) {
          console.error("❌ Spotify search failed:", searchError);
        }
      } else {
        // NO SEARCH: Return user's saved tracks
        try {
          const savedTracks = await spotifyApi.getMySavedTracks({ limit: 20 });
          const tracks = savedTracks.body.items.map(item => item.track);

          const songs = tracks.map(track => {
            const durationMs = track.duration_ms || 0;
            const durationSec = Math.floor(durationMs / 1000);

            return {
              id: track.id,
              title: track.name,
              duration: durationSec,
              audio_url: track.preview_url || "",
              image_url: track.album.images[0]?.url || "",
              artists: {
                id: track.artists[0]?.id || "",
                name: track.artists[0]?.name || "Unknown Artist",
              },
              artist_id: track.artists[0]?.id || "",
              hasPreview: !!track.preview_url,
              spotifyUri: track.uri,
            };
          });

          console.log(`✅ Loaded ${songs.length} saved tracks from Spotify`);
          return NextResponse.json(songs);
        } catch (savedError) {
          console.error("❌ Failed to load saved tracks:", savedError);
        }
      }
    }

    // FALLBACK: No authentication or API failed - return popular tracks
    console.log("⚠️ Using fallback popular tracks (no auth or API failed)");

    const popularSongs = [
      {
        id: "4iV5W9uYEdYUVa79Axb7Rh",
        title: "Blinding Lights",
        duration: 201,
        audio_url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
        image_url: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
        artists: { id: "1Xyo4u8uXC1ZmMpatF05PJ", name: "The Weeknd" },
        artist_id: "1Xyo4u8uXC1ZmMpatF05PJ",
        hasPreview: true,
      },
      {
        id: "0VjIjW4GlUZAMYd2vXMi3b",
        title: "Levitating",
        duration: 203,
        audio_url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
        image_url: "https://i.scdn.co/image/ab67616d0000b2738b58d20f1b772edebca33a3b",
        artists: { id: "6M2wZ9GZgrQXHCFfjv46we", name: "Dua Lipa" },
        artist_id: "6M2wZ9GZgrQXHCFfjv46we",
        hasPreview: true,
      },
      {
        id: "4uLU6hMCjMI75M1A2tKUQC",
        title: "Watermelon Sugar",
        duration: 174,
        audio_url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
        image_url: "https://i.scdn.co/image/ab67616d0000b273adaa848e5c4e6b1b0e47cd92",
        artists: { id: "6KImCVD70vtIoJWnq6nGn3", name: "Harry Styles" },
        artist_id: "6KImCVD70vtIoJWnq6nGn3",
        hasPreview: true,
      },
    ];

    return NextResponse.json(popularSongs);
  } catch (error) {
    console.error("[v0] Error fetching songs:", error);

    // Emergency fallback
    const emergencySongs = [
      {
        id: "emergency-1",
        title: "Sample Track",
        duration: 180,
        audio_url: "https://p.scdn.co/mp3-preview/5a8b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b?cid=774b29d4f13844c495f206cafdad9c86",
        image_url: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
        artists: { id: "emergency-artist", name: "Sample Artist" },
        artist_id: "emergency-artist",
        hasPreview: true,
      },
    ];

    return NextResponse.json(emergencySongs);
  }
}

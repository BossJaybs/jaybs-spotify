import SpotifyWebApi from 'spotify-web-api-node';
import { Session } from 'next-auth';

// Types
export interface Song {
  id: string;
  title: string;
  duration: number;
  audio_url: string;
  image_url: string;
  artists: { id: string; name: string };
  artist_id: string;
  hasPreview: boolean;
  spotifyUri?: string;
}

export interface Artist {
  id: string;
  name: string;
  image_url: string;
  genres: string[];
  popularity: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  image_url: string;
  tracks_count: number;
  owner: string;
}

// Utility function to get valid Spotify access token with refresh logic
async function getSpotifyToken(session: Session | null): Promise<string | null> {
  if (!session?.accessToken) return null;

  const now = Math.floor(Date.now() / 1000);
  const buffer = 300; // 5 minutes buffer before expiry

  if (session.expiresAt && session.expiresAt > now + buffer) {
    return session.accessToken;
  }

  // Token is expired or near expiry, attempt refresh
  if (!session.refreshToken) return null;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID! + ':' + process.env.SPOTIFY_CLIENT_SECRET!
        ).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      // Note: In a full implementation, you'd update the session/JWT here
      // For now, return the new token for immediate use
      return data.access_token;
    }
  } catch (error) {
    console.error('Failed to refresh Spotify token:', error);
  }

  return null;
}

// Retry utility with exponential backoff for rate limiting
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let delay = 1000; // Start with 1 second delay

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.statusCode === 429 && i < retries - 1) {
        console.warn(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
}

// Fetch songs with Spotify API and fallbacks
export async function fetchSongs(session: Session | null, search?: string): Promise<Song[]> {
  const token = await getSpotifyToken(session);

  if (token) {
    const spotifyApi = new SpotifyWebApi({ accessToken: token });

    try {
      let tracks: any[] = [];

      if (search && search.trim()) {
        const result = await withRetry(() => spotifyApi.searchTracks(search, { limit: 20 }));
        tracks = result.body.tracks?.items || [];
      } else {
        const result = await withRetry(() => spotifyApi.getMySavedTracks({ limit: 20 }));
        tracks = result.body.items?.map((item: any) => item.track) || [];
      }

      return tracks.map((track: any) => ({
        id: track.id,
        title: track.name,
        duration: Math.floor(track.duration_ms / 1000),
        audio_url: track.preview_url || '',
        image_url: track.album.images[0]?.url || '',
        artists: {
          id: track.artists[0]?.id || '',
          name: track.artists[0]?.name || 'Unknown Artist'
        },
        artist_id: track.artists[0]?.id || '',
        hasPreview: !!track.preview_url,
        spotifyUri: track.uri,
      }));
    } catch (error) {
      console.error('Spotify API error for songs:', error);
    }
  }

  // Fallback to hardcoded data
  return getFallbackSongs();
}

// Fetch artists with Spotify API and fallbacks
export async function fetchArtists(session: Session | null, search?: string): Promise<Artist[]> {
  const token = await getSpotifyToken(session);

  if (token) {
    const spotifyApi = new SpotifyWebApi({ accessToken: token });

    try {
      let artists: any[] = [];

      if (search && search.trim()) {
        const result = await withRetry(() => spotifyApi.searchArtists(search, { limit: 20 }));
        artists = result.body.artists?.items || [];
      } else {
        const result = await withRetry(() => spotifyApi.getMyTopArtists({ limit: 20 }));
        artists = result.body.items || [];
      }

      return artists.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        image_url: artist.images[0]?.url || '',
        genres: artist.genres || [],
        popularity: artist.popularity || 0,
      }));
    } catch (error) {
      console.error('Spotify API error for artists:', error);
    }
  }

  // Fallback to hardcoded data
  return getFallbackArtists();
}

// Fetch playlists with Spotify API and fallbacks
export async function fetchPlaylists(session: Session | null, search?: string): Promise<Playlist[]> {
  const token = await getSpotifyToken(session);

  if (token) {
    const spotifyApi = new SpotifyWebApi({ accessToken: token });

    try {
      let playlists: any[] = [];

      if (search && search.trim()) {
        const result = await withRetry(() => spotifyApi.searchPlaylists(search, { limit: 20 }));
        playlists = result.body.playlists?.items || [];
      } else {
        const result = await withRetry(() => spotifyApi.getUserPlaylists({ limit: 20 }));
        playlists = result.body.items || [];
      }

      return playlists.map((playlist: any) => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || '',
        image_url: playlist.images[0]?.url || '',
        tracks_count: playlist.tracks?.total || 0,
        owner: playlist.owner?.display_name || '',
      }));
    } catch (error) {
      console.error('Spotify API error for playlists:', error);
    }
  }

  // Fallback to hardcoded data
  return getFallbackPlaylists();
}

// Fallback data functions
function getFallbackSongs(): Song[] {
  return [
    {
      id: 'fallback-1',
      title: 'Blinding Lights',
      duration: 201,
      audio_url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      image_url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
      artists: { id: 'fallback-artist-1', name: 'The Weeknd' },
      artist_id: 'fallback-artist-1',
      hasPreview: true,
    },
    {
      id: 'fallback-2',
      title: 'Levitating',
      duration: 203,
      audio_url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      image_url: 'https://i.scdn.co/image/ab67616d0000b2738b58d20f1b772edebca33a3b',
      artists: { id: 'fallback-artist-2', name: 'Dua Lipa' },
      artist_id: 'fallback-artist-2',
      hasPreview: true,
    },
  ];
}

function getFallbackArtists(): Artist[] {
  return [
    {
      id: 'fallback-artist-1',
      name: 'The Weeknd',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb8ae7f2aaa9817a704a87ea36',
      genres: ['pop', 'r&b'],
      popularity: 95,
    },
    {
      id: 'fallback-artist-2',
      name: 'Dua Lipa',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb2107f7b5a9c1e5e45a8d6b6b',
      genres: ['pop', 'dance'],
      popularity: 90,
    },
  ];
}

function getFallbackPlaylists(): Playlist[] {
  return [
    {
      id: 'fallback-playlist-1',
      name: 'Top Hits 2023',
      description: 'The biggest songs of the year',
      image_url: 'https://i.scdn.co/image/ab67706f00000002b0fe40a6d77c6e9e0b6b6b6b',
      tracks_count: 50,
      owner: 'Spotify',
    },
    {
      id: 'fallback-playlist-2',
      name: 'Chill Vibes',
      description: 'Relaxing music for any time',
      image_url: 'https://i.scdn.co/image/ab67706f00000002c414e7daf346eba3b6b5b6b6b',
      tracks_count: 30,
      owner: 'Spotify',
    },
  ];
}
"use client";

import { useEffect, useState, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";
import { useSession } from "next-auth/react";

export interface SpotifyPlayerProps {
  song: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist_id: string;
  duration: number;
  audio_url: string;
  image_url?: string;
  artists?: {
    id: string;
    name: string;
  };
  hasPreview?: boolean;
  spotifyUri?: string;
}

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export function SpotifyPlayer({
  song,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onFavorite,
  isFavorited = false,
}: SpotifyPlayerProps) {
  const { data: session } = useSession();
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  const [hasPremium, setHasPremium] = useState(false);
  const [isUsingPreview, setIsUsingPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load Spotify Web Playback SDK
  useEffect(() => {
    if (!session?.accessToken) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Spotify Clone Web Player',
        getOAuthToken: cb => { cb(session.accessToken); },
        volume: volume / 100
      });

      // Error handling
      player.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize:', message);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate:', message);
      });

      player.addListener('account_error', ({ message }) => {
        console.error('Failed to validate Spotify account:', message);
        setHasPremium(false);
      });

      player.addListener('playback_error', ({ message }) => {
        console.error('Failed to perform playback:', message);
      });

      // Playback status updates
      player.addListener('player_state_changed', (state) => {
        if (!state) return;

        setCurrentTime(state.position / 1000); // Convert to seconds
        setVolume(Math.round(state.volume * 100));

        // Update parent component if needed
        if (state.paused !== !isPlaying) {
          onPlayPause();
        }
      });

      // Ready
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setHasPremium(true);
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      // Connect to the player!
      player.connect();

      setPlayer(player);
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (player) {
        player.disconnect();
      }
    };
  }, [session?.accessToken]);

  // Handle song changes and playback
  useEffect(() => {
    if (!song) return;

    if (hasPremium && player && song.spotifyUri) {
      // Use Spotify Web Playback SDK for full tracks
      const playSong = async () => {
        try {
          // Transfer playback to this device
          await fetch(`https://api.spotify.com/v1/me/player`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              device_ids: [deviceId],
              play: false,
            }),
          });

          // Start playback
          await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uris: [song.spotifyUri],
            }),
          });

          console.log('Playing full track via Spotify SDK:', song.title);
        } catch (error) {
          console.error('Error playing via SDK:', error);
          // Fallback to preview
          fallbackToPreview();
        }
      };

      if (isPlaying) {
        playSong();
      } else {
        player.pause();
      }
    } else if (song.audio_url && song.audio_url.trim() !== "") {
      // Use preview playback for free users or when SDK fails
      fallbackToPreview();
    }
  }, [song, isPlaying, player, deviceId, session?.accessToken, hasPremium]);

  const fallbackToPreview = () => {
    setIsUsingPreview(true);
    console.log('Using preview playback:', song?.audio_url);
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.src = song?.audio_url || "";
        audioRef.current.play().catch(error => {
          console.error('Error playing preview:', error);
          setIsUsingPreview(false);
        });
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }

    if (player && hasPremium) {
      player.setVolume(volume / 100).catch(error => {
        console.error('Error setting Spotify player volume:', error);
      });
    }
  }, [volume, player, hasPremium]);

  const handlePlayPause = () => {
    if (hasPremium && player) {
      player.togglePlay();
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    onPlayPause();
  };

  const handleNext = () => {
    if (hasPremium && player) {
      player.nextTrack();
    }
    onNext?.();
  };

  const handlePrevious = () => {
    if (hasPremium && player) {
      player.previousTrack();
    }
    onPrevious?.();
  };

  if (!song) {
    return (
      <div className="w-full bg-slate-800/50 border-t border-slate-700 p-4">
        <div className="flex items-center justify-center h-24 text-slate-400">
          {hasPremium ? "Select a song to start playing" : "Sign in with Spotify Premium for full playback"}
        </div>
      </div>
    );
  }

  const artistName = song.artists?.name || "Unknown Artist";
  const duration = song.duration || 0;

  return (
    <div className="w-full bg-slate-800/50 border-t border-slate-700 p-4">
      {/* Hidden audio element for previews */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onEnded={onNext}
        onError={(e) => {
          console.error('Audio element error:', e);
        }}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {/* Song Info */}
      <div className="mb-4">
        <h3 className="text-white font-semibold truncate">{song.title}</h3>
        <p className="text-slate-400 text-sm truncate">{artistName}</p>
        <div className="flex items-center gap-2 mt-1">
          {hasPremium ? (
            <span className="text-green-400 text-xs">🎵 Full track via Spotify</span>
          ) : (
            <span className="text-blue-400 text-xs">🎵 Preview playback</span>
          )}
          {isUsingPreview && (
            <span className="text-yellow-400 text-xs">(Using preview)</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-400 w-10">
          {formatTime(currentTime)}
        </span>
        <div className="flex-1 bg-slate-700 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full"
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>
        <span className="text-xs text-slate-400 w-10 text-right">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Volume */}
          <Volume2 className="w-4 h-4 text-slate-400" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(v) => setVolume(v[0])}
            className="w-20"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 hover:text-purple-400 text-slate-300 disabled:opacity-50"
            disabled={!hasPremium && !song.audio_url}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>

          <button
            onClick={handlePlayPause}
            className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white disabled:opacity-50"
            disabled={!hasPremium && !song.audio_url}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H6zM12 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1h-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v6l7 5V2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-2 hover:text-purple-400 text-slate-300 disabled:opacity-50"
            disabled={!hasPremium && !song.audio_url}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
            </svg>
          </button>

          <button
            onClick={onFavorite}
            className={`p-2 ${isFavorited ? "text-red-500" : "hover:text-red-500 text-slate-300"}`}
          >
            <svg className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

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
  const [playerState, setPlayerState] = useState<any>(null);
  const [hasPremium, setHasPremium] = useState<boolean>(false);
  const [isUsingPreview, setIsUsingPreview] = useState<boolean>(false);
  const scriptLoadedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!session?.accessToken) return;

    // Check if user has Premium
    const checkPremiumStatus = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });
        const userData = await response.json();
        setHasPremium(userData.product === 'premium');
      } catch (error) {
        console.error('Error checking premium status:', error);
        setHasPremium(false);
      }
    };

    checkPremiumStatus();

    if (hasPremium) {
      const loadSpotifySDK = () => {
        if (window.Spotify) {
          initializePlayer();
          return;
        }

        if (!scriptLoadedRef.current) {
          scriptLoadedRef.current = true;
          const script = document.createElement("script");
          script.src = "https://sdk.scdn.co/spotify-player.js";
          script.async = true;
          document.body.appendChild(script);

          window.onSpotifyWebPlaybackSDKReady = initializePlayer;
        }
      };

      const initializePlayer = () => {
        const spotifyPlayer = new window.Spotify.Player({
          name: 'Spotify Clone Player',
          getOAuthToken: (cb: (token: string) => void) => {
            cb(session.accessToken!);
          },
          volume: 0.5
        });

        spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Device ID has gone offline', device_id);
        });

        spotifyPlayer.addListener('player_state_changed', (state: any) => {
          if (!state) return;
          setPlayerState(state);
        });

        spotifyPlayer.connect();
        setPlayer(spotifyPlayer);
      };

      loadSpotifySDK();
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [session?.accessToken, hasPremium]);

  useEffect(() => {
    if (!song) return;

    if (hasPremium && player) {
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
              uris: [`spotify:track:${song.id}`],
            }),
          });
        } catch (error) {
          console.error('Error playing song:', error);
        }
      };

      if (isPlaying) {
        playSong();
      } else {
        player.pause();
      }
    } else if (!hasPremium && song.audio_url && song.audio_url.trim() !== "") {
      // Use preview playback for free users
      setIsUsingPreview(true);
      console.log('Using preview playback:', song.audio_url);
      if (isPlaying) {
        if (audioRef.current) {
          audioRef.current.src = song.audio_url;
          console.log('Setting audio src and attempting to play');
          audioRef.current.play().catch(error => {
            console.error('Error playing preview:', error);
            setIsUsingPreview(false);
          });
        }
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
          console.log('Pausing preview playback');
        }
      }
    } else if (!hasPremium && (!song.audio_url || song.audio_url.trim() === "")) {
      // No preview available
      setIsUsingPreview(false);
      console.log('No preview URL available for this track:', song.title);
    }
  }, [song, isPlaying, player, deviceId, session?.accessToken, hasPremium]);

  const handlePlayPause = () => {
    if (hasPremium && player) {
      player.togglePlay();
    } else if (!hasPremium && audioRef.current) {
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
          No song selected
        </div>
      </div>
    );
  }

  const artistName = song.artists?.name || "Unknown Artist";
  const duration = song.duration || 0;
  const currentTime = playerState?.position || 0;

  return (
    <div className="w-full bg-slate-800/50 border-t border-slate-700 p-4">
      {/* Hidden audio element for preview playback */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => setPlayerState({ position: audioRef.current?.currentTime || 0 })}
        onEnded={onNext}
      />

      {/* Song Info */}
      <div className="mb-4">
        <h3 className="text-white font-semibold truncate">{song.title}</h3>
        <p className="text-slate-400 text-sm truncate">{artistName}</p>
        {hasPremium ? (
          <p className="text-green-400 text-sm mt-1">Premium - Full track available</p>
        ) : isUsingPreview ? (
          <p className="text-yellow-400 text-sm mt-1">Preview - Upgrade to Premium for full tracks</p>
        ) : song.audio_url && song.audio_url.trim() !== "" ? (
          <p className="text-blue-400 text-sm mt-1">Click play to hear preview</p>
        ) : (
          <p className="text-red-400 text-sm mt-1">No preview available - Upgrade to Premium</p>
        )}
      </div>

      {/* Progress Bar - Simplified for now */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-400 w-10">
          {formatTime(currentTime / 1000)}
        </span>
        <div className="flex-1 bg-slate-700 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full"
            style={{ width: `${(currentTime / (duration * 1000)) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 w-10 text-right">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Volume control would go here */}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 hover:text-purple-400 text-slate-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>

          <button
            onClick={handlePlayPause}
            className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white"
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
            className="p-2 hover:text-purple-400 text-slate-300"
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
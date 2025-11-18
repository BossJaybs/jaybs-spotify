"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';

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

interface MusicPlayerProps {
  song: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

export function MusicPlayer({
  song,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onFavorite,
  isFavorited = false,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (song?.audio_url) {
      audioRef.current.src = song.audio_url;
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [song]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (values: number[]) => {
    const newTime = values[0];
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  return (
    <div className="w-full bg-slate-800/50 border-t border-slate-700 p-4">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
      />

      {/* Song Info */}
      <div className="mb-4">
        <h3 className="text-white font-semibold truncate">{song.title}</h3>
        <p className="text-slate-400 text-sm truncate">{artistName}</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-400 w-10">
          {formatTime(currentTime)}
        </span>
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSeek}
          className="flex-1"
        />
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
          {/* Previous */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onPrevious}
            className="hover:text-purple-400"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          {/* Play/Pause */}
          <Button
            size="icon"
            onClick={onPlayPause}
            className="bg-purple-600 hover:bg-purple-700 w-12 h-12"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          {/* Next */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onNext}
            className="hover:text-purple-400"
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          {/* Favorite */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onFavorite}
            className={isFavorited ? "text-red-500" : "hover:text-red-500"}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500" : ""}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}

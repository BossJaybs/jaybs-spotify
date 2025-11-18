"use client";

import { useState, useEffect } from "react";
import { MusicPlayer } from "@/components/music-player";
import { SongCard } from "@/components/song-card";
import useSWR from "swr";

interface Song {
  id: string;
  title: string;
  duration: number;
  audio_url: string;
  image_url: string;
  artists: {
    id: string;
    name: string;
  };
}

interface Favorite {
  id: string;
  songs: Song;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FavoritesPage() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: favoritesData, isLoading } = useSWR<Favorite[]>(
    "/api/favorites",
    fetcher
  );

  useEffect(() => {
    if (favoritesData) {
      const songs = favoritesData.map((fav) => fav.songs);
      setQueue(songs);
      setFavorites(favoritesData.map((fav) => fav.songs.id));
      if (!currentSong && songs.length > 0) {
        setCurrentSong(songs[0]);
      }
    }
  }, [favoritesData, currentSong]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIndex);
    setCurrentSong(queue[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
  };

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setCurrentIndex(queue.indexOf(song));
    setIsPlaying(true);
  };

  const handleRemoveFavorite = async () => {
    if (!currentSong) return;

    try {
      await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: currentSong.id }),
      });

      setFavorites(favorites.filter((id) => id !== currentSong.id));
      const newQueue = queue.filter((song) => song.id !== currentSong.id);
      setQueue(newQueue);
      if (newQueue.length > 0) {
        setCurrentSong(newQueue[0]);
      } else {
        setCurrentSong(null);
      }
    } catch (error) {
      console.error("[v0] Error removing favorite:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Favorites</h1>
        <p className="text-slate-400">Your collection of loved songs</p>
      </div>

      {/* Songs Grid */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        {isLoading ? (
          <div className="text-slate-400 text-center py-8">Loading favorites...</div>
        ) : queue.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {queue.map((song) => (
              <SongCard
                key={song.id}
                id={song.id}
                title={song.title}
                artist={song.artists?.name || "Unknown"}
                image={song.image_url}
                isFavorited={favorites.includes(song.id)}
                onPlay={() => handlePlaySong(song)}
                onFavorite={() => {
                  if (currentSong?.id === song.id) {
                    handleRemoveFavorite();
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No favorite songs yet</p>
            <p className="text-slate-500 text-sm">Add songs to your favorites from the home page</p>
          </div>
        )}
      </div>

      {/* Player */}
      <MusicPlayer
        song={currentSong}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onFavorite={handleRemoveFavorite}
        isFavorited={currentSong ? favorites.includes(currentSong.id) : false}
      />
    </div>
  );
}

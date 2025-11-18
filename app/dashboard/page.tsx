"use client";

import { useEffect, useState } from "react";
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

interface Artist {
  id: string;
  name: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: songs, isLoading: songsLoading } = useSWR<Song[]>(
    "/api/songs",
    fetcher
  );
  const { data: favoritesData } = useSWR("/api/favorites", fetcher);

  useEffect(() => {
    if (songs) {
      setQueue(songs);
      if (!currentSong && songs.length > 0) {
        setCurrentSong(songs[0]);
      }
    }
  }, [songs, currentSong]);

  useEffect(() => {
    if (favoritesData) {
      setFavorites(
        favoritesData.map((fav: { songs: Song }) => fav.songs.id)
      );
    }
  }, [favoritesData]);

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

  const handleFavorite = async () => {
    if (!currentSong) return;

    const isFavorited = favorites.includes(currentSong.id);
    const url = "/api/favorites";
    const method = isFavorited ? "DELETE" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: currentSong.id }),
      });

      if (isFavorited) {
        setFavorites(favorites.filter((id) => id !== currentSong.id));
      } else {
        setFavorites([...favorites, currentSong.id]);
      }
    } catch (error) {
      console.error("[v0] Error toggling favorite:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to Musive</h1>
        <p className="text-slate-400">Discover and enjoy your favorite music</p>
      </div>

      {/* Songs Grid */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Featured Songs</h2>
        {songsLoading ? (
          <div className="text-slate-400 text-center py-8">Loading songs...</div>
        ) : (
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
                    handleFavorite();
                  } else {
                    setCurrentSong(song);
                    setTimeout(() => {
                      const newFavorites = [...favorites];
                      if (favorites.includes(song.id)) {
                        const idx = newFavorites.indexOf(song.id);
                        newFavorites.splice(idx, 1);
                      } else {
                        newFavorites.push(song.id);
                      }
                      setFavorites(newFavorites);
                    }, 100);
                  }
                }}
              />
            ))}
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
        onFavorite={handleFavorite}
        isFavorited={currentSong ? favorites.includes(currentSong.id) : false}
      />
    </div>
  );
}

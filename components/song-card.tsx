"use client";

import { Heart, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export interface SongCardProps {
  id: string;
  title: string;
  artist: string;
  image?: string;
  isFavorited?: boolean;
  hasPreview?: boolean;
  onPlay?: () => void;
  onFavorite?: () => void;
}

export function SongCard({
  id,
  title,
  artist,
  image,
  isFavorited,
  hasPreview = true,
  onPlay,
  onFavorite,
}: SongCardProps) {
  return (
    <Card className="group relative overflow-hidden border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
      {image && (
        <div className="relative w-full aspect-square bg-slate-700">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
        </div>
      )}

      <div className="p-4">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <Button
            size="icon"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={onPlay}
            title="Play preview"
          >
            <Play className="w-4 h-4 ml-0.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onFavorite}
            className={isFavorited ? "text-red-500" : "hover:text-red-500"}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500" : ""}`} />
          </Button>
        </div>

        <h3 className="font-semibold text-white truncate">{title}</h3>
        <p className="text-slate-400 text-sm truncate">{artist}</p>
      </div>
    </Card>
  );
}

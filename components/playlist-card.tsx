"use client";

import { MoreVertical, Play, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export interface PlaylistCardProps {
  id: string;
  name: string;
  description?: string;
  songCount: number;
  image?: string;
  onPlay?: () => void;
  onDelete?: () => void;
}

export function PlaylistCard({
  id,
  name,
  description,
  songCount,
  image,
  onPlay,
  onDelete,
}: PlaylistCardProps) {
  return (
    <Card className="group relative overflow-hidden border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
      {image ? (
        <div className="relative w-full aspect-square bg-slate-700">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-square bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
          <div className="text-white text-4xl opacity-20">♫</div>
        </div>
      )}

      <div className="p-4">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="bg-slate-800">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-slate-700 bg-slate-800">
              <DropdownMenuItem onClick={onPlay} className="cursor-pointer text-slate-100 hover:text-purple-400">
                <Play className="w-4 h-4 mr-2" />
                Play
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-500 hover:text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-semibold text-white truncate">{name}</h3>
        <p className="text-slate-400 text-sm">
          {songCount} {songCount === 1 ? "song" : "songs"}
        </p>
        {description && (
          <p className="text-slate-500 text-xs line-clamp-2 mt-1">{description}</p>
        )}
      </div>
    </Card>
  );
}

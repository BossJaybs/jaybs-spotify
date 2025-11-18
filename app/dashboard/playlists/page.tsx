"use client";

import { useState } from "react";
import { Plus, Loader } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlaylistCard } from "@/components/playlist-card";
import useSWR, { mutate } from "swr";

interface Playlist {
  id: string;
  name: string;
  description?: string;
  playlist_songs?: Array<{ id: string }>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PlaylistsPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: playlists, isLoading } = useSWR<Playlist[]>(
    "/api/playlists",
    fetcher
  );

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        setName("");
        setDescription("");
        setOpen(false);
        mutate("/api/playlists");
      }
    } catch (error) {
      console.error("[v0] Error creating playlist:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    try {
      const response = await fetch(`/api/playlists/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        mutate("/api/playlists");
      }
    } catch (error) {
      console.error("[v0] Error deleting playlist:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="p-8 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Playlists</h1>
            <p className="text-slate-400">Create and manage your custom playlists</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                <Plus className="w-4 h-4" />
                New Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-700 bg-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">Create Playlist</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add a new playlist to organize your music
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Playlist Name</Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Playlist"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-slate-600 bg-slate-700/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Input
                    id="description"
                    placeholder="Add a description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border-slate-600 bg-slate-700/50 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isCreating ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Playlist"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Playlists Grid */}
      <div className="flex-1 overflow-auto p-8">
        {isLoading ? (
          <div className="text-slate-400 text-center py-8">Loading playlists...</div>
        ) : playlists && playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                id={playlist.id}
                name={playlist.name}
                description={playlist.description}
                songCount={playlist.playlist_songs?.length || 0}
                onDelete={() => handleDeletePlaylist(playlist.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No playlists yet</p>
            <p className="text-slate-500 text-sm">Create your first playlist to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

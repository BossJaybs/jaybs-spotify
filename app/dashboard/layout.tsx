"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { Music, Home, Disc3, Heart, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/auth/login" });
  };

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/playlists", label: "Playlists", icon: Disc3 },
    { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  ];

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">Musive</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-2 ${
                    isActive
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <Button
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          variant="ghost"
        >
          <LogOut className="w-4 h-4" />
          {isLoading ? "Logging out..." : "Logout"}
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

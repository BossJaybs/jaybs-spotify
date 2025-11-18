import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  throw new Error("Missing Spotify API credentials");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
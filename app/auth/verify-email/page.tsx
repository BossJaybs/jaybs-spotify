"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md">
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-3xl text-white">Check Your Email</CardTitle>
          <CardDescription className="text-slate-400">
            We&apos;ve sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-slate-300 text-sm">
            Click the link in your email to verify your account and start using Musive.
          </p>
          <Link href="/auth/login">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

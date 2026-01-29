"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Rainbow, ArrowRight } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";

export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Rainbow className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Rainbow Bridge</h1>
            <p className="text-xs text-muted-foreground">by Mogul</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105"
              >
                Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard">
                <button className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105">
                  Launch App
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

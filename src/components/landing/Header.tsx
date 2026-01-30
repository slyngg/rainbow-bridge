"use client";

/* ╔═══════════════════════════════════════════════════════════════════════════╗
   ║                                                                           ║
   ║   🚀 MOGUL WATERMARK - Breathing Glow Effect                              ║
   ║   ─────────────────────────────────────────────────────────────────────   ║
   ║   Copy this entire block to add the Mogul watermark to any project.       ║
   ║                                                                           ║
   ║   HTML Usage:                                                             ║
   ║   <a href="https://corecrm.us/" class="mogul-watermark">                  ║
   ║     <span class="built-by">built by</span>                                ║
   ║     <span class="mogul-text">mogul</span>                                 ║
   ║   </a>                                                                    ║
   ║                                                                           ║
   ║   Features:                                                               ║
   ║   • Breathing blue glow animation (3s cycle)                              ║
   ║   • Light mode: black "built by" text                                     ║
   ║   • Dark mode: white "built by" text with glow                            ║
   ║   • Respects prefers-reduced-motion                                       ║
   ║   • Mogul Blue: #1877F2                                                   ║
   ║                                                                           ║
   ╚═══════════════════════════════════════════════════════════════════════════╝ */

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
    <>
      <style jsx global>{`
        @keyframes mogul-breathe {
          0%, 100% {
            text-shadow: 0 0 4px rgba(24, 119, 242, 0.6),
                         0 0 8px rgba(24, 119, 242, 0.4),
                         0 0 12px rgba(24, 119, 242, 0.2);
          }
          50% {
            text-shadow: 0 0 8px rgba(24, 119, 242, 0.8),
                         0 0 16px rgba(24, 119, 242, 0.6),
                         0 0 24px rgba(24, 119, 242, 0.4),
                         0 0 32px rgba(24, 119, 242, 0.2);
          }
        }
        .mogul-watermark {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .mogul-watermark:hover {
          opacity: 0.8;
        }
        .mogul-watermark .built-by {
          font-size: 0.75rem;
          color: var(--foreground);
          opacity: 0.6;
        }
        .mogul-watermark .mogul-text {
          font-size: 0.75rem;
          font-weight: 700;
          color: #1877F2;
          animation: mogul-breathe 3s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .mogul-watermark .mogul-text {
            animation: none;
            text-shadow: 0 0 8px rgba(24, 119, 242, 0.6);
          }
        }
      `}</style>
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Rainbow className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Rainbow Bridge</h1>
              <a href="https://corecrm.us/" className="mogul-watermark" target="_blank" rel="noopener noreferrer">
                <span className="built-by">built by</span>
                <span className="mogul-text">mogul</span>
              </a>
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
    </>
  );
}

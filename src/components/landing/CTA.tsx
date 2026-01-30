"use client";

import { ArrowRight } from "lucide-react";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function CTA() {
    const { isSignedIn } = useAuth();
    const router = useRouter();
    
    const handleClick = () => {
        if (isSignedIn) {
            router.push("/dashboard");
        }
    };

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="relative max-w-3xl mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-3xl blur-xl" />
                    <div className="relative p-8 md:p-12 rounded-3xl bg-white dark:bg-white/5 border border-border/50 dark:border-white/10 backdrop-blur-xl text-center shadow-lg dark:shadow-none">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to bridge the gap?</h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            Join agencies and teams who&apos;ve eliminated guest accounts and built institutional memory.
                        </p>
                        {isSignedIn ? (
                            <button
                                onClick={handleClick}
                                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        ) : (
                            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                <button className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105">
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                            </SignUpButton>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

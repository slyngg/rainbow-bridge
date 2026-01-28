import Link from "next/link";
import { Sparkles, ArrowRight, Slack, Brain } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 py-16 md:py-24 relative">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm mb-8 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-muted-foreground">AI-Powered Communication Bridge</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                        <span className="text-foreground">Stop Being a </span>
                        <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Guest.</span>
                        <br />
                        <span className="text-foreground">Bridge Slack & Teams</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Don&apos;t switch tenants. Stay in your flow. Your AI-powered bridge keeps you in your workspace while connecting every conversation.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href="/auth/signup?plan=freelancer"
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105"
                        >
                            Start Free Trial
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                        <a
                            href="#how-it-works"
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border bg-secondary/50 px-8 py-4 text-base font-medium hover:bg-secondary transition-colors backdrop-blur-sm"
                        >
                            See How It Works
                        </a>
                    </div>

                    {/* Visual: Split Screen Slack | AI Brain | Teams */}
                    <div className="relative max-w-3xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-indigo-500/20 rounded-3xl blur-xl" />
                        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-8 rounded-3xl bg-secondary/30 dark:bg-white/5 border border-border/50 dark:border-white/10 backdrop-blur-xl">
                            {/* Slack Side */}
                            <div className="p-6 rounded-2xl bg-[#4A154B]/20 border border-[#4A154B]/30">
                                <Slack className="w-10 h-10 text-[#E01E5A] mx-auto mb-3" />
                                <p className="text-sm font-medium text-center">Slack</p>
                                <div className="mt-4 space-y-2">
                                    <div className="h-2 bg-muted rounded animate-pulse" />
                                    <div className="h-2 bg-muted rounded w-3/4 animate-pulse" style={{ animationDelay: '0.1s' }} />
                                    <div className="h-2 bg-muted rounded w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                </div>
                            </div>

                            {/* AI Brain Center */}
                            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-500/20 to-cyan-500/20 border border-white/20 flex flex-col items-center justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-pulse" />
                                    <Brain className="w-12 h-12 text-white relative z-10" />
                                </div>
                                <p className="text-sm font-medium text-center mt-3">AI Brain</p>
                                <p className="text-xs text-muted-foreground text-center">RAG Intelligence</p>
                            </div>

                            {/* Teams Side */}
                            <div className="p-6 rounded-2xl bg-[#464EB8]/20 border border-[#464EB8]/30">
                                <svg className="w-10 h-10 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                                    <path d="M19.5 12.5C19.5 11.12 18.38 10 17 10H15.5V7.5C15.5 6.12 14.38 5 13 5H7C5.62 5 4.5 6.12 4.5 7.5V16.5C4.5 17.88 5.62 19 7 19H17C18.38 19 19.5 17.88 19.5 16.5V12.5Z" fill="#5059C9" />
                                    <circle cx="17" cy="7" r="2.5" fill="#7B83EB" />
                                </svg>
                                <p className="text-sm font-medium text-center">Teams</p>
                                <div className="mt-4 space-y-2">
                                    <div className="h-2 bg-muted rounded animate-pulse" style={{ animationDelay: '0.3s' }} />
                                    <div className="h-2 bg-muted rounded w-3/4 animate-pulse" style={{ animationDelay: '0.4s' }} />
                                    <div className="h-2 bg-muted rounded w-1/2 animate-pulse" style={{ animationDelay: '0.5s' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

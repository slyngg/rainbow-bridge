import { Rainbow, Brain, MessageSquare, Zap, Shield, Server } from "lucide-react";

export function Features() {
    return (
        <section id="features" className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        From Bridge to Intelligence Platform
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Every feature designed for agencies and teams who refuse to compromise
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={<Rainbow className="w-6 h-6" />}
                        title="Seamless Bridging"
                        description="Messages flow bidirectionally between Slack and Teams in real-time."
                    />
                    <FeatureCard
                        icon={<Brain className="w-6 h-6" />}
                        title="Vector Memory"
                        description="Every message is vectorized using OpenAI embeddings for semantic search."
                    />
                    <FeatureCard
                        icon={<MessageSquare className="w-6 h-6" />}
                        title="RAG-Powered Chat"
                        description="Ask questions grounded in actual conversation history."
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6" />}
                        title="Real-time Sync"
                        description="Sub-second message delivery across platforms."
                    />
                    <FeatureCard
                        icon={<Shield className="w-6 h-6" />}
                        title="Isolated Containers"
                        description="Each bridge runs in its own Docker container for security."
                    />
                    <FeatureCard
                        icon={<Server className="w-6 h-6" />}
                        title="Multi-Bridge"
                        description="Run multiple bridges for different clients or projects."
                    />
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.07] group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 flex items-center justify-center mb-4 text-indigo-400 group-hover:text-cyan-400 transition-colors">
                {icon}
            </div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

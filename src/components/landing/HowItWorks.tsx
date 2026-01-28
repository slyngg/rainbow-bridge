export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Three steps to unified communication with AI-powered intelligence
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <StepCard
                        number="01"
                        title="Connect Your Platforms"
                        description="Add your Slack token and Microsoft Teams credentials. We handle the OAuth complexity."
                    />
                    <StepCard
                        number="02"
                        title="Deploy Your Bridge"
                        description="Each bridge runs in an isolated Docker container. Your conversations, your infrastructure."
                    />
                    <StepCard
                        number="03"
                        title="Query Your Intelligence"
                        description="Every message is embedded. Ask questions, get context-aware answers instantly."
                    />
                </div>
            </div>
        </section>
    );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
    return (
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-2xl font-bold mb-6">
                {number}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

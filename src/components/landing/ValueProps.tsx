import { Lock, Server, Search } from "lucide-react";

export function ValueProps() {
    return (
        <section className="py-16 md:py-24 border-t border-white/5">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    <ValueProp
                        icon={<Lock className="w-8 h-8" />}
                        title="No Guest Accounts"
                        description="Don't switch tenants. Stay in your flow. Access everything from your primary workspace."
                        gradient="from-indigo-500 to-purple-500"
                    />
                    <ValueProp
                        icon={<Server className="w-8 h-8" />}
                        title="Total Sovereignty"
                        description="Your data, your containers. Isolated Docker execution for every bridge you create."
                        gradient="from-purple-500 to-pink-500"
                    />
                    <ValueProp
                        icon={<Search className="w-8 h-8" />}
                        title="Instant Context"
                        description="Ask the AI: 'What did the client say about the logo?' and get an instant answer with citations."
                        gradient="from-pink-500 to-cyan-500"
                    />
                </div>
            </div>
        </section>
    );
}

function ValueProp({ icon, title, description, gradient }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
}) {
    return (
        <div className="relative group h-full">
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity`} />
            <div className="relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors h-full flex flex-col">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-6 text-white shadow-lg shrink-0`}>
                    {icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

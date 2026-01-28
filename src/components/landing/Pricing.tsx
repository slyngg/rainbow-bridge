import Link from "next/link";
import { Check } from "lucide-react";

export function Pricing() {
    return (
        <section id="pricing" className="py-16 md:py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />

            <div className="container mx-auto px-4 relative">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Start free, scale as you grow. No hidden fees, no surprises.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
                    {/* Freelancer */}
                    <PricingCard
                        tier="Freelancer"
                        price="29"
                        description="Perfect for solo consultants bridging client workspaces"
                        features={[
                            "1 Bridge",
                            "Basic Intelligence",
                            "7-day message history",
                            "Email support",
                        ]}
                        cta="Start Free Trial"
                        href="/dashboard"
                    />

                    {/* Agency - Featured */}
                    <PricingCard
                        tier="Agency"
                        price="99"
                        description="For teams managing multiple client relationships"
                        features={[
                            "5 Bridges",
                            "Full Intelligence",
                            "Unlimited message history",
                            "Priority support",
                            "Custom bridge names",
                        ]}
                        cta="Start Free Trial"
                        href="/dashboard"
                        featured
                    />

                    {/* Enterprise */}
                    <PricingCard
                        tier="Enterprise"
                        price="Custom"
                        description="For organizations with advanced requirements"
                        features={[
                            "Unlimited Bridges",
                            "On-premise deployment",
                            "Custom domains",
                            "SLA guarantee",
                            "Dedicated support",
                            "SSO / SAML",
                        ]}
                        cta="Contact Sales"
                        href="mailto:sales@mogul.io"
                        enterprise
                    />
                </div>
            </div>
        </section>
    );
}

function PricingCard({
    tier,
    price,
    description,
    features,
    cta,
    href,
    featured = false,
    enterprise = false
}: {
    tier: string;
    price: string;
    description: string;
    features: string[];
    cta: string;
    href: string;
    featured?: boolean;
    enterprise?: boolean;
}) {
    return (
        <div className={`relative group flex flex-col ${featured ? 'z-10' : ''}`}>
            {featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-semibold z-20">
                    Most Popular
                </div>
            )}
            <div className={`
        h-full p-8 rounded-2xl backdrop-blur-xl border transition-all flex flex-col
        ${featured
                    ? 'bg-gradient-to-b from-indigo-500/10 to-cyan-500/10 border-indigo-500/30 shadow-xl shadow-indigo-500/10 scale-105'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }
      `}>
                <h3 className="text-lg font-semibold mb-2">{tier}</h3>
                <div className="mb-4">
                    {enterprise ? (
                        <span className="text-3xl font-bold">Custom</span>
                    ) : (
                        <>
                            <span className="text-4xl font-bold">${price}</span>
                            <span className="text-muted-foreground">/mo</span>
                        </>
                    )}
                </div>
                <p className="text-sm text-muted-foreground mb-6 flex-grow">{description}</p>

                <ul className="space-y-3 mb-8">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                            <Check className={`w-5 h-5 ${featured ? 'text-cyan-400' : 'text-indigo-400'}`} />
                            {feature}
                        </li>
                    ))}
                </ul>

                <Link
                    href={href}
                    className={`
            block text-center py-3 px-6 rounded-lg font-medium transition-all mt-auto
            ${featured
                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105'
                            : 'bg-white/10 hover:bg-white/20'
                        }
          `}
                >
                    {cta}
                </Link>
            </div>
        </div>
    );
}

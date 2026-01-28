import { Rainbow } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border/50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                            <Rainbow className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold">Rainbow Bridge</span>
                        <span className="text-muted-foreground text-sm">by Mogul</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2026 Mogul. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

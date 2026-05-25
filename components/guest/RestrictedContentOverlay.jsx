import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const RestrictedContentOverlay = ({ children, isAuthenticated, register = true }) => {
    if (isAuthenticated) return children;
    return (
        <div className="relative min-h-[100px]">
            <div className="blur-[3px] pointer-events-none select-none opacity-70">
                {children}
            </div>
            {register && (
                <div className="absolute inset-0 flex items-center justify-center z-10 p-3">
                    <div className="bg-white rounded-xl shadow-md p-5 max-w-[280px] text-center border border-border/60">
                        <div className="flex justify-center mb-2.5">
                            <div className="w-11 h-11 rounded-full border border-border flex items-center justify-center bg-muted/30">
                                <Lock className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        <p className="font-semibold text-foreground mb-3 text-xs sm:text-sm leading-relaxed">
                            Full specifications are available to registered customers only.
                        </p>
                        <Link href="/register">
                            <Button size="sm" className="w-full">
                                REGISTER
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

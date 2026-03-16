import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const RestrictedContentOverlay = ({ children, isAuthenticated }) => {
    if (isAuthenticated) return children;
    return (
        <div className="relative min-h-[120px]">
            <div className="blur-sm pointer-events-none select-none">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm text-center border border-gray-100">
                    <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50">
                            <Lock className="h-7 w-7 text-primary" />
                        </div>
                    </div>
                    <p className="font-bold text-gray-900 mb-4 text-sm leading-snug">
                        Full specifications are available to registered customers only.
                    </p>
                    <Link href="/register">
                        <Button className="w-full bg-primary text-white font-semibold">REGISTER</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
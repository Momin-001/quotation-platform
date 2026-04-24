"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function UserHeader() {
    const { isAuthenticated, isUser } = useAuth();
    const { language } = useLanguage();
    const { getTotalItems } = useCart();
    const pathname = usePathname();

    const isActive = (href) => {
        if (!pathname) return false;
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const linkClass = (href) =>
        `hover:underline whitespace-nowrap transition-colors ${
            isActive(href) ? "font-semibold underline underline-offset-4" : ""
        }`;
    // Only show this header if user is authenticated
    if (!isAuthenticated || isUser === false) {
        return null;
    }

    return (
        <div className="w-full bg-primary text-primary-foreground">
            {/* Horizontal scroll container for small screens */}
            <div className="container mx-auto px-4 py-3 overflow-x-auto">
                <div className="min-w-max flex justify-between items-center gap-6 font-open-sans text-lg font-normal">
                    {/* Navigation Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/user/my-enquiries"
                            className={linkClass("/user/my-enquiries")}
                        >
                            {language === "en" ? "My Enquiries" : "Meine Anfragen"}
                        </Link>
                        <Link
                            href="/user/my-quotations"
                            className={linkClass("/user/my-quotations")}
                        >
                            {language === "en" ? "My Quotations" : "Meine Angebote"}
                        </Link>
                        <Link
                            href="/user/account-settings"
                            className={linkClass("/user/account-settings")}
                        >
                            {language === "en" ? "My Account" : "Mein Konto"}
                        </Link>
                    </div>

                    {/* Spacer so cart isn't glued to links */}

                    {/* Cart */}
                    <Link
                        href="/user/cart"
                        className={`flex items-center gap-2 hover:underline relative whitespace-nowrap transition-colors ${
                            isActive("/user/cart") ? "font-semibold underline underline-offset-4" : ""
                        }`}
                    >
                        <div className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {getTotalItems()}
                                </span>
                            )}
                        </div>
                        <span>{language === "en" ? "My Cart" : "Mein Warenkorb"}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

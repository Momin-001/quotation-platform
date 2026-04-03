"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function UserHeader({ userHeaderData }) {
    const { isAuthenticated, isUser } = useAuth();
    const { language } = useLanguage();
    const { getTotalItems } = useCart();
    // Only show this header if user is authenticated
    if (!isAuthenticated || isUser === false) {
        return null;
    }

    const getUserHeaderText = (text) => {
        if (!userHeaderData) return "";
        const key = language === "en" ? `${text}En` : `${text}De`;
        return userHeaderData[key] || userHeaderData[`userHeader${text}En`] || "";
    };

    return (
        <div className="w-full bg-primary text-primary-foreground">
            {/* Horizontal scroll container for small screens */}
            <div className="container mx-auto px-4 py-3 overflow-x-auto">
                <div className="min-w-max flex justify-between items-center gap-6 font-open-sans text-lg font-normal">
                    {/* Navigation Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/user/my-enquiries"
                            className="hover:underline whitespace-nowrap"
                        >
                            {getUserHeaderText("userHeaderMyEnquiry")}
                        </Link>
                        <Link
                            href="/user/my-quotations"
                            className="hover:underline whitespace-nowrap"
                        >
                            {getUserHeaderText("userHeaderMyQuotation")}
                        </Link>
                        <Link
                            href="/user/account-settings"
                            className="hover:underline whitespace-nowrap"
                        >
                            {getUserHeaderText("userHeaderMyAccount")}
                        </Link>
                    </div>

                    {/* Spacer so cart isn't glued to links */}

                    {/* Cart */}
                    <Link
                        href="/user/cart"
                        className="flex items-center gap-2 hover:underline relative whitespace-nowrap"
                    >
                        <div className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {getTotalItems()}
                                </span>
                            )}
                        </div>
                        <span>{getUserHeaderText("userHeaderMyCart")}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

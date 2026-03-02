"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function UserHeader() {
    const { isAuthenticated, isUser } = useAuth();
    const { getTotalItems } = useCart();
    // Only show this header if user is authenticated
    if (!isAuthenticated || isUser === false) {
        return null;
    }

    return (
        <div className="w-full bg-primary text-white">
            {/* Horizontal scroll container for small screens */}
            <div className="container mx-auto px-4 py-3 overflow-x-auto">
                <div className="min-w-max flex justify-between items-center gap-6 text-sm">
                    {/* Navigation Links */}
                    <div className="flex items-center gap-6">

                        <Link
                            href="/user/my-enquiries"
                            className="hover:underline whitespace-nowrap"
                        >
                            My Enquiries
                        </Link>
                        <Link
                            href="/user/my-quotations"
                            className="hover:underline whitespace-nowrap"
                        >
                            My Quotations
                        </Link>
                        <Link
                            href="/user/account-settings"
                            className="hover:underline whitespace-nowrap"
                        >
                            Account Setting
                        </Link>
                    </div>

                    {/* Spacer so cart isn't glued to links */}

                    {/* Cart */}
                    <Link
                        href="/user/cart"
                        className="flex items-center gap-2 hover:underline relative whitespace-nowrap"
                    >
                        <div className="relative">
                            <ShoppingCart className="h-4 w-4" />
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {getTotalItems()}
                                </span>
                            )}
                        </div>
                        <span className="text-sm">Cart</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

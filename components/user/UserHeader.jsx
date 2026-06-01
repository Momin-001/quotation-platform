"use client";



import { ShoppingCart } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import { useCart } from "@/context/CartContext";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";



export default function UserHeader() {

    const { isAuthenticated, isUser } = useAuth();

    const t = useTranslations("UserHeader");

    const { getTotalItems } = useCart();

    const pathname = usePathname();



    const isActive = (href) => {

        if (!pathname) return false;

        return pathname === href || pathname.startsWith(`${href}/`);

    };



    const linkClass = (href) =>

        `text-sm sm:text-[15px] whitespace-nowrap transition-colors duration-200 ${

            isActive(href)

                ? "font-semibold text-primary-foreground"

                : "font-normal text-primary-foreground/85 hover:text-primary-foreground"

        }`;



    if (!isAuthenticated || isUser === false) {

        return null;

    }



    const cartCount = getTotalItems();



    return (

        <div className="w-full bg-[#E1EEFE] text-primary-foreground border-b border-white/10">

            <div className="container mx-auto px-4 lg:px-6 py-2.5 sm:py-3 overflow-x-auto">

                <div className="min-w-max flex items-center justify-between gap-4 sm:gap-6 ">

                    <nav className="flex items-center gap-4 sm:gap-6" aria-label={t("navAriaLabel")}>

                        <Link href="/user/my-enquiries" className={linkClass("/user/my-enquiries")}>

                            {t("myEnquiries")}

                        </Link>

                        <Link href="/user/my-quotations" className={linkClass("/user/my-quotations")}>

                            {t("myQuotations")}

                        </Link>

                        <Link href="/user/account-settings" className={linkClass("/user/account-settings")}>

                            {t("myAccount")}

                        </Link>

                    </nav>



                    <Link

                        href="/user/cart"

                        className={`flex items-center gap-2 text-sm sm:text-[15px] whitespace-nowrap transition-colors duration-200 ${

                            isActive("/user/cart")

                                ? "font-semibold text-primary-foreground"

                                : "font-normal text-primary-foreground/85 hover:text-primary-foreground"

                        }`}

                    >

                        <span className="relative flex shrink-0">

                            <ShoppingCart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />

                            {cartCount > 0 && (

                                <span className="absolute -top-2 -right-2 bg-destructive text-primary-foreground text-[10px] font-semibold leading-none rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5">

                                    {cartCount > 99 ? "99+" : cartCount}

                                </span>

                            )}

                        </span>

                        <span>{t("myCart")}</span>

                    </Link>

                </div>

            </div>

        </div>

    );

}


"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/UserAvatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

const MobileNavSheet = dynamic(() => import("./NavbarMobileSheet"), { ssr: false });

export default function Navbar() {
    const { isAuthenticated, loading } = useAuth();
    const locale = useLocale();
    const t = useTranslations("Navbar");
    const tCommon = useTranslations("Common");
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    const switchLocale = (nextLocale) => {
        router.replace(pathname, { locale: nextLocale });
    };

    const isActive = (href) => {
        if (!pathname) return false;
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const navLinkClass = (href) =>
        `hover:text-primary transition-colors duration-200 ${isActive(href) ? "text-primary font-semibold" : "text-foreground/80"}`;

    return (
        <nav className="w-full border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 left-0 right-0 z-50 ">
            <div className="container mx-auto px-4 lg:px-6 py-3.5 flex items-center justify-between">
                <Link href="/" className="shrink-0 flex items-center">
                    <Image
                        src="/logo-name.png"
                        alt="Logo"
                        width={1024}
                        height={360}
                        priority
                        sizes="(max-width: 640px) 150px, (max-width: 1024px) 180px, 200px"
                        className="h-10 w-auto sm:h-12 lg:h-14"
                    />
                </Link>

                <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-[15px] tracking-wide">
                    <Link href="/" className={navLinkClass("/")}>
                        {t("home")}
                    </Link>
                    <Link href="/products" className={navLinkClass("/products")}>
                        {t("products")}
                    </Link>
                    <Link href="/controllers" className={navLinkClass("/controllers")}>
                        {t("controllers")}
                    </Link>
                    <Link href="/leditor" className={navLinkClass("/leditor")}>
                        {t("leditor")}
                    </Link>
                    <Link href="/blogs" className={navLinkClass("/blogs")}>
                        {t("blogs")}
                    </Link>
                    <Link href="/become-partner" className={navLinkClass("/become-partner")}>
                        {t("becomePartner")}
                    </Link>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="hidden xl:flex items-center gap-2.5">
                        {loading ? (
                            <Spinner />
                        ) : !isAuthenticated ? (
                            <>
                                <Link href="/register">
                                    <Button variant="default">
                                        {tCommon("register")}
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="outline" className="text-primary border-primary hover:bg-primary/5">
                                        {tCommon("login")}
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <UserAvatar />
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="border-border px-2.5 gap-1.5"
                                >
                                    <Image
                                        src={locale === "en" ? "/us.svg" : "/de.svg"}
                                        alt={locale === "en" ? t("englishAlt") : t("germanAlt")}
                                        width={22}
                                        height={16}
                                        className="shrink-0"
                                    />
                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-36 p-1">
                                <DropdownMenuItem
                                    className="gap-2.5 py-1.5 px-2.5 text-sm cursor-pointer"
                                    onClick={() => switchLocale("de")}
                                >
                                    <Image src="/de.svg" alt={t("germanAlt")} width={22} height={16} className="shrink-0" />
                                    <span>{t("german")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="gap-2.5 py-1.5 px-2.5 text-sm cursor-pointer"
                                    onClick={() => switchLocale("en")}
                                >
                                    <Image src="/us.svg" alt={t("englishAlt")} width={22} height={16} className="shrink-0" />
                                    <span>{t("english")}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="xl:hidden">
                        {mobileOpen ? (
                            <MobileNavSheet
                                open={mobileOpen}
                                onOpenChange={setMobileOpen}
                                locale={locale}
                                isAuthenticated={isAuthenticated}
                                loading={loading}
                                switchLocale={switchLocale}
                            />
                        ) : null}
                        <Button variant="outline" size="icon-sm" className="border-border" onClick={() => setMobileOpen(true)}>
                            <Menu className="h-4 w-4 text-foreground" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

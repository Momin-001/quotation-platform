"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cmsField } from "@/lib/i18n/cms";
import UserAvatar from "@/components/UserAvatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

export default function Navbar({ navbarData }) {
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

    const mobileNavLinkClass = (href) =>
        `block py-2.5 hover:text-primary transition-colors duration-200 ${isActive(href) ? "text-primary font-semibold" : "text-foreground/80"}`;

    const getNavText = (itemNumber) =>
        cmsField(navbarData, `navItem${itemNumber}`, locale);

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
                        {getNavText(1)}
                    </Link>
                    <Link href="/products" className={navLinkClass("/products")}>
                        {getNavText(2)}
                    </Link>
                    <Link href="/controllers" className={navLinkClass("/controllers")}>
                        {getNavText(3)}
                    </Link>
                    <Link href="/leditor" className={navLinkClass("/leditor")}>
                        {getNavText(4)}
                    </Link>
                    <Link href="/blogs" className={navLinkClass("/blogs")}>
                        {getNavText(5)}
                    </Link>
                    <Link href="/become-partner" className={navLinkClass("/become-partner")}>
                        {getNavText(6)}
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
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon-sm" className="border-border">
                                    <Menu className="h-4 w-4 text-foreground" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72 flex flex-col p-0">
                                <SheetHeader className="shrink-0 p-5 border-b">
                                    <SheetTitle className="flex items-center gap-2">
                                        <span className=" text-base font-semibold text-foreground">{t("menu")}</span>
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                    <div className="space-y-1 text-sm font-medium tracking-wide border-b border-border/60 pb-5">
                                        <Link href="/" onClick={() => setMobileOpen(false)} className={mobileNavLinkClass("/")}>
                                            {getNavText(1)}
                                        </Link>
                                        <Link href="/products" onClick={() => setMobileOpen(false)} className={mobileNavLinkClass("/products")}>
                                            {getNavText(2)}
                                        </Link>
                                        <Link href="/controllers" onClick={() => setMobileOpen(false)} className={mobileNavLinkClass("/controllers")}>
                                            {getNavText(3)}
                                        </Link>
                                        <Link href="/leditor" onClick={() => setMobileOpen(false)} className={mobileNavLinkClass("/leditor")}>
                                            {getNavText(4)}
                                        </Link>
                                        <Link href="/blogs" onClick={() => setMobileOpen(false)} className={mobileNavLinkClass("/blogs")}>
                                            {getNavText(5)}
                                        </Link>
                                        <Link href="/become-partner" onClick={() => setMobileOpen(false)} className={mobileNavLinkClass("/become-partner")}>
                                            {getNavText(6)}
                                        </Link>
                                    </div>

                                    <div className="space-y-3">
                                        {loading ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Spinner />
                                            </div>
                                        ) : !isAuthenticated ? (
                                            <div className="grid grid-cols-1 gap-2.5">
                                                <Link href="/register" onClick={() => setMobileOpen(false)}>
                                                    <Button size="sm" className="w-full">
                                                        {tCommon("register")}
                                                    </Button>
                                                </Link>
                                                <Link href="/login" onClick={() => setMobileOpen(false)}>
                                                    <Button size="sm" variant="outline" className="w-full text-primary border-primary hover:bg-primary/5">
                                                        {tCommon("login")}
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div onClick={() => setMobileOpen(false)}>
                                                <UserAvatar />
                                            </div>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full justify-between border-border"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <Image
                                                            src={locale === "en" ? "/us.svg" : "/de.svg"}
                                                            alt={locale === "en" ? t("englishAlt") : t("germanAlt")}
                                                            width={24}
                                                            height={18}
                                                            className="shrink-0"
                                                        />
                                                        <span>{t("language")}</span>
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="min-w-36 p-1">
                                                <DropdownMenuItem
                                                    className="gap-2.5 py-1.5 px-2.5 text-sm cursor-pointer"
                                                    onClick={() => switchLocale("de")}
                                                >
                                                    <Image src="/de.svg" alt="German" width={22} height={16} className="shrink-0" />
                                                    <span>German</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="gap-2.5 py-1.5 px-2.5 text-sm cursor-pointer"
                                                    onClick={() => switchLocale("en")}
                                                >
                                                    <Image src="/us.svg" alt="English" width={22} height={16} className="shrink-0" />
                                                    <span>English</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}

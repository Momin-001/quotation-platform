"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cmsField } from "@/lib/i18n/cms";

export default function NavbarMobileSheet({ open, onOpenChange, navbarData, locale, isAuthenticated, loading, switchLocale }) {
    const t = useTranslations("Navbar");
    const tCommon = useTranslations("Common");
    const pathname = usePathname();

    const isActive = (href) => {
        if (!pathname) return false;
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const mobileNavLinkClass = (href) =>
        `block py-2.5 hover:text-primary transition-colors duration-200 ${isActive(href) ? "text-primary font-semibold" : "text-foreground/80"}`;

    const getNavText = (itemNumber) => cmsField(navbarData, `navItem${itemNumber}`, locale);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-72 flex flex-col p-0">
                <SheetHeader className="shrink-0 p-5 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <span className="text-base font-semibold text-foreground">{t("menu")}</span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    <div className="space-y-1 text-sm font-medium tracking-wide border-b border-border/60 pb-5">
                        <Link href="/" onClick={() => onOpenChange(false)} className={mobileNavLinkClass("/")}>
                            {getNavText(1)}
                        </Link>
                        <Link href="/products" onClick={() => onOpenChange(false)} className={mobileNavLinkClass("/products")}>
                            {getNavText(2)}
                        </Link>
                        <Link href="/controllers" onClick={() => onOpenChange(false)} className={mobileNavLinkClass("/controllers")}>
                            {getNavText(3)}
                        </Link>
                        <Link href="/leditor" onClick={() => onOpenChange(false)} className={mobileNavLinkClass("/leditor")}>
                            {getNavText(4)}
                        </Link>
                        <Link href="/blogs" onClick={() => onOpenChange(false)} className={mobileNavLinkClass("/blogs")}>
                            {getNavText(5)}
                        </Link>
                        <Link href="/become-partner" onClick={() => onOpenChange(false)} className={mobileNavLinkClass("/become-partner")}>
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
                                <Link href="/register" onClick={() => onOpenChange(false)}>
                                    <Button size="sm" className="w-full">
                                        {tCommon("register")}
                                    </Button>
                                </Link>
                                <Link href="/login" onClick={() => onOpenChange(false)}>
                                    <Button size="sm" variant="outline" className="w-full text-primary border-primary hover:bg-primary/5">
                                        {tCommon("login")}
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div onClick={() => onOpenChange(false)}>
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
    );
}

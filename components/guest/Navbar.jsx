"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import UserAvatar from "@/components/common/UserAvatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
import {Spinner} from "@/components/ui/spinner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar({ navbarData }) {
    const { isAuthenticated, loading } = useAuth();
    const { language, setLanguage } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href) => {
        if (!pathname) return false;
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const navLinkClass = (href) =>
        `hover:text-primary transition-colors ${isActive(href) ? "text-primary" : ""}`;

    const mobileNavLinkClass = (href) =>
        `block py-2 hover:text-primary ${isActive(href) ? "text-primary" : ""}`;

    const getNavText = (itemNumber) => {
        if (!navbarData) return "";
        const key = language === "en" ? `navItem${itemNumber}En` : `navItem${itemNumber}De`;
        return navbarData[key] || navbarData[`navItem${itemNumber}En`] || "";
    };

    return (
        <nav className="w-full border-b bg-background sticky top-0 left-0 right-0 z-50 font-archivo">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="shrink-0 flex items-center">
                    <Image
                        src="/logo-name.png"
                        alt="Logo"
                        width={1024}
                        height={360}
                        priority
                        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 380px"
                        className="h-14 w-auto sm:h-16 md:h-17 lg:h-18"
                    />
                </Link>
                <div className="hidden lg:flex px-8 items-center gap-8 text-lg font-medium text-gray-800">
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

                {/* Right side actions (desktop) + hamburger (mobile) */}
                <div className="flex items-center gap-3">
                    {/* Desktop actions */}
                    <div className="hidden xl:flex items-center gap-3">
                        {loading ? (
                            <Spinner />
                        ) : !isAuthenticated ? (
                            <>
                                <Link href="/register">
                                    <Button variant="default">
                                        REGISTER
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="outline" size="default" className="text-primary border-primary hover:bg-primary/5">
                                        LOGIN
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <UserAvatar />
                                
                            </>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-12 min-h-12 border-gray-400 rounded-sm px-4 gap-2 text-base font-medium justify-center"
                                >
                                    <Image
                                        src={language === "en" ? "/us.svg" : "/de.svg"}
                                        alt={language === "en" ? "English" : "German"}
                                        width={28}
                                        height={21}
                                        className="shrink-0"
                                    />
                                    <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-48 p-2 text-base">
                                <DropdownMenuItem
                                    className="gap-3 py-2.5 px-3 text-base cursor-pointer"
                                    onClick={() => setLanguage("en")}
                                >
                                    <Image
                                        src="/us.svg"
                                        alt="English"
                                        width={28}
                                        height={21}
                                        className="shrink-0"
                                    />
                                    <span>English</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="gap-3 py-2.5 px-3 text-base cursor-pointer"
                                    onClick={() => setLanguage("de")}
                                >
                                    <Image
                                        src="/de.svg"
                                        alt="German"
                                        width={28}
                                        height={21}
                                        className="shrink-0"
                                    />
                                    <span>German</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile hamburger */}
                    <div className="xl:hidden">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="border-gray-300">
                                    <Menu className="h-5 w-5 text-gray-800" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72 flex flex-col p-0">
                                <SheetHeader className="shrink-0 p-4 border-b">
                                    <SheetTitle className="flex items-center gap-2">
                                        <span className="font-archivo text-base text-gray-800">Menu</span>
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <div className="block lg:hidden space-y-2 text-sm font-medium text-gray-800 border-b pb-4">
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
                                            <div className="grid grid-cols-1 gap-2">
                                                <Link href="/register" onClick={() => setMobileOpen(false)}>
                                                    <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                                                        REGISTER
                                                    </Button>
                                                </Link>
                                                <Link href="/login" onClick={() => setMobileOpen(false)}>
                                                    <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/5">
                                                        LOGIN
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="w-full" onClick={() => setMobileOpen(false)}>
                                                    <UserAvatar triggerClassName="w-full min-h-12" />
                                                </div>
                                            </div>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full min-h-12 h-auto py-3 justify-between border-gray-300 text-base font-medium"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <Image
                                                            src={language === "en" ? "/us.svg" : "/de.svg"}
                                                            alt={language === "en" ? "English" : "German"}
                                                            width={28}
                                                            height={21}
                                                            className="shrink-0"
                                                        />
                                                        <span>Language</span>
                                                    </span>
                                                    <ChevronDown className="h-5 w-5 text-gray-500 shrink-0" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="min-w-48 p-2 text-base">
                                                <DropdownMenuItem
                                                    className="gap-3 py-2.5 px-3 text-base cursor-pointer"
                                                    onClick={() => setLanguage("en")}
                                                >
                                                    <Image
                                                        src="/us.svg"
                                                        alt="English"
                                                        width={28}
                                                        height={21}
                                                        className="shrink-0"
                                                    />
                                                    <span>English</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="gap-3 py-2.5 px-3 text-base cursor-pointer"
                                                    onClick={() => setLanguage("de")}
                                                >
                                                    <Image
                                                        src="/de.svg"
                                                        alt="German"
                                                        width={28}
                                                        height={21}
                                                        className="shrink-0"
                                                    />
                                                    <span>German</span>
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
        </nav >
    );
}

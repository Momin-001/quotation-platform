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

export default function Navbar({ navbarData }) {
    const { isAuthenticated, loading } = useAuth();
    const { language, setLanguage } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const getNavText = (itemNumber) => {
        if (!navbarData) return "";
        const key = language === "en" ? `navItem${itemNumber}En` : `navItem${itemNumber}De`;
        return navbarData[key] || navbarData[`navItem${itemNumber}En`] || "";
    };

    return (
        <nav className="w-full border-b bg-background sticky top-0 left-0 right-0 z-50 font-archivo">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="shrink-0">
                    <Image className="" src="/logo.png" alt="Logo" width={40} height={40} />
                </Link>
                <div className="hidden lg:flex px-8 items-center gap-8 text-sm font-bold text-[#0F2E4A]">
                    <Link href="/" className="hover:text-primary transition-colors">
                        {getNavText(1)}
                    </Link>
                    <Link href="/products" className="hover:text-primary transition-colors">
                        {getNavText(2)}
                    </Link>
                    <Link href="/controllers" className="hover:text-primary transition-colors">
                        {getNavText(3)}
                    </Link>
                    <Link href="/leditor" className="hover:text-primary transition-colors">
                        {getNavText(4)}
                    </Link>
                    {/* <Link href="/case-studies" className="hover:text-primary transition-colors">
                        {getNavText(5)}
                    </Link> */}
                    <Link href="/become-partner" className="hover:text-primary transition-colors">
                        {getNavText(6)}
                    </Link>
                </div>

                {/* Right side actions (desktop) + hamburger (mobile) */}
                <div className="flex items-center gap-3">
                    {/* Desktop actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        {loading ? (
                            <Spinner />
                        ) : !isAuthenticated ? (
                            <>
                                <Link href="/register">
                                    <Button className="bg-primary hover:bg-primary/90 text-white px-6">
                                        REGISTER
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="outline" className="text-primary border-primary hover:bg-primary/5 px-6">
                                        LOGIN
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <UserAvatar />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="justify-center border-gray-400 rounded">
                                            <Image
                                                src={language === "en" ? "/us.svg" : "/de.svg"}
                                                alt={language === "en" ? "English" : "German"}
                                                width={20}
                                                height={15}
                                            />
                                            <ChevronDown className="h-3 w-3 text-gray-400 ml-1" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            className="gap-2"
                                            onClick={() => setLanguage("en")}
                                        >
                                            <Image src="/us.svg" alt="English" width={20} height={15} />
                                            <span className="text-sm">English</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="gap-2"
                                            onClick={() => setLanguage("de")}
                                        >
                                            <Image src="/de.svg" alt="German" width={20} height={15} />
                                            <span className="text-sm">German</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <div className="lg:hidden">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="border-gray-300">
                                    <Menu className="h-5 w-5 text-[#0F2E4A]" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72 flex flex-col p-0">
                                <SheetHeader className="shrink-0 p-4 border-b">
                                    <SheetTitle className="flex items-center gap-2">
                                        <Image src="/logo.png" alt="Logo" width={32} height={32} />
                                        <span className="font-archivo text-base text-[#0F2E4A]">Menu</span>
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <div className="space-y-2 text-sm font-bold text-[#0F2E4A]">
                                        <Link href="/" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-primary">
                                            {getNavText(1)}
                                        </Link>
                                        <Link href="/products" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-primary">
                                            {getNavText(2)}
                                        </Link>
                                        <Link href="/controllers" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-primary">
                                            {getNavText(3)}
                                        </Link>
                                        <Link href="/leditor" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-primary">
                                            {getNavText(4)}
                                        </Link>
                                        <Link href="/become-partner" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-primary">
                                            {getNavText(6)}
                                        </Link>
                                    </div>

                                    <div className="border-t pt-4 space-y-3">
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
                                                    <UserAvatar />
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-between border-gray-300">
                                                            <span className="flex items-center gap-2">
                                                                <Image
                                                                    src={language === "en" ? "/us.svg" : "/de.svg"}
                                                                    alt={language === "en" ? "English" : "German"}
                                                                    width={20}
                                                                    height={15}
                                                                />
                                                                <span className="text-sm">Language</span>
                                                            </span>
                                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="gap-2"
                                                            onClick={() => setLanguage("en")}
                                                        >
                                                            <Image src="/us.svg" alt="English" width={20} height={15} />
                                                            <span className="text-sm">English</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="gap-2"
                                                            onClick={() => setLanguage("de")}
                                                        >
                                                            <Image src="/de.svg" alt="German" width={20} height={15} />
                                                            <span className="text-sm">German</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
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

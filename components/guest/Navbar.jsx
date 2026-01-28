"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { PenLine } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import {Spinner} from "@/components/ui/spinner";

export default function Navbar({ navbarData }) {
    const { isAuthenticated, loading } = useAuth();
    const { language, setLanguage } = useLanguage();

    const getNavText = (itemNumber) => {
        if (!navbarData) return "";
        const key = language === "en" ? `navItem${itemNumber}En` : `navItem${itemNumber}De`;
        return navbarData[key] || navbarData[`navItem${itemNumber}En`] || "";
    };

    return (
        <nav className="w-full border-b bg-background font-archivo">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Image className="lg:mr-20" src="/logo.png" alt="Logo" width={40} height={40} />
                <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[#0F2E4A]">
                    <Link href="/" className="hover:text-primary transition-colors">
                        {getNavText(1)}
                    </Link>
                    <Link href="/products" className="hover:text-primary transition-colors">
                        {getNavText(2)}
                    </Link>
                    <Link href="/leditor" className="hover:text-primary transition-colors">
                        {getNavText(3)}
                    </Link>
                    <Link href="/case-studies" className="hover:text-primary transition-colors">
                        {getNavText(4)}
                    </Link>
                    <Link href="/become-partner" className="hover:text-primary transition-colors">
                        {getNavText(5)}
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <Spinner />
                        </div>
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
                        <div className="flex items-center gap-3">
                            <Button size="icon" className="bg-[#009B8F] hover:bg-[#009B8F]/90 text-white rounded">
                                <PenLine className="h-4 w-4" />
                            </Button>
                            <UserAvatar />
                        </div>
                    

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
            </div>
        </nav >
    );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { PenLine } from "lucide-react";
import UserActions from "@/components/UserActions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
    const { user } = useAuth();
    const { language, setLanguage } = useLanguage();
    const [navbarData, setNavbarData] = useState({
        navItem1En: "HOME",
        navItem1De: "STARTSEITE",
        navItem2En: "PRODUCTS",
        navItem2De: "PRODUKTE",
        navItem3En: "LEDITOR",
        navItem3De: "LEDITOR",
        navItem4En: "CASE STUDIES",
        navItem4De: "FALLSTUDIEN",
        navItem5En: "BECOME PARTNERS",
        navItem5De: "PARTNER WERDEN",
    });

    useEffect(() => {
        fetchNavbarData();
    }, []);

    const fetchNavbarData = async () => {
        try {
            const res = await fetch("/api/navbar");
            const data = await res.json();
            if (data.success && data.data) {
                setNavbarData(data.data);
            }
        } catch (error) {
            console.error("Error fetching navbar data:", error);
        }
    };

    const getNavText = (itemNumber) => {
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
                    <Link href="/partners" className="hover:text-primary transition-colors">
                        {getNavText(5)}
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    {!user ? (
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
                        <div className="flex items-center gap-3">
                            <Button size="icon" className="bg-[#009B8F] hover:bg-[#009B8F]/90 text-white rounded">
                                <PenLine className="h-4 w-4" />
                            </Button>

                            <UserActions />

                        </div>
                    )}

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
                </div>
            </div>
        </nav >
    );
}

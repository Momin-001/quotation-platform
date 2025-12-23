"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, LogOut, Bell, PenLine, ChevronDown, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserActions from "@/components/UserActions";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="w-full border-b bg-background font-archivo">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Image className="lg:mr-20" src="/logo.png" alt="Logo" width={40} height={40} />
                <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[#0F2E4A]">
                    <Link href="/" className="hover:text-primary transition-colors">HOME</Link>
                    <Link href="/products" className="hover:text-primary transition-colors">PRODUCTS</Link>
                    <Link href="/leditor" className="hover:text-primary transition-colors">LEDITOR</Link>
                    <Link href="/case-studies" className="hover:text-primary transition-colors">CASE STUDIES</Link>
                    <Link href="/partners" className="hover:text-primary transition-colors">PARTNERS</Link>
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
                </div>
            </div>
        </nav >
    );
}

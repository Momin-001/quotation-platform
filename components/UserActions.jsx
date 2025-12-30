"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { Bell, ChevronDown, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserActions() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="flex items-center gap-3">
            <Button size="icon" variant="outline" className="border-gray-400 text-primary rounded">
                <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-400 pl-2 pr-2 rounded h-10 flex gap-2 items-center">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src="" /> {/* Placeholder for user image */}
                            <AvatarFallback className="bg-gray-200"><User className="h-4 w-4 text-gray-500" /></AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start mr-1">
                            <span className="text-xs font-bold leading-none text-[#0F2E4A]">{user.fullName || "User Name"}</span>
                            <span className="text-[10px] text-gray-500 capitalize leading-none mt-0.5">{user.role || "User"}</span>
                        </div>
                        <ChevronDown className="h-3 w-3 text-gray-400" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {user.role === 'admin' && (
                        <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer">Dashboard</Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500">
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
           
        </div>
    );
}

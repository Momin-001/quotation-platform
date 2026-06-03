"use client";

import Link from "next/link";
import { formatRole } from "@/lib/helpers/helpers";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { ChevronDown, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserAvatar() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="flex items-center gap-3">
            {/* <Button size="icon" variant="outline" className="border-gray-400 text-primary rounded">
                <Bell className="h-4 w-4" />
            </Button> */}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between border-border"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-gray-200">
                                    <User className="h-4 w-4 text-gray-500" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start min-w-0 text-left">
                                <span className="text-xs font-bold leading-tight text-[#0F2E4A] truncate max-w-32 sm:max-w-48">
                                    {user?.fullName || "User Name"}
                                </span>
                                <span className="text-xs text-gray-500 capitalize leading-tight">
                                    {formatRole(user?.role)}
                                </span>
                            </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56 p-2 text-base">
                    {(user?.role === "admin" || user?.role === "super_admin") && (
                        <DropdownMenuItem asChild className="text-base py-2.5 px-3 cursor-pointer">
                            <Link href="/admin">Dashboard</Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        onClick={logout}
                        variant="destructive"
                        className="text-base py-2.5 px-3 cursor-pointer"
                    >
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

        </div>
    );
}

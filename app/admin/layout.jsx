"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import UserActions from "@/components/UserActions";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Management", icon: Users },
];

function NavLinks({ pathname, onNavigate }) {
    return (
        <nav className="flex-1 py-4">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link key={item.href} href={item.href} onClick={onNavigate}>
                        <Button
                            variant="ghost"
                            className={`w-full h-12 px-8! justify-start ${isActive ? "bg-primary rounded-none text-white hover:bg-primary hover:text-white" : ""
                                }`}
                        >
                            <Icon size={20} /> {item.label}
                        </Button>
                    </Link>
                );
            })}
        </nav>
    );
}

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-white shadow-md border-r flex-col">
                <div className="p-4 border-b flex items-center gap-2">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} />
                </div>
                <NavLinks pathname={pathname} />
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8">
                    {/* Mobile Hamburger Menu */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle className="flex items-center gap-2">
                                    <Image src="/logo.png" alt="Logo" width={32} height={32} />
                                </SheetTitle>
                            </SheetHeader>
                            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
                        </SheetContent>
                    </Sheet>

                    <div className="flex-1 md:flex-none" />
                    <UserActions />
                </header>
                <div className="p-4 md:p-8 flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

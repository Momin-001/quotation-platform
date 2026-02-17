"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, Menu, FolderOpen, Package, Upload, Handshake, PenLine, NotebookText, TicketCheck, HelpCircle, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import UserAvatar from "@/components/common/UserAvatar";
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
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/products/import", label: "Bulk Product Import", icon: Upload },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/partners", label: "Partners", icon: Handshake },
    { href: "/admin/enquiries", label: "Customer Enquiries", icon: MessageSquare },
    { href: "/admin/quotations", label: "Quotations", icon: FileText },
    { href: "/admin/cms", label: "CMS Pages", icon: NotebookText },
    { href: "/admin/certificates", label: "Certificates", icon: TicketCheck },
    { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
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
                    <UserAvatar />
                </header>
                <div className="p-4 md:p-8 flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

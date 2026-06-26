"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, Menu, FolderOpen, Package, Upload, Handshake, PenLine, NotebookText, TicketCheck, HelpCircle, MessageSquare, FileText, ImageIcon, BookOpen, Recycle, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import UserAvatar from "@/components/UserAvatar";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/refurbished-products", label: "Refurbished Products", icon: Recycle },
    { href: "/admin/controllers", label: "Controllers", icon: Package },
    { href: "/admin/accessories", label: "Accessories", icon: Package },
    { href: "/admin/bulk-import", label: "Bulk Product Import", icon: Upload },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/partners", label: "Partners", icon: Handshake },
    { href: "/admin/advertisements", label: "Advertisements", icon: Megaphone },
    { href: "/admin/enquiries", label: "Customer Enquiries", icon: MessageSquare },
    { href: "/admin/quotations", label: "Quotations", icon: FileText },
    { href: "/admin/cms", label: "CMS Pages", icon: NotebookText, isSuperAdminOnly: true },
    { href: "/admin/certificates", label: "Certificates", icon: TicketCheck },
    { href: "/admin/product-icons", label: "Product Icons", icon: ImageIcon },
    { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
    { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
];

function NavLinks({ pathname, onNavigate, className = "" }) {
    const { isSuperAdmin } = useAuth();
    return (
        <nav className={`flex-1 min-h-0 overflow-y-auto py-4 ${className}`}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                if (item.isSuperAdminOnly && !isSuperAdmin) {
                    return null;
                }
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
            {/* Desktop Sidebar: fixed, full height; scrolls only when nav overflows */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md border-r flex-col h-screen">
                <div className="shrink-0 p-4 border-b flex items-center gap-2">
                    <Link href="/admin" className="shrink-0 flex items-center">
                        <Image
                            src="/logo-name.png"
                            alt="Logo"
                            width={1024}
                            height={360}
                            priority
                            sizes="150px"
                            className="h-10 w-auto"
                        />
                    </Link>
                </div>
                <NavLinks pathname={pathname} />
            </aside>

            {/* Main: offset by sidebar width on desktop; only this area scrolls */}
            <main className="flex-1 flex flex-col overflow-hidden min-w-0 md:ml-64">
                <header className="py-5 bg-white border-b flex items-center justify-between px-4 md:px-8">
                    {/* Mobile Hamburger Menu */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 flex flex-col p-0">
                            <SheetHeader className="shrink-0 p-4 border-b">
                                <SheetTitle className="flex items-center gap-2">
                                    <Image
                                        src="/logo-name.png"
                                        alt="Logo"
                                        width={1024}
                                        height={360}
                                        priority
                                        sizes="150px"
                                        className="h-10 w-auto"
                                    />
                                </SheetTitle>
                            </SheetHeader>
                            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} className="overflow-y-auto" />
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

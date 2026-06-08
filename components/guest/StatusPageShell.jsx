"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Headphones, RefreshCw, SearchX, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COPY = {
    notFound: {
        code: "404",
        title: "Page not found",
        description:
            "The page you're looking for doesn't exist or may have been moved.",
    },
    error: {
        code: "Error",
        title: "Something went wrong",
        description: "An unexpected error occurred. Please try again or return home.",
    },
};

export default function StatusPageShell({ variant = "notFound", onRetry }) {
    const isError = variant === "error";
    const copy = COPY[isError ? "error" : "notFound"];

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-linear-to-br from-white via-blue-50/70 to-secondary/10">
            <div
                aria-hidden
                className="pointer-events-none absolute -top-28 -right-20 h-112 w-112 rounded-full bg-primary/10 blur-3xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-36 -left-24 h-80 w-80 rounded-full bg-secondary/15 blur-3xl"
            />

            <header className="relative z-10 container mx-auto px-4 lg:px-6 py-6">
                <Link
                    href="/"
                    className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                    <Image
                        src="/logo-name.png"
                        alt="ProLEDALL"
                        width={160}
                        height={40}
                        className="h-9 w-auto sm:h-10"
                        priority
                    />
                </Link>
            </header>

            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
                <div className="w-full max-w-xl text-center">
                    <div
                        className={cn(
                            "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl",
                            isError
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary"
                        )}
                    >
                        {isError ? (
                            <RefreshCw className="h-8 w-8" />
                        ) : (
                            <SearchX className="h-8 w-8" />
                        )}
                    </div>

                    <p className="text-6xl sm:text-7xl font-bold tracking-tight bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {copy.code}
                    </p>

                    <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        {copy.title}
                    </h1>

                    <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
                        {copy.description}
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                        <Button asChild size="lg" className="w-full sm:w-auto">
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                                Back to home
                            </Link>
                        </Button>

                        {isError && onRetry ? (
                            <Button
                                type="button"
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border-secondary/40 text-secondary hover:bg-secondary/5"
                                onClick={onRetry}
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try again
                            </Button>
                        ) : (
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border-secondary/40 text-secondary hover:bg-secondary/5"
                            >
                                <Link href="/products">
                                    <ShoppingBag className="h-4 w-4" />
                                    Browse products
                                </Link>
                            </Button>
                        )}
                    </div>

                    <div className="mt-6">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            <Headphones className="h-4 w-4" />
                            Contact support
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

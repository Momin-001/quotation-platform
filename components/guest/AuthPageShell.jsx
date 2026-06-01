"use client";

import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BreadCrumb from "@/components/user/BreadCrumb";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AuthPageShell({
    breadcrumbTitle,
    breadcrumbs,
    title,
    description,
    children,
    className,
    cardClassName,
    maxWidth = "max-w-lg",
}) {
    return (
        <div className={cn("min-h-screen flex flex-col", className)}>
            <BreadCrumb title={breadcrumbTitle} breadcrumbs={breadcrumbs} />
            <main className="grow relative">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/placeholder-bg.jpg')" }}
                    aria-hidden
                />
                <div className="absolute inset-0 z-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5" aria-hidden />

                <div className="relative z-10 container mx-auto px-4 lg:px-6 py-10 sm:py-14 lg:py-16 flex justify-center">
                    <Card
                        className={cn(
                            "w-full shadow-lg border border-border/60 backdrop-blur-sm rounded-xl",
                            maxWidth,
                            cardClassName
                        )}
                    >
                        <CardHeader className="px-6 sm:px-8 pt-2 pb-0 space-y-0">
                            <CardTitle className="text-xl sm:text-2xl font-bold  text-foreground leading-tight tracking-tight">
                                {title}
                            </CardTitle>
                            {description ? (
                                <p className="text-sm text-muted-foreground leading-relaxed mt-2 pt-0">
                                    {description}
                                </p>
                            ) : null}
                        </CardHeader>
                        <CardContent className="px-6 sm:px-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export function AuthField({ label, htmlFor, required, error, children }) {
    return (
        <div className="space-y-1.5">
            <Label
                htmlFor={htmlFor}
            >
                {label}
                {required ? <span className="text-destructive ml-0.5">*</span> : null}
            </Label>
            {children}
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
    );
}

export function AuthTextLink({ href, children, className }) {
    return (
        <Link
            href={href}
            className={cn(
                "text-sm font-medium text-primary hover:text-primary/80 transition-colors",
                className
            )}
        >
            {children}
        </Link>
    );
}

export function AuthFormFooter({ children, className }) {
    return (
        <p className={cn("text-center text-sm text-muted-foreground mt-5 pt-1", className)}>
            {children}
        </p>
    );
}

export const authInputClass = "h-10 text-sm";
export const authTextareaClass = "min-h-[140px] text-sm resize-y";
export const authInputErrorClass = "border-destructive focus-visible:ring-destructive/30";

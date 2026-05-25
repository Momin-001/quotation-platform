"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { Spinner } from "@/components/ui/spinner";
import {
    AuthPageShell,
    AuthField,
    AuthTextLink,
    AuthFormFooter,
    authInputClass,
    authInputErrorClass,
} from "@/components/guest/AuthPageShell";
import { cn } from "@/lib/utils";

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;

const formSchema = z
    .object({
        password: z
            .string()
            .min(8, "At least 8 characters")
            .regex(PASSWORD_RULE, "Include letters and numbers"),
        confirmPassword: z.string().min(1, "Confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

function ResetPasswordContent({ title, description, children }) {
    const { language } = useLanguage();
    const isEn = language === "en";

    return (
        <AuthPageShell
            breadcrumbTitle={isEn ? "Reset password" : "Passwort zurücksetzen"}
            breadcrumbs={[
                { label: isEn ? "Home" : "Startseite", href: "/" },
                { label: isEn ? "Reset password" : "Passwort zurücksetzen" },
            ]}
            title={title}
            description={description}
        >
            {children}
        </AuthPageShell>
    );
}

function ResetPasswordLoading() {
    const { language } = useLanguage();
    const isEn = language === "en";

    return (
        <ResetPasswordContent
            title={isEn ? "Reset password" : "Passwort zurücksetzen"}
            description={isEn ? "Please wait while we verify your link." : "Bitte warten Sie, während wir Ihren Link prüfen."}
        >
            <div className="flex flex-col items-center justify-center gap-3 py-10">
                <Spinner className="h-6 w-6 text-primary" />
                <p className="text-sm text-muted-foreground">
                    {isEn ? "Checking your link…" : "Link wird geprüft…"}
                </p>
            </div>
        </ResetPasswordContent>
    );
}

function PasswordField({ id, label, registerProps, error, show, onToggle, placeholder }) {
    return (
        <AuthField label={label} htmlFor={id} required error={error}>
            <div className="relative">
                <Input
                    id={id}
                    {...registerProps}
                    type={show ? "text" : "password"}
                    placeholder={placeholder}
                    className={cn(authInputClass, "pr-10", error && authInputErrorClass)}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={show ? "Hide password" : "Show password"}
                >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </AuthField>
    );
}

function ResetPasswordInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { language } = useLanguage();
    const isEn = language === "en";
    const [status, setStatus] = useState("loading");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const token = searchParams.get("token") || "";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (!token) {
            setStatus("invalid");
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
                const json = await res.json();
                if (cancelled) return;
                setStatus(json.success ? "ready" : "invalid");
            } catch {
                if (!cancelled) setStatus("invalid");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    password: data.password,
                    confirmPassword: data.confirmPassword,
                }),
            });
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to reset password");
            }
            toast.success(response.message || (isEn ? "Password updated" : "Passwort aktualisiert"));
            router.push("/login");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return <ResetPasswordLoading />;
    }

    if (status === "invalid") {
        return (
            <ResetPasswordContent
                title={isEn ? "Link not valid" : "Link ungültig"}
                description={
                    isEn
                        ? "This password reset link is invalid or has expired. Please request a new one."
                        : "Dieser Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an."
                }
            >
                <div className="space-y-4">
                    <Button asChild size="lg" className="w-full">
                        <Link href="/forgot-password">
                            {isEn ? "Request a new link" : "Neuen Link anfordern"}
                        </Link>
                    </Button>
                    <AuthFormFooter>
                        <AuthTextLink href="/login" className="inline">
                            {isEn ? "Back to sign in" : "Zurück zur Anmeldung"}
                        </AuthTextLink>
                    </AuthFormFooter>
                </div>
            </ResetPasswordContent>
        );
    }

    return (
        <ResetPasswordContent
            title={isEn ? "Set a new password" : "Neues Passwort festlegen"}
            description={
                isEn
                    ? "Choose a strong password with at least 8 characters, including letters and numbers."
                    : "Wählen Sie ein sicheres Passwort mit mindestens 8 Zeichen, einschließlich Buchstaben und Zahlen."
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <PasswordField
                    id="password"
                    label={isEn ? "New password" : "Neues Passwort"}
                    registerProps={register("password")}
                    error={errors.password?.message}
                    show={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                    placeholder={isEn ? "New password" : "Neues Passwort"}
                />

                <PasswordField
                    id="confirmPassword"
                    label={isEn ? "Confirm password" : "Passwort bestätigen"}
                    registerProps={register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                    show={showConfirm}
                    onToggle={() => setShowConfirm(!showConfirm)}
                    placeholder={isEn ? "Confirm password" : "Passwort bestätigen"}
                />

                <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
                    {loading
                        ? isEn
                            ? "Saving…"
                            : "Wird gespeichert…"
                        : isEn
                          ? "Update password"
                          : "Passwort aktualisieren"}
                </Button>

                <AuthFormFooter>
                    <AuthTextLink href="/login" className="inline">
                        {isEn ? "Back to sign in" : "Zurück zur Anmeldung"}
                    </AuthTextLink>
                </AuthFormFooter>
            </form>
        </ResetPasswordContent>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordLoading />}>
            <ResetPasswordInner />
        </Suspense>
    );
}

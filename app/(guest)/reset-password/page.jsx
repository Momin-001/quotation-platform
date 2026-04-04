"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import BreadCrumb from "@/components/user/BreadCrumb";
import { useLanguage } from "@/context/LanguageContext";
import { Spinner } from "@/components/ui/spinner";

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

function ResetPasswordShell({ title, children }) {
    const { language } = useLanguage();
    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title={language === "en" ? "Reset password" : "Passwort zurücksetzen"}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Reset password" : "Passwort zurücksetzen" },
                ]}
            />
            <main className="grow relative">
                <div className="absolute inset-0 z-0">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: "url('/placeholder-bg.jpg')" }}
                    />
                </div>
                <div className="relative z-10 container mx-auto px-4 py-16 flex justify-center">
                    <Card className="w-full max-w-lg shadow-xl border-none px-6 py-10 bg-white dark:bg-card">
                        <CardHeader>
                            <CardTitle className="text-xl font-medium">{title}</CardTitle>
                        </CardHeader>
                        <CardContent>{children}</CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

function ResetPasswordLoading() {
    return (
        <ResetPasswordShell title="Reset password">
            <div className="flex flex-col items-center justify-center gap-3 py-8">
                <Spinner className="h-8 w-8" />
                <p className="text-sm text-muted-foreground">Checking your link…</p>
            </div>
        </ResetPasswordShell>
    );
}

function ResetPasswordInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
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
                if (json.success) {
                    setStatus("ready");
                } else {
                    setStatus("invalid");
                }
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
            toast.success(response.message || "Password updated");
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
            <ResetPasswordShell title="Link not valid">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Button asChild className="w-full" size="lg">
                        <Link href="/forgot-password">Request a new link</Link>
                    </Button>
                    <div className="text-center text-sm">
                        <Link href="/login" className="font-bold hover:underline">
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </ResetPasswordShell>
        );
    }

    return (
        <ResetPasswordShell title="Set a new password">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium">
                        New password<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Input
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            placeholder="New password"
                            className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">
                        Confirm password<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Input
                            {...register("confirmPassword")}
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm password"
                            className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 mt-4"
                    disabled={loading}
                >
                    {loading ? "Saving…" : "Update password"}
                </Button>

                <div className="text-center text-sm mt-4">
                    <Link href="/login" className="font-bold hover:underline">
                        Back to sign in
                    </Link>
                </div>
            </form>
        </ResetPasswordShell>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordLoading />}>
            <ResetPasswordInner />
        </Suspense>
    );
}

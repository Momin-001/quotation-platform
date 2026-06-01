"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
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

function ResetPasswordContent({ title, description, children }) {
    const t = useTranslations("Auth.resetPassword");
    const tCommon = useTranslations("Common");

    return (
        <AuthPageShell
            breadcrumbTitle={t("breadcrumb")}
            breadcrumbs={[
                { label: tCommon("home"), href: "/" },
                { label: t("breadcrumb") },
            ]}
            title={title}
            description={description}
        >
            {children}
        </AuthPageShell>
    );
}

function ResetPasswordLoading() {
    const t = useTranslations("Auth.resetPassword");

    return (
        <ResetPasswordContent title={t("title")} description={t("loadingDescription")}>
            <div className="flex flex-col items-center justify-center gap-3 py-10">
                <Spinner className="h-6 w-6 text-primary" />
                <p className="text-sm text-muted-foreground">{t("checkingLink")}</p>
            </div>
        </ResetPasswordContent>
    );
}

function PasswordField({ id, label, registerProps, error, show, onToggle, placeholder, ariaHide, ariaShow }) {
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
                    aria-label={show ? ariaHide : ariaShow}
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
    const t = useTranslations("Auth.resetPassword");
    const tCommon = useTranslations("Common");
    const tVal = useTranslations("Auth.validation");
    const [status, setStatus] = useState("loading");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const formSchema = useMemo(
        () =>
            z
                .object({
                    password: z
                        .string()
                        .min(8, tVal("passwordMin"))
                        .regex(PASSWORD_RULE, tVal("passwordRule")),
                    confirmPassword: z.string().min(1, tVal("confirmPasswordRequired")),
                })
                .refine((data) => data.password === data.confirmPassword, {
                    message: tVal("passwordsMismatch"),
                    path: ["confirmPassword"],
                }),
        [tVal],
    );

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
                throw new Error(response.message || t("failed"));
            }
            toast.success(response.message || t("success"));
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
            <ResetPasswordContent title={t("invalidTitle")} description={t("invalidDescription")}>
                <div className="space-y-4">
                    <Button asChild size="lg" className="w-full">
                        <Link href="/forgot-password">{t("requestNewLink")}</Link>
                    </Button>
                    <AuthFormFooter>
                        <AuthTextLink href="/login" className="inline">
                            {t("backToSignIn")}
                        </AuthTextLink>
                    </AuthFormFooter>
                </div>
            </ResetPasswordContent>
        );
    }

    return (
        <ResetPasswordContent title={t("setPasswordTitle")} description={t("setPasswordDescription")}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <PasswordField
                    id="password"
                    label={t("newPassword")}
                    registerProps={register("password")}
                    error={errors.password?.message}
                    show={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                    placeholder={t("newPassword")}
                    ariaHide={t("hidePassword")}
                    ariaShow={t("showPassword")}
                />

                <PasswordField
                    id="confirmPassword"
                    label={t("confirmPassword")}
                    registerProps={register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                    show={showConfirm}
                    onToggle={() => setShowConfirm(!showConfirm)}
                    placeholder={t("confirmPassword")}
                    ariaHide={t("hidePassword")}
                    ariaShow={t("showPassword")}
                />

                <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
                    {loading ? t("submitting") : t("submit")}
                </Button>

                <AuthFormFooter>
                    <AuthTextLink href="/login" className="inline">
                        {t("backToSignIn")}
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

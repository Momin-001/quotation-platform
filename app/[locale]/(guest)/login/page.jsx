"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReCAPTCHA from "react-google-recaptcha";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
    AuthPageShell,
    AuthField,
    AuthTextLink,
    AuthFormFooter,
    authInputClass,
    authInputErrorClass,
} from "@/components/guest/AuthPageShell";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const t = useTranslations("Auth.login");
    const tCommon = useTranslations("Common");
    const tVal = useTranslations("Auth.validation");
    const [captchaVal, setCaptchaVal] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const formSchema = useMemo(
        () =>
            z.object({
                email: z.string().email(tVal("invalidEmail")),
                password: z.string().min(6, tVal("passwordRequired")),
                remember: z.boolean().optional(),
            }),
        [tVal],
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data) => {
        if (!captchaVal) {
            toast.error(tCommon("captchaRequired"));
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || t("failed"));
            }
            login(response.data);
            toast.success(response.message || t("success"));
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPageShell
            breadcrumbTitle={t("breadcrumb")}
            breadcrumbs={[
                { label: tCommon("home"), href: "/" },
                { label: t("breadcrumb") },
            ]}
            title={t("title")}
            description={t("description")}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <AuthField
                    label={tCommon("emailLabel")}
                    htmlFor="email"
                    required
                    error={errors.email?.message}
                >
                    <Input
                        id="email"
                        {...register("email")}
                        type="email"
                        placeholder={tCommon("emailPlaceholder")}
                        className={cn(authInputClass, errors.email && authInputErrorClass)}
                    />
                </AuthField>

                <AuthField
                    label={t("password")}
                    htmlFor="password"
                    required
                    error={errors.password?.message}
                >
                    <div className="relative">
                        <Input
                            id="password"
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            placeholder={t("passwordPlaceholder")}
                            className={cn(
                                authInputClass,
                                "pr-10",
                                errors.password && authInputErrorClass,
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showPassword ? tCommon("hidePassword") : tCommon("showPassword")}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </AuthField>

                <div className="flex justify-end">
                    <AuthTextLink href="/forgot-password">{t("forgotPassword")}</AuthTextLink>
                </div>

                <div className="pt-1 overflow-x-auto">
                    <ReCAPTCHA
                        sitekey={NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "your-site-key"}
                        onChange={setCaptchaVal}
                    />
                </div>

                <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
                    {loading ? t("submitting") : t("submit")}
                </Button>

                <AuthFormFooter>
                    {t("noAccount")}
                    <AuthTextLink href="/register" className="inline">
                        {t("signUp")}
                    </AuthTextLink>
                </AuthFormFooter>
            </form>
        </AuthPageShell>
    );
}

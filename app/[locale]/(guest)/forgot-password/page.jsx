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

export default function ForgotPasswordPage() {
    const t = useTranslations("Auth.forgotPassword");
    const tCommon = useTranslations("Common");
    const tVal = useTranslations("Auth.validation");
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);

    const formSchema = useMemo(
        () =>
            z.object({
                email: z.string().email(tVal("invalidEmail")),
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
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email }),
            });
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || t("failed"));
            }
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
                    <AuthTextLink href="/login" className="inline">
                        {t("backToSignIn")}
                    </AuthTextLink>
                </AuthFormFooter>
            </form>
        </AuthPageShell>
    );
}

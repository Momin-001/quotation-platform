"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import {
    AuthPageShell,
    AuthField,
    AuthTextLink,
    AuthFormFooter,
    authInputClass,
    authInputErrorClass,
} from "@/components/guest/AuthPageShell";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    email: z.string().email("Invalid email"),
});

export default function ForgotPasswordPage() {
    const { language } = useLanguage();
    const isEn = language === "en";
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data) => {
        if (!captchaVal) {
            toast.error(isEn ? "Please complete the captcha" : "Bitte lösen Sie das Captcha");
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
                throw new Error(response.message || "Request failed");
            }
            toast.success(
                response.message ||
                    (isEn ? "Check your email for next steps." : "Prüfen Sie Ihre E-Mail für die nächsten Schritte.")
            );
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPageShell
            breadcrumbTitle={isEn ? "Forgot password" : "Passwort vergessen"}
            breadcrumbs={[
                { label: isEn ? "Home" : "Startseite", href: "/" },
                { label: isEn ? "Forgot password" : "Passwort vergessen" },
            ]}
            title={isEn ? "Reset your password" : "Passwort zurücksetzen"}
            description={
                isEn
                    ? "Enter the email address for your account."
                    : "Geben Sie die E-Mail-Adresse Ihres Kontos ein."
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <AuthField
                    label={isEn ? "Email address" : "E-Mail-Adresse"}
                    htmlFor="email"
                    required
                    error={errors.email?.message}
                >
                    <Input
                        id="email"
                        {...register("email")}
                        type="email"
                        placeholder={isEn ? "you@company.com" : "ihre@firma.de"}
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
                    {loading
                        ? isEn
                            ? "Sending…"
                            : "Wird gesendet…"
                        : isEn
                          ? "Send reset link"
                          : "Link senden"}
                </Button>

                <AuthFormFooter>
                    <AuthTextLink href="/login" className="inline">
                        {isEn ? "Back to sign in" : "Zurück zur Anmeldung"}
                    </AuthTextLink>
                </AuthFormFooter>
            </form>
        </AuthPageShell>
    );
}

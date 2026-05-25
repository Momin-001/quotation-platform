"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
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
    password: z.string().min(6, "Password is required"),
    remember: z.boolean().optional(),
});

export default function LoginPage() {
    const { language } = useLanguage();
    const isEn = language === "en";
    const [captchaVal, setCaptchaVal] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

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
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Login failed");
            }
            login(response.data);
            toast.success(response.message || (isEn ? "Login successful!" : "Anmeldung erfolgreich!"));
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPageShell
            breadcrumbTitle={isEn ? "Login" : "Anmelden"}
            breadcrumbs={[
                { label: isEn ? "Home" : "Startseite", href: "/" },
                { label: isEn ? "Login" : "Anmelden" },
            ]}
            title={isEn ? "Sign in" : "Anmelden"}
            description={
                isEn
                    ? "Access your account to manage enquiries, quotations, and orders."
                    : "Melden Sie sich an, um Anfragen, Angebote und Bestellungen zu verwalten."
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

                <AuthField
                    label={isEn ? "Password" : "Passwort"}
                    htmlFor="password"
                    required
                    error={errors.password?.message}
                >
                    <div className="relative">
                        <Input
                            id="password"
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            placeholder={isEn ? "Your password" : "Ihr Passwort"}
                            className={cn(
                                authInputClass,
                                "pr-10",
                                errors.password && authInputErrorClass
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </AuthField>

                <div className="flex justify-end">
                    <AuthTextLink href="/forgot-password">
                        {isEn ? "Forgot password?" : "Passwort vergessen?"}
                    </AuthTextLink>
                </div>

                <div className="pt-1 overflow-x-auto">
                    <ReCAPTCHA
                        sitekey={NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "your-site-key"}
                        onChange={setCaptchaVal}
                    />
                </div>

                <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
                    {loading
                        ? isEn
                            ? "Signing in…"
                            : "Wird angemeldet…"
                        : isEn
                          ? "Sign in"
                          : "Anmelden"}
                </Button>

                <AuthFormFooter>
                    {isEn ? "Don't have an account? " : "Noch kein Konto? "}
                    <AuthTextLink href="/register" className="inline">
                        {isEn ? "Sign up" : "Registrieren"}
                    </AuthTextLink>
                </AuthFormFooter>
            </form>
        </AuthPageShell>
    );
}

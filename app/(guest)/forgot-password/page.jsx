"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { toast } from "sonner";
import BreadCrumb from "@/components/user/BreadCrumb";
import { useLanguage } from "@/context/LanguageContext";

const formSchema = z.object({
    email: z.string().email("Invalid email"),
});

export default function ForgotPasswordPage() {
    const { language } = useLanguage();
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
            toast.error("Please complete the captcha");
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
            toast.success(response.message || "Check your email for next steps.");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title={language === "en" ? "Forgot password" : "Passwort vergessen"}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Forgot password" : "Passwort vergessen" },
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
                            <CardTitle className="text-xl font-medium">Forgot password</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Enter the email address for your account. If it is registered, we will send you a link
                                to reset your password.
                            </p>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Email<span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        {...register("email")}
                                        type="email"
                                        placeholder="Email"
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <ReCAPTCHA
                                        sitekey={NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "your-site-key"}
                                        onChange={setCaptchaVal}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-primary hover:bg-primary/90 mt-4"
                                    disabled={loading}
                                >
                                    {loading ? "Sending…" : "Send reset link"}
                                </Button>

                                <div className="text-center text-sm mt-4">
                                    <Link href="/login" className="font-bold hover:underline">
                                        Back to sign in
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { toast } from "sonner";
import BreadCrumb from "@/components/user/BreadCrumb";
import { useLanguage } from "@/context/LanguageContext";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    subject: z.string().min(3, "Subject is too short").max(200, "Subject is too long"),
    message: z.string().min(10, "Please enter a longer message").max(10000, "Message is too long"),
});

export default function ContactPage() {
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);
    const { language } = useLanguage();

    const {
        register,
        handleSubmit,
        reset,
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
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to send message");
            }
            toast.success(response.message || "Message sent successfully!");
            reset();
            setCaptchaVal(null);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title={language === "en" ? "Contact Us" : "Kontakt"}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Contact Us" : "Kontakt" },
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
                            <CardTitle className="text-xl font-medium">
                                {language === "en" ? "Contact Us" : "Kontakt"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <Label>
                                        Full Name
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        {...register("name")}
                                        placeholder="Your name"
                                        className={errors.name ? "border-red-500" : ""}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label>
                                        Full Email
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        {...register("email")}
                                        type="email"
                                        placeholder="email@example.com"
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label>
                                        Subject
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        {...register("subject")}
                                        placeholder="Subject"
                                        className={errors.subject ? "border-red-500" : ""}
                                    />
                                    {errors.subject && (
                                        <p className="text-xs text-red-500">{errors.subject.message}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label>
                                        Message
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        {...register("message")}
                                        placeholder="Your message"
                                        rows={6}
                                        className={errors.message ? "border-red-500 min-h-[140px]" : "min-h-[140px]"}
                                    />
                                    {errors.message && (
                                        <p className="text-xs text-red-500">{errors.message.message}</p>
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
                                    {loading
                                        ?  "Sending..."
                                        : "Send message"
                                        }
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

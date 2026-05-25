"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import {
    AuthPageShell,
    AuthField,
    authInputClass,
    authInputErrorClass,
    authTextareaClass,
} from "@/components/guest/AuthPageShell";

const formSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    subject: z.string().min(3, "Subject is too short").max(200, "Subject is too long"),
    message: z.string().min(10, "Please enter a longer message").max(10000, "Message is too long"),
});

export default function ContactPage() {
    const { language } = useLanguage();
    const isEn = language === "en";
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);

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
            toast.error(isEn ? "Please complete the captcha" : "Bitte lösen Sie das Captcha");
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
                throw new Error(response.message || (isEn ? "Failed to send message" : "Nachricht konnte nicht gesendet werden"));
            }
            toast.success(
                response.message ||
                    (isEn ? "Message sent successfully!" : "Nachricht erfolgreich gesendet!")
            );
            reset();
            setCaptchaVal(null);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPageShell
            breadcrumbTitle={isEn ? "Contact us" : "Kontakt"}
            breadcrumbs={[
                { label: isEn ? "Home" : "Startseite", href: "/" },
                { label: isEn ? "Contact us" : "Kontakt" },
            ]}
            title={isEn ? "Get in touch" : "Kontakt aufnehmen"}
            description={
                isEn
                    ? "Send us your question or project details — our team will respond as soon as possible."
                    : "Senden Sie uns Ihre Frage oder Projektdetails — unser Team meldet sich schnellstmöglich."
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <AuthField
                    label={isEn ? "Full name" : "Vollständiger Name"}
                    htmlFor="name"
                    required
                    error={errors.name?.message}
                >
                    <Input
                        id="name"
                        {...register("name")}
                        placeholder={isEn ? "Your name" : "Ihr Name"}
                        className={cn(authInputClass, errors.name && authInputErrorClass)}
                    />
                </AuthField>

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
                    label={isEn ? "Subject" : "Betreff"}
                    htmlFor="subject"
                    required
                    error={errors.subject?.message}
                >
                    <Input
                        id="subject"
                        {...register("subject")}
                        placeholder={isEn ? "How can we help?" : "Worum geht es?"}
                        className={cn(authInputClass, errors.subject && authInputErrorClass)}
                    />
                </AuthField>

                <AuthField
                    label={isEn ? "Message" : "Nachricht"}
                    htmlFor="message"
                    required
                    error={errors.message?.message}
                >
                    <Textarea
                        id="message"
                        {...register("message")}
                        placeholder={isEn ? "Your message" : "Ihre Nachricht"}
                        rows={6}
                        className={cn(authTextareaClass, errors.message && authInputErrorClass)}
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
                          ? "Send message"
                          : "Nachricht senden"}
                </Button>
            </form>
        </AuthPageShell>
    );
}

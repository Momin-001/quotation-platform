"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReCAPTCHA from "react-google-recaptcha";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    AuthPageShell,
    AuthField,
    authInputClass,
    authInputErrorClass,
    authTextareaClass,
} from "@/components/guest/AuthPageShell";

export default function ContactPage() {
    const t = useTranslations("Contact");
    const tCommon = useTranslations("Common");
    const tVal = useTranslations("Contact.validation");
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);

    const formSchema = useMemo(
        () =>
            z.object({
                name: z.string().min(2, tVal("nameTooShort")),
                email: z.string().email(tVal("invalidEmail")),
                subject: z
                    .string()
                    .min(3, tVal("subjectTooShort"))
                    .max(200, tVal("subjectTooLong")),
                message: z
                    .string()
                    .min(10, tVal("messageTooShort"))
                    .max(10000, tVal("messageTooLong")),
            }),
        [tVal],
    );

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
            toast.error(tCommon("captchaRequired"));
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
                throw new Error(response.message || t("failed"));
            }
            toast.success(response.message || t("success"));
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
                    label={t("fullName")}
                    htmlFor="name"
                    required
                    error={errors.name?.message}
                >
                    <Input
                        id="name"
                        {...register("name")}
                        placeholder={t("namePlaceholder")}
                        className={cn(authInputClass, errors.name && authInputErrorClass)}
                    />
                </AuthField>

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
                    label={t("subject")}
                    htmlFor="subject"
                    required
                    error={errors.subject?.message}
                >
                    <Input
                        id="subject"
                        {...register("subject")}
                        placeholder={t("subjectPlaceholder")}
                        className={cn(authInputClass, errors.subject && authInputErrorClass)}
                    />
                </AuthField>

                <AuthField
                    label={t("message")}
                    htmlFor="message"
                    required
                    error={errors.message?.message}
                >
                    <Textarea
                        id="message"
                        {...register("message")}
                        placeholder={t("messagePlaceholder")}
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
                    {loading ? t("submitting") : t("submit")}
                </Button>
            </form>
        </AuthPageShell>
    );
}

"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { toast } from "sonner";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useFooter } from "@/context/FooterContext";
import {
    AuthPageShell,
    AuthField,
    AuthTextLink,
    AuthFormFooter,
    authInputClass,
    authInputErrorClass,
} from "@/components/guest/AuthPageShell";

const EXPERTISE_OPTIONS = {
    en: [
        "Advertising technology / Signage",
        "AV system integration / Media technology",
        "Digital signage integration",
        "Event / Rental technology",
        "IT / Infrastructure integration",
        "Architecture / Planning",
        "Technical consulting",
        "Bidding / Project planning",
        "Retail / Distribution",
        "Other",
    ],
    de: [
        "Werbetechnik / Beschilderung",
        "AV-Systemintegration / Medientechnik",
        "Digital-Signage-Integration",
        "Event- / Miettechnik",
        "IT- / Infrastrukturintegration",
        "Architektur / Planung",
        "Technische Beratung",
        "Ausschreibung / Projektplanung",
        "Einzelhandel / Distribution",
        "Sonstiges",
    ],
};

const formSchema = z.object({
    name: z.string().min(2, "Full name is required"),
    companyName: z.string().min(2, "Company / Organization is required"),
    position: z.string().min(2, "Position is required"),
    website: z.string().url("Invalid website URL"),
    email: z.string().email("Invalid email"),
    number: z
        .string()
        .min(1, "Phone number is required")
        .refine((val) => isValidPhoneNumber(val), {
            message: "Please enter a valid phone number",
        }),
    expertise: z.array(z.string()).min(1, "Select at least one option"),
    accepted: z.boolean().refine((val) => val === true, "You must accept the privacy policy and terms"),
});

export default function BecomePartnersSubmitPage() {
    const { language } = useLanguage();
    const isEn = language === "en";
    const { privacyPolicyPdfUrl } = useFooter();
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);

    const expertiseOptions = EXPERTISE_OPTIONS[isEn ? "en" : "de"];

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            companyName: "",
            position: "",
            website: "",
            email: "",
            number: "",
            expertise: [],
            accepted: false,
        },
    });

    const onSubmit = async (data) => {
        if (!captchaVal) {
            toast.error(isEn ? "Please complete the captcha" : "Bitte lösen Sie das Captcha");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/become-partners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const response = await res.json();

            if (!response.success) {
                throw new Error(
                    response.message ||
                        (isEn ? "Failed to submit application" : "Bewerbung konnte nicht gesendet werden")
                );
            }
            toast.success(
                response.message ||
                    (isEn ? "Application submitted successfully!" : "Bewerbung erfolgreich gesendet!")
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
            breadcrumbTitle={isEn ? "Become a partner" : "Partner werden"}
            breadcrumbs={[
                { label: isEn ? "Home" : "Startseite", href: "/" },
                { label: isEn ? "Become a partner" : "Partner werden", href: "/become-partner" },
                { label: isEn ? "Application" : "Bewerbung" },
            ]}
            title={isEn ? "Partner application" : "Partnerbewerbung"}
            description={
                isEn
                    ? "Tell us about your company and expertise. Our team will review your application and get back to you."
                    : "Erzählen Sie uns von Ihrem Unternehmen und Ihrer Expertise. Unser Team prüft Ihre Bewerbung und meldet sich bei Ihnen."
            }
            maxWidth="max-w-2xl"
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
                        placeholder={isEn ? "Full name" : "Name"}
                        className={cn(authInputClass, errors.name && authInputErrorClass)}
                    />
                </AuthField>

                <AuthField
                    label={isEn ? "Company / organization" : "Firma / Organisation"}
                    htmlFor="companyName"
                    required
                    error={errors.companyName?.message}
                >
                    <Input
                        id="companyName"
                        {...register("companyName")}
                        placeholder={isEn ? "Company / organization" : "Firma / Organisation"}
                        className={cn(authInputClass, errors.companyName && authInputErrorClass)}
                    />
                </AuthField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AuthField
                        label={isEn ? "Position at company" : "Position im Unternehmen"}
                        htmlFor="position"
                        required
                        error={errors.position?.message}
                    >
                        <Input
                            id="position"
                            {...register("position")}
                            placeholder={isEn ? "Position" : "Position"}
                            className={cn(authInputClass, errors.position && authInputErrorClass)}
                        />
                    </AuthField>

                    <AuthField
                        label={isEn ? "Website" : "Website"}
                        htmlFor="website"
                        required
                        error={errors.website?.message}
                    >
                        <Input
                            id="website"
                            {...register("website")}
                            placeholder="https://example.com"
                            className={cn(authInputClass, errors.website && authInputErrorClass)}
                        />
                    </AuthField>
                </div>

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
                    label={isEn ? "Phone number" : "Telefonnummer"}
                    htmlFor="number"
                    required
                    error={errors.number?.message}
                >
                    <div className="phone-input-wrapper">
                        <Controller
                            name="number"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <PhoneInput
                                    placeholder={isEn ? "Phone number" : "Telefonnummer"}
                                    international
                                    defaultCountry="DE"
                                    value={value || ""}
                                    countryCallingCodeEditable={false}
                                    onChange={(val) => onChange(val || "")}
                                    className={cn(
                                        "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        errors.number && authInputErrorClass
                                    )}
                                />
                            )}
                        />
                    </div>
                </AuthField>

                <AuthField
                    label={
                        isEn
                            ? "Area of expertise (multiple selections allowed)"
                            : "Fachgebiet (Mehrfachauswahl möglich)"
                    }
                    required
                    error={errors.expertise?.message}
                >
                    <Controller
                        name="expertise"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                                {expertiseOptions.map((opt, index) => {
                                    const storedValue = EXPERTISE_OPTIONS.en[index];
                                    const checked = Array.isArray(value)
                                        ? value.includes(storedValue)
                                        : false;
                                    return (
                                        <label
                                            key={storedValue}
                                            className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer leading-relaxed"
                                        >
                                            <Checkbox
                                                className="mt-0.5 shrink-0"
                                                checked={checked}
                                                onCheckedChange={(v) => {
                                                    const next = new Set(
                                                        Array.isArray(value) ? value : []
                                                    );
                                                    if (v) next.add(storedValue);
                                                    else next.delete(storedValue);
                                                    onChange(Array.from(next));
                                                }}
                                            />
                                            <span>{opt}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    />
                </AuthField>

                <div className="space-y-1.5 pt-1">
                    <Controller
                        name="accepted"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="accepted"
                                    className="mt-0.5"
                                    checked={!!value}
                                    onCheckedChange={(v) => onChange(!!v)}
                                />
                                <label
                                    htmlFor="accepted"
                                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                                >
                                    {isEn ? "I accept the " : "Ich akzeptiere die "}
                                    <Link
                                        href={privacyPolicyPdfUrl || "#"}
                                        target="_blank"
                                        className={cn(
                                            "font-medium text-primary hover:text-primary/80 underline underline-offset-2",
                                            !privacyPolicyPdfUrl && "pointer-events-none opacity-60"
                                        )}
                                    >
                                        {isEn ? "Privacy Policy" : "Datenschutzerklärung"}
                                    </Link>
                                    {isEn ? " and " : " und die "}
                                    <Link
                                        href="/terms-and-conditions"
                                        target="_blank"
                                        className="font-medium text-primary hover:text-primary/80 underline underline-offset-2"
                                    >
                                        {isEn ? "Terms and Conditions" : "AGB"}
                                    </Link>
                                    .
                                </label>
                            </div>
                        )}
                    />
                    {errors.accepted && (
                        <p className="text-xs text-destructive">{errors.accepted.message}</p>
                    )}
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
                            ? "Submitting…"
                            : "Wird gesendet…"
                        : isEn
                          ? "Submit application"
                          : "Bewerbung senden"}
                </Button>

                <AuthFormFooter>
                    {isEn ? "Back to " : "Zurück zu "}
                    <AuthTextLink href="/become-partner" className="inline">
                        {isEn ? "Become a partner" : "Partner werden"}
                    </AuthTextLink>
                </AuthFormFooter>
            </form>
        </AuthPageShell>
    );
}

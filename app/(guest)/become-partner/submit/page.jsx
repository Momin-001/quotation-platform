"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { toast } from "sonner";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";
import BreadCrumb from "@/components/user/BreadCrumb";
import { useLanguage } from "@/context/LanguageContext";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useFooter } from "@/context/FooterContext";

const EXPERTISE_OPTIONS = [
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
];

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
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);
    const { language } = useLanguage();
    const { privacyPolicyPdfUrl } = useFooter();
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
            toast.error(language === "en" ? "Please complete the captcha" : "Bitte Captcha ausfüllen");
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
                throw new Error(response.message || "Failed to submit application");
            }
            toast.success(response.message || (language === "en" ? "Application submitted successfully!" : "Bewerbung erfolgreich gesendet!"));
            reset();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb title={language === "en" ? "Become a Partner" : "Werden Sie ein Partner"}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Become a Partner" : "Werden Sie ein Partner" }
                ]} />

            <main className="grow relative">
                <div className="absolute inset-0 z-0">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: "url('/placeholder-bg.jpg')" }}
                    ></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 py-16 flex justify-center">
                    <Card className="w-full max-w-2xl shadow-xl border-none px-6 py-10 bg-white dark:bg-card">
                        <CardHeader>
                            <CardTitle className="text-xl font-medium">
                                {language === "en" ? "Partner Application" : "Partnerbewerbung"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <Label>
                                        {language === "en" ? "Full Name" : "Vollständiger Name"}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        {...register("name")}
                                        placeholder={language === "en" ? "Full Name" : "Name"}
                                        className={errors.name ? "border-red-500" : ""}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label>
                                        {language === "en" ? "Company / Organization" : "Firma / Organisation"}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        {...register("companyName")}
                                        placeholder={language === "en" ? "Company / Organization" : "Firma / Organisation"}
                                        className={errors.companyName ? "border-red-500" : ""}
                                    />
                                    {errors.companyName && (
                                        <p className="text-xs text-red-500">{errors.companyName.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>
                                            {language === "en" ? "Position at Company" : "Position im Unternehmen"}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            {...register("position")}
                                            placeholder={language === "en" ? "Position" : "Position"}
                                            className={errors.position ? "border-red-500" : ""}
                                        />
                                        {errors.position && (
                                            <p className="text-xs text-red-500">{errors.position.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <Label>
                                            {language === "en" ? "Website" : "Website"}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            {...register("website")}
                                            placeholder="https://example.com"
                                            className={errors.website ? "border-red-500" : ""}
                                        />
                                        {errors.website && (
                                            <p className="text-xs text-red-500">{errors.website.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label>
                                        {language === "en" ? "Your Email" : "E-Mail"}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        {...register("email")}
                                        type="email"
                                        placeholder={language === "en" ? "Email" : "E-Mail"}
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label>
                                        {language === "en" ? "Phone Number" : "Telefonnummer"}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className={cn("phone-input-wrapper")}>
                                        <Controller
                                            name="number"
                                            control={control}
                                            render={({ field: { onChange, value } }) => (
                                                <PhoneInput
                                                    placeholder="Enter phone number"
                                                    international
                                                    defaultCountry="DE"
                                                    value={value || ""}
                                                    countryCallingCodeEditable={false}
                                                    onChange={(val) => onChange(val || "")}
                                                    className={`flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.number ? "border-red-500" : ""}`}
                                                />
                                            )}
                                        />
                                    </div>
                                    {errors.number && (
                                        <p className="text-xs text-red-500">{errors.number.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Label>
                                        {language === "en"
                                            ? "What is your area of expertise? (Multiple selections allowed)"
                                            : "Was ist Ihr Fachgebiet? (Mehrfachauswahl möglich)"}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="expertise"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {EXPERTISE_OPTIONS.map((opt) => {
                                                    const checked = Array.isArray(value) ? value.includes(opt) : false;
                                                    return (
                                                        <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                                                            <Checkbox
                                                                checked={checked}
                                                                onCheckedChange={(v) => {
                                                                    const next = new Set(Array.isArray(value) ? value : []);
                                                                    if (v) next.add(opt);
                                                                    else next.delete(opt);
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
                                    {errors.expertise && (
                                        <p className="text-xs text-red-500">{errors.expertise.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Controller
                                        name="accepted"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <label className="flex items-start gap-2 text-sm cursor-pointer">
                                                <Checkbox checked={!!value} onCheckedChange={(v) => onChange(!!v)} />
                                                <span className="leading-relaxed">
                                                    {language === "en" ? "I accept the " : "Ich akzeptiere die "}
                                                    <Link
                                                        href={privacyPolicyPdfUrl || "#"}
                                                        target="_blank"
                                                        className={`underline ${privacyPolicyPdfUrl ? "" : "pointer-events-none opacity-60"}`}
                                                    >
                                                        {language === "en" ? "Privacy Policy" : "Datenschutzerklärung"}
                                                    </Link>
                                                    {language === "en" ? " and " : " und die "}
                                                    <Link href="/terms-and-conditions" target="_blank" className="underline">
                                                        {language === "en" ? "Terms and Conditions" : "AGB"}
                                                    </Link>
                                                    .
                                                </span>
                                            </label>
                                        )}
                                    />
                                    {errors.accepted && (
                                        <p className="text-xs text-red-500">{errors.accepted.message}</p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <ReCAPTCHA
                                        sitekey={
                                            NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "your-site-key"
                                        }
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
                                        ? language === "en"
                                            ? "Submitting..."
                                            : "Wird gesendet..."
                                        : language === "en"
                                            ? "Submit Application"
                                            : "Bewerbung senden"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}


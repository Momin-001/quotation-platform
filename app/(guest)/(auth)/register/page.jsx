"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useFooter } from "@/context/FooterContext";
import {
    AuthPageShell,
    AuthField,
    AuthTextLink,
    AuthFormFooter,
    authInputClass,
    authInputErrorClass,
} from "@/components/guest/AuthPageShell";

const formSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    companyName: z.string().min(2, "Company name is too short"),
    companyAddress: z.string().min(3, "Company address is too short"),
    email: z.string().email("Invalid email"),
    phoneNumber: z
        .string()
        .min(1, "Phone number is required")
        .refine((val) => isValidPhoneNumber(val), {
            message: "Please enter a valid phone number",
        }),
    commercialRegisterNumber: z.string().optional(),
    privacyAccepted: z.boolean().refine((val) => val === true, "You must accept the privacy policy"),
});

export default function RegisterPage() {
    const { language } = useLanguage();
    const isEn = language === "en";
    const { privacyPolicyPdfUrl } = useFooter();
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const {
        register,
        handleSubmit,
        setValue,
        control,
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
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Registration failed");
            }
            setSuccess(true);
            reset();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={success} onOpenChange={setSuccess}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className=" text-lg">
                            {isEn ? "Registration successful" : "Registrierung erfolgreich"}
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed">
                            {isEn
                                ? "Thank you for registering! Your account is pending admin approval. You will receive an email once approved, with instructions to sign in."
                                : "Vielen Dank für Ihre Registrierung! Ihr Konto wartet auf die Freigabe durch einen Administrator. Sie erhalten eine E-Mail, sobald Ihr Konto freigeschaltet wurde."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setSuccess(false)}>{isEn ? "OK" : "OK"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AuthPageShell
                breadcrumbTitle={isEn ? "Register" : "Registrieren"}
                breadcrumbs={[
                    { label: isEn ? "Home" : "Startseite", href: "/" },
                    { label: isEn ? "Register" : "Registrieren" },
                ]}
                title={isEn ? "Create your business account" : "Geschäftskonto erstellen"}
                description={
                    isEn
                        ? "Register to access full product specifications, quotations, and partner features."
                        : "Registrieren Sie sich für vollständige Produktspezifikationen, Angebote und Partnerfunktionen."
                }
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AuthField
                            label={isEn ? "Full name" : "Vollständiger Name"}
                            htmlFor="fullName"
                            required
                            error={errors.fullName?.message}
                        >
                            <Input
                                id="fullName"
                                {...register("fullName")}
                                placeholder={isEn ? "Full name" : "Name"}
                                className={cn(authInputClass, errors.fullName && authInputErrorClass)}
                            />
                        </AuthField>

                        <AuthField
                            label={isEn ? "Company name" : "Firmenname"}
                            htmlFor="companyName"
                            required
                            error={errors.companyName?.message}
                        >
                            <Input
                                id="companyName"
                                {...register("companyName")}
                                placeholder={isEn ? "Company" : "Firma"}
                                className={cn(authInputClass, errors.companyName && authInputErrorClass)}
                            />
                        </AuthField>
                    </div>

                    <AuthField
                        label={isEn ? "Company address" : "Firmenadresse"}
                        htmlFor="companyAddress"
                        required
                        error={errors.companyAddress?.message}
                    >
                        <Input
                            id="companyAddress"
                            {...register("companyAddress")}
                            placeholder={isEn ? "Street, city, country" : "Straße, Ort, Land"}
                            className={cn(authInputClass, errors.companyAddress && authInputErrorClass)}
                        />
                    </AuthField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            htmlFor="phoneNumber"
                            required
                            error={errors.phoneNumber?.message}
                        >
                            <div className="phone-input-wrapper">
                                <Controller
                                    name="phoneNumber"
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
                                                errors.phoneNumber && authInputErrorClass
                                            )}
                                        />
                                    )}
                                />
                            </div>
                        </AuthField>
                    </div>

                    <AuthField
                        label={isEn ? "Commercial register number" : "Handelsregisternummer"}
                        htmlFor="commercialRegisterNumber"
                    >
                        <Input
                            id="commercialRegisterNumber"
                            {...register("commercialRegisterNumber")}
                            placeholder={isEn ? "Optional" : "Optional"}
                            className={authInputClass}
                        />
                    </AuthField>

                    <div className="space-y-1.5 pt-1">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="privacyAccepted"
                                className="mt-0.5"
                                onCheckedChange={(checked) => setValue("privacyAccepted", checked)}
                            />
                            <label
                                htmlFor="privacyAccepted"
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
                                .
                            </label>
                        </div>
                        {errors.privacyAccepted && (
                            <p className="text-xs text-destructive">{errors.privacyAccepted.message}</p>
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
                                ? "Signing up…"
                                : "Wird registriert…"
                            : isEn
                              ? "Create account"
                              : "Konto erstellen"}
                    </Button>

                    <AuthFormFooter>
                        {isEn ? "Already registered? " : "Bereits registriert? "}
                        <AuthTextLink href="/login" className="inline">
                            {isEn ? "Sign in" : "Anmelden"}
                        </AuthTextLink>
                    </AuthFormFooter>
                </form>
            </AuthPageShell>
        </>
    );
}

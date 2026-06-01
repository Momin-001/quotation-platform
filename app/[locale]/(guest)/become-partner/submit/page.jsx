"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ReCAPTCHA from "react-google-recaptcha";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { toast } from "sonner";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";
import { useFooter } from "@/context/FooterContext";
import {
    AuthPageShell,
    AuthField,
    AuthTextLink,
    AuthFormFooter,
    authInputClass,
    authInputErrorClass,
} from "@/components/guest/AuthPageShell";

export default function BecomePartnersSubmitPage() {
    const t = useTranslations("BecomePartnerSubmit");
    const tVal = useTranslations("BecomePartnerSubmit.validation");
    const tCommon = useTranslations("Common");
    const { privacyPolicyPdfUrl } = useFooter();
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);

    const expertiseOptions = t.raw("expertiseOptions");
    const expertiseValues = t.raw("expertiseValues");

    const formSchema = useMemo(
        () =>
            z.object({
                name: z.string().min(2, tVal("nameRequired")),
                companyName: z.string().min(2, tVal("companyRequired")),
                position: z.string().min(2, tVal("positionRequired")),
                website: z.string().url(tVal("websiteInvalid")),
                email: z.string().email(tVal("emailInvalid")),
                number: z
                    .string()
                    .min(1, tVal("phoneRequired"))
                    .refine((val) => isValidPhoneNumber(val), {
                        message: tVal("phoneInvalid"),
                    }),
                expertise: z.array(z.string()).min(1, tVal("expertiseRequired")),
                accepted: z.boolean().refine((val) => val === true, tVal("acceptedRequired")),
            }),
        [tVal]
    );

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
            toast.error(tCommon("captchaRequired"));
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
                throw new Error(response.message || t("submitFailed"));
            }
            toast.success(response.message || t("submitSuccess"));
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
            breadcrumbTitle={t("breadcrumbTitle")}
            breadcrumbs={[
                { label: t("breadcrumbHome"), href: "/" },
                { label: t("breadcrumbPartner"), href: "/become-partner" },
                { label: t("breadcrumbApplication") },
            ]}
            title={t("title")}
            description={t("description")}
            maxWidth="max-w-2xl"
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
                        placeholder={t("fullNamePlaceholder")}
                        className={cn(authInputClass, errors.name && authInputErrorClass)}
                    />
                </AuthField>

                <AuthField
                    label={t("company")}
                    htmlFor="companyName"
                    required
                    error={errors.companyName?.message}
                >
                    <Input
                        id="companyName"
                        {...register("companyName")}
                        placeholder={t("companyPlaceholder")}
                        className={cn(authInputClass, errors.companyName && authInputErrorClass)}
                    />
                </AuthField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AuthField
                        label={t("position")}
                        htmlFor="position"
                        required
                        error={errors.position?.message}
                    >
                        <Input
                            id="position"
                            {...register("position")}
                            placeholder={t("positionPlaceholder")}
                            className={cn(authInputClass, errors.position && authInputErrorClass)}
                        />
                    </AuthField>

                    <AuthField
                        label={t("website")}
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
                    label={t("email")}
                    htmlFor="email"
                    required
                    error={errors.email?.message}
                >
                    <Input
                        id="email"
                        {...register("email")}
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className={cn(authInputClass, errors.email && authInputErrorClass)}
                    />
                </AuthField>

                <AuthField
                    label={t("phone")}
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
                                    placeholder={t("phonePlaceholder")}
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

                <AuthField label={t("expertiseLabel")} required error={errors.expertise?.message}>
                    <Controller
                        name="expertise"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                                {expertiseOptions.map((opt, index) => {
                                    const storedValue = expertiseValues[index];
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
                                    {t("privacyPrefix")}
                                    <Link
                                        href={privacyPolicyPdfUrl || "#"}
                                        target="_blank"
                                        className={cn(
                                            "font-medium text-primary hover:text-primary/80 underline underline-offset-2",
                                            !privacyPolicyPdfUrl && "pointer-events-none opacity-60"
                                        )}
                                    >
                                        {tCommon("privacyPolicy")}
                                    </Link>
                                    {t("privacyAnd")}
                                    <Link
                                        href="/terms-and-conditions"
                                        target="_blank"
                                        className="font-medium text-primary hover:text-primary/80 underline underline-offset-2"
                                    >
                                        {t("termsConditions")}
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
                    {loading ? t("submitting") : t("submit")}
                </Button>

                <AuthFormFooter>
                    {t("backPrefix")}
                    <AuthTextLink href="/become-partner" className="inline">
                        {t("backLink")}
                    </AuthTextLink>
                </AuthFormFooter>
            </form>
        </AuthPageShell>
    );
}

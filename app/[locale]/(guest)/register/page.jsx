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
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import ReCAPTCHA from "react-google-recaptcha";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { usePrivacyPolicy } from "@/context/PrivacyPolicyContext";
import {
    AuthPageShell,
    AuthField,
    AuthTextLink,
    AuthFormFooter,
    authInputClass,
    authInputErrorClass,
} from "@/components/guest/AuthPageShell";

export default function RegisterPage() {
    const t = useTranslations("Auth.register");
    const tCommon = useTranslations("Common");
    const tVal = useTranslations("Auth.validation");
    const { privacyPolicyPdfUrl } = usePrivacyPolicy();
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const formSchema = useMemo(
        () =>
            z.object({
                fullName: z.string().min(2, tVal("nameTooShort")),
                companyName: z.string().min(2, tVal("companyNameTooShort")),
                companyAddress: z.string().min(3, tVal("companyAddressTooShort")),
                email: z.string().email(tVal("invalidEmail")),
                phoneNumber: z
                    .string()
                    .min(1, tVal("phoneRequired"))
                    .refine((val) => isValidPhoneNumber(val), {
                        message: tVal("phoneInvalid"),
                    }),
                commercialRegisterNumber: z.string().optional(),
                privacyAccepted: z.boolean().refine((val) => val === true, tVal("privacyRequired")),
            }),
        [tVal],
    );

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
            toast.error(tCommon("captchaRequired"));
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
                throw new Error(response.message || t("failed"));
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
                        <DialogTitle className=" text-lg">{t("successTitle")}</DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed">
                            {t("successDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setSuccess(false)}>{tCommon("ok")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AuthPageShell
                breadcrumbTitle={t("breadcrumb")}
                breadcrumbs={[
                    { label: tCommon("home"), href: "/" },
                    { label: t("breadcrumb") },
                ]}
                title={t("title")}
                description={t("description")}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AuthField
                            label={t("fullName")}
                            htmlFor="fullName"
                            required
                            error={errors.fullName?.message}
                        >
                            <Input
                                id="fullName"
                                {...register("fullName")}
                                placeholder={t("fullNamePlaceholder")}
                                className={cn(authInputClass, errors.fullName && authInputErrorClass)}
                            />
                        </AuthField>

                        <AuthField
                            label={t("companyName")}
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
                    </div>

                    <AuthField
                        label={t("companyAddress")}
                        htmlFor="companyAddress"
                        required
                        error={errors.companyAddress?.message}
                    >
                        <Input
                            id="companyAddress"
                            {...register("companyAddress")}
                            placeholder={t("companyAddressPlaceholder")}
                            className={cn(authInputClass, errors.companyAddress && authInputErrorClass)}
                        />
                    </AuthField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            label={t("phoneNumber")}
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
                                            placeholder={t("phonePlaceholder")}
                                            international
                                            defaultCountry="DE"
                                            value={value || ""}
                                            countryCallingCodeEditable={false}
                                            onChange={(val) => onChange(val || "")}
                                            className={cn(
                                                "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                errors.phoneNumber && authInputErrorClass,
                                            )}
                                        />
                                    )}
                                />
                            </div>
                        </AuthField>
                    </div>

                    <AuthField label={t("commercialRegister")} htmlFor="commercialRegisterNumber">
                        <Input
                            id="commercialRegisterNumber"
                            {...register("commercialRegisterNumber")}
                            placeholder={tCommon("optional")}
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
                                {t("privacyPrefix")}
                                <Link
                                    href={privacyPolicyPdfUrl || "#"}
                                    target="_blank"
                                    className={cn(
                                        "font-medium text-primary hover:text-primary/80 underline underline-offset-2",
                                        !privacyPolicyPdfUrl && "pointer-events-none opacity-60",
                                    )}
                                >
                                    {tCommon("privacyPolicy")}
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
                        {loading ? t("submitting") : t("submit")}
                    </Button>

                    <AuthFormFooter>
                        {t("alreadyRegistered")}
                        <AuthTextLink href="/login" className="inline">
                            {t("signIn")}
                        </AuthTextLink>
                    </AuthFormFooter>
                </form>
            </AuthPageShell>
        </>
    );
}

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
import BreadCrumb from "@/components/BreadCrumb";

const formSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    number: z
        .string()
        .min(1, "Phone number is required")
        .refine((val) => isValidPhoneNumber(val), {
            message: "Please enter a valid phone number",
        }),
});

export default function BecomePartnersPage() {
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        control,
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
            const res = await fetch("/api/become-partners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to submit application");
            }
            toast.success(response.message || "Application submitted successfully!");
            reset();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb title="Become a Partner"
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Become a Partner" }
                ]} />

            <main className="grow relative">
                <div className="absolute inset-0 z-0">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: "url('/placeholder-bg.jpg')" }}
                    ></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 py-16 flex justify-center">
                    <Card className="w-full max-w-lg shadow-xl border-none px-6 py-10 bg-white dark:bg-card">
                        <CardHeader>
                            <CardTitle className="text-xl font-medium">Partner Application</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Full Name<span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        {...register("name")}
                                        placeholder="Full Name"
                                        className={errors.name ? "border-red-500" : ""}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Your Email<span className="text-red-500">*</span>
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

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Phone Number<span className="text-red-500">*</span>
                                    </label>
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
                                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.number ? "border-red-500" : ""}`}
                                                />
                                            )}
                                        />
                                    </div>
                                    {errors.number && (
                                        <p className="text-xs text-red-500">{errors.number.message}</p>
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
                                    {loading ? "Submitting..." : "Submit Application"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}


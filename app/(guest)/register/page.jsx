"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import BreadCrumb from "@/components/user/BreadCrumb";

const formSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    companyName: z.string().min(2, "Company name is too short"),
    email: z.string().email("Invalid email"),
    phoneNumber: z
        .string()
        .min(1, "Phone number is required")
        .refine((val) => isValidPhoneNumber(val), {
            message: "Please enter a valid phone number",
        }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, "You must agree to terms"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function RegisterPage() {
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        control,
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
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Registration failed");
            }
            toast.success(response.message || "Registration successful! Please login.");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header Section */}
            <BreadCrumb title="Register" 
            breadcrumbs={[
                { label: "Home", href: "/" }, 
                { label: "Register" }
                ]} />
            {/* Main Content */}
            <main className="grow relative">
                <div className="absolute inset-0 z-0">
                    <div className="w-full h-full  bg-cover bg-center" style={{ backgroundImage: "url('/placeholder-bg.jpg')" }}></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 py-16 flex justify-center">
                    <Card className="w-full max-w-lg shadow-xl border-none px-6 py-10">
                        <CardHeader>
                            <CardTitle className="text-xl text-center font-medium md:text-left">Create Your Business Account</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Full Name<span className="text-red-500">*</span></label>
                                    <Input {...register("fullName")} placeholder="Full Name" className={errors.fullName ? "border-red-500" : ""} />
                                    {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Company Name<span className="text-red-500">*</span></label>
                                    <Input {...register("companyName")} placeholder="Company" className={errors.companyName ? "border-red-500" : ""} />
                                    {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Your Email<span className="text-red-500">*</span></label>
                                    <Input {...register("email")} type="email" placeholder="Email" className={errors.email ? "border-red-500" : ""} />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Phone Number<span className="text-red-500">*</span></label>
                                    <div className={cn("phone-input-wrapper")}>
                                        <Controller
                                            name="phoneNumber"
                                            control={control}
                                            render={({ field: { onChange, value } }) => (

                                                <PhoneInput
                                                    placeholder="Enter phone number"
                                                    international
                                                    defaultCountry="DE"
                                                    value={value || ""}
                                                    countryCallingCodeEditable={false}
                                                    onChange={(val) => onChange(val || "")}
                                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.phoneNumber ? "border-red-500" : ""}`}
                                                />
                                            )}
                                        />
                                    </div>
                                    {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Your Password<span className="text-red-500">*</span></label>
                                    <Input {...register("password")} type="password" placeholder="Password" className={errors.password ? "border-red-500" : ""} />
                                    {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Confirm Password<span className="text-red-500">*</span></label>
                                    <Input {...register("confirmPassword")} type="password" placeholder="Confirm Password" className={errors.confirmPassword ? "border-red-500" : ""} />
                                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox id="terms" onCheckedChange={(checked) => setValue("terms", checked)} />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        I agree to the Terms & Conditions.
                                    </label>
                                </div>
                                {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

                                <div className="pt-2">
                                    <ReCAPTCHA
                                        sitekey={NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "your-site-key"}
                                        onChange={setCaptchaVal}
                                    />
                                </div>

                                <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 mt-4" disabled={loading}>
                                    {loading ? "Signing Up..." : "Sign Up"}
                                </Button>

                                <div className="text-center text-sm mt-4">
                                    Already registered? <Link href="/login" className="font-bold hover:underline">Sign in</Link>
                                </div>

                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>

           
        </div>
    );
}

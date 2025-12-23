"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { Home, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const formSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password is required"),
    remember: z.boolean().optional(),
});

export default function LoginPage() {
    const [captchaVal, setCaptchaVal] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        setValue,
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
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const resData = await res.json();

            if (resData.success) {
                toast.success("Login successful!");
                login(resData.data);
            } else {
                toast.error(resData.message || "Login failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <Navbar />

            {/* Header Section */}
            <div className="bg-secondary py-4 text-primary-foreground">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <h1 className="text-2xl font-archivo font-medium">Login</h1>
                    <div className="text-sm opacity-90 flex items-center gap-1">
                        <Button variant="ghost" className="border rounded-2xl">
                            <Link href="/" className="hover:underline flex items-center gap-2">
                                <Home size={16} /> Home
                            </Link>{" "}
                            / <span className="font-bold">Login</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
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
                            <CardTitle className="text-xl font-medium">Login</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Full Email<span className="text-red-500">*</span>
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
                                        Your Password<span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            {...register("password")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-red-500">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            onCheckedChange={(checked) => setValue("remember", checked)}
                                        />
                                        <label
                                            htmlFor="remember"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Remember me
                                        </label>
                                    </div>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
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
                                    {loading ? "Signing in..." : "Sign in"}
                                </Button>

                                <div className="text-center text-sm mt-4">
                                    Don't have an account?{" "}
                                    <Link href="/register" className="font-bold hover:underline">
                                        Sign Up
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}

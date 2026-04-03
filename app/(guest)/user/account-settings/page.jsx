"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import BreadCrumb from "@/components/user/BreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

const passwordRule = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;

export default function AccountSettingsPage() {
    const { language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [profile, setProfile] = useState({
        fullName: "",
        companyName: "",
        companyAddress: "",
        email: "",
        phoneNumber: "",
        commercialRegisterNumber: "",
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/account-settings/profile");
                const response = await res.json();
                if (!response.success) throw new Error(response.message);

                setProfile({
                    fullName: response.data.fullName || "",
                    companyName: response.data.companyName || "",
                    companyAddress: response.data.companyAddress || "",
                    email: response.data.email || "",
                    phoneNumber: response.data.phoneNumber || "",
                    commercialRegisterNumber: response.data.commercialRegisterNumber || "",
                });
            } catch (error) {
                toast.error(error.message || "Failed to load account settings");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleProfileChange = (key, value) => {
        setProfile((prev) => ({ ...prev, [key]: value }));
    };

    const handlePasswordChange = (key, value) => {
        setPasswords((prev) => ({ ...prev, [key]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!profile.fullName || !profile.companyName || !profile.companyAddress || !profile.email || !profile.phoneNumber) {
            toast.error("Please fill all required profile fields");
            return;
        }

        setSavingProfile(true);
        try {
            const res = await fetch("/api/user/account-settings/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });

            const response = await res.json();
            if (!response.success) throw new Error(response.message);

            toast.success(response.message || "Profile updated successfully");
        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        const { currentPassword, newPassword, confirmPassword } = passwords;
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill all password fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New password and confirm password do not match");
            return;
        }
        if (!passwordRule.test(newPassword)) {
            toast.error("Password must be 8+ characters with letters and numbers");
            return;
        }

        setSavingPassword(true);
        try {
            const res = await fetch("/api/user/account-settings/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(passwords),
            });

            const response = await res.json();
            if (!response.success) throw new Error(response.message);

            toast.success(response.message || "Password changed successfully");
            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            toast.error(error.message || "Failed to change password");
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb
                title={language === "en" ? "Account Settings" : "Kontoeinstellungen"}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Account Settings" : "Kontoeinstellungen" },
                ]}
            />

            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="profile" className="lg:gap-6">
                    <TabsList>
                        <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white px-6 py-5 font-open-sans font-semibold text-xl">
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-white px-6 py-5 font-open-sans font-semibold text-xl">
                            Security
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 mt-4 lg:mt-0">
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold font-open-sans">Profile Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Full Name *</Label>
                                                <Input
                                                    value={profile.fullName}
                                                    onChange={(e) => handleProfileChange("fullName", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Company Name *</Label>
                                                <Input
                                                    value={profile.companyName}
                                                    onChange={(e) => handleProfileChange("companyName", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Company Address *</Label>
                                            <Input
                                                value={profile.companyAddress}
                                                onChange={(e) => handleProfileChange("companyAddress", e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Email Address *</Label>
                                                <Input
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => handleProfileChange("email", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Phone Number *</Label>
                                                <div className={cn("phone-input-wrapper")}>
                                                    <PhoneInput
                                                        placeholder="Enter phone number"
                                                        international
                                                        defaultCountry="DE"
                                                        value={profile.phoneNumber || ""}
                                                        countryCallingCodeEditable={false}
                                                        onChange={(val) => handleProfileChange("phoneNumber", val || "")}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Commercial Register Number</Label>
                                            <Input
                                                value={profile.commercialRegisterNumber}
                                                onChange={(e) =>
                                                    handleProfileChange("commercialRegisterNumber", e.target.value)
                                                }
                                            />
                                        </div>

                                        <Button type="submit" disabled={savingProfile}>
                                            {savingProfile ? "Saving..." : "Update Profile"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold font-open-sans">Security</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
                                        <div className="space-y-2">
                                            <Label>Current Password *</Label>
                                            <Input
                                                type="password"
                                                value={passwords.currentPassword}
                                                onChange={(e) =>
                                                    handlePasswordChange("currentPassword", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>New Password *</Label>
                                            <Input
                                                type="password"
                                                value={passwords.newPassword}
                                                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Must be at least 8 characters and include letters and numbers.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Confirm Password *</Label>
                                            <Input
                                                type="password"
                                                value={passwords.confirmPassword}
                                                onChange={(e) =>
                                                    handlePasswordChange("confirmPassword", e.target.value)
                                                }
                                            />
                                        </div>

                                        <Button type="submit" disabled={savingPassword}>
                                            {savingPassword ? "Updating..." : "Change Password"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}


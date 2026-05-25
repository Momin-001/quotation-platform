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
import { authInputClass } from "@/components/guest/AuthPageShell";

const passwordRule = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;

function SettingsField({ label, htmlFor, required, children, hint }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={htmlFor}>
                {label}
                {required ? <span className="text-destructive ml-0.5">*</span> : null}
            </Label>
            {children}
            {hint ? (
                <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>
            ) : null}
        </div>
    );
}

export default function AccountSettingsPage() {
    const { language } = useLanguage();
    const isEn = language === "en";
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
                toast.error(
                    error.message ||
                        (isEn ? "Failed to load account settings" : "Kontoeinstellungen konnten nicht geladen werden")
                );
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
        if (
            !profile.fullName ||
            !profile.companyName ||
            !profile.companyAddress ||
            !profile.email ||
            !profile.phoneNumber
        ) {
            toast.error(
                isEn
                    ? "Please fill all required profile fields"
                    : "Bitte füllen Sie alle Pflichtfelder aus"
            );
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

            toast.success(
                response.message ||
                    (isEn ? "Profile updated successfully" : "Profil erfolgreich aktualisiert")
            );
        } catch (error) {
            toast.error(
                error.message ||
                    (isEn ? "Failed to update profile" : "Profil konnte nicht aktualisiert werden")
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        const { currentPassword, newPassword, confirmPassword } = passwords;
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error(
                isEn
                    ? "Please fill all password fields"
                    : "Bitte füllen Sie alle Passwortfelder aus"
            );
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error(
                isEn
                    ? "New password and confirm password do not match"
                    : "Neues Passwort und Bestätigung stimmen nicht überein"
            );
            return;
        }
        if (!passwordRule.test(newPassword)) {
            toast.error(
                isEn
                    ? "Password must be 8+ characters with letters and numbers"
                    : "Passwort: mind. 8 Zeichen mit Buchstaben und Zahlen"
            );
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

            toast.success(
                response.message ||
                    (isEn ? "Password changed successfully" : "Passwort erfolgreich geändert")
            );
            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            toast.error(
                error.message ||
                    (isEn ? "Failed to change password" : "Passwort konnte nicht geändert werden")
            );
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner className="h-6 w-6" />
                    <span className="text-sm">
                        {isEn ? "Loading settings…" : "Einstellungen werden geladen…"}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb
                title={isEn ? "My account" : "Mein Konto"}
                breadcrumbs={[
                    { label: isEn ? "Home" : "Startseite", href: "/" },
                    { label: isEn ? "Account settings" : "Kontoeinstellungen" },
                ]}
            />

            <main className="container mx-auto px-4 lg:px-6 py-6 sm:py-8">
                <Tabs defaultValue="profile">
                    <TabsList className="p-0">
                        <TabsTrigger
                            value="profile"
                            className="flex-1 sm:flex-none text-sm font-medium px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            {isEn ? "Profile" : "Profil"}
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="flex-1 sm:flex-none text-sm font-medium px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            {isEn ? "Security" : "Sicherheit"}
                        </TabsTrigger>
                    </TabsList>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {isEn
                        ? "Update your company profile and account security."
                        : "Aktualisieren Sie Ihr Firmenprofil und die Kontosicherheit."}
                </p>
                    <TabsContent value="profile">
                        <Card className="rounded-xl border border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-foreground">
                                    {isEn ? "Profile information" : "Profilinformationen"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <SettingsField
                                            label={isEn ? "Full name" : "Vollständiger Name"}
                                            htmlFor="fullName"
                                            required
                                        >
                                            <Input
                                                id="fullName"
                                                value={profile.fullName}
                                                onChange={(e) =>
                                                    handleProfileChange("fullName", e.target.value)
                                                }
                                                className={authInputClass}
                                            />
                                        </SettingsField>
                                        <SettingsField
                                            label={isEn ? "Company name" : "Firmenname"}
                                            htmlFor="companyName"
                                            required
                                        >
                                            <Input
                                                id="companyName"
                                                value={profile.companyName}
                                                onChange={(e) =>
                                                    handleProfileChange("companyName", e.target.value)
                                                }
                                                className={authInputClass}
                                            />
                                        </SettingsField>
                                    </div>

                                    <SettingsField
                                        label={isEn ? "Company address" : "Firmenadresse"}
                                        htmlFor="companyAddress"
                                        required
                                    >
                                        <Input
                                            id="companyAddress"
                                            value={profile.companyAddress}
                                            onChange={(e) =>
                                                handleProfileChange("companyAddress", e.target.value)
                                            }
                                            className={authInputClass}
                                        />
                                    </SettingsField>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <SettingsField
                                            label={isEn ? "Email address" : "E-Mail-Adresse"}
                                            htmlFor="email"
                                            required
                                        >
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) =>
                                                    handleProfileChange("email", e.target.value)
                                                }
                                                className={authInputClass}
                                            />
                                        </SettingsField>
                                        <SettingsField
                                            label={isEn ? "Phone number" : "Telefonnummer"}
                                            htmlFor="phone"
                                            required
                                        >
                                            <div className={cn("phone-input-wrapper")}>
                                                <PhoneInput
                                                    id="phone"
                                                    placeholder={
                                                        isEn
                                                            ? "Enter phone number"
                                                            : "Telefonnummer eingeben"
                                                    }
                                                    international
                                                    defaultCountry="DE"
                                                    value={profile.phoneNumber || ""}
                                                    countryCallingCodeEditable={false}
                                                    onChange={(val) =>
                                                        handleProfileChange("phoneNumber", val || "")
                                                    }
                                                    className={cn(
                                                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    )}
                                                />
                                            </div>
                                        </SettingsField>
                                    </div>

                                    <SettingsField
                                        label={
                                            isEn
                                                ? "Commercial register number"
                                                : "Handelsregisternummer"
                                        }
                                        htmlFor="commercialRegister"
                                    >
                                        <Input
                                            id="commercialRegister"
                                            value={profile.commercialRegisterNumber}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "commercialRegisterNumber",
                                                    e.target.value
                                                )
                                            }
                                            className={authInputClass}
                                        />
                                    </SettingsField>

                                    <Button type="submit" disabled={savingProfile} size="default">
                                        {savingProfile ? (
                                            <>
                                                <Spinner className="h-4 w-4 mr-2" />
                                                {isEn ? "Saving…" : "Wird gespeichert…"}
                                            </>
                                        ) : isEn ? (
                                            "Update profile"
                                        ) : (
                                            "Profil aktualisieren"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card className="rounded-xl border border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-foreground">
                                    {isEn ? "Password" : "Passwort"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handlePasswordSubmit}
                                    className="space-y-5 max-w-md"
                                >
                                    <SettingsField
                                        label={isEn ? "Current password" : "Aktuelles Passwort"}
                                        htmlFor="currentPassword"
                                        required
                                    >
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            autoComplete="current-password"
                                            value={passwords.currentPassword}
                                            onChange={(e) =>
                                                handlePasswordChange(
                                                    "currentPassword",
                                                    e.target.value
                                                )
                                            }
                                            className={authInputClass}
                                        />
                                    </SettingsField>

                                    <SettingsField
                                        label={isEn ? "New password" : "Neues Passwort"}
                                        htmlFor="newPassword"
                                        required
                                        hint={
                                            isEn
                                                ? "At least 8 characters with letters and numbers."
                                                : "Mind. 8 Zeichen mit Buchstaben und Zahlen."
                                        }
                                    >
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            value={passwords.newPassword}
                                            onChange={(e) =>
                                                handlePasswordChange("newPassword", e.target.value)
                                            }
                                            className={authInputClass}
                                        />
                                    </SettingsField>

                                    <SettingsField
                                        label={isEn ? "Confirm password" : "Passwort bestätigen"}
                                        htmlFor="confirmPassword"
                                        required
                                    >
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            value={passwords.confirmPassword}
                                            onChange={(e) =>
                                                handlePasswordChange(
                                                    "confirmPassword",
                                                    e.target.value
                                                )
                                            }
                                            className={authInputClass}
                                        />
                                    </SettingsField>

                                    <Button type="submit" disabled={savingPassword} size="default">
                                        {savingPassword ? (
                                            <>
                                                <Spinner className="h-4 w-4 mr-2" />
                                                {isEn ? "Updating…" : "Wird aktualisiert…"}
                                            </>
                                        ) : isEn ? (
                                            "Change password"
                                        ) : (
                                            "Passwort ändern"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

"use client";

import BreadCrumb from "@/components/user/BreadCrumb";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPolicyPage() {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title={language === "en" ? "Privacy Policy" : "Datenschutzerklaerung"}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Privacy Policy" : "Datenschutzerklaerung" },
                ]}
            />

            <main className="container mx-auto px-4 py-10 max-w-4xl">
                <div className="bg-white border rounded-lg p-6 md:p-8 space-y-4">
                    <h1 className="text-2xl font-bold">Privacy Policy</h1>
                    <p>
                        This page describes how we collect, use, and protect personal data shared during registration
                        and usage of the quotation platform.
                    </p>
                    <p>
                        We process your details for account creation, account approval, communication related to your
                        enquiries and quotations, and service improvement.
                    </p>
                    <p>
                        You can contact us to request data access, correction, or deletion according to applicable
                        privacy laws.
                    </p>
                </div>
            </main>
        </div>
    );
}

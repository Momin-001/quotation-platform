"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import BecomePartnerSubmitForm from "@/components/guest/BecomePartner/Form/BecomePartnerSubmitForm";

export default function BecomePartnerInquirySection() {
    const t = useTranslations("BecomePartner.inquiry");
    const benefits = t.raw("benefits");

    return (
        <section
            id="partner-form-section"
            className="w-full bg-gray-50 py-16 md:py-20 lg:py-24 scroll-mt-24"
        >
            <div className="container mx-auto px-4 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-start">
                    <div className="space-y-6 lg:space-y-8 lg:py-4">
                        <div className="space-y-3">
                            <p className="text-sm sm:text-base font-medium text-primary tracking-wide uppercase">
                                {t("overline")}
                            </p>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
                                {t("title")}
                            </h2>
                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                                {t("description")}
                            </p>
                        </div>

                        <ul className="space-y-4">
                            {benefits.map((benefit) => (
                                <li key={benefit} className="flex items-start gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 mt-0.5">
                                        <Check
                                            className="h-3.5 w-3.5 text-primary"
                                            strokeWidth={2.5}
                                        />
                                    </span>
                                    <span className="text-[15px] md:text-base text-foreground leading-relaxed">
                                        {benefit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <BecomePartnerSubmitForm />
                </div>
            </div>
        </section>
    );
}

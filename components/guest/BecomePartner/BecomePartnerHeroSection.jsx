"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const COPY = {
    en: {
        overline: "Become a partner",
        title: "ProLEDALL Partner Program",
        description:
            "Join our global network of partners and access exclusive benefits, support, and business opportunities.",
        tagline: "Save time, eliminate risks, scale projects.",
        primaryButton: "Submit an application",
        secondaryButton: "Partner login",
    },
    de: {
        overline: "Partner werden",
        title: "ProLEDALL Partnerprogramm",
        description:
            "Werden Sie Teil unseres globalen Partnernetzwerks und profitieren Sie von exklusiven Vorteilen, Support und Geschäftsmöglichkeiten.",
        tagline: "Zeit sparen, Risiken ausschließen, Projekte skalieren.",
        primaryButton: "Bewerbung einreichen",
        secondaryButton: "Partner-Login",
    },
};

export default function BecomePartnerHeroSection() {
    const { language } = useLanguage();
    const isEn = language === "en";
    const copy = COPY[isEn ? "en" : "de"];

    return (
        <section className="relative w-full overflow-hidden bg-white">
            <div className="flex flex-col lg:flex-row min-h-[520px] lg:min-h-[640px]">
                <div className="flex-1 flex items-center justify-center lg:justify-end">
                    <div className="w-full lg:max-w-[680px] space-y-6 lg:space-y-8 px-6 sm:px-8 lg:pr-16 lg:pl-8 py-12 lg:py-16">
                        <div className="space-y-3">
                            <p className="text-sm sm:text-base font-medium text-primary tracking-wide uppercase">
                                {copy.overline}
                            </p>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold leading-[1.1] tracking-tight text-foreground">
                                {copy.title}
                            </h1>
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                                {copy.description}
                            </p>
                            <p className="text-muted-foreground text-base sm:text-lg font-semibold leading-relaxed">
                                {copy.tagline}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button asChild size="lg" className="w-full sm:w-auto">
                                <Link href="/become-partner/submit">{copy.primaryButton}</Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border-secondary text-secondary hover:bg-secondary/5"
                            >
                                <Link href="/login">{copy.secondaryButton}</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="relative h-[360px] sm:h-[440px] lg:h-auto w-full lg:w-[50%] shrink-0">
                    <Image
                        src="/become-partner.png"
                        alt={copy.title}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 2048px) 100vw, 50vw"
                    />
                </div>
            </div>
        </section>
    );
}

"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Monitor, MonitorCog, Network, Store, Tag } from "lucide-react";
import Link from "next/link";

const COPY = {
    en: {
        title: "Partner opportunities",
        subtitle: "We are looking for motivated partners to grow with us in global markets.",
        ctaButton: "Become a partner",
        cards: [
            {
                title: "Distributors",
                description:
                    "Distribute PROLEDALL products in your local market and grow your business.",
            },
            {
                title: "Resellers",
                description:
                    "Resell our high-quality LED displays and solutions to your customers.",
            },
            {
                title: "System integrators",
                description:
                    "Integrate PROLEDALL products into your solutions and projects seamlessly.",
            },
            {
                title: "Project contractors",
                description:
                    "Work on LED display projects and deliver outstanding results together.",
            },
            {
                title: "Retailers",
                description:
                    "Sell PROLEDALL products through your retail channels and stores.",
            },
        ],
    },
    de: {
        title: "Partnermöglichkeiten",
        subtitle:
            "Wir suchen motivierte Partner, die mit uns auf globalen Märkten wachsen möchten.",
        ctaButton: "Partner werden",
        cards: [
            {
                title: "Distributoren",
                description:
                    "Vertreiben Sie PROLEDALL-Produkte in Ihrem lokalen Markt und wachsen Sie mit uns.",
            },
            {
                title: "Wiederverkäufer",
                description:
                    "Verkaufen Sie unsere hochwertigen LED-Displays und Lösungen an Ihre Kunden.",
            },
            {
                title: "Systemintegratoren",
                description:
                    "Integrieren Sie PROLEDALL-Produkte nahtlos in Ihre Lösungen und Projekte.",
            },
            {
                title: "Projektauftragnehmer",
                description:
                    "Realisieren Sie LED-Display-Projekte und liefern Sie gemeinsam herausragende Ergebnisse.",
            },
            {
                title: "Einzelhändler",
                description:
                    "Verkaufen Sie PROLEDALL-Produkte über Ihre Einzelhandelskanäle und Filialen.",
            },
        ],
    },
};

const CARD_ICONS = [Network, Tag, MonitorCog, Monitor, Store];

export default function BecomePartnerOpportunitiesSection() {
    const { language } = useLanguage();
    const isEn = language === "en";
    const copy = COPY[isEn ? "en" : "de"];

    return (
        <section className="w-full bg-[#0F2E4A] py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center mb-10 md:mb-14 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight tracking-tight">
                        {copy.title}
                    </h2>
                    <p className="mt-3 md:mt-4 text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
                        {copy.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 lg:gap-6">
                    {copy.cards.map((card, index) => {
                        const IconComponent = CARD_ICONS[index];
                        return (
                            <div
                                key={card.title}
                                className="bg-white rounded-xl p-6 lg:p-7 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shrink-0">
                                    <IconComponent
                                        className="h-6 w-6 text-primary-foreground"
                                        strokeWidth={1.75}
                                    />
                                </div>

                                <h3 className="text-base lg:text-lg font-bold text-foreground leading-snug">
                                    {card.title}
                                </h3>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {card.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center mt-10 md:mt-12 lg:mt-14">
                    <Button
                        asChild
                        size="lg"
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground min-w-[200px]"
                    >
                        <Link href="/become-partner/submit">{copy.ctaButton}</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

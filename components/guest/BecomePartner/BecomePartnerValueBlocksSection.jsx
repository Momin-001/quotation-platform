"use client";

import { useLanguage } from "@/context/LanguageContext";
import { CheckCircle2, FileSpreadsheet, Grid3X3, ShieldCheck } from "lucide-react";

const COPY = {
    en: {
        title: "Why partner with ProLEDALL?",
        subtitle:
            "ProLEDALL provides you with high-quality products, professional support, and powerful resources to help you grow your business.",
        blocks: [
            {
                title: "High-quality products",
                description: "Reliable, certified, and innovative LED display solutions.",
            },
            {
                title: "Competitive advantages",
                description: "Competitive pricing and flexible partnership policies.",
            },
            {
                title: "Professional support",
                description: "Dedicated technical and sales support throughout your projects.",
            },
            {
                title: "Global opportunities",
                description: "Expand your business with access to international markets.",
            },
        ],
    },
    de: {
        title: "Warum Partner von ProLEDALL werden?",
        subtitle:
            "ProLEDALL bietet Ihnen hochwertige Produkte, professionellen Support und starke Ressourcen für Ihr Wachstum.",
        blocks: [
            {
                title: "Hochwertige Produkte",
                description: "Zuverlässige, zertifizierte und innovative LED-Display-Lösungen.",
            },
            {
                title: "Wettbewerbsvorteile",
                description: "Wettbewerbsfähige Preise und flexible Partnerschaftsbedingungen.",
            },
            {
                title: "Professioneller Support",
                description: "Dedizierter technischer und vertrieblicher Support in Ihren Projekten.",
            },
            {
                title: "Globale Chancen",
                description: "Erweitern Sie Ihr Geschäft mit Zugang zu internationalen Märkten.",
            },
        ],
    },
};

const BLOCK_ICONS = [CheckCircle2, FileSpreadsheet, Grid3X3, ShieldCheck];

export default function BecomePartnerValueBlocksSection() {
    const { language } = useLanguage();
    const isEn = language === "en";
    const copy = COPY[isEn ? "en" : "de"];

    return (
        <section className="w-full bg-gray-50 py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center mb-10 md:mb-14 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold  text-foreground leading-tight tracking-tight">
                        {copy.title}
                    </h2>
                    <p className="mt-3 md:mt-4 text-base md:text-lg max-w-2xl mx-auto text-muted-foreground leading-relaxed">
                        {copy.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {copy.blocks.map((block, index) => {
                        const IconComponent = BLOCK_ICONS[index];
                        return (
                            <div
                                key={block.title}
                                className="rounded-xl p-6 lg:p-7 flex flex-col space-y-4 bg-white hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="text-secondary">
                                    <IconComponent
                                        className="h-9 w-9 lg:h-10 lg:w-10"
                                        strokeWidth={1.2}
                                    />
                                </div>

                                <h3 className="text-lg font-semibold text-foreground leading-snug">
                                    {block.title}
                                </h3>

                                <div className="w-8 rounded-full h-0.5 bg-primary/50" />

                                <p className="text-[15px] text-muted-foreground leading-relaxed">
                                    {block.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

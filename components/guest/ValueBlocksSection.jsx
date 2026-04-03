"use client";

import { useLanguage } from "@/context/LanguageContext";
import { CheckCircle2, FileSpreadsheet, Eye, ShieldCheck, Grid3X3 } from "lucide-react";

export default function ValueBlocksSection({ homepageData }) {
    const { language } = useLanguage();

    // Get text based on current language with fallback
    const getText = (field) => {
        if (!homepageData) return "";
        const key = language === "en" ? `${field}En` : `${field}De`;
        return homepageData[key] || homepageData[`${field}En`] || "";
    };

    // Value blocks data
    const valueBlocks = [
        {
            icon: CheckCircle2,
            title: getText("valueBlock1Title"),
            description: getText("valueBlock1Description"),
        },
        {
            icon: FileSpreadsheet,
            title: getText("valueBlock2Title"),
            description: getText("valueBlock2Description"),
        },
        {
            icon: Grid3X3,
            title: getText("valueBlock3Title"),
            description: getText("valueBlock3Description"),
        },
        {
            icon: ShieldCheck,
            title: getText("valueBlock4Title"),
            description: getText("valueBlock4Description"),
        },
    ];

    return (
        <section className="w-full bg-gray-50 py-16 lg:py-24">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-[55px] text-black font-bold mb-4 font-archivo">
                        {getText("valueBlocksTitle")}
                    </h2>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto text-primary-background font-normal font-open-sans">
                        {getText("valueBlocksSubtitle")}
                    </p>
                </div>

                {/* Value Blocks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                    {valueBlocks.map((block, index) => {
                        const IconComponent = block.icon;
                        return (
                            <div
                                key={index}
                                className="rounded-lg p-6 lg:p-6 flex flex-col items-start space-y-4 hover:shadow-lg transition-shadow"
                            >
                                {/* Icon */}
                                <div className="text-secondary mb-2">
                                    <IconComponent className="h-10 w-10" strokeWidth={1} />
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold font-archivo">
                                    {block.title}
                                </h3>

                                {/* Separator Line */}
                                <div className="w-8 rounded-full h-1 bg-[#4BA3FF]"></div>

                                {/* Description */}
                                <p className="text-[#2C2C2C] text-xl font-normal font-open-sans">
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


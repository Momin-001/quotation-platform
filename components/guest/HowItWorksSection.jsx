"use client";

import { useLanguage } from "@/context/LanguageContext";
import { MoveRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowItWorksSection({ homepageData }) {
    const { language } = useLanguage();

    // Get text based on current language with fallback
    const getText = (field) => {
        if (!homepageData) return "";
        const key = language === "en" ? `${field}En` : `${field}De`;
        return homepageData[key] || homepageData[`${field}En`] || "";
    };

    // Steps data
    const steps = [
        {
            number: "01",
            title: getText("step1Title"),
            description1: getText("step1Description1"),
            description2: getText("step1Description2"),
        },
        {
            number: "02",
            title: getText("step2Title"),
            description1: getText("step2Description1"),
            description2: getText("step2Description2"),
        },
        {
            number: "03",
            title: getText("step3Title"),
            description1: getText("step3Description1"),
            description2: getText("step3Description2"),
        },
        {
            number: "04",
            title: getText("step4Title"),
            description1: getText("step4Description1"),
            description2: getText("step4Description2"),
        },
        {
            number: "05",
            title: getText("step5Title"),
            description1: getText("step5Description1"),
            description2: getText("step5Description2"),
        },
    ];

    return (
        <section className="w-full bg-[#0F2E4A] py-16 lg:py-24">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-archivo">
                        {getText("howItWorksTitle")}
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto font-open-sans">
                        {getText("howItWorksSubtitle")}
                    </p>
                </div>

                {/* Steps Grid - 3 columns layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Step Boxes 1-5 */}
                    {steps.map((step, index) => {
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-lg p-6 lg:px-10 pt-30 pb-22 relative border border-gray-200 shadow-sm"
                            >
                                {/* Large Number - Top Left */}
                                <div className="absolute top-10 left-8 text-8xl lg:text-9xl font-bold text-[#00A8CC33] leading-none font-open-sans">
                                    {step.number}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-secondary mb-4 font-archivo relative z-10 pt-14">
                                    {step.title}
                                </h3>

                                {/* Bullet Points */}
                                <ul className="space-y-2 relative z-10 w-xs">
                                    <li className="font-archivo text-xl flex items-start">
                                        <span className="mr-2 text-primary mt-1 shrink-0"><MoveRightIcon className="h-4 w-4" /></span>
                                        <span>{step.description1}</span>
                                    </li>
                                    <li className="font-archivo text-xl flex items-start">
                                        <span className="mr-2 text-primary mt-1 shrink-0"><MoveRightIcon className="h-4 w-4" /></span>
                                        <span>{step.description2}</span>
                                    </li>
                                </ul>
                            </div>
                        );
                    })}

                    {/* CTA Box - Bottom Right (6th position) */}
                    <div className="bg-[#0F2E4A] border-2 border-primary rounded-lg p-6 lg:p-8 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                        <Button size="lg" className="w-full">
                            {getText("ctaCardButton1")}
                        </Button>
                        <Button 
                            size="lg"
                            variant="ghost" 
                            className="w-full border border-primary text-white hover:text-white hover:bg-secondary/5"
                        >
                            {getText("ctaCardButton2")}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}


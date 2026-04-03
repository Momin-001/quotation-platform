"use client";

import { useLanguage } from "@/context/LanguageContext";
import { MoveRight } from "lucide-react";
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
                    <h2 className="text-4xl md:text-5xl lg:text-[55px] font-bold text-primary-foreground mb-4 font-archivo">
                        {getText("howItWorksTitle")}
                    </h2>
                    <p className="text-lg md:text-xl text-primary-foreground/90 max-w-3xl mx-auto font-normal font-open-sans">
                        {getText("howItWorksSubtitle")}
                    </p>
                </div>

                {/* Steps Grid - 3 columns layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Step Boxes 1-5 */}
                    {steps.map((step, index) => {
                        return (
                            <div
                                key={index}
                                className="bg-primary-foreground rounded-lg p-6 lg:px-10 pt-30 pb-14 relative border border-gray-200 shadow-sm"
                            >
                                {/* Large Number - Top Left */}
                                <div className="absolute top-8 left-8 text-9xl lg:text-[137px] font-bold text-[#00A8CC33] leading-none font-open-sans">
                                    {step.number}
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold font-archivo text-secondary mb-4 relative z-10 pt-14">
                                    {step.title}
                                </h3>

                                {/* Bullet Points */}
                                <ul className="space-y-2 relative z-10 w-full md:w-xs font-normal text-xl font-archivo">
                                    <li className="flex items-start">
                                        <span className="mr-2 text-primary mt-1 shrink-0"><MoveRight className="h-5 w-6" strokeWidth={1.5} /></span>
                                        <span>{step.description1}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-primary mt-1 shrink-0"><MoveRight className="h-5 w-6" strokeWidth={1.5} /></span>
                                        <span>{step.description2}</span>
                                    </li>
                                </ul>
                            </div>
                        );
                    })}

                    {/* CTA Box - Bottom Right (6th position) */}
                    <div className="bg-[#0F2E4A] border-6 border-secondary rounded-lg px-24 py-6 lg:py-8 lg:px-30 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                        <Button variant="default" size="lg" className="w-full">
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


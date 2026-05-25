"use client";

import { useLanguage } from "@/context/LanguageContext";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HowItWorksSection({ homepageData }) {
    const { language } = useLanguage();

    const getText = (field) => {
        if (!homepageData) return "";
        const key = language === "en" ? `${field}En` : `${field}De`;
        return homepageData[key] || homepageData[`${field}En`] || "";
    };

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
        <section className="w-full bg-[#0F2E4A] py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center mb-10 md:mb-14 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold  text-primary-foreground leading-tight tracking-tight">
                        {getText("howItWorksTitle")}
                    </h2>
                    <p className="mt-3 md:mt-4 text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
                        {getText("howItWorksSubtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-6 lg:p-8 relative overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="absolute top-4 left-6 text-7xl sm:text-8xl lg:text-[110px] font-bold text-secondary/10 leading-none  select-none">
                                {step.number}
                            </div>

                            <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24">
                                <h3 className="text-lg lg:text-xl font-bold  text-secondary mb-4">
                                    {step.title}
                                </h3>

                                <ul className="space-y-2.5">
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-primary mt-0.5 shrink-0">
                                            <MoveRight className="h-4 w-4" strokeWidth={2} />
                                        </span>
                                        <span className="text-[15px] text-foreground/80 leading-relaxed">
                                            {step.description1}
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-primary mt-0.5 shrink-0">
                                            <MoveRight className="h-4 w-4" strokeWidth={2} />
                                        </span>
                                        <span className="text-[15px] text-foreground/80 leading-relaxed">
                                            {step.description2}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ))}

                    <div className="bg-[#0F2E4A] border-4 border-secondary rounded-xl p-8 sm:p-10 lg:p-12 flex flex-col items-center justify-center space-y-4 min-h-[280px]">
                        <Link className="w-full max-w-xs" href="/products">
                            <Button variant="default" size="lg" className="w-full">
                                {getText("ctaCardButton1")}
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="ghost"
                            className="w-full max-w-xs border border-primary text-white hover:text-white hover:bg-white/5"
                        >
                            {getText("ctaCardButton2")}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

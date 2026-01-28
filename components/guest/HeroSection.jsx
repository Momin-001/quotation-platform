"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Phone } from "lucide-react";
import Image from "next/image";

export default function HeroSection({ homepageData }) {
    const { language } = useLanguage();

    // Get text based on current language with fallback
    const getText = (field) => {
        if (!homepageData) return "";
        const key = language === "en" ? `${field}En` : `${field}De`;
        return homepageData[key] || homepageData[`${field}En`] || "";
    };

    return (
        <section className="relative w-full flex items-center justify-center max-w-[1500px] mx-auto">
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Section - Content */}
                    <div className="space-y-6 z-10 p-10">
                        {/* Small Label */}
                        <div>
                            <p className="text-sm font-medium text-blue-600 tracking-wide font-open-sans">
                                {getText("heroSmallLabel")}
                            </p>

                            {/* Main Title */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 font-archivo leading-tight">
                                {getText("heroTitle")}
                            </h1>
                        </div>

                        <div className="space-y-2">
                            {/* Description */}
                            <p className="text-lg text-gray-500 font-open-sans">
                                {getText("heroDescription")}
                            </p>

                            {/* Short Description */}
                            <p className="text-gray-500 font-bold font-open-sans">
                                {getText("heroShortDescription")}
                            </p>
                        </div>


                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder={getText("heroInputPlaceholder")}
                                className="pl-12 pr-4 py-6 text-base border-2 border-gray-300 rounded-lg focus:border-primary font-open-sans"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg">
                                {getText("heroPrimaryButton")}
                            </Button>
                            <Button size='lg' variant="outline" className="border-secondary text-secondary hover:bg-secondary/5">
                                {getText("heroSecondaryButton")}
                            </Button>
                        </div>
                    </div>

                    {/* Right Section - Image with Overlays */}
                    <div className="relative h-[700px] overflow-hidden">
                        <Image
                            src="/hero-led-display.jpg"
                            alt="LED Display"
                            fill
                            className="object-cover"
                            priority
                        />


                        {/* Hotline CTA - Bottom Left */}
                        <div className="absolute bottom-0 left-0 bg-[#009B8F] rounded-tr-lg text-white px-8 py-6 flex items-center gap-3 shadow-lg z-10 max-w-xs">
                            <Phone className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-medium font-open-sans">
                                {getText("heroHotlineCta")}
                            </p>
                        </div>

                        {/* Request for Offer Button - Bottom Right */}
                        <Button className="absolute bottom-4 right-16 bg-[#009B8F] hover:bg-[#009B8F]/90 text-white px-6 py-4 rounded-lg shadow-lg z-10 font-open-sans">
                            {getText("heroRequestButton")}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}


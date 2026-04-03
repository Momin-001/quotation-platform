"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PhoneCall, Pencil } from "lucide-react";
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
    <section className="relative w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[700px] lg:min-h-[850px]">

            {/* Left Section - content pushed from center leftward */}
            <div className="flex-1 flex items-center justify-end">
                <div className="w-full lg:max-w-[750px] space-y-6 px-8 lg:pr-16 lg:pl-8 py-16">
                    {/* Small Label */}
                    <div>
                        <p className="text-lg font-medium font-open-sans text-[#1A73E8] tracking-wide">
                            {getText("heroSmallLabel")}
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-[58px] font-bold font-archivo leading-tight">
                            {getText("heroTitle")}
                        </h1>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[#6F7A8A] font-normal text-lg font-open-sans">
                            {getText("heroDescription")}
                        </p>
                        <p className="text-[#6F7A8A] text-lg font-bold font-open-sans">
                            {getText("heroShortDescription")}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg">
                            {getText("heroPrimaryButton")}
                        </Button>
                        <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary/5">
                            {getText("heroSecondaryButton")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Section - flush to right edge, no margin/padding on right */}
            <div className="relative h-[700px] lg:h-auto w-full lg:w-[50%] shrink-0">
                <Image
                    src={homepageData?.heroImageUrl || "/hero-led-display.jpg"}
                    alt="LED Display"
                    fill
                    className="object-cover"
                    priority
                />

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 w-full flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 p-4 sm:p-0 z-10">
                    {/* Hotline CTA */}
                    <div className="bg-secondary rounded-tr-xl text-primary-foreground px-6 py-7 flex items-center gap-3 shadow-lg max-w-[450px]">
                        <div className="bg-[#018C85] rounded-full p-5">
                            <PhoneCall className="h-5 w-5 shrink-0" />
                        </div>
                        <p className="text-2xl font-bold font-open-sans">
                            {getText("heroHotlineCta")}
                        </p>
                    </div>

                    {/* Request for Offer Button */}
                    <Button variant="secondary" className="sm:mr-16 sm:mb-6 text-xl font-bold font-open-sans px-4! rounded-full">
                        <Pencil className="h-6 w-6 shrink-0" />
                        {getText("heroRequestButton")}
                    </Button>
                </div>
            </div>

        </div>
    </section>
);
}


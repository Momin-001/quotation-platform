"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Marquee from "react-fast-marquee";

export default function PartnersSection({ homepageData, partners = [] }) {
    const { language } = useLanguage();
    const [pauseOnHover, setPauseOnHover] = useState(true);
    const [speed, setSpeed] = useState(50); // Adjust speed as needed (20-100)

    const handlePartnerClick = async (partnerId, websiteUrl) => {
        try {
            await fetch(`/api/partners/${partnerId}/click`, {
                method: "POST",
            });
            window.open(websiteUrl, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Error updating partner click:", error);
        }
    };

    const getText = (field) => {
        if (!homepageData) return "";
        const key = language === "en" ? `${field}En` : `${field}De`;
        return homepageData[key] || homepageData[`${field}En`] || "";
    };

    return (
        <section className="w-full bg-white py-14 lg:py-16">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-archivo">
                        {getText("partnersTitle")}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-open-sans">
                        {getText("partnersSubtitle")}
                    </p>
                </div>

                {/* Marquee Container */}
                {partners.length > 0 ? (
                    <div className="overflow-hidden relative">
                        <Marquee
                            speed={speed}
                            pauseOnHover={pauseOnHover}
                            pauseOnClick={false}
                            gradient={false}
                            className="py-4"
                        >
                            {partners.map((partner) => (
                                <div
                                    key={partner.id}
                                    className="flex-shrink-0 bg-gray-100 rounded-lg py-6 px-14 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-center mx-4"
                                    onClick={() => handlePartnerClick(partner.id, partner.websiteUrl)}
                                    onMouseEnter={() => setPauseOnHover(true)}
                                >
                                    <Image
                                        src={partner.logoUrl}
                                        alt={partner.name}
                                        width={100}
                                        height={100}
                                        className="object-contain w-[120px] h-[30px]"
                                    />
                                </div>
                            ))}
                        </Marquee>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        <p>No partners available</p>
                    </div>
                )}
            </div>
        </section>
    );
}
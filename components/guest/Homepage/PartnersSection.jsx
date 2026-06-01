"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Image from "next/image";
import Marquee from "react-fast-marquee";

export default function PartnersSection({ homepageData, partners = [] }) {
    const locale = useLocale();
    const [pauseOnHover, setPauseOnHover] = useState(true);
    const [speed, setSpeed] = useState(50);

    const handlePartnerClick = async (partnerId, websiteUrl) => {
        try {
            await fetch(`/api/partners/${partnerId}/click`, {
                method: "POST",
            });
            window.open(websiteUrl, "_blank", "noopener,noreferrer");
        } catch (error) {
        }
    };

    const getText = (field) => {
        if (!homepageData) return "";
        const key = locale === "en" ? `${field}En` : `${field}De`;
        return homepageData[key] || homepageData[`${field}En`] || "";
    };

    return (
        <section className="w-full bg-gray-50 py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold  text-foreground leading-tight tracking-tight">
                        {getText("partnersTitle")}
                    </h2>
                    <p className="mt-3 md:mt-4 text-base md:text-lg max-w-2xl mx-auto text-muted-foreground leading-relaxed">
                        {getText("partnersSubtitle")}
                    </p>
                </div>

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
                                    className="shrink-0 bg-white border border-gray-100 rounded-lg shadow-md transition-shadow duration-300 cursor-pointer flex items-center justify-center mx-3 w-[240px] h-[80px]"
                                    onClick={() => handlePartnerClick(partner.id, partner.websiteUrl)}
                                    onMouseEnter={() => setPauseOnHover(true)}
                                >
                                    <Image
                                        src={partner.logoUrl}
                                        alt={partner.name}
                                        width={180}
                                        height={180}
                                        priority
                                        className="object-contain w-[140px] h-[60px]"
                                    />
                                </div>
                            ))}
                        </Marquee>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        <p className="text-sm">No partners available</p>
                    </div>
                )}
            </div>
        </section>
    );
}

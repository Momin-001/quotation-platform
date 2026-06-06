"use client";

import Image from "next/image";
import Marquee from "react-fast-marquee";

async function handlePartnerClick(partnerId, websiteUrl) {
    try {
        await fetch(`/api/partners/${partnerId}/click`, {
            method: "POST",
        });
        window.open(websiteUrl, "_blank", "noopener,noreferrer");
    } catch {
        // click tracking is best-effort
    }
}

export default function PartnerLogoMarquee({ partners = [] }) {
    if (partners.length === 0) return null;

    return (
        <div className="overflow-hidden relative">
            <Marquee
                speed={50}
                pauseOnHover
                pauseOnClick={false}
                gradient={false}
                className="py-4"
            >
                {partners.map((partner) => (
                    <div
                        key={partner.id}
                        className="shrink-0 bg-white border border-gray-100 rounded-lg shadow-md transition-shadow duration-300 cursor-pointer flex items-center justify-center mx-3 w-[240px] h-[80px]"
                        onClick={() => handlePartnerClick(partner.id, partner.websiteUrl)}
                    >
                        <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            width={180}
                            height={180}
                            className="object-contain w-[140px] h-[60px]"
                        />
                    </div>
                ))}
            </Marquee>
        </div>
    );
}

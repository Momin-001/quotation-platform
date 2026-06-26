"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Banner for the refurbished listing page. Picks one active advertisement at
// random; renders nothing when there are no active ads.
export default function AdvertisementBanner() {
    const [ad, setAd] = useState(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch("/api/advertisements");
                const response = await res.json();
                if (!active) return;
                const ads = response?.data || [];
                if (ads.length > 0) {
                    setAd(ads[Math.floor(Math.random() * ads.length)]);
                }
            } catch {
                // No banner on error
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    if (!ad) return null;

    const handleClick = () => {
        // Fire-and-forget click tracking (keepalive lets it complete during navigation)
        try {
            fetch(`/api/advertisements/${ad.id}/click`, { method: "POST", keepalive: true });
        } catch {
            // ignore
        }
    };

    return (
        <a
            href={ad.redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="block relative w-full overflow-hidden rounded-xl border border-border/60 bg-white"
            aria-label={ad.title}
        >
            <div className="relative w-full aspect-[16/5] sm:aspect-[16/4]">
                <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" priority />
            </div>
            {ad.title ? (
                <span className="absolute bottom-3 left-3 bg-black/55 text-white text-sm font-semibold px-3 py-1.5 rounded-md">
                    {ad.title}
                </span>
            ) : null}
        </a>
    );
}

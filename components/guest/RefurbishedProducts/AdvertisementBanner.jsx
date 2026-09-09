"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { PROMO_SLOT_HEIGHT } from "@/components/guest/promo-slot";

const ROTATE_MS = 6000;

/**
 * Rotating ad banner at the top of the left rail on the refurbished listing.
 * Cycles through every active advertisement rather than showing a single random
 * one. Renders nothing when there are no active ads.
 *
 * Fills the shared banner slot so it matches the refurbished promo card on the
 * products listing. Creatives are centre-cropped to fill that box.
 */
export default function AdvertisementBanner({ className = "" }) {
    const [ads, setAds] = useState([]);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        if (!mq) return;
        setReducedMotion(mq.matches);
        const onChange = (e) => setReducedMotion(e.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch("/api/advertisements");
                const response = await res.json();
                if (!active) return;
                setAds(Array.isArray(response?.data) ? response.data : []);
            } catch {
                // No banner on error
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    // Auto-advance. Skipped for a single ad and while hovered/focused. Reduced
    // motion drops the crossfade rather than the rotation, so every ad is still
    // shown its turn.
    useEffect(() => {
        if (ads.length < 2 || paused) return;
        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % ads.length);
        }, ROTATE_MS);
        return () => clearInterval(timer);
    }, [ads.length, paused]);

    const trackClick = useCallback((adId) => {
        // Fire-and-forget click tracking (keepalive lets it complete during navigation)
        try {
            fetch(`/api/advertisements/${adId}/click`, { method: "POST", keepalive: true });
        } catch {
            // ignore
        }
    }, []);

    if (ads.length === 0) return null;

    return (
        <div
            className={`relative w-full overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm ${PROMO_SLOT_HEIGHT} ${className}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            {ads.map((ad, i) => (
                <a
                    key={ad.id}
                    href={ad.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(ad.id)}
                    aria-label={ad.title}
                    aria-hidden={i !== index}
                    tabIndex={i === index ? 0 : -1}
                    className={`absolute inset-0 ${
                        reducedMotion ? "" : "transition-opacity duration-700"
                    } ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                    <Image
                        src={ad.imageUrl}
                        alt={ad.title}
                        fill
                        sizes="(min-width: 1024px) 320px, 100vw"
                        className="object-cover"
                        priority={i === 0}
                    />
                    {ad.title ? (
                        <span className="absolute bottom-2 left-2.5 rounded bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
                            {ad.title}
                        </span>
                    ) : null}
                </a>
            ))}

            {ads.length > 1 ? (
                <div className="absolute bottom-2 right-2.5 flex items-center gap-1.5">
                    {ads.map((ad, i) => (
                        <button
                            key={ad.id}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`Show advertisement ${i + 1} of ${ads.length}`}
                            aria-current={i === index}
                            className={`h-1.5 rounded-full ring-1 ring-black/10 transition-all ${
                                i === index ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
                            }`}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

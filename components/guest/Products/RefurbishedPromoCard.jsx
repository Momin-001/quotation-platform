"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, BadgeCheck, Recycle } from "lucide-react";
import { PROMO_SLOT_HEIGHT } from "@/components/guest/promo-slot";

/**
 * Entry point to the refurbished catalogue, shown at the top of the left rail on
 * the new-products listing. Fills the shared banner slot, with the call to
 * action pinned to the bottom so the card composes at that fixed height in
 * either language.
 */
export default function RefurbishedPromoCard({ className = "" }) {
    const t = useTranslations("Products.list.refurbishedPromo");

    return (
        <Link
            href="/refurbished-products"
            className={`group relative block w-full overflow-hidden rounded-xl border border-secondary/30 bg-linear-to-b from-secondary/15 to-secondary/5 p-5 transition-colors hover:border-secondary/50 hover:from-secondary/20 ${PROMO_SLOT_HEIGHT} ${className}`}
        >
            {/* Decorative mark, hidden from assistive tech */}
            <Recycle
                aria-hidden="true"
                className="pointer-events-none absolute -right-5 -bottom-5 h-28 w-28 text-secondary/10"
            />

            <div className="relative flex h-full flex-col">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {t("badge")}
                </span>

                <h3 className="mt-2.5 text-base font-semibold leading-snug text-foreground">
                    {t("title")}
                </h3>
                {/* Clamped so a longer translation can never push the button out of the card */}
                <p className="mt-1.5 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                    {t("body")}
                </p>

                <span className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-secondary/90">
                    {t("cta")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
            </div>
        </Link>
    );
}

"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MoveLeft, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useLocale } from "next-intl";
import { categoryToShowcaseCard } from "@/lib/helpers/category-helpers";
import { cmsField } from "@/lib/i18n/cms";

function CategoryCard({ card, presetLabel, categoryId }) {
    const href = categoryId
        ? `/products?categoryId=${encodeURIComponent(categoryId)}`
        : "/products";

    return (
        <div className="relative h-full min-h-[520px] lg:min-h-[620px] rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="absolute inset-0 z-0">
                {card.imageUrl ? (
                    <Image
                        src={card.imageUrl}
                        alt={card.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-slate-700 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/10" />
            </div>

            <div className="relative z-10 flex flex-col h-full p-6 sm:p-8 lg:p-10">
                <div className="mt-auto space-y-3 text-white">
                    <span className="inline-block bg-primary text-primary-foreground text-xs sm:text-sm font-semibold tracking-wider uppercase px-3.5 py-1 rounded-sm">
                        {(card.categoryName || "").toUpperCase()}
                    </span>

                    <h3 className="text-xl sm:text-2xl font-bold  leading-snug line-clamp-2 mt-4">
                        {card.title}
                    </h3>
                    {card.description ? (
                        <p className="text-sm sm:text-base text-white/75 leading-relaxed line-clamp-3">
                            {card.description}
                        </p>
                    ) : null}
                    {card.features?.length > 0 ? (
                        <ul className="text-sm sm:text-base text-white/75 space-y-1 list-disc pl-4 marker:text-primary">
                            {card.features.map((f, i) => (
                                <li key={i} className="leading-relaxed">
                                    {f}
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    <div className="pt-3">
                        <Button
                            asChild
                            size="lg"
                            variant="secondary"
                            className=""
                            disabled={!categoryId}
                        >
                            <Link href={href}>
                                {presetLabel} →
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PreSelectedFiltersSection({ homepageData }) {
    const locale = useLocale();
    const lang = locale === "de" ? "de" : "en";

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [api, setApi] = useState(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);
    const [autoplayNonce, setAutoplayNonce] = useState(0);

    const getText = (field) => cmsField(homepageData, field, locale);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setCategoriesLoading(true);
            try {
                const res = await fetch("/api/categories/showcase");
                const json = await res.json();
                if (!json.success)
                    throw new Error(json.message);
                if (!cancelled) setCategories(json.data || []);
            } catch {
                if (!cancelled) setCategories([]);
            } finally {
                if (!cancelled) setCategoriesLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const cards = useMemo(
        () => categories.map((c) => categoryToShowcaseCard(c, lang)),
        [categories, lang]
    );

    useEffect(() => {
        if (!api) return;
        const onSelect = () => {
            setCanPrev(api.canScrollPrev());
            setCanNext(api.canScrollNext());
        };
        onSelect();
        api.on("reInit", onSelect);
        api.on("select", onSelect);
        return () => {
            api.off("select", onSelect);
            api.off("reInit", onSelect);
        };
    }, [api]);

    useEffect(() => {
        api?.reInit();
    }, [api, cards]);

    useEffect(() => {
        if (!api || cards.length === 0) return;
        const intervalMs = 3000;
        const id = setInterval(() => {
            api.scrollNext();
        }, intervalMs);
        return () => clearInterval(id);
    }, [api, autoplayNonce, cards]);

    return (
        <section className="w-full bg-[#F6FBFF] py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="relative mb-10 md:mb-12">
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold  text-foreground leading-tight tracking-tight">
                            {getText("preSelectedFiltersTitle")}
                        </h2>
                        <p className="mt-3 md:mt-4 text-sm sm:text-base md:text-lg mx-auto max-w-4xl text-muted-foreground leading-relaxed">
                            {getText("preSelectedFiltersSubtitle")}
                        </p>
                    </div>
                    <div className="flex justify-center gap-2 mt-6 lg:mt-0 lg:absolute lg:top-1 lg:right-0">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full h-10 w-10 border-primary text-primary hover:text-primary hover:bg-primary/5"
                            disabled={!canPrev}
                            onClick={() => {
                                api?.scrollPrev();
                                setAutoplayNonce((n) => n + 1);
                            }}
                        >
                            <MoveLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            className="rounded-full h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={!canNext}
                            onClick={() => {
                                api?.scrollNext();
                                setAutoplayNonce((n) => n + 1);
                            }}
                        >
                            <MoveRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="min-w-0">
                    {categoriesLoading ? (
                        <p className="text-center py-12 text-sm text-muted-foreground">
                            {lang === "en"
                                ? "Loading categories…"
                                : "Kategorien werden geladen…"}
                        </p>
                    ) : cards.length === 0 ? (
                        <p className="text-center py-12 text-sm text-muted-foreground">
                            {lang === "en"
                                ? "No categories configured yet."
                                : "Noch keine Kategorien konfiguriert."}
                        </p>
                    ) : (
                        <Carousel
                            setApi={setApi}
                            opts={{ align: "start", loop: true }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-3">
                                {cards.map((card) => {
                                    const catLabel = (card.categoryName || "").toUpperCase();
                                    const presetLabel = `${getText("preSelectedFiltersPresetPrefix")} ${catLabel}`.trim();
                                    return (
                                        <CarouselItem
                                            key={card.id}
                                            className="pl-3 basis-full lg:basis-1/2"
                                        >
                                            <CategoryCard
                                                card={card}
                                                presetLabel={presetLabel}
                                                categoryId={card.id}
                                            />
                                        </CarouselItem>
                                    );
                                })}
                            </CarouselContent>
                            <CarouselPrevious className="hidden" />
                            <CarouselNext className="hidden" />
                        </Carousel>
                    )}
                </div>
            </div>
        </section>
    );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoveLeft, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/context/LanguageContext";
import { categoryToShowcaseCard } from "@/lib/category-helpers";

function CategoryCard({ card, presetLabel, categoryId }) {
    const href = categoryId
        ? `/products?categoryId=${encodeURIComponent(categoryId)}`
        : "/products";

    return (
        <div className="relative h-full min-h-[600px] lg:min-h-[740px] rounded-xl overflow-hidden shadow-xl flex flex-col">
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
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/55 to-black/20" />
            </div>

            <div className="relative z-10 flex flex-col h-full p-8 lg:p-10 pt-8">
                <div className="mt-auto space-y-3 text-white">
                    <span className="self-start bg-primary text-primary-foreground font-open-sans text-lg font-semibold tracking-wide px-5 py-1.5 rounded-sm">
                        {(card.categoryName || "").toUpperCase()}
                    </span>

                    <h3 className="text-2xl mt-6 font-bold font-open-sans leading-tight line-clamp-2">
                        {card.title}
                    </h3>
                    {card.description ? (
                        <p className="text-lg text-white/80 font-normal font-open-sans line-clamp-3 leading-relaxed">
                            {card.description}
                        </p>
                    ) : null}
                    {card.features?.length > 0 ? (
                        <ul className="text-lg text-white/80 font-normal font-open-sans space-y-1.5 list-disc pl-4 marker:text-primary">
                            {card.features.map((f, i) => (
                                <li key={i} className="leading-snug">
                                    {f}
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    <div className="pt-2">
                        <Button
                            asChild
                            size="lg"
                            variant="secondary"
                            className="font-archivo"
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
    const { language } = useLanguage();
    const lang = language === "de" ? "de" : "en";

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [api, setApi] = useState(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);
    const [autoplayNonce, setAutoplayNonce] = useState(0);

    const getText = (field) => {
        if (!homepageData) return "";
        const key = language === "en" ? `${field}En` : `${field}De`;
        return homepageData[key] || homepageData[`${field}En`] || "";
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setCategoriesLoading(true);
            try {
                const res = await fetch("/api/categories");
                const json = await res.json();
                if (!json.success) throw new Error(json.message);
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
        <section className="w-full bg-[#F6FBFF] py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="relative mb-10">
                    <div className="text-center">
                        <h2 className="text-4xl md:text-5xl lg:text-[55px] text-black font-bold font-archivo mb-4">
                            {getText("preSelectedFiltersTitle")}
                        </h2>
                        <p className="text-md md:text-lg mx-auto max-w-6xl font-normal font-open-sans">
                            {getText("preSelectedFiltersSubtitle")}
                        </p>
                    </div>
                    <div className="flex justify-center gap-2 mt-6 lg:mt-0 lg:absolute lg:top-0 lg:right-0">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full h-14 w-14 border-primary text-primary hover:text-primary"
                            disabled={!canPrev}
                            onClick={() => {
                                api?.scrollPrev();
                                setAutoplayNonce((n) => n + 1);
                            }}
                        >
                            <MoveLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            type="button"
                            className="rounded-full h-14 w-14 bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={!canNext}
                            onClick={() => {
                                api?.scrollNext();
                                setAutoplayNonce((n) => n + 1);
                            }}
                        >
                            <MoveRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="min-w-0">
                    {categoriesLoading ? (
                        <p className="text-center py-12 text-sm text-muted-foreground font-open-sans">
                            {lang === "en"
                                ? "Loading categories…"
                                : "Kategorien werden geladen…"}
                        </p>
                    ) : cards.length === 0 ? (
                        <p className="text-center py-12 text-sm text-muted-foreground font-open-sans">
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
                            <CarouselContent className="-ml-1">
                                {cards.map((card) => {
                                    const catLabel = (card.categoryName || "").toUpperCase();
                                    const presetLabel = `${getText("preSelectedFiltersPresetPrefix")} ${catLabel}`.trim();
                                    return (
                                        <CarouselItem
                                            key={card.id}
                                            className="pl-1 basis-full lg:basis-1/2"
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

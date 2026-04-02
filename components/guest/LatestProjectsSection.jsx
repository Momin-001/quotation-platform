"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Globe,
    Monitor,
    PanelTop,
    Truck,
    ArrowRight,
    ArrowLeft,
    MoveLeft,
    MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/context/LanguageContext";
import { Spinner } from "@/components/ui/spinner";

const COPY = {
    en: {
        title: "Pre-Selected Filters",
        description:
            "Explore our newest LED installations across indoor, outdoor, and mobile applications—precision-built displays engineered for lasting performance.",
        allProjects: "All Projects",
        aboutUs: "About us",
        presetPrefix: "PRESET FILTER",
    },
    de: {
        title: "Vorausgewählte Filter",
        description:
            "Entdecken Sie unsere neuesten LED-Installationen für Innen-, Außen- und mobile Anwendungen—präzise gefertigte Displays für dauerhafte Leistung.",
        allProjects: "Alle Projekte",
        aboutUs: "Über uns",
        presetPrefix: "FILTER VOREINSTELLEN",
    },
};

function categoryIconForName(name) {
    const n = (name || "").toLowerCase();
    if (n.includes("indoor")) return Monitor;
    if (n.includes("outdoor")) return PanelTop;
    if (n.includes("mobil")) return Truck;
    return Monitor;
}

function ProjectCard({ product, presetLabel }) {
    const href = product.areaOfUseId
        ? `/products?categoryId=${encodeURIComponent(product.areaOfUseId)}`
        : "/products";
    const badge = (product.areaOfUseName || "").toUpperCase();

    return (
        <div className="relative h-full min-h-[500px] lg:min-h-[560px] rounded-xl overflow-hidden shadow-xl flex flex-col">
            <div className="absolute inset-0 z-0">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-slate-700 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/55 to-black/20" />
            </div>

            <div className="relative z-10 flex flex-col h-full p-5 lg:p-6 pt-8">


                <div className="mt-auto space-y-3 text-white">

                    <span className="self-start bg-primary text-primary-foreground font-open-sans text-xs font-semibold tracking-wide px-3 py-1.5 rounded-sm">
                        {badge}
                    </span>

                    <h3 className="text-xl mt-6 font-bold font-open-sans leading-tight line-clamp-2">
                        {product.productName}
                    </h3>
                    {product.productDescription ? (
                        <p className="text-xs text-white/80 font-open-sans line-clamp-3 leading-relaxed">
                            {product.productDescription}
                        </p>
                    ) : null}
                    {product.features?.length > 0 ? (
                        <ul className="text-xs text-white/80 font-open-sans space-y-1.5 list-disc pl-4 marker:text-primary">
                            {product.features.map((f, i) => (
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

export default function LatestProjectsSection() {
    const { language } = useLanguage();
    const lang = language === "de" ? "de" : "en";
    const t = COPY[lang];

    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [api, setApi] = useState(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/categories");
                const json = await res.json();
                if (!json.success) throw new Error(json.message);
                if (!cancelled) setCategories(json.data || []);
            } catch {
                if (!cancelled) setCategories([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const fetchProjects = useCallback(async (categoryId) => {
        setLoadingList(true);
        try {
            const url = categoryId
                ? `/api/latest-projects?categoryId=${encodeURIComponent(categoryId)}`
                : "/api/latest-projects?mode=all";
            const res = await fetch(url);
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            setProjects(json.data || []);
        } catch {
            setProjects([]);
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects(selectedCategoryId);
    }, [selectedCategoryId, fetchProjects]);

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
    }, [api, projects]);

    const isAll = selectedCategoryId === null;

    return (
        <section className="w-full bg-[#F6FBFF] py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="relative mb-10">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-archivo mb-4">
                            {t.title}
                        </h2>
                        <p className="text-md md:text-lg max-w-3xl mx-auto font-open-sans">
                            {t.description}
                        </p>
                    </div>
                    <div className="flex justify-center gap-2 mt-6 lg:mt-0 lg:absolute lg:top-0 lg:right-0">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full h-14 w-14 border-primary text-primary hover:text-primary"
                            disabled={!canPrev}
                            onClick={() => api?.scrollPrev()}
                        >
                            <MoveLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            type="button"
                            className="rounded-full h-14 w-14 bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={!canNext}
                            onClick={() => api?.scrollNext()}
                        >
                            <MoveRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-14 lg:items-start">
                    <aside className="shrink-0 lg:w-[260px] xl:w-[280px]">
                        <nav className="space-y-1 font-open-sans">
                            <button
                                type="button"
                                onClick={() => setSelectedCategoryId(null)}
                                className={`w-full flex items-center gap-3 font-open-sans font-semibold px-3 py-3 rounded-lg text-left text-sm lg:text-base transition-colors ${isAll ? "text-primary" : ""}`}
                            >
                                <div className={`bg-primary-foreground p-2 border ${isAll ? "border-primary" : "border-gray-400"} rounded-full`}>
                                    <Globe className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.5} />
                                </div>
                                {t.allProjects}
                            </button>
                            {categories.map((cat) => {
                                const Icon = categoryIconForName(cat.name);
                                const active = selectedCategoryId === cat.id;
                                return (

                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategoryId(cat.id)}
                                        className=
                                        {`w-full flex items-center font-open-sans font-semibold gap-3 px-3 py-3 rounded-lg text-left text-sm lg:text-base transition-colors uppercase tracking-wide" ${active ? "text-primary" : ""}`}
                                    >
                                        <div className={`bg-primary-foreground p-2 border ${active ? "border-primary" : "border-gray-400"} rounded-full`}>
                                            <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.5} />
                                        </div>
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </nav>
                        <Link href="/become-partner" className="mt-8 block">
                            <Button className="w-full rounded-md font-semibold tracking-wide uppercase text-sm h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                                {t.aboutUs}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </aside>

                    <div className="flex-1 min-w-0">
                        {loadingList ? (
                            <div className="flex justify-center py-20">
                                <Spinner className="h-10 w-10 text-primary" />
                            </div>
                        ) : projects.length === 0 ? (
                            <p className="text-center py-16 font-open-sans">
                                {lang === "en" ? "No projects to show yet." : "Noch keine Projekte verfügbar."}
                            </p>
                        ) : (
                            <Carousel
                                key={selectedCategoryId || "all"}
                                setApi={setApi}
                                opts={{ align: "start", loop: false }}
                                className="w-full"
                            >
                                <CarouselContent className="-ml-1">
                                    {projects.map((product) => {
                                        const catLabel = (product.areaOfUseName || "").toUpperCase();
                                        const presetLabel = `${t.presetPrefix} ${catLabel}`.trim();
                                        return (
                                            <CarouselItem
                                                key={product.id}
                                                className="pl-1 basis-full lg:basis-1/2"
                                            >
                                                <ProjectCard product={product} presetLabel={presetLabel} />
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
            </div>
        </section>
    );
}

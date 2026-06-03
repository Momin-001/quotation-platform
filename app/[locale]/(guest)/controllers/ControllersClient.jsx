"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import ControllerCard from "@/components/guest/Controllers/ControllerCard";

const BRANDS = ["Colorlight", "Novastar", "Brompton", "LINSN", "Other"];

function useDebounce(value, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

function isDefaultListingQuery(query) {
    if (!query) return true;
    const params = new URLSearchParams(query);
    if (params.get("page") !== "1") return false;
    if (params.get("limit") !== "10") return false;
    for (const [key] of params.entries()) {
        if (key !== "page" && key !== "limit") return false;
    }
    return true;
}

export default function ControllersClient({
    initialControllers = [],
    initialHasMore = false,
}) {
    const t = useTranslations("Controllers.list");
    const tCommon = useTranslations("Common");
    const hasInitialListing = initialControllers.length > 0;
    const initialListingConsumedRef = useRef(false);
    const lastQueryRef = useRef("");
    const [controllers, setControllers] = useState(() =>
        hasInitialListing ? initialControllers : []
    );
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(() =>
        hasInitialListing ? initialHasMore : true
    );
    const [search, setSearch] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");

    const debouncedSearch = useDebounce(search, 400);
    const debouncedSelectedBrand = useDebounce(selectedBrand, 150);

    const observer = useRef();

    const buildQueryParams = useCallback(
        (pageNum = page) => {
            const params = new URLSearchParams();
            params.append("page", pageNum.toString());
            params.append("limit", "10");
            if (debouncedSearch) params.append("search", debouncedSearch);
            if (debouncedSelectedBrand) params.append("brand", debouncedSelectedBrand);
            return params.toString();
        },
        [page, debouncedSearch, debouncedSelectedBrand]
    );

    const fetchControllers = useCallback(
        async (pageNum, reset = false) => {
            setLoading(true);
            try {
                const queryParams = buildQueryParams(pageNum);
                const res = await fetch(`/api/controllers?${queryParams}`);
                const response = await res.json();

                if (!response.success) {
                    throw new Error(response.message || "Failed to fetch controllers");
                }
                if (reset) {
                    setControllers(response.data);
                } else {
                    setControllers((prev) => [...prev, ...response.data]);
                }
                setHasMore(response.data.length === 10);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        },
        [buildQueryParams]
    );

    useEffect(() => {
        const query = buildQueryParams(1);
        if (lastQueryRef.current === query) return;
        lastQueryRef.current = query;

        if (
            hasInitialListing &&
            !initialListingConsumedRef.current &&
            isDefaultListingQuery(query)
        ) {
            initialListingConsumedRef.current = true;
            setPage(1);
            return;
        }

        setPage(1);
        setControllers([]);
        fetchControllers(1, true);
    }, [debouncedSearch, debouncedSelectedBrand, buildQueryParams, fetchControllers, hasInitialListing]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchControllers(nextPage);
    }, [page, loading, hasMore, fetchControllers]);

    const lastCardRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore();
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, loadMore]
    );

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title={t("breadcrumb")}
                breadcrumbs={[
                    { label: tCommon("home"), href: "/" },
                    { label: t("breadcrumb") },
                ]}
            />
            <main className="flex-1 container mx-auto px-4 lg:px-6 py-6 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("searchPlaceholder")}
                            className="pl-10 h-10 sm:h-11 text-sm rounded-lg border-border/80 shadow-sm placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                <div className="mb-6 sm:mb-8 flex flex-wrap gap-2">
                    <Button
                        variant={selectedBrand === "" ? "default" : "outline"}
                        size="sm"
                        className={cn(
                            selectedBrand === ""
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                        )}
                        onClick={() => setSelectedBrand("")}
                    >
                        {t("all")}
                    </Button>
                    {BRANDS.map((brand) => (
                        <Button
                            key={brand}
                            variant={selectedBrand === brand ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedBrand(brand)}
                            className={cn(
                                selectedBrand === brand
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                            )}
                        >
                            {brand}
                        </Button>
                    ))}
                </div>

                {loading && controllers.length === 0 ? (
                    <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-border/60 bg-white/60">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Spinner className="h-5 w-5" />
                            <span className="text-sm">{t("loading")}</span>
                        </div>
                    </div>
                ) : controllers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                        {controllers.map((controller, index) => {
                            const isLast = controllers.length === index + 1;
                            return (
                                <Link
                                    href={`/controllers/${controller.id}`}
                                    key={controller.id}
                                    ref={isLast ? lastCardRef : null}
                                    className="block group h-full"
                                >
                                    <ControllerCard controller={controller} className="h-full" />
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 px-6 rounded-xl border border-dashed border-border/60 bg-white/60">
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            {t("empty")}
                        </p>
                    </div>
                )}

                {loading && controllers.length > 0 && (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Spinner className="h-4 w-4" />
                            <span className="text-sm">{t("loadingMore")}</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

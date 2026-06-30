"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Search, FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import RefurbishedProductCard from "@/components/guest/RefurbishedProducts/RefurbishedProductCard";
import AdvertisementBanner from "@/components/guest/RefurbishedProducts/AdvertisementBanner";
import { ProductsRangeFilter } from "@/components/guest/Products/ProductsRangeFilter";
import BreadCrumb from "@/components/guest/BreadCrumb";

const PAGE_SIZE = 10;
const PRODUCT_TYPES = ["Complete System", "LED Display Single Cabinet"];
const DESIGNS = ["Mobil", "Fix"];
const YES_NO = ["Yes", "No"];

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

function pixelRangeIsActive(range, bounds) {
    if (!bounds || !range?.min || !range?.max) return false;
    const a = parseFloat(range.min);
    const b = parseFloat(range.max);
    const x = parseFloat(bounds.pixelPitchMin);
    const y = parseFloat(bounds.pixelPitchMax);
    if ([a, b, x, y].some((n) => Number.isNaN(n))) return false;
    return Math.abs(a - x) > 1e-3 || Math.abs(b - y) > 1e-3;
}

// Filter sidebar — styled to match the new products listing filter bar.
function FiltersAccordion({
    bounds,
    productType, setProductType,
    design, setDesign,
    hangingBrackets, setHangingBrackets,
    stackingSystem, setStackingSystem,
    flightCases, setFlightCases,
    pixelPitchRange, setPixelPitchRange,
}) {
    const sectionTitle = "text-sm font-semibold  uppercase tracking-wide text-foreground/90 mb-3";
    const fieldLabel = "text-xs font-medium text-muted-foreground font-normal mb-1.5";

    const selectField = (label, value, setValue, options) => (
        <div>
            <Label className={fieldLabel}>{label}</Label>
            <Select value={value || undefined} onValueChange={setValue}>
                <SelectTrigger size="sm" className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="border-t border-border/60 pt-5 first:border-t-0 first:pt-0">
                <h3 className={sectionTitle}>Product Information</h3>
                <div className="space-y-3">
                    {selectField("Product Type", productType, setProductType, PRODUCT_TYPES)}
                    {selectField("Design", design, setDesign, DESIGNS)}
                </div>
            </div>

            <div className="border-t border-border/60 pt-5">
                <h3 className={sectionTitle}>Physical Specifications</h3>
                <div className="space-y-3">
                    <ProductsRangeFilter
                        label="Pixel Pitch"
                        unit="mm"
                        boundMin={bounds.pixelPitchMin}
                        boundMax={bounds.pixelPitchMax}
                        step={0.01}
                        value={pixelPitchRange}
                        onChange={setPixelPitchRange}
                    />
                </div>
            </div>

            <div className="border-t border-border/60 pt-5">
                <h3 className={sectionTitle}>Mounting &amp; Logistics</h3>
                <div className="space-y-3">
                    {selectField("Hanging-Brackets", hangingBrackets, setHangingBrackets, YES_NO)}
                    {selectField("Stacking System", stackingSystem, setStackingSystem, YES_NO)}
                    {selectField("Flight Cases", flightCases, setFlightCases, YES_NO)}
                </div>
            </div>
        </div>
    );
}

export default function RefurbishedProductsClient({ initialProducts = [], initialHasMore = false, filterBounds }) {
    const bounds = filterBounds || { pixelPitchMin: "0.10", pixelPitchMax: "30.00" };

    const [products, setProducts] = useState(initialProducts);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [filtersMountKey, setFiltersMountKey] = useState(0);

    // Filter state
    const [search, setSearch] = useState("");
    const [productType, setProductType] = useState("");
    const [areaOfUse, setAreaOfUse] = useState(""); // categoryId; driven by the pill row
    const [design, setDesign] = useState("");
    const [hangingBrackets, setHangingBrackets] = useState("");
    const [stackingSystem, setStackingSystem] = useState("");
    const [flightCases, setFlightCases] = useState("");
    const [pixelPitchRange, setPixelPitchRange] = useState({ min: bounds.pixelPitchMin, max: bounds.pixelPitchMax });

    const debouncedSearch = useDebounce(search);
    const debouncedPixel = useDebounce(pixelPitchRange);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/categories");
                const response = await res.json();
                if (response.success) setCategories(response.data || []);
            } catch {
                // ignore
            }
        })();
    }, []);

    const buildQueryParams = useCallback(
        (pageNum) => {
            const params = new URLSearchParams();
            params.set("page", String(pageNum));
            params.set("limit", String(PAGE_SIZE));
            if (debouncedSearch) params.set("search", debouncedSearch);
            if (productType) params.set("productType", productType);
            if (areaOfUse) params.set("categoryId", areaOfUse);
            if (design) params.set("design", design);
            if (hangingBrackets) params.set("hangingBrackets", hangingBrackets);
            if (stackingSystem) params.set("stackingSystem", stackingSystem);
            if (flightCases) params.set("flightCases", flightCases);
            if (pixelRangeIsActive(debouncedPixel, bounds)) {
                params.set("pixelPitchMin", debouncedPixel.min);
                params.set("pixelPitchMax", debouncedPixel.max);
            }
            return params.toString();
        },
        [debouncedSearch, productType, areaOfUse, design, hangingBrackets, stackingSystem, flightCases, debouncedPixel, bounds]
    );

    const fetchProducts = useCallback(
        async (pageNum, reset = false) => {
            setLoading(true);
            try {
                const res = await fetch(`/api/refurbished-products?${buildQueryParams(pageNum)}`);
                const response = await res.json();
                if (response.success) {
                    setProducts((prev) => (reset ? response.data : [...prev, ...response.data]));
                    setHasMore(response.data.length === PAGE_SIZE);
                }
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        },
        [buildQueryParams]
    );

    // Re-fetch from page 1 whenever a filter changes
    const filtersKey = buildQueryParams(1);
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        setPage(1);
        fetchProducts(1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtersKey]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        const next = page + 1;
        setPage(next);
        fetchProducts(next, false);
    }, [page, loading, hasMore, fetchProducts]);

    const observer = useRef(null);
    const lastElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) loadMore();
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, loadMore]
    );

    const clearFilters = () => {
        setProductType("");
        setDesign("");
        setHangingBrackets("");
        setStackingSystem("");
        setFlightCases("");
        setPixelPitchRange({ min: String(bounds.pixelPitchMin), max: String(bounds.pixelPitchMax) });
        setFiltersMountKey((k) => k + 1);
    };

    const filterProps = {
        bounds,
        productType, setProductType,
        design, setDesign,
        hangingBrackets, setHangingBrackets,
        stackingSystem, setStackingSystem,
        flightCases, setFlightCases,
        pixelPitchRange, setPixelPitchRange,
    };

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title="Refurbished Products"
                breadcrumbs={[{ label: "Home", href: "/" }, { label: "Refurbished Products" }]}
            />
            <main className="flex-1 container mx-auto px-4 lg:px-6 py-6 sm:py-8">
                {/* Advertisement banner (hidden when no active ads) */}
                <div className="mb-6 sm:mb-8">
                    <AdvertisementBanner />
                </div>

                <div className="mb-6 sm:mb-8">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by serie or product number..."
                            className="pl-10 h-10 sm:h-11 text-sm rounded-lg border-border/80 shadow-sm placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                {/* Area of Use pills */}
                <div className="mb-6 sm:mb-8 flex flex-wrap gap-2">
                    <Button
                        variant={areaOfUse === "" ? "default" : "outline"}
                        size="sm"
                        className={areaOfUse === "" ? "" : "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"}
                        onClick={() => setAreaOfUse("")}
                    >
                        All
                    </Button>
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={areaOfUse === category.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAreaOfUse(category.id)}
                            className={areaOfUse === category.id ? "" : "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                {/* Mobile filter trigger */}
                <div className="lg:hidden mb-5">
                    <Button
                        variant="outline"
                        size="default"
                        onClick={() => setSheetOpen(true)}
                        className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                        <FilterIcon className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                </div>

                {/* Mobile Filter Sheet */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetContent side="left" className="w-[min(100vw,380px)] p-0 flex flex-col">
                        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/60">
                            <div className="flex items-center justify-between gap-3">
                                <SheetTitle className="text-base font-semibold flex items-center gap-2">
                                    <FilterIcon className="w-4 h-4 text-primary" />
                                    Filters
                                </SheetTitle>
                                <Button variant="ghost" size="sm" className="text-xs text-primary h-8" onClick={clearFilters}>
                                    Clear all
                                </Button>
                            </div>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto px-5 py-5">
                            <FiltersAccordion key={filtersMountKey} {...filterProps} />
                        </div>
                        <div className="px-5 py-4 border-t border-border/60 bg-muted/20">
                            <Button className="w-full" size="default" onClick={() => setSheetOpen(false)}>
                                Show results
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Desktop filter sidebar */}
                    <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col sticky top-24 self-start">
                        <div className="rounded-xl border border-border/60 bg-gray-50/80 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                                <h3 className="text-sm font-semibold  uppercase tracking-wide flex items-center gap-2 text-foreground">
                                    <FilterIcon className="w-4 h-4 text-primary" />
                                    Filters
                                </h3>
                                <Button variant="ghost" size="sm" className="text-xs text-primary h-8 px-2" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>
                            <div className="overflow-y-auto pr-1 max-h-[calc(100vh-11rem)]">
                                <FiltersAccordion key={filtersMountKey} {...filterProps} />
                            </div>
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="flex-1 min-w-0">
                        {loading && products.length === 0 ? (
                            <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Spinner className="h-5 w-5" />
                                    <span className="text-sm">Loading...</span>
                                </div>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                                {products.map((product, index) => {
                                    const isLast = products.length === index + 1;
                                    return (
                                        <Link
                                            key={product.id}
                                            href={`/refurbished-products/${product.slug}`}
                                            ref={isLast ? lastElementRef : null}
                                            className="block group h-full"
                                        >
                                            <RefurbishedProductCard product={product} className="h-full" />
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-6 rounded-xl border border-dashed border-border/60 bg-muted/20">
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                    No refurbished products found.
                                </p>
                            </div>
                        )}
                        {loading && products.length > 0 && (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Spinner className="h-4 w-4" />
                                    <span className="text-sm">Loading more...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { RestrictedContentOverlay } from "@/components/guest/RestrictedContentOverlay";
import ProductCard from "@/components/guest/ProductCard";
import { ProductsRangeFilter } from "@/components/guest/ProductsRangeFilter";
import { Label } from "@/components/ui/label";

const FALLBACK_FILTER_BOUNDS = {
    pixelPitchMin: "0.10",
    pixelPitchMax: "30.00",
    powerConsumptionMaxMin: 0,
    powerConsumptionMaxMax: 20000,
    powerConsumptionTypicalMin: 0,
    powerConsumptionTypicalMax: 20000,
};

/** Query param tokens — must match `app/api/(guest)/products/route.js` */
const WARRANTY_FILTER_OPTIONS = [
    { value: "12", labelEn: "12 Months (Basic)", labelDe: "12 Monate (Basic)" },
    { value: "24", labelEn: "24 Months (Standard)", labelDe: "24 Monate (Standard)" },
    { value: "36", labelEn: "36 Months (Industry Standard)", labelDe: "36 Monate (Industriestandard)" },
    { value: "gte_60", labelEn: "≥ 60 Months (Premium)", labelDe: "≥ 60 Monate (Premium)" },
];

const LED_LIFESPAN_FILTER_OPTIONS = [
    { value: "lt_50000", labelEn: "< 50,000", labelDe: "< 50.000" },
    { value: "50000_70000", labelEn: "50,000 – 70,000", labelDe: "50.000 – 70.000" },
    { value: "70000_100000", labelEn: "70,000 – 100,000", labelDe: "70.000 – 100.000" },
    { value: "gte_100000", labelEn: "≥ 100,000", labelDe: "≥ 100.000" },
];

const BRIGHTNESS_FILTER_OPTIONS = [
    { value: "lt_1000", labelEn: "< 1,000", labelDe: "< 1.000" },
    { value: "1000_2000", labelEn: "1,000 – 2,000", labelDe: "1.000 – 2.000" },
    { value: "2000_4000", labelEn: "2,000 – 4,000", labelDe: "2.000 – 4.000" },
    { value: "4000_6000", labelEn: "4,000 – 6,000", labelDe: "4.000 – 6.000" },
    { value: "6000_8000", labelEn: "6,000 – 8,000", labelDe: "6.000 – 8.000" },
    { value: "gte_8000", labelEn: "≥ 8,000", labelDe: "≥ 8.000" },
];

const CONTRAST_FILTER_OPTIONS = [
    { value: "lt_3000", labelEn: "< 3,000 (Basic)", labelDe: "< 3.000 (Basic)" },
    { value: "3000_5000", labelEn: "3,000 – 5,000 (Standard)", labelDe: "3.000 – 5.000 (Standard)" },
    { value: "5000_10000", labelEn: "5,000 – 10,000 (High Quality)", labelDe: "5.000 – 10.000 (Hohe Qualität)" },
    { value: "gte_10000", labelEn: "≥ 10,000 (Premium)", labelDe: "≥ 10.000 (Premium)" },
];

const REFRESH_RATE_FILTER_OPTIONS = [
    { value: "lt_1000", labelEn: "< 1,000 Hz", labelDe: "< 1.000 Hz" },
    { value: "1000_1920", labelEn: "1,000 – 1,920 Hz", labelDe: "1.000 – 1.920 Hz" },
    { value: "gt_1920_le_3840", labelEn: "> 1,920 Hz (Standard)", labelDe: "> 1.920 Hz (Standard)" },
    { value: "gt_3840_le_7680", labelEn: "> 3,840 Hz (Professional)", labelDe: "> 3.840 Hz (Professional)" },
    { value: "gt_7680", labelEn: "> 7,680 Hz (Broadcast)", labelDe: "> 7.680 Hz (Broadcast)" },
];

// ---------------------------------------------------------------------------
// Debounce hook
// Returns a debounced copy of `value` that only updates after `delay` ms of
// inactivity.  Default delay is 400 ms – feel free to tune it.
// ---------------------------------------------------------------------------
function useDebounce(value, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
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

function intRangeIsActive(range, bMin, bMax) {
    if (!range?.min || !range?.max) return false;
    const a = parseInt(range.min, 10);
    const b = parseInt(range.max, 10);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    return a !== bMin || b !== bMax;
}


function FiltersAccordion({
    productType, setProductType,
    design, setDesign,
    specialTypes, setSpecialTypes,
    application, setApplication,
    filterBounds,
    pixelPitchRange, setPixelPitchRange,
    powerMaxRange, setPowerMaxRange,
    powerTypicalRange, setPowerTypicalRange,
    ledTechnology, setLedTechnology,
    ledLifespan, setLedLifespan,
    chipBonding, setChipBonding,
    brightnessValue, setBrightnessValue,
    contrastRatio, setContrastRatio,
    refreshRate, setRefreshRate,
    powerRedundancy, setPowerRedundancy,
    memoryOnModule, setMemoryOnModule,
    smartModule, setSmartModule,
    controlSystem, setControlSystem,
    warrantyPeriod, setWarrantyPeriod,
    isAuthenticated,
}) {
    const { language } = useLanguage();

    const sectionTitle =
        "text-sm font-semibold  uppercase tracking-wide text-foreground/90 mb-3";
    const fieldLabel =
        "text-xs font-medium text-muted-foreground font-normal mb-1.5";

    return (
        <div className="space-y-5">
            <div className="border-t border-border/60 pt-5 first:border-t-0 first:pt-0">
                <h3 className={sectionTitle}>
                    {language === "en" ? "Product Information" : "Produktinformation"}
                </h3>
                <div className={`space-y-3 ${isAuthenticated ? "" : "pb-10"}`}>
                    <div>
                        <Label className={fieldLabel}>{language === "en" ? "Design" : "Design"}</Label>
                        <Select value={design} onValueChange={setDesign}>
                            <SelectTrigger size="sm" className="w-full h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Fix">Fix</SelectItem>
                                <SelectItem value="Mobil">Mobil</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className={`${isAuthenticated ? "" : "mb-10"}`}>
                        <Label className={fieldLabel}>{language === "en" ? "Application" : "Anwendung"}</Label>
                        <Select value={application} onValueChange={setApplication}>
                            <SelectTrigger size="sm" className="w-full h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DOOH">DOOH</SelectItem>
                                <SelectItem value="Indoor Signage">Indoor Signage</SelectItem>
                                <SelectItem value="Home Theater">Home Theater</SelectItem>
                                <SelectItem value="Stadium Scoreboard">Stadium Scoreboard</SelectItem>
                                <SelectItem value="Video Cube">Video Cube</SelectItem>
                                <SelectItem value="Conference">Conference</SelectItem>
                                <SelectItem value="Stadium Ribbons">Stadium Ribbons</SelectItem>
                                <SelectItem value="Corporate Design">Corporate Design</SelectItem>
                                <SelectItem value="Staging">Staging</SelectItem>
                                <SelectItem value="Virtual Production">Virtual Production</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <RestrictedContentOverlay isAuthenticated={isAuthenticated}>
                        <div>
                            <Label className={fieldLabel}>{language === "en" ? "Product Type" : "Produkttyp"}</Label>
                            <Select value={productType} onValueChange={setProductType}>
                                <SelectTrigger size="sm" className="w-full h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AIO Systems">AIO Systems</SelectItem>
                                    <SelectItem value="LED Display Single Cabinet">LED Display Single Cabinet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className={fieldLabel}>{language === "en" ? "Special Types" : "Spezialtypen"}</Label>
                            <Select value={specialTypes} onValueChange={setSpecialTypes}>
                                <SelectTrigger size="sm" className="w-full h-9 text-sm"><SelectValue placeholder="Standard" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Transparent">Transparent</SelectItem>
                                    <SelectItem value="Curved">Curved</SelectItem>
                                    <SelectItem value="Floor">Floor</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </RestrictedContentOverlay>
                </div>
            </div>

            {/* Physical Specifications */}
            <div className="border-t border-border/60 pt-5">
                <h3 className={sectionTitle}>
                    {language === "en" ? "Physical Specifications" : "Physikalische Spezifikationen"}
                </h3>
                <div className="space-y-3">
                    {filterBounds ? (
                        <ProductsRangeFilter
                            label={language === "en" ? "Pixel Pitch (mm)" : "Pixelabstand (mm)"}
                            unit="mm"
                            boundMin={filterBounds.pixelPitchMin}
                            boundMax={filterBounds.pixelPitchMax}
                            step={0.01}
                            integer={false}
                            value={pixelPitchRange}
                            onChange={setPixelPitchRange}
                            disabled={false}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {language === "en" ? "Loading filter bounds…" : "Filtergrenzen werden geladen…"}
                        </p>
                    )}
                </div>
            </div>

            {/* LED Specifications */}
            <div className="border-t border-border/60 pt-5">
                <h3 className={sectionTitle}>
                    {language === "en" ? "LED Specifications" : "LED-Spezifikationen"}
                </h3>
                <div className={`space-y-3 ${isAuthenticated ? "" : "pb-14"}`}>
                    <div className="space-y-3">
                        <div>
                            <Label className={fieldLabel}>{language === "en" ? "LED Technology" : "LED-Technologie"}</Label>
                            <Select value={ledTechnology} onValueChange={setLedTechnology}>
                                <SelectTrigger size="sm" className="w-full h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SMD">SMD</SelectItem>
                                    <SelectItem value="SMD+GOB">SMD+GOB</SelectItem>
                                    <SelectItem value="IMD">IMD</SelectItem>
                                    <SelectItem value="COB">COB</SelectItem>
                                    <SelectItem value="DIP">DIP</SelectItem>
                                    <SelectItem value="LOB">LOB</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className={`${isAuthenticated ? "" : "mb-14"}`}>
                            <Label className={fieldLabel}>{language === "en" ? "LED Lifespan" : "LED-Lebensdauer"}</Label>
                            <Select value={ledLifespan || undefined} onValueChange={setLedLifespan}>
                                <SelectTrigger size="sm" className="w-full h-9 text-sm">
                                        <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LED_LIFESPAN_FILTER_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {language === "en" ? o.labelEn : o.labelDe}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <RestrictedContentOverlay isAuthenticated={isAuthenticated}>
                            <div>
                                <Label className={fieldLabel}>{language === "en" ? "Chip-Bonding" : "Chip-Bonding"}</Label>
                                <Select value={chipBonding} onValueChange={setChipBonding}>
                                    <SelectTrigger size="sm" className="w-full h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Gold Wire">Gold Wire</SelectItem>
                                        <SelectItem value="Copper Wire">Copper Wire</SelectItem>
                                        <SelectItem value="Flip-Chip">Flip-Chip</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </RestrictedContentOverlay>
                    </div>
                </div>
            </div>

            {/* Optical Specifications */}
            <div className="border-t border-border/60 pt-5">
                <h3 className={sectionTitle}>
                    {language === "en" ? "Optical Specifications" : "Optische Spezifikationen"}
                </h3>
                <div className="space-y-3">
                    <div className="space-y-3">
                        <div>
                            <Label className={fieldLabel}>{language === "en" ? "Brightness Value" : "Helligkeitswert"}</Label>
                            <Select value={brightnessValue || undefined} onValueChange={setBrightnessValue}>
                                <SelectTrigger size="sm" className="w-full h-9 text-sm">
                                        <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BRIGHTNESS_FILTER_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {language === "en" ? o.labelEn : o.labelDe}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className={fieldLabel}>{language === "en" ? "Contrast Ratio" : "Kontrastverhältnis"}</Label>
                            <Select value={contrastRatio || undefined} onValueChange={setContrastRatio}>
                                <SelectTrigger size="sm" className="w-full h-9 text-sm">
                                        <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CONTRAST_FILTER_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {language === "en" ? o.labelEn : o.labelDe}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Electrical Specifications */}
            <div className="border-t border-border/60 pt-5">
                <h3 className={sectionTitle}>
                    {language === "en" ? "Electrical Specifications" : "Elektrische Spezifikationen"}
                </h3>
                <div className="space-y-3">
                    <div className="space-y-3">
                        <div>
                            <Label className={fieldLabel}>{language === "en" ? "Refresh Rate" : "Aktualisierungsrate"}</Label>
                            <Select value={refreshRate || undefined} onValueChange={setRefreshRate}>
                                <SelectTrigger size="sm" className="w-full h-9 text-sm">
                                        <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REFRESH_RATE_FILTER_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {language === "en" ? o.labelEn : o.labelDe}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <RestrictedContentOverlay isAuthenticated={isAuthenticated}>
                            {filterBounds ? (
                                <>
                                    <ProductsRangeFilter
                                        label={language === "en" ? "Power Consumption Max (W)" : "Maximale Leistung (W)"}
                                        unit="W"
                                        boundMin={filterBounds.powerConsumptionMaxMin}
                                        boundMax={filterBounds.powerConsumptionMaxMax}
                                        step={1}
                                        integer
                                        value={powerMaxRange}
                                        onChange={setPowerMaxRange}
                                        disabled={false}
                                    />
                                    <ProductsRangeFilter
                                        label={language === "en" ? "Power Consumption Typical (W)" : "Typische Leistung (W)"}
                                        unit="W"
                                        boundMin={filterBounds.powerConsumptionTypicalMin}
                                        boundMax={filterBounds.powerConsumptionTypicalMax}
                                        step={1}
                                        integer
                                        value={powerTypicalRange}
                                        onChange={setPowerTypicalRange}
                                        disabled={false}
                                    />
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground mb-4">
                                    {language === "en" ? "Loading filter bounds…" : "Filtergrenzen werden geladen…"}
                                </p>
                            )}
                            <div>
                                <Label className={fieldLabel}>{language === "en" ? "Power Redundancy" : "Leistungsredundanz"}</Label>
                                <Select value={powerRedundancy} onValueChange={setPowerRedundancy}>
                                    <SelectTrigger size="sm" className="w-full h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Optional">Optional</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className={fieldLabel}>{language === "en" ? "Memory on Module" : "Speicher auf Modul"}</Label>
                                <Select value={memoryOnModule} onValueChange={setMemoryOnModule}>
                                    <SelectTrigger size="sm" className="w-full h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Optional">Optional</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className={fieldLabel}>{language === "en" ? "Smart Module" : "Smart Modul"}</Label>
                                <Select value={smartModule} onValueChange={setSmartModule}>
                                    <SelectTrigger size="sm" className="w-full h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Optional">Optional</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className={fieldLabel}>{language === "en" ? "Control System" : "Steuersystem"}</Label>
                                <Select value={controlSystem} onValueChange={setControlSystem}>
                                    <SelectTrigger size="sm" className="w-full h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Colorlight">Colorlight</SelectItem>
                                        <SelectItem value="Novastar">Novastar</SelectItem>
                                        <SelectItem value="Brompton">Brompton</SelectItem>
                                        <SelectItem value="LINSN">LINSN</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </RestrictedContentOverlay>
                    </div>
                </div>
            </div>

            {/* Warranty */}
            <div className="border-t border-border/60 pt-5 pb-6">
                <h3 className={sectionTitle}>
                    {language === "en" ? "Warranty" : "Garantie"}
                </h3>
                <div className={`space-y-3 ${isAuthenticated ? "" : "pb-14"}`}>
                    <RestrictedContentOverlay isAuthenticated={isAuthenticated}>
                        <div>
                            <Label className={fieldLabel}>{language === "en" ? "Warranty Period (Months)" : "Garantiezeitraum (Monate)"}</Label>
                            <Select value={warrantyPeriod || undefined} onValueChange={setWarrantyPeriod}>
                                <SelectTrigger size="sm" className="w-full h-9 text-sm">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {WARRANTY_FILTER_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {language === "en" ? o.labelEn : o.labelDe}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </RestrictedContentOverlay>
                </div>
            </div>

        </div>
    );
}

function ProductsPageContent() {
    const searchParams = useSearchParams();
    const urlCategoryAppliedRef = useRef(false);
    const lastQueryRef = useRef("");
    const [products, setProducts] = useState([]);
    const { language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    // Initialize directly from URL to avoid the "All" fetch + second filtered fetch.
    const initialUrlCategoryId = searchParams.get("categoryId") || "";
    const [selectedCategory, setSelectedCategory] = useState(initialUrlCategoryId);

    // ---------------------------------------------------------------------------
    // Raw filter states  (bound to inputs – update immediately for a responsive UI)
    // ---------------------------------------------------------------------------
    const [productType, setProductType] = useState("");
    const [design, setDesign] = useState("");
    const [specialTypes, setSpecialTypes] = useState("");
    const [application, setApplication] = useState("");
    const [filterBounds, setFilterBounds] = useState(null);
    const [filterBoundsReady, setFilterBoundsReady] = useState(false);
    const [pixelPitchRange, setPixelPitchRange] = useState({ min: "", max: "" });
    const [powerMaxRange, setPowerMaxRange] = useState({ min: "", max: "" });
    const [powerTypicalRange, setPowerTypicalRange] = useState({ min: "", max: "" });
    const [ledTechnology, setLedTechnology] = useState("");
    const [ledLifespan, setLedLifespan] = useState("");
    const [chipBonding, setChipBonding] = useState("");
    const [brightnessValue, setBrightnessValue] = useState("");
    const [contrastRatio, setContrastRatio] = useState("");
    const [refreshRate, setRefreshRate] = useState("");
    const [powerRedundancy, setPowerRedundancy] = useState("");
    const [memoryOnModule, setMemoryOnModule] = useState("");
    const [smartModule, setSmartModule] = useState("");
    const [controlSystem, setControlSystem] = useState("");
    const [warrantyPeriod, setWarrantyPeriod] = useState("");

    // ---------------------------------------------------------------------------
    // Debounced values ( 400 ms delay)
    // ---------------------------------------------------------------------------
    const debouncedSearch               = useDebounce(search, 400);
    const debouncedSelectedCategory     = useDebounce(selectedCategory, 400);
    const debouncedProductType          = useDebounce(productType, 400);
    const debouncedDesign               = useDebounce(design, 400);
    const debouncedSpecialTypes         = useDebounce(specialTypes, 400);
    const debouncedApplication          = useDebounce(application, 400);
    const debouncedPixelPitchRange      = useDebounce(pixelPitchRange, 400);
    const debouncedPowerMaxRange        = useDebounce(powerMaxRange, 400);
    const debouncedPowerTypicalRange    = useDebounce(powerTypicalRange, 400);
    const debouncedLedTechnology        = useDebounce(ledTechnology, 400);
    const debouncedLedLifespan          = useDebounce(ledLifespan, 400);
    const debouncedChipBonding          = useDebounce(chipBonding, 400);
    const debouncedBrightnessValue    = useDebounce(brightnessValue, 400);
    const debouncedContrastRatio        = useDebounce(contrastRatio, 400);
    const debouncedRefreshRate          = useDebounce(refreshRate, 400);
    const debouncedPowerRedundancy      = useDebounce(powerRedundancy, 400);
    const debouncedMemoryOnModule       = useDebounce(memoryOnModule, 400);
    const debouncedSmartModule          = useDebounce(smartModule, 400);
    const debouncedControlSystem        = useDebounce(controlSystem, 400);
    const debouncedWarrantyPeriod       = useDebounce(warrantyPeriod, 400);

    const [sheetOpen, setSheetOpen] = useState(false);
    /** Bumps on "Clear All" so Radix Selects remount and show placeholders (controlled value → ""). */
    const [filtersMountKey, setFiltersMountKey] = useState(0);

    const observer = useRef();

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                const response = await res.json();
                if (!response.success) {
                    throw new Error(response.message || "Failed to fetch categories");
                }
                setCategories(response.data);
            } catch (error) {
                toast.error(error.message);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const loadBounds = async () => {
            try {
                const res = await fetch("/api/product-filter-bounds");
                const json = await res.json();
                if (!json.success || !json.data) {
                    const d = FALLBACK_FILTER_BOUNDS;
                    setFilterBounds(d);
                    setPixelPitchRange({ min: String(d.pixelPitchMin), max: String(d.pixelPitchMax) });
                    setPowerMaxRange({
                        min: String(d.powerConsumptionMaxMin),
                        max: String(d.powerConsumptionMaxMax),
                    });
                    setPowerTypicalRange({
                        min: String(d.powerConsumptionTypicalMin),
                        max: String(d.powerConsumptionTypicalMax),
                    });
                    setFilterBoundsReady(true);
                    return;
                }
                const d = json.data;
                setFilterBounds(d);
                setPixelPitchRange({ min: String(d.pixelPitchMin), max: String(d.pixelPitchMax) });
                setPowerMaxRange({
                    min: String(d.powerConsumptionMaxMin),
                    max: String(d.powerConsumptionMaxMax),
                });
                setPowerTypicalRange({
                    min: String(d.powerConsumptionTypicalMin),
                    max: String(d.powerConsumptionTypicalMax),
                });
                setFilterBoundsReady(true);
            } catch {
                toast.error("Failed to load filter bounds; using default ranges");
                const d = FALLBACK_FILTER_BOUNDS;
                setFilterBounds(d);
                setPixelPitchRange({ min: d.pixelPitchMin, max: d.pixelPitchMax });
                setPowerMaxRange({
                    min: String(d.powerConsumptionMaxMin),
                    max: String(d.powerConsumptionMaxMax),
                });
                setPowerTypicalRange({
                    min: String(d.powerConsumptionTypicalMin),
                    max: String(d.powerConsumptionTypicalMax),
                });
                setFilterBoundsReady(true);
            }
        };
        loadBounds();
    }, []);

    // Apply `categoryId` from URL query params to the existing category filter UI/API.
    useEffect(() => {
        if (categories.length === 0) return;
        if (urlCategoryAppliedRef.current) return;

        const urlCategoryId = searchParams.get("categoryId") || "";

        if (!urlCategoryId) {
            if (selectedCategory !== "") setSelectedCategory("");
            urlCategoryAppliedRef.current = true;
            return;
        }

        const exists = categories.some((c) => c.id === urlCategoryId);
        if (exists) {
            if (selectedCategory !== urlCategoryId) setSelectedCategory(urlCategoryId);
            urlCategoryAppliedRef.current = true;
        } else {
            if (selectedCategory !== "") setSelectedCategory("");
            urlCategoryAppliedRef.current = true;
        }
    }, [searchParams, categories]);

    // Build query params – uses the DEBOUNCED values
    const buildQueryParams = useCallback((pageNum = page) => {
        const params = new URLSearchParams();
        params.append("page", pageNum.toString());
        params.append("limit", "10");
        if (debouncedSearch)                
            params.append("search", debouncedSearch);
        if (debouncedSelectedCategory)      
            params.append("categoryId", debouncedSelectedCategory);
        if (debouncedProductType)           
            params.append("productType", debouncedProductType);
        if (debouncedDesign)                
            params.append("design", debouncedDesign);
        if (debouncedSpecialTypes)          
            params.append("specialTypes", debouncedSpecialTypes);
        if (debouncedApplication)           
            params.append("application", debouncedApplication);
        if (
            filterBounds &&
            pixelRangeIsActive(debouncedPixelPitchRange, filterBounds)
        ) {
            const pMin = parseFloat(debouncedPixelPitchRange.min);
            const pMax = parseFloat(debouncedPixelPitchRange.max);
            if (Number.isFinite(pMin) && Number.isFinite(pMax) && pMin <= pMax) {
                params.append("pixelPitchMin", pMin.toFixed(2));
                params.append("pixelPitchMax", pMax.toFixed(2));
            }
        }
        if (debouncedLedTechnology)         
            params.append("ledTechnology", debouncedLedTechnology);
        if (debouncedLedLifespan)           
            params.append("ledLifespan", debouncedLedLifespan);
        if (debouncedChipBonding)           
            params.append("chipBonding", debouncedChipBonding);
        if (debouncedBrightnessValue)     
            params.append("brightnessValue", debouncedBrightnessValue);
        if (debouncedContrastRatio)         
            params.append("contrastRatio", debouncedContrastRatio);
        if (
            filterBounds &&
            intRangeIsActive(
                debouncedPowerMaxRange,
                filterBounds.powerConsumptionMaxMin,
                filterBounds.powerConsumptionMaxMax
            )
        ) {
            const pMin = parseInt(debouncedPowerMaxRange.min, 10);
            const pMax = parseInt(debouncedPowerMaxRange.max, 10);
            if (!Number.isNaN(pMin) && !Number.isNaN(pMax) && pMin <= pMax) {
                params.append("powerConsumptionMaxMin", String(pMin));
                params.append("powerConsumptionMaxMax", String(pMax));
            }
        }
        if (
            filterBounds &&
            intRangeIsActive(
                debouncedPowerTypicalRange,
                filterBounds.powerConsumptionTypicalMin,
                filterBounds.powerConsumptionTypicalMax
            )
        ) {
            const pMin = parseInt(debouncedPowerTypicalRange.min, 10);
            const pMax = parseInt(debouncedPowerTypicalRange.max, 10);
            if (!Number.isNaN(pMin) && !Number.isNaN(pMax) && pMin <= pMax) {
                params.append("powerConsumptionTypicalMin", String(pMin));
                params.append("powerConsumptionTypicalMax", String(pMax));
            }
        }
        if (debouncedRefreshRate)           
            params.append("refreshRate", debouncedRefreshRate);
        if (debouncedPowerRedundancy !== "") 
            params.append("powerRedundancy", debouncedPowerRedundancy);
        if (debouncedMemoryOnModule !== "")  
            params.append("memoryOnModule", debouncedMemoryOnModule);
        if (debouncedSmartModule !== "")     
            params.append("smartModule", debouncedSmartModule);
        if (debouncedControlSystem)         
            params.append("controlSystem", debouncedControlSystem);
        if (debouncedWarrantyPeriod)        
            params.append("warrantyPeriod", debouncedWarrantyPeriod);
        return params.toString();
    }, [
        page,
        filterBounds,
        debouncedSearch, debouncedSelectedCategory, debouncedProductType, debouncedDesign,
        debouncedSpecialTypes, debouncedApplication, debouncedPixelPitchRange, debouncedLedTechnology,
        debouncedLedLifespan, debouncedChipBonding, debouncedBrightnessValue, debouncedContrastRatio,
        debouncedPowerMaxRange, debouncedPowerTypicalRange,
        debouncedRefreshRate, debouncedPowerRedundancy, debouncedMemoryOnModule, debouncedSmartModule,
        debouncedControlSystem, debouncedWarrantyPeriod,
    ]);

    // Fetch products
    const fetchProducts = useCallback(async (pageNum, reset = false) => {
        setLoading(true);
        try {
            const queryParams = buildQueryParams(pageNum);
            const res = await fetch(`/api/products?${queryParams}`);
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch products");
            }
            if (reset) {
                setProducts(response.data);
            } else {
                setProducts((prev) => [...prev, ...response.data]);
            }
            setHasMore(response.data.length === 10);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [buildQueryParams]);

    // Reset and fetch when DEBOUNCED filters change (after CMS bounds are loaded)
    useEffect(() => {
        if (!filterBoundsReady) return;

        // Avoid duplicate fetches when debounced state changes but the actual query stays the same
        // (e.g. initial range defaults coming from filter bounds).
        const query = buildQueryParams(1);
        if (lastQueryRef.current === query) return;
        lastQueryRef.current = query;

        setPage(1);
        setProducts([]);
        fetchProducts(1, true);
    }, [
        filterBoundsReady,
        buildQueryParams,
        fetchProducts,
        debouncedSearch, debouncedSelectedCategory, debouncedProductType, debouncedDesign,
        debouncedSpecialTypes, debouncedApplication, debouncedPixelPitchRange, debouncedLedTechnology,
        debouncedLedLifespan, debouncedChipBonding, debouncedBrightnessValue, debouncedContrastRatio,
        debouncedPowerMaxRange, debouncedPowerTypicalRange,
        debouncedRefreshRate, debouncedPowerRedundancy, debouncedMemoryOnModule, debouncedSmartModule,
        debouncedControlSystem, debouncedWarrantyPeriod,
    ]);

    // Infinite scroll
    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage);
    }, [page, loading, hasMore, fetchProducts]);

    const lastProductElementRef = useCallback(
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


    const clearFilters = () => {
        setProductType("");
        setDesign("");
        setSpecialTypes("");
        setApplication("");
        if (filterBounds) {
            setPixelPitchRange({
                min: String(filterBounds.pixelPitchMin),
                max: String(filterBounds.pixelPitchMax),
            });
            setPowerMaxRange({
                min: String(filterBounds.powerConsumptionMaxMin),
                max: String(filterBounds.powerConsumptionMaxMax),
            });
            setPowerTypicalRange({
                min: String(filterBounds.powerConsumptionTypicalMin),
                max: String(filterBounds.powerConsumptionTypicalMax),
            });
        }
        setLedTechnology("");
        setLedLifespan("");
        setChipBonding("");
        setBrightnessValue("");
        setContrastRatio("");
        setRefreshRate("");
        setPowerRedundancy("");
        setMemoryOnModule("");
        setSmartModule("");
        setControlSystem("");
        setWarrantyPeriod("");
        setFiltersMountKey((k) => k + 1);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb title={language === "en" ? "Products" : "Produkte"}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Products" : "Produkte" }
                ]} />
            <main className="flex-1 container mx-auto px-4 lg:px-6 py-6 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={language === "en" ? "Search by name or product number…" : "Nach Name oder Produktnummer suchen…"}
                            className="pl-10 h-10 sm:h-11 text-sm rounded-lg border-border/80 shadow-sm placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                <div className="mb-6 sm:mb-8 flex flex-wrap gap-2">
                    <Button
                        variant={selectedCategory === "" ? "default" : "outline"}
                        size="sm"
                        className={`${
                            selectedCategory === ""
                                ? ""
                                : "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                        }`}
                        onClick={() => setSelectedCategory("")}
                    >
                        {language === "en" ? "All" : "Alle"}
                    </Button>
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`${
                                category.id === selectedCategory
                                    ? ""
                                    : "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                            }`}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                <div className="lg:hidden mb-5">
                    <Button
                        variant="outline"
                        size="default"
                        onClick={() => setSheetOpen(true)}
                        className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                        <FilterIcon className="w-4 h-4 mr-2" />
                        {language === "en" ? "Filters" : "Filter"}
                    </Button>
                </div>

                {/* Mobile Filter Sheet */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetContent side="left" className="w-[min(100vw,380px)] p-0 flex flex-col">
                        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/60">
                            <div className="flex items-center justify-between gap-3">
                                <SheetTitle className="text-base font-semibold  flex items-center gap-2">
                                    <FilterIcon className="w-4 h-4 text-primary" />
                                    {language === "en" ? "Filters" : "Filter"}
                                </SheetTitle>
                                <Button variant="ghost" size="sm" className="text-xs text-primary h-8" onClick={clearFilters}>
                                    {language === "en" ? "Clear All" : "Alle löschen"}
                                </Button>
                            </div>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto px-5 py-5">
                            <FiltersAccordion
                                key={filtersMountKey}
                                productType={productType} setProductType={setProductType}
                                design={design} setDesign={setDesign}
                                specialTypes={specialTypes} setSpecialTypes={setSpecialTypes}
                                application={application} setApplication={setApplication}
                                filterBounds={filterBounds}
                                pixelPitchRange={pixelPitchRange} setPixelPitchRange={setPixelPitchRange}
                                powerMaxRange={powerMaxRange} setPowerMaxRange={setPowerMaxRange}
                                powerTypicalRange={powerTypicalRange} setPowerTypicalRange={setPowerTypicalRange}
                                ledTechnology={ledTechnology} setLedTechnology={setLedTechnology}
                                ledLifespan={ledLifespan} setLedLifespan={setLedLifespan}
                                chipBonding={chipBonding} setChipBonding={setChipBonding}
                                brightnessValue={brightnessValue} setBrightnessValue={setBrightnessValue}
                                contrastRatio={contrastRatio} setContrastRatio={setContrastRatio}
                                refreshRate={refreshRate} setRefreshRate={setRefreshRate}
                                powerRedundancy={powerRedundancy} setPowerRedundancy={setPowerRedundancy}
                                memoryOnModule={memoryOnModule} setMemoryOnModule={setMemoryOnModule}
                                smartModule={smartModule} setSmartModule={setSmartModule}
                                controlSystem={controlSystem} setControlSystem={setControlSystem}
                                warrantyPeriod={warrantyPeriod} setWarrantyPeriod={setWarrantyPeriod}
                                isAuthenticated={isAuthenticated}
                            />
                        </div>
                        <div className="px-5 py-4 border-t border-border/60 bg-muted/20">
                            <Button className="w-full" size="default" onClick={() => setSheetOpen(false)}>
                                {language === "en" ? "Show Results" : "Ergebnisse anzeigen"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col sticky top-24 self-start">
                        <div className="rounded-xl border border-border/60 bg-gray-50/80 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                                <h3 className="text-sm font-semibold  uppercase tracking-wide flex items-center gap-2 text-foreground">
                                    <FilterIcon className="w-4 h-4 text-primary" />
                                    {language === "en" ? "Filters" : "Filter"}
                                </h3>
                                <Button variant="ghost" size="sm" className="text-xs text-primary h-8 px-2" onClick={clearFilters}>
                                    {language === "en" ? "Clear" : "Löschen"}
                                </Button>
                            </div>
                            <div className="overflow-y-auto pr-1 max-h-[calc(100vh-11rem)]">
                            <FiltersAccordion
                                key={filtersMountKey}
                                productType={productType} setProductType={setProductType}
                                design={design} setDesign={setDesign}
                                specialTypes={specialTypes} setSpecialTypes={setSpecialTypes}
                                application={application} setApplication={setApplication}
                                filterBounds={filterBounds}
                                pixelPitchRange={pixelPitchRange} setPixelPitchRange={setPixelPitchRange}
                                powerMaxRange={powerMaxRange} setPowerMaxRange={setPowerMaxRange}
                                powerTypicalRange={powerTypicalRange} setPowerTypicalRange={setPowerTypicalRange}
                                ledTechnology={ledTechnology} setLedTechnology={setLedTechnology}
                                ledLifespan={ledLifespan} setLedLifespan={setLedLifespan}
                                chipBonding={chipBonding} setChipBonding={setChipBonding}
                                brightnessValue={brightnessValue} setBrightnessValue={setBrightnessValue}
                                contrastRatio={contrastRatio} setContrastRatio={setContrastRatio}
                                refreshRate={refreshRate} setRefreshRate={setRefreshRate}
                                powerRedundancy={powerRedundancy} setPowerRedundancy={setPowerRedundancy}
                                memoryOnModule={memoryOnModule} setMemoryOnModule={setMemoryOnModule}
                                smartModule={smartModule} setSmartModule={setSmartModule}
                                controlSystem={controlSystem} setControlSystem={setControlSystem}
                                warrantyPeriod={warrantyPeriod} setWarrantyPeriod={setWarrantyPeriod}
                                isAuthenticated={isAuthenticated}
                            />
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1 min-w-0">
                        {!filterBoundsReady ? (
                            <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Spinner className="h-5 w-5" />
                                    <span className="text-sm">Loading…</span>
                                </div>
                            </div>
                        ) : loading && products.length === 0 ? (
                            <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Spinner className="h-5 w-5" />
                                    <span className="text-sm">
                                        {language === "en" ? "Loading products…" : "Produkte werden geladen…"}
                                    </span>
                                </div>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                                {products.map((product, index) => {
                                    const isLastElement = products.length === index + 1;
                                    return (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.id}`}
                                            ref={isLastElement ? lastProductElementRef : null}
                                            className="block group h-full"
                                        >
                                            <ProductCard product={product} className="h-full" />
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-6 rounded-xl border border-dashed border-border/60 bg-muted/20">
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                    {language === "en"
                                        ? "No products found. Try adjusting your filters or search."
                                        : "Keine Produkte gefunden. Passen Sie Filter oder Suche an."}
                                </p>
                            </div>
                        )}
                        {loading && products.length > 0 && (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Spinner className="h-4 w-4" />
                                    <span className="text-sm">
                                        {language === "en" ? "Loading more…" : "Weitere werden geladen…"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner className="h-8 w-8" />
                </div>
            }
        >
            <ProductsPageContent />
        </Suspense>
    );
}
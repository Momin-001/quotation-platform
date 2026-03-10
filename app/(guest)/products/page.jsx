"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, FilterIcon, X } from "lucide-react";
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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import Link from "next/link";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

function FiltersAccordion({
    accordionValue, setAccordionValue,
    productType, setProductType,
    design, setDesign,
    specialTypes, setSpecialTypes,
    application, setApplication,
    pixelPitch, setPixelPitch,
    ledTechnology, setLedTechnology,
    chipBonding, setChipBonding,
    brightnessControl, setBrightnessControl,
    contrastRatio, setContrastRatio,
    powerConsumptionMax, setPowerConsumptionMax,
    powerConsumptionTypical, setPowerConsumptionTypical,
    refreshRate, setRefreshRate,
    powerRedundancy, setPowerRedundancy,
    memoryOnModule, setMemoryOnModule,
    smartModule, setSmartModule,
    controlSystem, setControlSystem,
    receivingCard, setReceivingCard,
    ipRating, setIpRating,
    warrantyPeriod, setWarrantyPeriod,
}) {
    const { language } = useLanguage();
    return (
        <Accordion
            type="multiple"
            value={accordionValue}
            onValueChange={setAccordionValue}
            className="space-y-0"
        >
            <AccordionItem value="productInfo" className="border-t pt-4 border-b-0 first:border-t-0 first:pt-0">
                <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                    <span className="font-open-sans font-bold text-base">{language === "en" ? "Product Information" : "Produktinformation"}</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Product Type" : "Produkttyp"}</label>
                        <Select value={productType} onValueChange={setProductType}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AIO Systems">AIO Systems</SelectItem>
                                <SelectItem value="LED Display Single Cabinet">LED Display Single Cabinet</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Design" : "Design"}</label>
                        <Select value={design} onValueChange={setDesign}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Fix">Fix</SelectItem>
                                <SelectItem value="Mobil">Mobil</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Special Types" : "Spezialtypen"}</label>
                        <Select value={specialTypes} onValueChange={setSpecialTypes}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Transparent">Transparent</SelectItem>
                                <SelectItem value="Curved">Curved</SelectItem>
                                <SelectItem value="Floor">Floor</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Application" : "Anwendung"}</label>
                        <Select value={application} onValueChange={setApplication}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="physicalSpecs" className="border-t pt-4 border-b-0">
                <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                    <span className="font-open-sans font-bold text-base">{language === "en" ? "Physical Specifications" : "Physikalische Spezifikationen"}</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Pixel Pitch (mm)" : "Pixelabstand (mm)"}</label>
                        <Input type="number" step="0.01" value={pixelPitch} onChange={(e) => setPixelPitch(e.target.value)} placeholder="e.g., 1.2" />
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ledSpecs" className="border-t pt-4 border-b-0">
                <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                    <span className="font-open-sans font-bold text-base">{language === "en" ? "LED Specifications" : "LED-Spezifikationen"}</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "LED Technology" : "LED-Technologie"}</label>
                        <Select value={ledTechnology} onValueChange={setLedTechnology}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Chip-Bonding" : "Chip-Bonding"}</label>
                        <Select value={chipBonding} onValueChange={setChipBonding}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Gold Wire">Gold Wire</SelectItem>
                                <SelectItem value="Cooper Wire">Cooper Wire</SelectItem>
                                <SelectItem value="Flip-Chip">Flip-Chip</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="opticalSpecs" className="border-t pt-4 border-b-0">
                <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                    <span className="font-open-sans font-bold text-base">{language === "en" ? "Optical Specifications" : "Optische Spezifikationen"}</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Brightness Control" : "Helligkeitssteuerung"}</label>
                        <Input value={brightnessControl} onChange={(e) => setBrightnessControl(e.target.value)} placeholder="Enter brightness control" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Contrast Ratio" : "Kontrastverhältnis"}</label>
                        <Input type="number" value={contrastRatio} onChange={(e) => setContrastRatio(e.target.value)} placeholder="Enter number" />
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="electricalSpecs" className="border-t pt-4 border-b-0">
                <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                    <span className="font-open-sans font-bold text-base">{language === "en" ? "Electrical Specifications" : "Elektrische Spezifikationen"}</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Power Consumption Max" : "Maximale Leistung"}</label>
                        <Input type="number" value={powerConsumptionMax} onChange={(e) => setPowerConsumptionMax(e.target.value)} placeholder="Enter number" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Power Consumption Typical" : "Typische Leistung"}</label>
                        <Input type="number" value={powerConsumptionTypical} onChange={(e) => setPowerConsumptionTypical(e.target.value)} placeholder="Enter number" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Refresh Rate" : "Aktualisierungsrate"}</label>
                        <Input type="number" value={refreshRate} onChange={(e) => setRefreshRate(e.target.value)} placeholder="Enter refresh rate" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Power Redundancy" : "Leistungsredundanz"}</label>
                        <Select value={powerRedundancy} onValueChange={setPowerRedundancy}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Memory on Module" : "Speicher auf Modul"}</label>
                        <Select value={memoryOnModule} onValueChange={setMemoryOnModule}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Smart Module" : "Smart Modul"}</label>
                        <Select value={smartModule} onValueChange={setSmartModule}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Control System" : "Steuersystem"}</label>
                        <Select value={controlSystem} onValueChange={setControlSystem}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Colorlight">Colorlight</SelectItem>
                                <SelectItem value="Novastar">Novastar</SelectItem>
                                <SelectItem value="Brompton">Brompton</SelectItem>
                                <SelectItem value="LINSN">LINSN</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Receiving Card" : "Empfangs-Karte"}</label>
                        <Input value={receivingCard} onChange={(e) => setReceivingCard(e.target.value)} placeholder="Enter receiving card" />
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="operatingConditions" className="border-t pt-4 border-b-0">
                <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                    <span className="font-open-sans font-bold text-base">{language === "en" ? "Operating Conditions" : "Betriebsbedingungen"}</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "IP Rating" : "IP-Rating"}</label>
                        <Input value={ipRating} onChange={(e) => setIpRating(e.target.value)} placeholder="Enter text" />
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="warranty" className="border-t pt-4 border-b-0">
                <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                    <span className="font-open-sans font-bold text-base">{language === "en" ? "Warranty" : "Garantie"}</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{language === "en" ? "Warranty Period (Months)" : "Garantiezeitraum (Monate)"}</label>
                        <Input type="number" value={warrantyPeriod} onChange={(e) => setWarrantyPeriod(e.target.value)} placeholder="Enter number" />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const { language } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    
    // Filter states
    const [productType, setProductType] = useState("");
    const [design, setDesign] = useState("");
    const [specialTypes, setSpecialTypes] = useState("");
    const [application, setApplication] = useState("");
    const [pixelPitch, setPixelPitch] = useState("");
    const [ledTechnology, setLedTechnology] = useState("");
    const [chipBonding, setChipBonding] = useState("");
    const [brightnessControl, setBrightnessControl] = useState("");
    const [contrastRatio, setContrastRatio] = useState("");
    const [powerConsumptionMax, setPowerConsumptionMax] = useState("");
    const [powerConsumptionTypical, setPowerConsumptionTypical] = useState("");
    const [refreshRate, setRefreshRate] = useState("");
    const [powerRedundancy, setPowerRedundancy] = useState("");
    const [memoryOnModule, setMemoryOnModule] = useState("");
    const [smartModule, setSmartModule] = useState("");
    const [controlSystem, setControlSystem] = useState("");
    const [receivingCard, setReceivingCard] = useState("");
    const [ipRating, setIpRating] = useState("");
    const [warrantyPeriod, setWarrantyPeriod] = useState("");

    // Accordion state - all sections open by default
    const [accordionValue, setAccordionValue] = useState([]);
    const [sheetOpen, setSheetOpen] = useState(false);

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

    // Build query params
    const buildQueryParams = useCallback((pageNum = page) => {
        const params = new URLSearchParams();
        params.append("page", pageNum.toString());
        params.append("limit", "10");
        if (search) params.append("search", search);
        if (selectedCategory) params.append("categoryId", selectedCategory);
        if (productType) params.append("productType", productType);
        if (design) params.append("design", design);
        if (specialTypes) params.append("specialTypes", specialTypes);
        if (application) params.append("application", application);
        if (pixelPitch) params.append("pixelPitch", pixelPitch);
        if (ledTechnology) params.append("ledTechnology", ledTechnology);
        if (chipBonding) params.append("chipBonding", chipBonding);
        if (brightnessControl) params.append("brightnessControl", brightnessControl);
        if (contrastRatio) params.append("contrastRatio", contrastRatio);
        if (powerConsumptionMax) params.append("powerConsumptionMax", powerConsumptionMax);
        if (powerConsumptionTypical) params.append("powerConsumptionTypical", powerConsumptionTypical);
        if (refreshRate) params.append("refreshRate", refreshRate);
        if (powerRedundancy !== "") params.append("powerRedundancy", powerRedundancy);
        if (memoryOnModule !== "") params.append("memoryOnModule", memoryOnModule);
        if (smartModule !== "") params.append("smartModule", smartModule);
        if (controlSystem) params.append("controlSystem", controlSystem);
        if (receivingCard) params.append("receivingCard", receivingCard);
        if (ipRating) params.append("ipRating", ipRating);
        if (warrantyPeriod) params.append("warrantyPeriod", warrantyPeriod);
        return params.toString();
    }, [page, search, selectedCategory, productType, design, specialTypes, application, pixelPitch, ledTechnology, chipBonding, brightnessControl, contrastRatio, powerConsumptionMax, powerConsumptionTypical, refreshRate, powerRedundancy, memoryOnModule, smartModule, controlSystem, receivingCard, ipRating, warrantyPeriod]);

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

    // Reset and fetch when filters change
    useEffect(() => {
        setPage(1);
        setProducts([]);
        fetchProducts(1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, selectedCategory, productType, design, specialTypes, application, pixelPitch, ledTechnology, chipBonding, brightnessControl, contrastRatio, powerConsumptionMax, powerConsumptionTypical, refreshRate, powerRedundancy, memoryOnModule, smartModule, controlSystem, receivingCard, ipRating, warrantyPeriod]);

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
        setPixelPitch("");
        setLedTechnology("");
        setChipBonding("");
        setBrightnessControl("");
        setContrastRatio("");
        setPowerConsumptionMax("");
        setPowerConsumptionTypical("");
        setRefreshRate("");
        setPowerRedundancy("");
        setMemoryOnModule("");
        setSmartModule("");
        setControlSystem("");
        setReceivingCard("");
        setIpRating("");
        setWarrantyPeriod("");
    };

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb title={language === "en" ? "Products" : "Produkte"} 
            breadcrumbs={[
                { label: language === "en" ? "Home" : "Startseite", href: "/" }, 
                { label: language === "en" ? "Products" : "Produkte" }
                ]} />
            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 text-gray-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={language === "en" ? "Search Products by Name or Product Number" : "Produkte nach Name oder Produktnummer suchen"}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <Button
                        variant={selectedCategory === "" ? "default" : "outline"}
                        className={`${selectedCategory === "" ? "" : "border-primary text-primary hover:bg-primary hover:text-white"}`}
                        onClick={() => setSelectedCategory("")}
                        
                    >
                        {language === "en" ? "All" : "Alle"}
                    </Button>
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`${category.id === selectedCategory ? "" : "border-primary text-primary hover:bg-primary hover:text-white"}`}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                {/* Mobile Filter Button */}
                <div className="lg:hidden mb-4">
                    <Button
                        variant="outline"
                        onClick={() => setSheetOpen(true)}
                        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                    >
                        <FilterIcon className="w-4 h-4 mr-2" />
                        {language === "en" ? "Filters" : "Filter"}
                    </Button>
                </div>

                {/* Mobile Filter Sheet */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0 flex flex-col">
                        <SheetHeader className="px-5 pt-5 pb-3 border-b">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="font-bold flex items-center gap-2">
                                    <FilterIcon className="w-4 h-4" />
                                    {language === "en" ? "Filters" : "Filter"}
                                </SheetTitle>
                                <Button className="font-bold" variant="ghost" size="sm" onClick={clearFilters}>
                                    {language === "en" ? "Clear All" : "Alle löschen"}
                                </Button>
                            </div>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            <FiltersAccordion
                                accordionValue={accordionValue}
                                setAccordionValue={setAccordionValue}
                                productType={productType} setProductType={setProductType}
                                design={design} setDesign={setDesign}
                                specialTypes={specialTypes} setSpecialTypes={setSpecialTypes}
                                application={application} setApplication={setApplication}
                                pixelPitch={pixelPitch} setPixelPitch={setPixelPitch}
                                ledTechnology={ledTechnology} setLedTechnology={setLedTechnology}
                                chipBonding={chipBonding} setChipBonding={setChipBonding}
                                brightnessControl={brightnessControl} setBrightnessControl={setBrightnessControl}
                                contrastRatio={contrastRatio} setContrastRatio={setContrastRatio}
                                powerConsumptionMax={powerConsumptionMax} setPowerConsumptionMax={setPowerConsumptionMax}
                                powerConsumptionTypical={powerConsumptionTypical} setPowerConsumptionTypical={setPowerConsumptionTypical}
                                refreshRate={refreshRate} setRefreshRate={setRefreshRate}
                                powerRedundancy={powerRedundancy} setPowerRedundancy={setPowerRedundancy}
                                memoryOnModule={memoryOnModule} setMemoryOnModule={setMemoryOnModule}
                                smartModule={smartModule} setSmartModule={setSmartModule}
                                controlSystem={controlSystem} setControlSystem={setControlSystem}
                                receivingCard={receivingCard} setReceivingCard={setReceivingCard}
                                ipRating={ipRating} setIpRating={setIpRating}
                                warrantyPeriod={warrantyPeriod} setWarrantyPeriod={setWarrantyPeriod}
                            />
                        </div>
                        <div className="px-5 py-4 border-t">
                            <Button className="w-full" onClick={() => setSheetOpen(false)}>
                                {language === "en" ? "Show Results" : "Ergebnisse anzeigen"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Main Content: Filters + Products */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - Filters (desktop only) */}
                    <div className="hidden lg:flex w-76 shrink-0 flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <FilterIcon className="w-4 h-4" />
                                {language === "en" ? "Filters" : "Filter"}
                                </h3>
                            <Button className="font-bold" variant="ghost" size="sm" onClick={clearFilters}>
                                {language === "en" ? "Clear All" : "Alle löschen"}
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-100px)]">
                            <FiltersAccordion
                                accordionValue={accordionValue}
                                setAccordionValue={setAccordionValue}
                                productType={productType} setProductType={setProductType}
                                design={design} setDesign={setDesign}
                                specialTypes={specialTypes} setSpecialTypes={setSpecialTypes}
                                application={application} setApplication={setApplication}
                                pixelPitch={pixelPitch} setPixelPitch={setPixelPitch}
                                ledTechnology={ledTechnology} setLedTechnology={setLedTechnology}
                                chipBonding={chipBonding} setChipBonding={setChipBonding}
                                brightnessControl={brightnessControl} setBrightnessControl={setBrightnessControl}
                                contrastRatio={contrastRatio} setContrastRatio={setContrastRatio}
                                powerConsumptionMax={powerConsumptionMax} setPowerConsumptionMax={setPowerConsumptionMax}
                                powerConsumptionTypical={powerConsumptionTypical} setPowerConsumptionTypical={setPowerConsumptionTypical}
                                refreshRate={refreshRate} setRefreshRate={setRefreshRate}
                                powerRedundancy={powerRedundancy} setPowerRedundancy={setPowerRedundancy}
                                memoryOnModule={memoryOnModule} setMemoryOnModule={setMemoryOnModule}
                                smartModule={smartModule} setSmartModule={setSmartModule}
                                controlSystem={controlSystem} setControlSystem={setControlSystem}
                                receivingCard={receivingCard} setReceivingCard={setReceivingCard}
                                ipRating={ipRating} setIpRating={setIpRating}
                                warrantyPeriod={warrantyPeriod} setWarrantyPeriod={setWarrantyPeriod}
                            />
                        </div>
                    </div>

                    {/* Right Side - Product Grid */}
                    <div className="flex-1">
                        {loading && products.length === 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex items-center gap-2">
                                    <Spinner className="h-6 w-6" />
                                    <span>Loading products...</span>
                                </div>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product, index) => {
                                    const isLastElement = products.length === index + 1;
                                    return (
                                        <Link href={`/products/${product.id}`}
                                            key={product.id}
                                            ref={isLastElement ? lastProductElementRef : null}
                                            className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block"
                                        >
                                            {/* Product Image with Certificates */}
                                            <div className="relative aspect-8/7 bg-gray-100">
                                                {product.images.length > 0 ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.productName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        No Image
                                                    </div>
                                                )}
                                                {/* Certificates */}
                                                {product.productCertificates && product.productCertificates.length > 0 && (
                                                    <div className="absolute top-2 right-2 flex gap-1 flex-col flex-wrap justify-end">
                                                        {product.productCertificates.map((cert) => (
                                                            <div
                                                                key={cert.id}
                                                                className="bg-white rounded-full p-2 shadow-sm"
                                                            >
                                                                <Image
                                                                    src={cert.imageUrl}
                                                                    alt={cert.name}
                                                                    width={22}
                                                                    height={22}
                                                                    className="object-contain"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Product Info */}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg mb-1">
                                                    {product.productName}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-1">{product.productNumber}</p>
                                                <p className="text-sm bg-secondary text-white rounded-md px-2 py-1 w-fit">{product.areaOfUse || "N/A"}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No products found. Try adjusting your filters.
                            </div>
                        )}
                        {loading && products.length > 0 && (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex items-center gap-2">
                                    <Spinner className="h-5 w-5" />
                                    <span>Loading more products...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}


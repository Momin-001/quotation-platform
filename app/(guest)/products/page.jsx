"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, FilterIcon } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import Link from "next/link";
import BreadCrumb from "@/components/BreadCrumb";
import { toast } from "sonner";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
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
            <BreadCrumb title="Products" 
            breadcrumbs={[
                { label: "Home", href: "/" }, 
                { label: "Products" }
                ]} />
            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 text-gray-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Products by Name or Product Number"
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
                        All
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

                {/* Main Content: Filters + Products */}
                <div className="flex gap-8">
                    {/* Left Sidebar - Filters */}
                    <div className="w-76 shrink-0 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <FilterIcon className="w-4 h-4" />
                                Filters
                                </h3>
                            <Button className="font-bold" variant="ghost" size="sm" onClick={clearFilters}>
                                Clear All
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-100px)]">
                            <Accordion
                                type="multiple"
                                value={accordionValue}
                                onValueChange={setAccordionValue}
                                className="space-y-0"
                            >
                                {/* Product Information */}
                                <AccordionItem value="productInfo" className="border-t pt-4 border-b-0 first:border-t-0 first:pt-0">
                                    <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                                        <span className="font-open-sans font-bold text-base">Product Information</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Product Type</label>
                                            <Select value={productType} onValueChange={setProductType}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="AIO systems">AIO systems</SelectItem>
                                                    <SelectItem value="LED Display single cabinet">LED Display single cabinet</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Design</label>
                                            <Select value={design} onValueChange={setDesign}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fix">Fix</SelectItem>
                                                    <SelectItem value="mobil">Mobil</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Special Types</label>
                                            <Select value={specialTypes} onValueChange={setSpecialTypes}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="transparent">Transparent</SelectItem>
                                                    <SelectItem value="curved">Curved</SelectItem>
                                                    <SelectItem value="floor">Floor</SelectItem>
                                                    <SelectItem value="N/A">N/A</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Application</label>
                                            <Select value={application} onValueChange={setApplication}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DOOH">DOOH</SelectItem>
                                                    <SelectItem value="Indoor signage">Indoor signage</SelectItem>
                                                    <SelectItem value="Home theater">Home theater</SelectItem>
                                                    <SelectItem value="Stadium scoreboard">Stadium scoreboard</SelectItem>
                                                    <SelectItem value="Video cube">Video cube</SelectItem>
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

                                {/* Physical Specifications */}
                                <AccordionItem value="physicalSpecs" className="border-t pt-4 border-b-0">
                                    <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                                        <span className="font-open-sans font-bold text-base">Physical Specifications</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Pixel Pitch (mm)</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={pixelPitch}
                                                onChange={(e) => setPixelPitch(e.target.value)}
                                                placeholder="e.g., 1.2"
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* LED Specifications */}
                                <AccordionItem value="ledSpecs" className="border-t pt-4 border-b-0">
                                    <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                                        <span className="font-open-sans font-bold text-base">LED Specifications</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">LED Technology</label>
                                            <Select value={ledTechnology} onValueChange={setLedTechnology}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SMD">SMD</SelectItem>
                                                    <SelectItem value="SMD+GOB">SMD+GOB</SelectItem>
                                                    <SelectItem value="IMD">IMD</SelectItem>
                                                    <SelectItem value="COB">COB</SelectItem>
                                                    <SelectItem value="DIP">DIP</SelectItem>
                                                    <SelectItem value="LOB">LOB</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Chip-Bonding</label>
                                            <Select value={chipBonding} onValueChange={setChipBonding}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="gold wire">Gold Wire</SelectItem>
                                                    <SelectItem value="cooper wire">Cooper Wire</SelectItem>
                                                    <SelectItem value="Flip chip">Flip Chip</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Optical Specifications */}
                                <AccordionItem value="opticalSpecs" className="border-t pt-4 border-b-0">
                                    <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                                        <span className="font-open-sans font-bold text-base">Optical Specifications</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Brightness Control</label>
                                            <Input
                                                value={brightnessControl}
                                                onChange={(e) => setBrightnessControl(e.target.value)}
                                                placeholder="Enter brightness control"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Contrast Ratio</label>
                                            <Input
                                                type="number"
                                                value={contrastRatio}
                                                onChange={(e) => setContrastRatio(e.target.value)}
                                                placeholder="Enter number"
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Electrical Specifications */}
                                <AccordionItem value="electricalSpecs" className="border-t pt-4 border-b-0">
                                    <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                                        <span className="font-open-sans font-bold text-base">Electrical Specifications</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Power Consumption Max</label>
                                            <Input
                                                type="number"
                                                value={powerConsumptionMax}
                                                onChange={(e) => setPowerConsumptionMax(e.target.value)}
                                                placeholder="Enter number"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Power Consumption Typical</label>
                                            <Input
                                                type="number"
                                                value={powerConsumptionTypical}
                                                onChange={(e) => setPowerConsumptionTypical(e.target.value)}
                                                placeholder="Enter number"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Refresh Rate</label>
                                            <Input
                                                type="number"
                                                value={refreshRate}
                                                onChange={(e) => setRefreshRate(e.target.value)}
                                                placeholder="Enter refresh rate"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Power Redundancy</label>
                                            <Select value={powerRedundancy} onValueChange={setPowerRedundancy}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="yes">Yes</SelectItem>
                                                    <SelectItem value="no">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Memory on Module</label>
                                            <Select value={memoryOnModule} onValueChange={setMemoryOnModule}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="yes">Yes</SelectItem>
                                                    <SelectItem value="no">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Smart Module</label>
                                            <Select value={smartModule} onValueChange={setSmartModule}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="yes">Yes</SelectItem>
                                                    <SelectItem value="no">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Control System</label>
                                            <Select value={controlSystem} onValueChange={setControlSystem}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Colorlight">Colorlight</SelectItem>
                                                    <SelectItem value="Novastar">Novastar</SelectItem>
                                                    <SelectItem value="Brompton">Brompton</SelectItem>
                                                    <SelectItem value="LINSN">LINSN</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Receiving Card</label>
                                            <Input
                                                value={receivingCard}
                                                onChange={(e) => setReceivingCard(e.target.value)}
                                                placeholder="Enter receiving card"
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Operating Conditions */}
                                <AccordionItem value="operatingConditions" className="border-t pt-4 border-b-0">
                                    <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                                        <span className="font-open-sans font-bold text-base">Operating Conditions</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">IP Rating</label>
                                            <Input
                                                value={ipRating}
                                                onChange={(e) => setIpRating(e.target.value)}
                                                placeholder="Enter text"
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Warranty */}
                                <AccordionItem value="warranty" className="border-t pt-4 border-b-0">
                                    <AccordionTrigger className="w-full flex items-center justify-between font-medium">
                                        <span className="font-open-sans font-bold text-base">Warranty</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Warranty Period (Months)</label>
                                            <Input
                                                type="number"
                                                value={warrantyPeriod}
                                                onChange={(e) => setWarrantyPeriod(e.target.value)}
                                                placeholder="Enter number"
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
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
                            <div className="grid grid-cols-3 gap-6">
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
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={product.imageUrl}
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
                                                {product.certificates && product.certificates.length > 0 && (
                                                    <div className="absolute top-2 right-2 flex gap-1 flex-col flex-wrap justify-end">
                                                        {product.certificates.map((cert) => (
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
                                                <p className="text-sm bg-secondary text-white rounded-md px-2 py-1 w-fit">{product.categoryName || "N/A"}</p>
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


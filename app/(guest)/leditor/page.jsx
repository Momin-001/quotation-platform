"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import {
    Search,
    Plus,
    Minus,
    ChevronLeft,
    ChevronRight,
    Monitor,
    Send,
} from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const enquirySchema = z.object({
    message: z.string().min(10, "Please enter a message (at least 10 characters)"),
    privacy: z.boolean().refine((val) => val === true, "Please agree to the Privacy Policy and Terms & Conditions"),
    captcha: z.union([z.string(), z.any()]).refine((val) => !!val, "Please complete the captcha"),
});

export default function LeditorPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    // Data states
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 5,
        totalCount: 0,
        totalPages: 0,
    });

    // Selected product
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Screen configuration fields
    const [config, setConfig] = useState({
        ledTechnology: "",
        ledTechnologyOther: "",
        brightnessValue: "",
        pixelPitch: "",
        refreshRate: "",
        cabinetWidth: "",
        cabinetHeight: "",
        screenWidth: 1,
        screenHeight: 1,
    });

    // Enquiry form (react-hook-form)
    const {
        register,
        handleSubmit: rhfHandleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(enquirySchema),
        defaultValues: {
            message: "",
            privacy: false,
            captcha: "",
        },
    });

    // Canvas ref
    const canvasRef = useRef(null);
    // Pre-load images for canvas
    const leditorImgRef = useRef(null);
    const personImgRef = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        let loaded = 0;
        const checkLoaded = () => {
            loaded++;
            if (loaded >= 2) setImagesLoaded(true);
        };

        const ledImg = new window.Image();
        ledImg.src = "/leditor.jpg";
        ledImg.onload = checkLoaded;
        ledImg.onerror = checkLoaded;
        leditorImgRef.current = ledImg;

        const personImg = new window.Image();
        personImg.src = "/person.jpg";
        personImg.onload = checkLoaded;
        personImg.onerror = checkLoaded;
        personImgRef.current = personImg;
    }, []);

    // Accordion open sections
    const [accordionSections, setAccordionSections] = useState([
        "preview",
        "selection",
        "screen-info",
    ]);

    // Fetch products from API
    const fetchProducts = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "5",
            });

            if (selectedCategory && selectedCategory !== "all") {
                params.set("categoryId", selectedCategory);
            }

            if (search) {
                params.set("search", search);
            }

            const res = await fetch(`/api/leditor?${params.toString()}`);
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch products");
            }

            setCategories(response.data.categories || []);
            setProducts(response.data.products || []);
            setPagination(response.data.pagination || {});
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [page, selectedCategory, search]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Debounced search
    const [searchTimeout, setSearchTimeout] = useState(null);
    const handleSearch = (value) => {
        setSearch(value);
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(
            setTimeout(() => {
                setPage(1);
            }, 300)
        );
    };

    // Handle category change
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setPage(1);
    };

    // Handle product selection
    const handleSelectProduct = (product) => {
        setSelectedProduct(product);

        // Convert cabinet dimensions from mm to meters for display
        const cabWidthM = product.cabinetWidth
            ? parseFloat(product.cabinetWidth) / 1000
            : 0.5;
        const cabHeightM = product.cabinetHeight
            ? parseFloat(product.cabinetHeight) / 1000
            : 0.5;

        // Set initial screen to 1 cabinet
        const initialScreenW = parseFloat(cabWidthM.toFixed(3));
        const initialScreenH = parseFloat(cabHeightM.toFixed(3));

        setConfig({
            ledTechnology: product.ledTechnology || "",
            ledTechnologyOther: product.ledTechnologyOther || "",
            brightnessValue: product.brightnessValue || "",
            pixelPitch: product.pixelPitch || "",
            refreshRate: product.refreshRate?.toString() || "",
            cabinetWidth: product.cabinetWidth || "",
            cabinetHeight: product.cabinetHeight || "",
            screenWidth: initialScreenW,
            screenHeight: initialScreenH,
        });
    };

    // Calculate cabinets count
    const getCabinetsInfo = useCallback(() => {
        const cabWidthM = config.cabinetWidth
            ? parseFloat(config.cabinetWidth) / 1000
            : 0;
        const cabHeightM = config.cabinetHeight
            ? parseFloat(config.cabinetHeight) / 1000
            : 0;
        if (!cabWidthM || !cabHeightM) {
            return { countH: 1, countV: 1 };
        }

        const countH = Math.max(1, Math.round(config.screenWidth / cabWidthM));
        const countV = Math.max(1, Math.round(config.screenHeight / cabHeightM));

        return { countH, countV };
    }, [config.cabinetWidth, config.cabinetHeight, config.screenWidth, config.screenHeight]);

    // ─── Computed / Derived values ───
    const computed = useMemo(() => {
        const cabInfo = getCabinetsInfo();
        const totalCabinets = cabInfo.countH * cabInfo.countV;

        // 1) Total Resolution
        const cabinetResH = selectedProduct?.cabinetResolutionHorizontal || 0;
        const cabinetResV = selectedProduct?.cabinetResolutionVertical || 0;
        const totalResH = cabinetResH * cabInfo.countH;
        const totalResV = cabinetResV * cabInfo.countV;

        // 2) Weight
        const cabinetWeight = selectedProduct?.weightWithoutPackaging
            ? parseFloat(selectedProduct.weightWithoutPackaging)
            : 0;
        const totalWeight = parseFloat((cabinetWeight * totalCabinets).toFixed(2));

        // 3) Display Area (m²) — screenWidth and screenHeight are already in meters
        const displayArea = parseFloat((config.screenWidth * config.screenHeight).toFixed(4));

        // 4) Dimension string
        const dimension = `${config.screenWidth.toFixed(3)}m × ${config.screenHeight.toFixed(3)}m`;

        // 5) Power Consumption (per m² × display area)
        const pcMax = selectedProduct?.powerConsumptionMax || 0;
        const pcTyp = selectedProduct?.powerConsumptionTypical || 0;
        const powerMax = parseFloat((pcMax * displayArea).toFixed(2));
        const powerTypical = parseFloat((pcTyp * displayArea).toFixed(2));

        return {
            cabInfo,
            totalCabinets,
            totalResH,
            totalResV,
            totalWeight,
            displayArea,
            dimension,
            powerMax,
            powerTypical,
        };
    }, [getCabinetsInfo, selectedProduct, config.screenWidth, config.screenHeight]);

    // Adjust screen width/height by one cabinet
    const adjustScreenWidth = (delta) => {
        const cabWidthM = config.cabinetWidth
            ? parseFloat(config.cabinetWidth) / 1000
            : 0.5;
        const newWidth = Math.max(
            cabWidthM,
            parseFloat((config.screenWidth + delta * cabWidthM).toFixed(3))
        );
        setConfig((prev) => ({ ...prev, screenWidth: newWidth }));
    };

    const adjustScreenHeight = (delta) => {
        const cabHeightM = config.cabinetHeight
            ? parseFloat(config.cabinetHeight) / 1000
            : 0.5;
        const newHeight = Math.max(
            cabHeightM,
            parseFloat((config.screenHeight + delta * cabHeightM).toFixed(3))
        );
        setConfig((prev) => ({ ...prev, screenHeight: newHeight }));
    };

    // Draw LED preview on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imagesLoaded) return;

        const ctx = canvas.getContext("2d");
        const containerWidth = canvas.parentElement.clientWidth;

        const PERSON_HEIGHT_M = 1.6;
        const showPerson = config.screenHeight >= PERSON_HEIGHT_M;

        // Reserve space: person on the left, labels on top/right/bottom
        const personReserveW = showPerson ? 80 : 0; // pixels reserved for person column
        const maxW = Math.min(containerWidth - 32, 900);
        const ledMaxW = maxW - personReserveW - 40; // 40 for right label
        const maxH = 450;

        const screenRatio = config.screenWidth / config.screenHeight;
        let drawW, drawH;

        if (screenRatio > ledMaxW / maxH) {
            drawW = ledMaxW;
            drawH = ledMaxW / screenRatio;
        } else {
            drawH = maxH;
            drawW = maxH * screenRatio;
        }

        // Person height in pixels (relative to LED height)
        const personDrawH = showPerson ? (PERSON_HEIGHT_M / config.screenHeight) * drawH : 0;
        // Person aspect ratio ~0.35 (typical silhouette)
        const personDrawW = personImgRef.current?.naturalWidth && personImgRef.current?.naturalHeight
            ? personDrawH * (personImgRef.current.naturalWidth / personImgRef.current.naturalHeight)
            : personDrawH * 0.35;

        const actualPersonReserve = showPerson ? Math.max(personReserveW, personDrawW + 16) : 0;

        // Canvas total dimensions
        const totalW = actualPersonReserve + drawW + 40; // 40 for right label
        const totalH = Math.max(drawH, personDrawH) + 80; // 80 for top/bottom labels

        const dpr = window.devicePixelRatio || 1;
        canvas.width = totalW * dpr;
        canvas.height = totalH * dpr;
        canvas.style.width = `${totalW}px`;
        canvas.style.height = `${totalH}px`;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, totalW, totalH);

        // LED screen position: after person area, centered vertically with bottom alignment
        const ledX = actualPersonReserve;
        const ledBottomY = totalH - 30; // 30px bottom margin for cabinets label
        const ledY = ledBottomY - drawH;

        const cabInfo = computed.cabInfo;

        // ── Draw leditor image inside the LED area ──
        if (leditorImgRef.current && leditorImgRef.current.complete && leditorImgRef.current.naturalWidth) {
            // Draw image to fill LED area (cover)
            const img = leditorImgRef.current;
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const ledRatio = drawW / drawH;
            let sx, sy, sw, sh;
            if (imgRatio > ledRatio) {
                // Image is wider — crop sides
                sh = img.naturalHeight;
                sw = sh * ledRatio;
                sx = (img.naturalWidth - sw) / 2;
                sy = 0;
            } else {
                // Image is taller — crop top/bottom
                sw = img.naturalWidth;
                sh = sw / ledRatio;
                sx = 0;
                sy = (img.naturalHeight - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, ledX, ledY, drawW, drawH);
        } else {
            // Fallback solid dark color
            ctx.fillStyle = "#1a2d4a";
            ctx.fillRect(ledX, ledY, drawW, drawH);
        }

        // ── Draw cabinet grid lines on top of image ──
        const cellW = drawW / cabInfo.countH;
        const cellH = drawH / cabInfo.countV;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;

        for (let i = 0; i <= cabInfo.countH; i++) {
            const x = ledX + i * cellW;
            ctx.beginPath();
            ctx.moveTo(x, ledY);
            ctx.lineTo(x, ledY + drawH);
            ctx.stroke();
        }

        for (let i = 0; i <= cabInfo.countV; i++) {
            const y = ledY + i * cellH;
            ctx.beginPath();
            ctx.moveTo(ledX, y);
            ctx.lineTo(ledX + drawW, y);
            ctx.stroke();
        }

        // ── Draw screen border ──
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.strokeRect(ledX, ledY, drawW, drawH);

        // ── Draw person image (bottom-left, aligned to LED bottom) ──
        if (showPerson && personImgRef.current && personImgRef.current.complete && personImgRef.current.naturalWidth) {
            const personX = actualPersonReserve - personDrawW - 8; // 8px gap from LED
            const personY = ledBottomY - personDrawH; // bottom-aligned with LED

            ctx.drawImage(personImgRef.current, personX, personY, personDrawW, personDrawH);

            // Draw person height label
            ctx.fillStyle = "#64748b";
            ctx.font = "11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("1.6m", personX + personDrawW / 2, personY - 5);
        }

        // ── Draw dimension labels ──
        ctx.fillStyle = "#3b82f6";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";

        // Width label (top)
        const widthLabel = `Screen Width: ${config.screenWidth.toFixed(2)}m`;
        ctx.fillText(widthLabel, ledX + drawW / 2, ledY - 12);

        // Width arrow line
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ledX + 10, ledY - 6);
        ctx.lineTo(ledX + drawW - 10, ledY - 6);
        ctx.stroke();

        // Height label (right side, rotated)
        ctx.save();
        ctx.translate(ledX + drawW + 18, ledY + drawH / 2);
        ctx.rotate(Math.PI / 2);
        const heightLabel = `Screen Height: ${config.screenHeight.toFixed(2)}m`;
        ctx.fillText(heightLabel, 0, 0);
        ctx.restore();

        // Cabinets info (bottom center)
        ctx.fillStyle = "#64748b";
        ctx.font = "12px Inter, sans-serif";
        ctx.textAlign = "center";
        const cabLabel = `${cabInfo.countH} × ${cabInfo.countV} Cabinets`;
        ctx.fillText(cabLabel, ledX + drawW / 2, ledBottomY + 18);
    }, [config, computed.cabInfo, imagesLoaded]);

    // Submit enquiry
    const onSubmitEnquiry = async (data) => {
        if (!selectedProduct) {
            toast.error("Please select a product first");
            return;
        }

        try {
            const res = await fetch("/api/user/enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: data.message.trim(),
                    isCustom: true,
                    items: [
                        {
                            productId: selectedProduct.id,
                            quantity: 1,
                            isCustom: true,
                            customLedTechnology: config.ledTechnology,
                            customBrightnessValue: config.brightnessValue,
                            customPixelPitch: config.pixelPitch,
                            customRefreshRate: parseInt(config.refreshRate) || 0,
                            customResolutionHorizontal: selectedProduct.cabinetResolutionHorizontal || null,
                            customResolutionVertical: selectedProduct.cabinetResolutionVertical || null,
                            customCabinetWidth: config.cabinetWidth,
                            customCabinetHeight: config.cabinetHeight,
                            customScreenWidth: config.screenWidth.toString(),
                            customScreenHeight: config.screenHeight.toString(),
                            // New calculated fields
                            customTotalResolutionH: computed.totalResH,
                            customTotalResolutionV: computed.totalResV,
                            customWeight: computed.totalWeight.toString(),
                            customDisplayArea: computed.displayArea.toString(),
                            customDimension: computed.dimension,
                            customPowerConsumptionMax: computed.powerMax.toString(),
                            customPowerConsumptionTyp: computed.powerTypical.toString(),
                            customTotalCabinets: computed.totalCabinets,
                        },
                    ],
                }),
            });

            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to submit enquiry");
            }

            toast.success("Custom LED enquiry submitted successfully!");
            router.push("/user/my-enquiries");
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb
                title="Leditor"
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Leditor" },
                ]}
            />

            <div className="container mx-auto px-4 py-8 space-y-8">
                <Accordion
                    type="multiple"
                    value={accordionSections}
                    onValueChange={setAccordionSections}
                    className="space-y-8"
                >
                    {/* ===== SECTION 1: PREVIEW ===== */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <AccordionItem value="preview" className="border-0">
                            <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Preview
                                    </h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6">
                                    <div className="flex items-center justify-center rounded-lg p-4 min-h-[400px]">
                                        <canvas
                                            ref={canvasRef}
                                            className="max-w-full"
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </div>

                    {/* ===== SECTION 2: SELECT A MODEL CONFIGURATION ===== */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <AccordionItem value="selection" className="border-0">
                            <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Select a model configuration
                                    </h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6 space-y-4">
                                    {/* Category Tabs */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            onClick={() => handleCategoryChange("all")}
                                            className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                                                selectedCategory === "all"
                                                    ? "bg-blue-500 text-white border-blue-500"
                                                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                                            }`}
                                        >
                                            ALL
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => handleCategoryChange(cat.id)}
                                                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all uppercase ${
                                                    selectedCategory === cat.id
                                                        ? "bg-blue-500 text-white border-blue-500"
                                                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                                                }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Search Bar */}
                                    <div className="relative max-w-md">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search by product name..."
                                            value={search}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    {/* Products Table */}
                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Spinner className="h-8 w-8" />
                                        </div>
                                    ) : products.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p>No products found.</p>
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg overflow-x-auto">
                                            <Table className="min-w-full">
                                                <TableHeader className="bg-gray-50">
                                                    <TableRow>
                                                        <TableHead className="p-4 font-semibold text-gray-700 whitespace-nowrap">
                                                            Product Name
                                                        </TableHead>
                                                        <TableHead className="p-4 font-semibold text-gray-700 whitespace-nowrap">
                                                            Pitch
                                                        </TableHead>
                                                        <TableHead className="p-4 font-semibold text-gray-700 whitespace-nowrap">
                                                            Brightness
                                                        </TableHead>
                                                        <TableHead className="p-4 font-semibold text-gray-700 whitespace-nowrap">
                                                            Resolution (H x V)
                                                        </TableHead>
                                                        <TableHead className="p-4 font-semibold text-gray-700 whitespace-nowrap">
                                                            Refresh Rate
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {products.map((product) => (
                                                        <TableRow
                                                            key={product.id}
                                                            onClick={() => handleSelectProduct(product)}
                                                            className={`cursor-pointer transition-colors ${
                                                                selectedProduct?.id === product.id
                                                                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                                                                    : "hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            <TableCell className="p-4 font-medium">
                                                                {product.productName}
                                                            </TableCell>
                                                            <TableCell className="p-4">
                                                                {product.pixelPitch ? `${product.pixelPitch}mm` : "N/A"}
                                                            </TableCell>
                                                            <TableCell className="p-4">
                                                                {product.brightnessValue ? `${product.brightnessValue} nits` : "N/A"}
                                                            </TableCell>
                                                            <TableCell className="p-4 text-sm">
                                                                {product.cabinetResolutionHorizontal && product.cabinetResolutionVertical
                                                                    ? `${product.cabinetResolutionHorizontal} × ${product.cabinetResolutionVertical}`
                                                                    : "N/A"}
                                                            </TableCell>
                                                            <TableCell className="p-4">
                                                                {product.refreshRate ? `${product.refreshRate} Hz` : "N/A"}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {pagination.totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-4 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <span className="text-sm text-gray-600">
                                                Page {pagination.page} of {pagination.totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                                disabled={page === pagination.totalPages}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </div>

                    {/* ===== SECTION 3: SCREEN INFORMATION ===== */}
                    <div
                        id="screen-info-section"
                        className="bg-white rounded-xl border shadow-sm overflow-hidden"
                    >
                        <AccordionItem value="screen-info" className="border-0">
                            <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Screen Information
                                    </h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6 space-y-6">
                                    {!selectedProduct ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p>
                                                Please select a product from the table
                                                above to configure your LED screen.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Product Info - Disabled Fields */}
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cabinet Specifications</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <Label>LED Technology</Label>
                                                    <Input
                                                        value={`${config.ledTechnology} ${config.ledTechnologyOther ? `- ${config.ledTechnologyOther}` : ""}`}
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Brightness (nits)</Label>
                                                    <Input
                                                        value={config.brightnessValue}
                                                        
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Pixel Pitch (mm)</Label>
                                                    <Input
                                                        value={config.pixelPitch}
                                                        
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Refresh Rate (Hz)</Label>
                                                    <Input
                                                        value={config.refreshRate}
                                                       
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Cabinet Width (mm)</Label>
                                                    <Input
                                                        value={config.cabinetWidth}
                                                        
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Cabinet Height (mm)</Label>
                                                    <Input
                                                        value={config.cabinetHeight}
                                                        
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                            </div>

                                            {/* Screen Width & Height with +/- (Dynamic) */}
                                            <div className="space-y-2 pt-4">
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Screen Size Configuration</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>Width (meters)</Label>
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10 shrink-0"
                                                            onClick={() => adjustScreenWidth(-1)}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            step="0.001"
                                                            value={config.screenWidth}
                                                            onChange={(e) =>
                                                                setConfig((prev) => ({
                                                                    ...prev,
                                                                    screenWidth: parseFloat(e.target.value) || 0,
                                                                }))
                                                            }
                                                            className="text-center"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10 shrink-0"
                                                            onClick={() => adjustScreenWidth(1)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Height (meters)</Label>
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10 shrink-0"
                                                            onClick={() => adjustScreenHeight(-1)}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            step="0.001"
                                                            value={config.screenHeight}
                                                            onChange={(e) =>
                                                                setConfig((prev) => ({
                                                                    ...prev,
                                                                    screenHeight: parseFloat(e.target.value) || 0,
                                                                }))
                                                            }
                                                            className="text-center"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10 shrink-0"
                                                            onClick={() => adjustScreenHeight(1)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Calculated Fields */}
                                            <div className="space-y-2 pt-4">
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Custom LED Summary</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <Label>Total Resolution</Label>
                                                    <Input
                                                        value={
                                                            computed.totalResH && computed.totalResV
                                                                ? `${computed.totalResH} × ${computed.totalResV} px`
                                                                : "N/A"
                                                        }
                                                        
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Total Weight</Label>
                                                    <Input
                                                        value={
                                                            computed.totalWeight
                                                                ? `${computed.totalWeight} kg`
                                                                : "N/A"
                                                        }
                                                        
                                                        readOnly
                                                    className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Display Area</Label>
                                                    <Input
                                                        value={
                                                            computed.displayArea
                                                                ? `${computed.displayArea} m²`
                                                                : "N/A"
                                                        }
                                                        
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Dimension</Label>
                                                    <Input
                                                        value={computed.dimension}
                                                        
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Power Consumption Max (W)</Label>
                                                    <Input
                                                        value={
                                                            computed.powerMax
                                                                ? `${computed.powerMax} W`
                                                                : "N/A"
                                                        }
                                                        
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Power Consumption Typical (W)</Label>
                                                    <Input
                                                        value={
                                                            computed.powerTypical
                                                                ? `${computed.powerTypical} W`
                                                                : "N/A"
                                                        }
                                                        
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Total Cabinets</Label>
                                                    <Input
                                                        value={`${computed.totalCabinets}`}
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                            </div>

                                            {/* Enquiry Submission */}
                                            <div className="pt-6 mt-6">
                                                <h3 className="text-lg font-bold mb-4">
                                                    Submit Custom Enquiry
                                                </h3>

                                                {isAuthenticated ? (
                                                    <form
                                                        onSubmit={rhfHandleSubmit(onSubmitEnquiry)}
                                                        className="space-y-4 max-w-2xl"
                                                    >
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Your Name</Label>
                                                                <Input
                                                                    value={user?.fullName || ""}
                                                                    disabled
                                                                    className="bg-gray-100"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Your Email</Label>
                                                                <Input
                                                                    value={user?.email || ""}
                                                                    disabled
                                                                    className="bg-gray-100"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="enquiry-message">Your Message*</Label>
                                                            <Textarea
                                                                id="enquiry-message"
                                                                {...register("message")}
                                                                placeholder="Describe your custom LED screen requirements..."
                                                                rows={4}
                                                                className={errors.message ? "border-red-500" : ""}
                                                            />
                                                            {errors.message && (
                                                                <p className="text-sm text-red-500">{errors.message.message}</p>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Controller
                                                                name="privacy"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Checkbox
                                                                        id="privacy-leditor"
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                )}
                                                            />
                                                            <Label
                                                                htmlFor="privacy-leditor"
                                                                className="text-sm cursor-pointer"
                                                            >
                                                                I agree to the Privacy Policy and Terms & Conditions.
                                                            </Label>
                                                            {errors.privacy && (
                                                                <p className="text-sm text-red-500 ml-2">{errors.privacy.message}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <ReCAPTCHA
                                                                sitekey={NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                                                onChange={(val) => setValue("captcha", val || "", { shouldValidate: true })}
                                                            />
                                                            {errors.captcha && (
                                                                <p className="text-sm text-red-500 mt-1">{errors.captcha.message}</p>
                                                            )}
                                                        </div>

                                                        <Button
                                                            type="submit"
                                                            disabled={isSubmitting}
                                                            className="w-full md:w-auto px-10"
                                                            size="lg"
                                                        >
                                                            {isSubmitting ? (
                                                                <>
                                                                    <Spinner className="h-4 w-4 mr-2" />
                                                                    Submitting...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Send className="h-4 w-4 mr-2" />
                                                                    Submit Enquiry
                                                                </>
                                                            )}
                                                        </Button>
                                                    </form>
                                                ) : (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                                                        <p className="text-blue-800 mb-4">
                                                            Please login to submit your custom LED enquiry.
                                                        </p>
                                                        <Button onClick={() => router.push("/login")}>
                                                            Login to Continue
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </div>
                </Accordion>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
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
    X,
    Upload,
    FileText,
    ChevronDown,
} from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useLanguage } from "@/context/LanguageContext";

const enquirySchema = z.object({
    message: z.string().min(10, "Please enter a message (at least 10 characters)"),
    privacy: z.boolean().refine((val) => val === true, "Please agree to the Privacy Policy and Terms & Conditions"),
    captcha: z.union([z.string(), z.any()]).refine((val) => !!val, "Please complete the captcha"),
});

export default function LeditorPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const { language } = useLanguage();
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

    // Installation & Service state
    const [installationData, setInstallationData] = useState({
        serviceAccess: "Front Service",
        mountingMethod: "Wall Mount",
        operatingHours: "Standard (8-12 hours/day)",
        powerRedundancy: "Required",
        ipRating: "",
    });

    // Optional accessories state
    const [selectedAccessories, setSelectedAccessories] = useState([]);
    const [accessorySearch, setAccessorySearch] = useState("");
    const [accessoryResults, setAccessoryResults] = useState([]);
    const [accessoryDropdownOpen, setAccessoryDropdownOpen] = useState(false);
    const [accessoryLoading, setAccessoryLoading] = useState(false);
    const [accessoryDropdownRect, setAccessoryDropdownRect] = useState(null);
    const accessorySearchRef = useRef(null);
    const accessoryTriggerRef = useRef(null);

    // File upload state
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // Notes state

    // Canvas ref
    const canvasRef = useRef(null);
    // Pre-load images for canvas
    const leditorImgRef = useRef(null);
    const personImgRef = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    // User's own image for preview (local state only, cleared on refresh)
    const [userPreviewImageUrl, setUserPreviewImageUrl] = useState(null);
    const userPreviewImageRef = useRef(null);
    const [userPreviewImageLoaded, setUserPreviewImageLoaded] = useState(false);

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

    // Load user's preview image when they select a file
    useEffect(() => {
        if (!userPreviewImageUrl) {
            userPreviewImageRef.current = null;
            setUserPreviewImageLoaded(false);
            return;
        }
        const img = new window.Image();
        img.onload = () => {
            userPreviewImageRef.current = img;
            setUserPreviewImageLoaded(true);
        };
        img.onerror = () => {
            userPreviewImageRef.current = null;
            setUserPreviewImageLoaded(false);
        };
        img.src = userPreviewImageUrl;
        return () => {
            URL.revokeObjectURL(userPreviewImageUrl);
            userPreviewImageRef.current = null;
            setUserPreviewImageLoaded(false);
        };
    }, [userPreviewImageUrl]);

    // Accordion open sections
    const [accordionSections, setAccordionSections] = useState([
        "preview",
        "selection",
        "screen-info",
        "installation-service",
        "optional-services",
        "file-upload",
        "notes-submission",
        "submit-enquiry",
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

        // ── Draw leditor image inside the LED area (user's image or default) ──
        const imgToDraw = userPreviewImageRef.current?.complete && userPreviewImageRef.current?.naturalWidth
            ? userPreviewImageRef.current
            : leditorImgRef.current;
        if (imgToDraw && imgToDraw.complete && imgToDraw.naturalWidth) {
            // Draw image to fill LED area (cover)
            const img = imgToDraw;
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
    }, [config, computed.cabInfo, imagesLoaded, userPreviewImageLoaded]);

    // Fetch accessories when dropdown opens (show list by default) and when search changes (filter)
    useEffect(() => {
        if (!accessoryDropdownOpen) return;
        const timer = setTimeout(async () => {
            setAccessoryLoading(true);
            try {
                const params = new URLSearchParams();
                if (accessorySearch.trim()) params.set("search", accessorySearch.trim());
                const res = await fetch(`/api/accessories?${params.toString()}`);
                const json = await res.json();
                if (json.success) {
                    const filtered = (json.data || []).filter(
                        (a) => !selectedAccessories.some((s) => s.id === a.id)
                    );
                    setAccessoryResults(filtered);
                }
            } catch (e) {
                console.error("Failed to fetch accessories:", e);
            } finally {
                setAccessoryLoading(false);
            }
        }, accessorySearch.trim() ? 300 : 0);
        return () => clearTimeout(timer);
    }, [accessoryDropdownOpen, accessorySearch, selectedAccessories]);

    // Measure trigger position when dropdown opens; clear when closes
    useEffect(() => {
        if (!accessoryDropdownOpen) {
            setAccessoryDropdownRect(null);
            return;
        }
        const updateRect = () => {
            if (accessoryTriggerRef.current) {
                setAccessoryDropdownRect(accessoryTriggerRef.current.getBoundingClientRect());
            }
        };
        updateRect();
        window.addEventListener("scroll", updateRect, true);
        window.addEventListener("resize", updateRect);
        return () => {
            window.removeEventListener("scroll", updateRect, true);
            window.removeEventListener("resize", updateRect);
        };
    }, [accessoryDropdownOpen]);

    const handleAddAccessory = (accessory) => {
        setSelectedAccessories((prev) => [...prev, accessory]);
        setAccessorySearch("");
        setAccessoryResults([]);
        setAccessoryDropdownOpen(false);
    };

    const handleRemoveAccessory = (id) => {
        setSelectedAccessories((prev) => prev.filter((a) => a.id !== id));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter((f) => {
            const ext = f.name.split(".").pop()?.toLowerCase();
            return ["pdf", "jpg", "jpeg", "png", "dwg"].includes(ext);
        });
        if (validFiles.length !== files.length) {
            toast.error("Some files were skipped. Accepted: PDF, JPG, PNG, DWG");
        }
        setUploadedFiles((prev) => [...prev, ...validFiles]);
        e.target.value = "";
    };

    const handleRemoveFile = (index) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Submit enquiry
    const onSubmitEnquiry = async (data) => {
        if (!selectedProduct) {
            toast.error("Please select a product first");
            return;
        }

        try {
            const payload = {
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
                        customTotalResolutionH: computed.totalResH,
                        customTotalResolutionV: computed.totalResV,
                        customWeight: computed.totalWeight.toString(),
                        customDisplayArea: computed.displayArea.toString(),
                        customDimension: computed.dimension,
                        customPowerConsumptionMax: computed.powerMax.toString(),
                        customPowerConsumptionTyp: computed.powerTypical.toString(),
                        customTotalCabinets: computed.totalCabinets,
                        // Installation & Service
                        customServiceAccess: installationData.serviceAccess,
                        customMountingMethod: installationData.mountingMethod,
                        customOperatingHours: installationData.operatingHours,
                        customPowerRedundancy: installationData.powerRedundancy,
                        customIpRating: installationData.ipRating || null,
                        // Selected accessories
                        accessoryIds: selectedAccessories.map((a) => a.id),
                    },
                ],
            };

            const formData = new FormData();
            formData.append("payload", JSON.stringify(payload));
            uploadedFiles.forEach((file) => {
                formData.append("files", file);
            });

            const res = await fetch("/api/user/enquiries", {
                method: "POST",
                body: formData,
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
                title={language === "en" ? "Leditor" : "Leditor"}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Leditor" : "Leditor" },
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
                        <AccordionItem value="preview" defaultValue="preview" className="border-0">
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
                                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                                        {/* LED Preview canvas */}
                                        <div className="flex-1 w-full flex items-center justify-center rounded-lg bg-gray-50 border p-4 min-h-[360px]">
                                            <canvas
                                                ref={canvasRef}
                                                className="max-w-full"
                                            />
                                        </div>
                                        {/* Screen size controls - right of preview (or below on mobile) for live feedback */}
                                        {selectedProduct && (
                                            <div className="w-full lg:w-72 shrink-0 rounded-lg border bg-white p-4 space-y-4">
                                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Screen Size</h3>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Width (m)</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9 shrink-0"
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
                                                                className="text-center flex-1"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9 shrink-0"
                                                                onClick={() => adjustScreenWidth(1)}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Height (m)</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9 shrink-0"
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
                                                                className="text-center flex-1"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9 shrink-0"
                                                                onClick={() => adjustScreenHeight(1)}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Change width/height to see the LED preview update live.
                                                </p>
                                                {/* Preview with your own image (local only, cleared on refresh) */}
                                                <div className="space-y-2 pt-2 border-t">
                                                    <Label className="text-sm">Preview with your own image</Label>
                                                    <p className="text-xs text-gray-500">
                                                        Upload an image to see how it would look on the screen.
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <label className="flex items-center w-full justify-center h-10 px-4 border rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                                            <span className="mr-2">+</span>
                                                            {userPreviewImageUrl ? "Change image" : "Upload image"}
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        if (userPreviewImageUrl) URL.revokeObjectURL(userPreviewImageUrl);
                                                                        setUserPreviewImageUrl(URL.createObjectURL(file));
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        {userPreviewImageUrl && (
                                                            <Button
                                                                type="button"

                                                                onClick={() => {
                                                                    URL.revokeObjectURL(userPreviewImageUrl);
                                                                    setUserPreviewImageUrl(null);
                                                                }}
                                                            >
                                                                Clear
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </div>

                    {/* ===== SECTION 2: SELECT A MODEL CONFIGURATION ===== */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <AccordionItem value="selection" defaultValue="selection" className="border-0">
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
                                            className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${selectedCategory === "all"
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
                                                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all uppercase ${selectedCategory === cat.id
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
                                                            className={`cursor-pointer transition-colors ${selectedProduct?.id === product.id
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
                        <AccordionItem value="screen-info" defaultValue="screen-info" className="border-0">
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

                                            {/* Screen size controls are in the Preview section for live feedback */}

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


                                        </>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </div>
                {/* Installation & Service Accordion */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    
                        <AccordionItem value="installation-service" defaultValue="installation-service" className="border-0">
                            <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-teal-500 rounded-full" />
                                    <h2 className="text-lg font-bold text-gray-900">Installation & Service</h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="font-semibold">Service Access</Label>
                                            <div className="flex flex-wrap gap-4 pt-1">
                                                {["Front Service", "Rear Service"].map((val) => (
                                                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="serviceAccess"
                                                            value={val}
                                                            checked={installationData.serviceAccess === val}
                                                            onChange={(e) => setInstallationData((p) => ({ ...p, serviceAccess: e.target.value }))}
                                                            className="accent-teal-500"
                                                        />
                                                        <span className="text-sm">{val}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-semibold">Mounting Method</Label>
                                            <div className="flex flex-wrap gap-4 pt-1">
                                                {["Wall Mount", "Hanging / Rigging", "Ground Support", "Freestanding Structure"].map((val) => (
                                                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="mountingMethod"
                                                            value={val}
                                                            checked={installationData.mountingMethod === val}
                                                            onChange={(e) => setInstallationData((p) => ({ ...p, mountingMethod: e.target.value }))}
                                                            className="accent-teal-500"
                                                        />
                                                        <span className="text-sm">{val}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="ipRating" className="font-semibold">IP Rating (Weather Protection)</Label>
                                            <Input
                                                id="ipRating"
                                                value={installationData.ipRating}
                                                onChange={(e) => setInstallationData((p) => ({ ...p, ipRating: e.target.value }))}
                                                placeholder="e.g. IP65"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-semibold">Power Redundancy</Label>
                                            <div className="flex flex-wrap gap-4 pt-1">
                                                {["Required", "Not Required"].map((val) => (
                                                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="powerRedundancy"
                                                            value={val}
                                                            checked={installationData.powerRedundancy === val}
                                                            onChange={(e) => setInstallationData((p) => ({ ...p, powerRedundancy: e.target.value }))}
                                                            className="accent-teal-500"
                                                        />
                                                        <span className="text-sm">{val}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold">Operating Hours</Label>
                                        <div className="flex flex-wrap gap-4 pt-1">
                                            {["Standard (8-12 hours/day)", "Extended (12-20 hours/day)", "24/7 Operation"].map((val) => (
                                                <label key={val} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="operatingHours"
                                                        value={val}
                                                        checked={installationData.operatingHours === val}
                                                        onChange={(e) => setInstallationData((p) => ({ ...p, operatingHours: e.target.value }))}
                                                        className="accent-teal-500"
                                                    />
                                                    <span className="text-sm">{val}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    
                </div>

                {/* Optional Services Accordion */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  
                        <AccordionItem value="optional-services" defaultValue="optional-services" className="border-0">
                            <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-teal-500 rounded-full" />
                                    <h2 className="text-lg font-bold text-gray-900">Optional Services</h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6 space-y-4">
                                    <Label className="font-semibold">Additional Services Needed</Label>
                                    <div ref={accessorySearchRef} className="relative max-w-lg">
                                        <button
                                            ref={accessoryTriggerRef}
                                            type="button"
                                            onClick={() => setAccessoryDropdownOpen((prev) => !prev)}
                                            className="w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg bg-white hover:border-gray-400 transition-colors text-left"
                                        >
                                            <span className="text-gray-400">-Select</span>
                                            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                                        </button>
                                        {accessoryDropdownOpen && accessoryDropdownRect && typeof document !== "undefined" && createPortal(
                                            <>
                                                <div
                                                    className="fixed inset-0 z-[100]"
                                                    onClick={() => setAccessoryDropdownOpen(false)}
                                                    aria-hidden
                                                />
                                                <div
                                                    className="fixed z-[101] bg-white border rounded-lg shadow-lg"
                                                    style={{
                                                        top: accessoryDropdownRect.bottom + 4,
                                                        left: accessoryDropdownRect.left,
                                                        width: Math.max(accessoryDropdownRect.width, 280),
                                                        minWidth: 280,
                                                    }}
                                                >
                                                    <div className="p-2 border-b">
                                                        <div className="relative">
                                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                value={accessorySearch}
                                                                onChange={(e) => setAccessorySearch(e.target.value)}
                                                                placeholder="Search accessories..."
                                                                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {accessoryLoading && accessoryResults.length === 0 ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <Spinner className="h-5 w-5" />
                                                                <span className="ml-2 text-sm text-gray-500">Loading...</span>
                                                            </div>
                                                        ) : accessoryResults.length === 0 ? (
                                                            <div className="px-4 py-3 text-sm text-gray-500">No accessories found</div>
                                                        ) : (
                                                            accessoryResults.map((acc) => (
                                                                <button
                                                                    key={acc.id}
                                                                    type="button"
                                                                    onClick={() => handleAddAccessory(acc)}
                                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium">{acc.productName}</span>
                                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 shrink-0">Accessory</span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-0.5">{acc.productNumber}</p>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </>,
                                            document.body
                                        )}
                                    </div>
                                    {selectedAccessories.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {selectedAccessories.map((acc) => (
                                                <div
                                                    key={acc.id}
                                                    className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1.5 rounded-full text-sm"
                                                >
                                                    <span>{acc.productName}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAccessory(acc.id)}
                                                        className="hover:text-red-600 transition-colors"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                </div>

                {/* File Upload Accordion */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <AccordionItem value="file-upload" defaultValue="file-upload" className="border-0">
                            <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-teal-500 rounded-full" />
                                    <h2 className="text-lg font-bold text-gray-900">File Upload</h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6 space-y-4">
                                    <Label className="font-semibold">Upload Reference Files</Label>
                                    <label className="flex items-center gap-2 cursor-pointer border rounded-lg px-4 py-3 max-w-sm hover:bg-gray-50 transition-colors">
                                        <Upload className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Attach</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png,.dwg"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-xs text-teal-600">Accepted file types: PDF, JPG, PNG, DWG</p>
                                    {uploadedFiles.length > 0 && (
                                        <div className="space-y-2 mt-2">
                                            {uploadedFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-3 bg-gray-50 border rounded-lg px-4 py-2">
                                                    <FileText className="h-4 w-4 text-gray-500 shrink-0" />
                                                    <span className="text-sm flex-1 truncate">{file.name}</span>
                                                    <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile(idx)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                </div>

                {/* Notes & Submission Accordion */}
                <div
                    id="submit-enquiry-section"
                    className="bg-white rounded-xl border shadow-sm overflow-hidden"
                >
                    <AccordionItem value="notes-submission" defaultValue="notes-submission" className="border-0">
                    <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                           <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-teal-500 rounded-full" />
                                <h2 className="text-lg font-bold text-gray-900">
                                    Notes & Submission
                                </h2>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6 space-y-6">
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
                        </AccordionContent>
                    </AccordionItem>
                </div>
                </Accordion>
            </div>
        </div>
    );
}

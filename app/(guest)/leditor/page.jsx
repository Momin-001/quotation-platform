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

function MultiCheckbox({ label, options, value = [], onChange }) {
    const toggle = (opt) => {
        if (value.includes(opt)) {
            onChange(value.filter((v) => v !== opt));
        } else {
            onChange([...value, opt]);
        }
    };
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex flex-wrap gap-x-5 gap-y-3 pt-1">
                {options.map((opt) => (
                    <Label key={opt} className="cursor-pointer font-normal mb-0 flex items-center gap-2">
                        <Checkbox
                            checked={value.includes(opt)}
                            onCheckedChange={() => toggle(opt)}
                            className="data-[state=checked]:bg-secondary data-[state=checked]:text-primary-foreground"
                        />
                        <span>{opt}</span>
                    </Label>
                ))}
            </div>
        </div>
    );
}

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
        serviceAccess: [],
        mountingMethod: "Wall Mount",
        operatingHours: "Standard (8-12 hours/day)",
        powerRedundancy: "Required",
        ipRating: "",
        installationAndService: [],
    });

    // Additional fields state
    const [structuralConstraints, setStructuralConstraints] = useState({ width: "", height: "", depth: "" });
    const [viewingDistance, setViewingDistance] = useState({ min: "", max: "" });
    const [controllerConfig, setControllerConfig] = useState([]);
    const [networkConnection, setNetworkConnection] = useState([]);
    const [signalSourceInputs, setSignalSourceInputs] = useState([]);
    const [additionalServices, setAdditionalServices] = useState([]);

    // Controller selection state (replaces accessories)
    const [selectedController, setSelectedController] = useState(null);
    const [controllerSearch, setControllerSearch] = useState("");
    const [controllerResults, setControllerResults] = useState([]);
    const [controllerDropdownOpen, setControllerDropdownOpen] = useState(false);
    const [controllerLoading, setControllerLoading] = useState(false);
    const [controllerDropdownRect, setControllerDropdownRect] = useState(null);
    const controllerSearchRef = useRef(null);
    const controllerTriggerRef = useRef(null);

    // File upload state
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // Canvas ref
    const canvasRef = useRef(null);
    const leditorImgRef = useRef(null);
    const personImgRef = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    // User's own image for preview
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
        "additional-config",
        "controller-selection",
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

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setPage(1);
    };

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);

        const cabWidthM = product.cabinetWidth
            ? parseFloat(product.cabinetWidth) / 1000
            : 0.5;
        const cabHeightM = product.cabinetHeight
            ? parseFloat(product.cabinetHeight) / 1000
            : 0.5;

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

    const computed = useMemo(() => {
        const cabInfo = getCabinetsInfo();
        const totalCabinets = cabInfo.countH * cabInfo.countV;

        const cabinetResH = selectedProduct?.cabinetResolutionHorizontal || 0;
        const cabinetResV = selectedProduct?.cabinetResolutionVertical || 0;
        const totalResH = cabinetResH * cabInfo.countH;
        const totalResV = cabinetResV * cabInfo.countV;

        const cabinetWeight = selectedProduct?.weightWithoutPackaging
            ? parseFloat(selectedProduct.weightWithoutPackaging)
            : 0;
        const totalWeight = parseFloat((cabinetWeight * totalCabinets).toFixed(2));

        const displayArea = parseFloat((config.screenWidth * config.screenHeight).toFixed(4));

        const dimension = `${config.screenWidth.toFixed(3)}m × ${config.screenHeight.toFixed(3)}m`;

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

        const personReserveW = showPerson ? 80 : 0;
        const maxW = Math.min(containerWidth - 32, 900);
        const ledMaxW = maxW - personReserveW - 40;
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

        const personDrawH = showPerson ? (PERSON_HEIGHT_M / config.screenHeight) * drawH : 0;
        const personDrawW = personImgRef.current?.naturalWidth && personImgRef.current?.naturalHeight
            ? personDrawH * (personImgRef.current.naturalWidth / personImgRef.current.naturalHeight)
            : personDrawH * 0.35;

        const actualPersonReserve = showPerson ? Math.max(personReserveW, personDrawW + 16) : 0;

        const totalW = actualPersonReserve + drawW + 40;
        const totalH = Math.max(drawH, personDrawH) + 80;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = totalW * dpr;
        canvas.height = totalH * dpr;
        canvas.style.width = `${totalW}px`;
        canvas.style.height = `${totalH}px`;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, totalW, totalH);

        const ledX = actualPersonReserve;
        const ledBottomY = totalH - 30;
        const ledY = ledBottomY - drawH;

        const cabInfo = computed.cabInfo;

        const imgToDraw = userPreviewImageRef.current?.complete && userPreviewImageRef.current?.naturalWidth
            ? userPreviewImageRef.current
            : leditorImgRef.current;
        if (imgToDraw && imgToDraw.complete && imgToDraw.naturalWidth) {
            const img = imgToDraw;
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const ledRatio = drawW / drawH;
            let sx, sy, sw, sh;
            if (imgRatio > ledRatio) {
                sh = img.naturalHeight;
                sw = sh * ledRatio;
                sx = (img.naturalWidth - sw) / 2;
                sy = 0;
            } else {
                sw = img.naturalWidth;
                sh = sw / ledRatio;
                sx = 0;
                sy = (img.naturalHeight - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, ledX, ledY, drawW, drawH);
        } else {
            ctx.fillStyle = "#1a2d4a";
            ctx.fillRect(ledX, ledY, drawW, drawH);
        }

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

        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.strokeRect(ledX, ledY, drawW, drawH);

        if (showPerson && personImgRef.current && personImgRef.current.complete && personImgRef.current.naturalWidth) {
            const personX = actualPersonReserve - personDrawW - 8;
            const personY = ledBottomY - personDrawH;

            ctx.drawImage(personImgRef.current, personX, personY, personDrawW, personDrawH);

            ctx.fillStyle = "#64748b";
            ctx.font = "11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("1.6m", personX + personDrawW / 2, personY - 5);
        }

        ctx.fillStyle = "#3b82f6";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";

        const widthLabel = `Screen Width: ${config.screenWidth.toFixed(2)}m`;
        ctx.fillText(widthLabel, ledX + drawW / 2, ledY - 12);

        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ledX + 10, ledY - 6);
        ctx.lineTo(ledX + drawW - 10, ledY - 6);
        ctx.stroke();

        ctx.save();
        ctx.translate(ledX + drawW + 18, ledY + drawH / 2);
        ctx.rotate(Math.PI / 2);
        const heightLabel = `Screen Height: ${config.screenHeight.toFixed(2)}m`;
        ctx.fillText(heightLabel, 0, 0);
        ctx.restore();

        ctx.fillStyle = "#64748b";
        ctx.font = "12px font-open-sans";
        ctx.textAlign = "center";
        const cabLabel = `${cabInfo.countH} × ${cabInfo.countV} Cabinets`;
        ctx.fillText(cabLabel, ledX + drawW / 2, ledBottomY + 18);
    }, [config, computed.cabInfo, imagesLoaded, userPreviewImageLoaded]);

    // Fetch controllers when dropdown opens and when search changes
    useEffect(() => {
        if (!controllerDropdownOpen) return;
        const timer = setTimeout(async () => {
            setControllerLoading(true);
            try {
                const params = new URLSearchParams();
                if (controllerSearch.trim()) params.set("search", controllerSearch.trim());
                const res = await fetch(`/api/controllers?${params.toString()}`);
                const json = await res.json();
                if (json.success) {
                    setControllerResults(json.data || []);
                }
            } catch (e) {
                console.error("Failed to fetch controllers:", e);
            } finally {
                setControllerLoading(false);
            }
        }, controllerSearch.trim() ? 300 : 0);
        return () => clearTimeout(timer);
    }, [controllerDropdownOpen, controllerSearch]);

    // Measure trigger position when dropdown opens
    useEffect(() => {
        if (!controllerDropdownOpen) {
            setControllerDropdownRect(null);
            return;
        }
        const updateRect = () => {
            if (controllerTriggerRef.current) {
                setControllerDropdownRect(controllerTriggerRef.current.getBoundingClientRect());
            }
        };
        updateRect();
        window.addEventListener("scroll", updateRect, true);
        window.addEventListener("resize", updateRect);
        return () => {
            window.removeEventListener("scroll", updateRect, true);
            window.removeEventListener("resize", updateRect);
        };
    }, [controllerDropdownOpen]);

    const handleSelectController = (controller) => {
        setSelectedController(controller);
        setControllerSearch("");
        setControllerResults([]);
        setControllerDropdownOpen(false);
    };

    const handleRemoveController = () => {
        setSelectedController(null);
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
                        controllerId: selectedController?.id || null,
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
                        customInstallationAndService: installationData.installationAndService,
                        // Additional fields
                        customStructuralWidth: structuralConstraints.width || null,
                        customStructuralHeight: structuralConstraints.height || null,
                        customStructuralDepth: structuralConstraints.depth || null,
                        customViewingDistanceMin: viewingDistance.min || null,
                        customViewingDistanceMax: viewingDistance.max || null,
                        customControllerConfig: controllerConfig,
                        customNetworkConnection: networkConnection,
                        customSignalSourceInputs: signalSourceInputs,
                        customAdditionalServices: additionalServices,
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
                                    <div className="w-1 h-6 bg-secondary rounded-full" />
                                    <h2 className="text-[22px] font-semibold font-open-sans text-black">
                                        Preview
                                    </h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6">
                                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                                        <div className="flex-1 w-full flex items-center justify-center rounded-lg bg-gray-50 border p-4 min-h-[360px]">
                                            <canvas
                                                ref={canvasRef}
                                                className="max-w-full"
                                            />
                                        </div>
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
                                                <p className="text-sm text-gray-500">
                                                    Change width/height to see the LED preview update live.
                                                </p>
                                                <div className="space-y-2 pt-2 border-t">
                                                    <Label className="text-sm">Preview with your own image</Label>
                                                    <p className="text-sm text-gray-500">
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
                                    <div className="w-1 h-6 bg-secondary rounded-full" />
                                    <h2 className="text-[22px] font-semibold font-open-sans text-black">
                                        Select a model configuration
                                    </h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6 space-y-4">
                                    <div className="flex flex-wrap justify-center items-center gap-2">
                                        <Button
                                            onClick={() => handleCategoryChange("all")}
                                            variant={selectedCategory === "all" ? "default" : "outline"}
                                            className={`font-open-sans font-semibold uppercase text-xl ${selectedCategory === "all" ? "" : "border-primary text-primary hover:bg-primary hover:text-white"}`}
                                        >
                                            ALL
                                        </Button>
                                        {categories.map((cat) => (
                                            <Button
                                                key={cat.id}
                                                onClick={() => handleCategoryChange(cat.id)}
                                                variant={selectedCategory === cat.id ? "default" : "outline"}
                                                className={`font-open-sans font-semibold uppercase text-xl ${selectedCategory === cat.id ? "" : "border-primary text-primary hover:bg-primary hover:text-white"}`}
                                            >
                                                {cat.name}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="relative max-w-md">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
                                        <Input
                                            type="text"
                                            placeholder="Search by product name..."
                                            value={search}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

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
                                                <TableHeader className="bg-gray-50 font-archivo text-lg">
                                                    <TableRow>
                                                        <TableHead className="p-4 font-bold whitespace-nowrap">
                                                            Product Name
                                                        </TableHead>
                                                        <TableHead className="p-4 font-bold whitespace-nowrap">
                                                            Pitch
                                                        </TableHead>
                                                        <TableHead className="p-4 font-bold whitespace-nowrap">
                                                            Brightness
                                                        </TableHead>
                                                        <TableHead className="p-4 font-bold whitespace-nowrap">
                                                            Resolution (H x V)
                                                        </TableHead>
                                                        <TableHead className="p-4 font-bold whitespace-nowrap">
                                                            Refresh Rate
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {products.map((product) => (
                                                        <TableRow
                                                            key={product.id}
                                                            onClick={() => handleSelectProduct(product)}
                                                            className={`cursor-pointer font-archivo font-normal text-lg transition-colors ${selectedProduct?.id === product.id
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
                                                            <TableCell className="p-4">
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

                                    {pagination.totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-4 pt-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <span className="text-md text-gray-800">
                                                Page {pagination.page} of {pagination.totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
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
                                    <div className="w-1 h-6 bg-secondary rounded-full" />
                                    <h2 className="text-[22px] font-semibold font-open-sans text-black">
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
                                                    <Input value={config.brightnessValue} readOnly className="bg-gray-100" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Pixel Pitch (mm)</Label>
                                                    <Input value={config.pixelPitch} readOnly className="bg-gray-100" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Refresh Rate (Hz)</Label>
                                                    <Input value={config.refreshRate} readOnly className="bg-gray-100" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Cabinet Width (mm)</Label>
                                                    <Input value={config.cabinetWidth} readOnly className="bg-gray-100" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Cabinet Height (mm)</Label>
                                                    <Input value={config.cabinetHeight} readOnly className="bg-gray-100" />
                                                </div>
                                            </div>

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
                                                        value={computed.totalWeight ? `${computed.totalWeight} kg` : "N/A"}
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Display Area</Label>
                                                    <Input
                                                        value={computed.displayArea ? `${computed.displayArea} m²` : "N/A"}
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Dimension</Label>
                                                    <Input value={computed.dimension} readOnly className="bg-gray-100" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Power Consumption Max (W)</Label>
                                                    <Input
                                                        value={computed.powerMax ? `${computed.powerMax} W` : "N/A"}
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Power Consumption Typical (W)</Label>
                                                    <Input
                                                        value={computed.powerTypical ? `${computed.powerTypical} W` : "N/A"}
                                                        readOnly
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Total Cabinets</Label>
                                                    <Input value={`${computed.totalCabinets}`} readOnly className="bg-gray-100" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </div>

                    {/* ===== SECTION 4: INSTALLATION & SERVICE ===== */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <AccordionItem value="installation-service" defaultValue="installation-service" className="border-0">
                            <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-secondary rounded-full" />
                                    <h2 className="text-[22px] font-semibold font-open-sans text-black">Installation & Service</h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <MultiCheckbox
                                            label="Installation and Service"
                                            options={["Schedule a free consultation appointment", "Preparation of tender documents"]}
                                            value={installationData.installationAndService}
                                            onChange={(val) => setInstallationData((p) => ({ ...p, installationAndService: val }))}
                                        />
                                        <MultiCheckbox
                                            label="Service Access"
                                            options={["Front service", "Rear service", "Not sure"]}
                                            value={installationData.serviceAccess}
                                            onChange={(val) => setInstallationData((p) => ({ ...p, serviceAccess: val }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Mounting Method</Label>
                                            <div className="flex flex-wrap gap-4 pt-1">
                                                {["Wall Mount", "Hanging / Rigging", "Ground Support", "Freestanding Structure"].map((val) => (
                                                    <Label key={val} className="cursor-pointer font-normal mb-0">
                                                        <input
                                                            type="radio"
                                                            name="mountingMethod"
                                                            value={val}
                                                            checked={installationData.mountingMethod === val}
                                                            onChange={(e) => setInstallationData((p) => ({ ...p, mountingMethod: e.target.value }))}
                                                            className="accent-secondary"
                                                        />
                                                        <span>{val}</span>
                                                    </Label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ipRating">IP Rating (Weather Protection)</Label>
                                            <Input
                                                id="ipRating"
                                                value={installationData.ipRating}
                                                onChange={(e) => setInstallationData((p) => ({ ...p, ipRating: e.target.value }))}
                                                placeholder="e.g. IP65"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Power Redundancy</Label>
                                            <div className="flex flex-wrap gap-4 pt-1">
                                                {["Required", "Not Required"].map((val) => (
                                                    <Label key={val} className="cursor-pointer font-normal mb-0">
                                                        <input
                                                            type="radio"
                                                            name="powerRedundancy"
                                                            value={val}
                                                            checked={installationData.powerRedundancy === val}
                                                            onChange={(e) => setInstallationData((p) => ({ ...p, powerRedundancy: e.target.value }))}
                                                            className="accent-secondary"
                                                        />
                                                        <span>{val}</span>
                                                    </Label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Operating Hours</Label>
                                            <div className="flex flex-wrap gap-4 pt-1">
                                                {["Standard (8-12 hours/day)", "Extended (12-20 hours/day)", "24/7 Operation"].map((val) => (
                                                    <Label key={val} className="cursor-pointer font-normal mb-0">
                                                        <input
                                                            type="radio"
                                                            name="operatingHours"
                                                            value={val}
                                                            checked={installationData.operatingHours === val}
                                                            onChange={(e) => setInstallationData((p) => ({ ...p, operatingHours: e.target.value }))}
                                                            className="accent-secondary"
                                                        />
                                                        <span>{val}</span>
                                                    </Label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Structural Constraints */}
                                    <div className="space-y-2 pt-2">
                                        <Label>Structural Constraints / Installation Space</Label>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm text-gray-500">Width</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="mm"
                                                value={structuralConstraints.width}
                                                onChange={(e) => setStructuralConstraints((p) => ({ ...p, width: e.target.value }))}
                                                className="w-28"
                                            />
                                            <span className="text-gray-400">×</span>
                                            <span className="text-sm text-gray-500">Height</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="mm"
                                                value={structuralConstraints.height}
                                                onChange={(e) => setStructuralConstraints((p) => ({ ...p, height: e.target.value }))}
                                                className="w-28"
                                            />
                                            <span className="text-gray-400">×</span>
                                            <span className="text-sm text-gray-500">Depth</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="mm"
                                                value={structuralConstraints.depth}
                                                onChange={(e) => setStructuralConstraints((p) => ({ ...p, depth: e.target.value }))}
                                                className="w-28"
                                            />
                                            <span className="text-sm text-gray-500">mm</span>
                                        </div>
                                    </div>

                                    {/* Viewing Distance */}
                                    <div className="space-y-2">
                                        <Label>Viewing Distance</Label>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm text-gray-500">Min.</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="m"
                                                value={viewingDistance.min}
                                                onChange={(e) => setViewingDistance((p) => ({ ...p, min: e.target.value }))}
                                                className="w-28"
                                            />
                                            <span className="text-sm text-gray-500">m</span>
                                            <span className="text-gray-400 mx-2">—</span>
                                            <span className="text-sm text-gray-500">Max.</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="m"
                                                value={viewingDistance.max}
                                                onChange={(e) => setViewingDistance((p) => ({ ...p, max: e.target.value }))}
                                                className="w-28"
                                            />
                                            <span className="text-sm text-gray-500">m</span>
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </div>

                    {/* ===== SECTION 5: ADDITIONAL CONFIGURATION ===== */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <AccordionItem value="additional-config" defaultValue="additional-config" className="border-0">
                            <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-secondary rounded-full" />
                                    <h2 className="text-[22px] font-semibold font-open-sans text-black">Additional Configuration</h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <MultiCheckbox
                                            label="Controller Configuration"
                                            options={["Synchronous", "Asynchronous"]}
                                            value={controllerConfig}
                                            onChange={setControllerConfig}
                                        />
                                        <MultiCheckbox
                                            label="Network Connection"
                                            options={["LAN", "WLAN (Wi-Fi)", "3G Mobile"]}
                                            value={networkConnection}
                                            onChange={setNetworkConnection}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <MultiCheckbox
                                            label="Signal Source Inputs"
                                            options={["HDMI", "DVI", "12G-SDI", "3G-DP", "10G Fiber"]}
                                            value={signalSourceInputs}
                                            onChange={setSignalSourceInputs}
                                        />
                                        <MultiCheckbox
                                            label="Additional Services"
                                            options={["Approval process", "Leasing", "Installation", "Extended warranty"]}
                                            value={additionalServices}
                                            onChange={setAdditionalServices}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </div>

                    {/* ===== SECTION 6: CONTROLLER SELECTION ===== */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <AccordionItem value="controller-selection" defaultValue="controller-selection" className="border-0">
                            <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-secondary rounded-full" />
                                    <h2 className="text-[22px] font-semibold font-open-sans text-black">Controller Selection</h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6 space-y-4">
                                    <Label>Select a Controller</Label>
                                    <div ref={controllerSearchRef} className="relative max-w-lg">
                                        <button
                                            ref={controllerTriggerRef}
                                            type="button"
                                            onClick={() => setControllerDropdownOpen((prev) => !prev)}
                                            className="w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg bg-white hover:border-gray-400 transition-colors text-left"
                                        >
                                            <span className="text-gray-400">
                                                {selectedController ? selectedController.interfaceName : "- Select Controller"}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                                        </button>
                                        {controllerDropdownOpen && controllerDropdownRect && typeof document !== "undefined" && createPortal(
                                            <>
                                                <div
                                                    className="fixed inset-0 z-100"
                                                    onClick={() => setControllerDropdownOpen(false)}
                                                    aria-hidden
                                                />
                                                <div
                                                    className="fixed z-101 bg-white border rounded-lg shadow-lg"
                                                    style={{
                                                        top: controllerDropdownRect.bottom + 4,
                                                        left: controllerDropdownRect.left,
                                                        width: Math.max(controllerDropdownRect.width, 280),
                                                        minWidth: 280,
                                                    }}
                                                >
                                                    <div className="p-2 border-b">
                                                        <div className="relative">
                                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                value={controllerSearch}
                                                                onChange={(e) => setControllerSearch(e.target.value)}
                                                                placeholder="Search controllers..."
                                                                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {controllerLoading && controllerResults.length === 0 ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <Spinner className="h-5 w-5" />
                                                                <span className="ml-2 text-sm text-gray-500">Loading...</span>
                                                            </div>
                                                        ) : controllerResults.length === 0 ? (
                                                            <div className="px-4 py-3 text-sm text-gray-500">No controllers found</div>
                                                        ) : (
                                                            controllerResults.map((ctrl) => (
                                                                <button
                                                                    key={ctrl.id}
                                                                    type="button"
                                                                    onClick={() => handleSelectController(ctrl)}
                                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium">{ctrl.interfaceName}</span>
                                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 shrink-0">Controller</span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-0.5">{ctrl.brandDisplay || ctrl.brandName}</p>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </>,
                                            document.body
                                        )}
                                    </div>
                                    {selectedController && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                                                <span>{selectedController.interfaceName}</span>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveController}
                                                    className="hover:text-red-600 transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </div>

                    {/* ===== SECTION 7: FILE UPLOAD ===== */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <AccordionItem value="file-upload" defaultValue="file-upload" className="border-0">
                            <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-secondary rounded-full" />
                                    <h2 className="text-[22px] font-semibold font-open-sans text-black">File Upload</h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="px-6 pb-6 space-y-4">
                                    <Label>Upload Reference Files</Label>
                                    <Label className="flex items-center gap-2 cursor-pointer border rounded-lg px-4 py-3 max-w-sm hover:bg-gray-50">
                                        <Upload className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Attach</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png,.dwg"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </Label>
                                    <p className="text-sm text-secondary">Accepted file types: PDF, JPG, PNG, DWG</p>
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

                    {/* ===== SECTION 8: NOTES & SUBMISSION ===== */}
                    <div
                        id="submit-enquiry-section"
                        className="bg-white rounded-xl border shadow-sm overflow-hidden"
                    >
                        <AccordionItem value="notes-submission" defaultValue="notes-submission" className="border-0">
                            <AccordionTrigger className="w-full flex items-center justify-between px-6 py-4 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-secondary rounded-full" />
                                    <h2 className="text-[22px] font-semibold font-open-sans text-black">
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
                                            <p className="text-primary text-lg mb-4">
                                                Please login to submit your custom LED enquiry.
                                            </p>
                                            <Button size="lg" variant="default" onClick={() => router.push("/login")}>
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

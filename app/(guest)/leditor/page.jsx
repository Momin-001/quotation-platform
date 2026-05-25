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
import Link from "next/link";
import Image from "next/image";
import { useFooter } from "@/context/FooterContext";
import { cn } from "@/lib/utils";

const leditorAccordionPanel =
    "rounded-xl border border-border/60 overflow-hidden bg-white shadow-sm";
const leditorAccordionTrigger =
    "text-sm sm:text-base font-semibold  tracking-wide bg-primary/10 hover:no-underline hover:bg-primary/15 px-4 sm:px-6 py-3.5 text-foreground data-[state=open]:bg-primary/15";
const leditorAccordionContent =
    "bg-muted/20 px-4 sm:px-6 pt-4 pb-6 border-t border-border/40";
const readOnlyInputClass = "h-10 text-sm bg-muted/30 border-border/60";

function LeditorSectionAccordion({ value, title, children, className }) {
    return (
        <Accordion
            type="single"
            defaultValue={value}
            collapsible
            className={cn(leditorAccordionPanel, className)}
        >
            <AccordionItem value={value} className="border-0">
                <AccordionTrigger className={leditorAccordionTrigger}>{title}</AccordionTrigger>
                <AccordionContent className={leditorAccordionContent}>{children}</AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

const enquirySchema = z.object({
    message: z.string().min(10, "Please enter a message (at least 10 characters)"),
    privacy: z.boolean().refine((val) => val === true, "Please agree to the Privacy Policy and Terms & Conditions"),
    captcha: z.union([z.string(), z.any()]).refine((val) => !!val, "Please complete the captcha"),
});

function ControllerSummaryPanel({ controller, isEn, onRemove }) {
    const brand = controller.brandDisplay || controller.brandName || "N/A";
    const specs = [
        {
            label: isEn ? "SKU" : "Artikelnr.",
            value: controller.controllerNumber,
        },
        {
            label: isEn ? "Brand" : "Marke",
            value: brand,
        },
        {
            label: isEn ? "Max. pixel capacity" : "Max. Pixelkapazität",
            value:
                controller.pixelCapacity != null
                    ? controller.pixelCapacity.toLocaleString()
                    : null,
        },
        {
            label: isEn ? "Max. width/height" : "Max. Breite/Höhe",
            value:
                controller.maxWidthHeight != null
                    ? `${controller.maxWidthHeight.toLocaleString()} px`
                    : null,
        },
        {
            label: isEn ? "Max. layers" : "Max. Layer",
            value: controller.maximumLayers,
        },
        {
            label: isEn ? "HDR support" : "HDR",
            value: controller.hdrSupport,
        },
    ].filter((row) => row.value != null && row.value !== "");

    return (
        <div className="rounded-xl border border-border/60 bg-white p-4 space-y-4 h-full">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {isEn ? "Selected controller" : "Ausgewählter Controller"}
                    </p>
                    <h3 className="text-base font-semibold text-foreground leading-snug mt-1">
                        {controller.interfaceName}
                    </h3>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
                    aria-label={isEn ? "Remove controller" : "Controller entfernen"}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            {controller.images?.[0] ? (
                <div className="relative aspect-4/3 max-h-36 rounded-lg border border-border/40 bg-muted/20 overflow-hidden">
                    <Image
                        src={controller.images[0]}
                        alt={controller.interfaceName || "Controller"}
                        fill
                        className="object-contain p-2"
                        sizes="360px"
                    />
                </div>
            ) : null}
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-sm">
                {specs.map((row) => (
                    <div key={row.label} className="flex gap-3 py-0.5">
                        <dt className="text-muted-foreground shrink-0">{row.label}</dt>
                        <dd className="font-medium text-foreground text-right">{row.value}</dd>
                    </div>
                ))}
            </dl>
            <Link
                href={`/controllers/${controller.id}`}
                className="inline-block text-sm font-medium text-primary hover:text-primary/80"
            >
                {isEn ? "View full specifications →" : "Alle Spezifikationen →"}
            </Link>
        </div>
    );
}

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
            <div className="flex flex-wrap gap-x-4 gap-y-2.5 pt-0.5">
                {options.map((opt) => (
                    <Label
                        key={opt}
                        className="cursor-pointer font-normal text-sm flex items-center gap-2"
                    >
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
    const isEn = language === "en";
    const { privacyPolicyPdfUrl } = useFooter();
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
        operatingHours: "24/7 Operation",
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
        const powerMax = parseFloat((pcMax * displayArea) / 1000).toFixed(2);
        const powerTypical = parseFloat((pcTyp * displayArea) / 1000).toFixed(2);

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
        ctx.font = "12px";
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

    const handleSelectController = async (controller) => {
        setControllerSearch("");
        setControllerResults([]);
        setControllerDropdownOpen(false);
        try {
            const res = await fetch(`/api/controllers/${controller.id}`);
            const json = await res.json();
            setSelectedController(json.success ? json.data : controller);
        } catch {
            setSelectedController(controller);
        }
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
                items: [
                    {
                        productId: selectedProduct.id,
                        quantity: 1,
                        isCustom: true,
                        controllerId: selectedController?.id || null,
                        customScreenWidth: config.screenWidth.toString(),
                        customScreenHeight: config.screenHeight.toString(),
                        customTotalResolutionH: computed.totalResH,
                        customTotalResolutionV: computed.totalResV,
                        customWeight: computed.totalWeight.toString(),
                        customDisplayArea: computed.displayArea.toString(),
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
        <div className="min-h-screen">
            <BreadCrumb
                title="Leditor"
                breadcrumbs={[
                    { label: isEn ? "Home" : "Startseite", href: "/" },
                    { label: "Leditor" },
                ]}
            />

            <div className="container mx-auto px-4 lg:px-6 py-6 sm:py-8 space-y-4">
                <LeditorSectionAccordion
                    value="preview"
                    title={isEn ? "Preview" : "Vorschau"}
                >
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        <div className="flex-1 w-full flex items-center justify-center rounded-lg bg-muted/20 border border-border/60 p-4 min-h-[320px] sm:min-h-[360px]">
                            <canvas
                                ref={canvasRef}
                                className="max-w-full"
                            />
                        </div>
                        {selectedProduct && (
                            <div className="w-full lg:w-72 shrink-0 rounded-xl border border-border/60 bg-white p-4 sm:p-5 space-y-4 shadow-sm">
                                <h3 className="text-sm font-semibold  uppercase tracking-wide text-foreground/90">
                                    {isEn ? "Screen size" : "Bildschirmgröße"}
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>{isEn ? "Width (m)" : "Breite (m)"}</Label>
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
                                                className="text-center flex-1 h-10 text-sm"
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
                                        <Label>{isEn ? "Height (m)" : "Höhe (m)"}</Label>
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
                                                className="text-center flex-1 h-10 text-sm"
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
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {isEn
                                        ? "Change width or height to update the LED preview live."
                                        : "Breite oder Höhe anpassen, um die LED-Vorschau live zu aktualisieren."}
                                </p>
                                <div className="space-y-2 pt-2 border-t border-border/40">
                                    <Label>
                                        {isEn ? "Preview with your own image" : "Vorschau mit eigenem Bild"}
                                    </Label>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {isEn
                                            ? "Upload an image to see how it would look on the screen."
                                            : "Laden Sie ein Bild hoch, um die Darstellung auf dem Screen zu sehen."}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center w-full justify-center h-10 px-4 border border-border/60 rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors text-sm font-medium ">
                                            <span className="mr-2">+</span>
                                            {userPreviewImageUrl
                                                ? isEn
                                                    ? "Change image"
                                                    : "Bild ändern"
                                                : isEn
                                                    ? "Upload image"
                                                    : "Bild hochladen"}
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
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    URL.revokeObjectURL(userPreviewImageUrl);
                                                    setUserPreviewImageUrl(null);
                                                }}
                                            >
                                                {isEn ? "Clear" : "Entfernen"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </LeditorSectionAccordion>

                <LeditorSectionAccordion
                    value="selection"
                    title={isEn ? "Select a model configuration" : "Modellkonfiguration wählen"}
                >
                    <div className="space-y-4">


                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="text"
                                placeholder={
                                    isEn ? "Search by product name…" : "Nach Produktname suchen…"
                                }
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 h-10 sm:h-11 text-sm rounded-lg border-border/80 shadow-sm placeholder:text-muted-foreground"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                onClick={() => handleCategoryChange("all")}
                                variant={selectedCategory === "all" ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                    "tracking-wide",
                                    selectedCategory === "all"
                                        ? ""
                                        : "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                                )}
                            >
                                {isEn ? "All" : "Alle"}
                            </Button>
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    variant={selectedCategory === cat.id ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "tracking-wide",
                                        selectedCategory === cat.id
                                            ? ""
                                            : "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                                    )}
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                                <Spinner className="h-6 w-6" />
                                <span className="text-sm">
                                    {isEn ? "Loading products…" : "Produkte werden geladen…"}
                                </span>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border/60 bg-white/60">
                                <Monitor className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">
                                    {isEn ? "No products found." : "Keine Produkte gefunden."}
                                </p>
                            </div>
                        ) : (
                            <div className="border border-border/60 rounded-xl overflow-x-auto shadow-sm">
                                <Table className="min-w-full text-sm">
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="px-4 py-3 font-semibold  text-foreground whitespace-nowrap">
                                                {isEn ? "Product name" : "Produktname"}
                                            </TableHead>
                                            <TableHead className="px-4 py-3 font-semibold  text-foreground whitespace-nowrap">
                                                {isEn ? "Pitch" : "Pitch"}
                                            </TableHead>
                                            <TableHead className="px-4 py-3 font-semibold  text-foreground whitespace-nowrap">
                                                {isEn ? "Brightness" : "Helligkeit"}
                                            </TableHead>
                                            <TableHead className="px-4 py-3 font-semibold  text-foreground whitespace-nowrap">
                                                {isEn ? "Resolution (H × V)" : "Auflösung (H × V)"}
                                            </TableHead>
                                            <TableHead className="px-4 py-3 font-semibold  text-foreground whitespace-nowrap">
                                                {isEn ? "Refresh rate" : "Bildwiederholrate"}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow
                                                key={product.id}
                                                onClick={() => handleSelectProduct(product)}
                                                className={cn(
                                                    "cursor-pointer transition-colors",
                                                    selectedProduct?.id === product.id
                                                        ? "bg-primary/5 border-l-4 border-l-primary"
                                                        : "hover:bg-muted/20"
                                                )}
                                            >
                                                <TableCell className="px-4 py-3 font-medium text-foreground">
                                                    {product.productName}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-muted-foreground">
                                                    {product.pixelPitch ? `${product.pixelPitch} mm` : "N/A"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-muted-foreground">
                                                    {product.brightnessValue
                                                        ? `${product.brightnessValue} nits`
                                                        : "N/A"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-muted-foreground">
                                                    {product.cabinetResolutionHorizontal &&
                                                        product.cabinetResolutionVertical
                                                        ? `${product.cabinetResolutionHorizontal} × ${product.cabinetResolutionVertical}`
                                                        : "N/A"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-muted-foreground">
                                                    {product.refreshRate ? `${product.refreshRate} Hz` : "N/A"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    {isEn ? "Previous" : "Zurück"}
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {isEn ? "Page" : "Seite"} {pagination.page} {isEn ? "of" : "von"}{" "}
                                    {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setPage((p) => Math.min(pagination.totalPages, p + 1))
                                    }
                                    disabled={page === pagination.totalPages}
                                >
                                    {isEn ? "Next" : "Weiter"}
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </LeditorSectionAccordion>

                <LeditorSectionAccordion
                    value="screen-info"
                    title={isEn ? "Screen information" : "Screen-Informationen"}
                    className="scroll-mt-24"
                >
                    <div id="screen-info-section" className="space-y-6">
                        {!selectedProduct ? (
                            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border/60">
                                <Monitor className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                                    {isEn
                                        ? "Select a product from the table above to configure your LED screen."
                                        : "Wählen Sie oben ein Produkt aus, um Ihren LED-Screen zu konfigurieren."}
                                </p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-sm font-semibold  uppercase tracking-wide text-foreground/90">
                                    {isEn ? "Cabinet specifications" : "Cabinet-Spezifikationen"}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                    <div className="space-y-1.5">
                                        <Label>{isEn ? "LED technology" : "LED-Technologie"}</Label>
                                        <Input
                                            value={`${config.ledTechnology} ${config.ledTechnologyOther ? `- ${config.ledTechnologyOther}` : ""}`}
                                            readOnly
                                            className={readOnlyInputClass}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{isEn ? "Brightness (nits)" : "Helligkeit (nits)"}</Label>
                                        <Input value={config.brightnessValue} readOnly className={readOnlyInputClass} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{isEn ? "Pixel pitch (mm)" : "Pixelabstand (mm)"}</Label>
                                        <Input value={config.pixelPitch} readOnly className={readOnlyInputClass} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{isEn ? "Refresh rate (Hz)" : "Bildwiederholrate (Hz)"}</Label>
                                        <Input value={config.refreshRate} readOnly className={readOnlyInputClass} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{isEn ? "Cabinet width (mm)" : "Cabinet-Breite (mm)"}</Label>
                                        <Input value={config.cabinetWidth} readOnly className={readOnlyInputClass} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{isEn ? "Cabinet height (mm)" : "Cabinet-Höhe (mm)"}</Label>
                                        <Input value={config.cabinetHeight} readOnly className={readOnlyInputClass} />
                                    </div>
                                </div>

                                <h3 className="text-sm font-semibold  uppercase tracking-wide text-foreground/90 pt-2">
                                    {isEn ? "Custom LED summary" : "Individuelle LED-Zusammenfassung"}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                    <div className="space-y-1.5">
                                        <Label>{isEn ? "Total resolution" : "Gesamtauflösung"}</Label>
                                        <Input
                                            value={
                                                computed.totalResH && computed.totalResV
                                                    ? `${computed.totalResH} × ${computed.totalResV} px`
                                                    : "N/A"
                                            }
                                            readOnly
                                            className={readOnlyInputClass}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{isEn ? "Total weight" : "Gesamtgewicht"}</Label>
                                        <Input
                                            value={computed.totalWeight ? `${computed.totalWeight} kg` : "N/A"}
                                            readOnly
                                            className={readOnlyInputClass}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{isEn ? "Display area" : "Anzeigefläche"}</Label>
                                        <Input
                                            value={computed.displayArea ? `${computed.displayArea} m²` : "N/A"}
                                            readOnly
                                            className={readOnlyInputClass}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{isEn ? "Dimension" : "Abmessung"}</Label>
                                        <Input value={computed.dimension} readOnly className={readOnlyInputClass} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>
                                            {isEn ? "Power consumption max (kW)" : "Max. Leistungsaufnahme (kW)"}
                                        </Label>
                                        <Input
                                            value={computed.powerMax ? `${computed.powerMax} kW` : "N/A"}
                                            readOnly
                                            className={readOnlyInputClass}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>
                                            {isEn ? "Power consumption typical (kW)" : "Typ. Leistungsaufnahme (kW)"}
                                        </Label>
                                        <Input
                                            value={computed.powerTypical ? `${computed.powerTypical} kW` : "N/A"}
                                            readOnly
                                            className={readOnlyInputClass}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{isEn ? "Total cabinets" : "Cabinets gesamt"}</Label>
                                        <Input value={`${computed.totalCabinets}`} readOnly className={readOnlyInputClass} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </LeditorSectionAccordion>

                <LeditorSectionAccordion
                    value="installation-service"
                    title={isEn ? "Installation & service" : "Installation & Service"}
                >
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <MultiCheckbox
                                label={isEn ? "Installation and service" : "Installation und Service"}
                                options={[
                                    "Schedule a free consultation appointment",
                                    "Preparation of tender documents",
                                ]}
                                value={installationData.installationAndService}
                                onChange={(val) =>
                                    setInstallationData((p) => ({ ...p, installationAndService: val }))
                                }
                            />
                            <MultiCheckbox
                                label={isEn ? "Service access" : "Servicezugang"}
                                options={["Front service", "Rear service", "Not sure"]}
                                value={installationData.serviceAccess}
                                onChange={(val) =>
                                    setInstallationData((p) => ({ ...p, serviceAccess: val }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{isEn ? "Mounting method" : "Montageart"}</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                {[
                                    "Wall Mount",
                                    "Hanging / Rigging",
                                    "Ground Support",
                                    "Freestanding Structure",
                                ].map((opt) => (
                                    <label
                                        key={opt}
                                        className={cn(
                                            "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer text-sm transition-colors",
                                            installationData.mountingMethod === opt
                                                ? "border-primary/50 bg-primary/5 text-foreground"
                                                : "border-border/60 bg-white hover:border-primary/30"
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="mountingMethod"
                                            value={opt}
                                            checked={installationData.mountingMethod === opt}
                                            onChange={(e) => setInstallationData((p) => ({ ...p, mountingMethod: e.target.value }))}
                                            className="accent-primary shrink-0"
                                        />
                                        <span className="leading-snug">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                            <div className="space-y-1.5">
                                <Label htmlFor="ipRating" className="text-sm font-medium">
                                    {isEn ? "IP rating" : "IP-Schutzart"}
                                </Label>
                                <Input
                                    id="ipRating"
                                    value={installationData.ipRating}
                                    onChange={(e) =>
                                        setInstallationData((p) => ({ ...p, ipRating: e.target.value }))
                                    }
                                    placeholder="e.g. IP65"
                                    className="h-10 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">{isEn ? "Power redundancy" : "Stromredundanz"}</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["Required", "Not Required"].map((opt) => (
                                            <label
                                                key={opt}
                                                className={cn(
                                                    "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer text-sm transition-colors",
                                                    installationData.powerRedundancy === opt
                                                        ? "border-primary/50 bg-primary/5 text-foreground"
                                                        : "border-border/60 bg-white hover:border-primary/30"
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="powerRedundancy"
                                                    value={opt}
                                                    checked={installationData.powerRedundancy === opt}
                                                    onChange={(e) => setInstallationData((p) => ({ ...p, powerRedundancy: e.target.value }))}
                                                    className="accent-primary shrink-0"
                                                />
                                                <span className="leading-snug">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">{isEn ? "Operating hours" : "Betriebszeiten"}</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["24/7 Operation"].map((opt) => (
                                            <label
                                                key={opt}
                                                className={cn(
                                                    "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer text-sm transition-colors",
                                                    installationData.operatingHours === opt
                                                        ? "border-primary/50 bg-primary/5 text-foreground"
                                                        : "border-border/60 bg-white hover:border-primary/30"
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="operatingHours"
                                                    value={opt}
                                                    checked={installationData.operatingHours === opt}
                                                    onChange={(e) => setInstallationData((p) => ({ ...p, operatingHours: e.target.value }))}
                                                    className="accent-primary shrink-0"
                                                />
                                                <span className="leading-snug">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-1 border-t border-border/40">
                            <div className="space-y-2 pt-4">
                                <Label className="text-sm font-medium">
                                    {isEn
                                        ? "Structural constraints / installation space"
                                        : "Bauliche Einschränkungen / Einbauraum"}
                                </Label>
                                <div className="flex items-end gap-3">
                                    {[
                                        { key: "width", label: isEn ? "Width" : "Breite" },
                                        { key: "height", label: isEn ? "Height" : "Höhe" },
                                        { key: "depth", label: isEn ? "Depth" : "Tiefe" },
                                    ].map(({ key, label }, i) => (
                                        <div key={key} className="flex items-end gap-2">
                                            {i > 0 ? (
                                                <span className="text-muted-foreground pb-2.5">×</span>
                                            ) : null}
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground">{label}</span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="mm"
                                                    value={structuralConstraints[key]}
                                                    onChange={(e) =>
                                                        setStructuralConstraints((p) => ({
                                                            ...p,
                                                            [key]: e.target.value,
                                                        }))
                                                    }
                                                    className="h-10 text-sm w-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2 pt-4">
                                <Label className="text-sm font-medium">
                                    {isEn ? "Viewing distance" : "Betrachtungsabstand"}
                                </Label>
                                <div className="flex flex-wrap items-end gap-3">
                                    <div className="space-y-1 flex-1">
                                        <span className="text-xs text-muted-foreground">
                                            {isEn ? "Minimum" : "Minimum"}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="mm"
                                                value={viewingDistance.min}
                                                onChange={(e) =>
                                                    setViewingDistance((p) => ({
                                                        ...p,
                                                        min: e.target.value,
                                                    }))
                                                }
                                                className="h-10 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <span className="text-xs text-muted-foreground">
                                            {isEn ? "Maximum" : "Maximum"}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="mm"
                                                value={viewingDistance.max}
                                                onChange={(e) =>
                                                    setViewingDistance((p) => ({
                                                        ...p,
                                                        max: e.target.value,
                                                    }))
                                                }
                                                className="h-10 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </LeditorSectionAccordion>

                <LeditorSectionAccordion
                    value="additional-config"
                    title={isEn ? "Additional configuration" : "Zusätzliche Konfiguration"}
                >
                    <div className="space-y-6">
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
                </LeditorSectionAccordion>

                <LeditorSectionAccordion
                    value="controller-selection"
                    title={isEn ? "Controller selection" : "Controller-Auswahl"}
                >
                    <div className="flex flex-col gap-5 items-stretch">
                        <div className="space-y-2 min-w-0">
                            <Label className="text-sm font-medium">
                                {isEn ? "Select a controller (optional)" : "Controller auswählen (optional)"}
                            </Label>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {isEn
                                    ? "Choose a video processor to include with your custom screen enquiry."
                                    : "Wählen Sie einen Videoprozessor für Ihre individuelle Screen-Anfrage."}
                            </p>
                            <div ref={controllerSearchRef} className="relative">
                                <button
                                    ref={controllerTriggerRef}
                                    type="button"
                                    onClick={() => setControllerDropdownOpen((prev) => !prev)}
                                    className="w-full flex items-center justify-between px-3 h-10 text-sm border border-border/60 rounded-lg bg-white hover:border-primary/40 transition-colors text-left shadow-sm"
                                >
                                    <span
                                        className={cn(
                                            "truncate pr-2",
                                            selectedController
                                                ? "text-foreground font-medium"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {selectedController
                                            ? selectedController.interfaceName
                                            : isEn
                                                ? "Search and select…"
                                                : "Suchen und auswählen…"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                </button>
                                {controllerDropdownOpen &&
                                    controllerDropdownRect &&
                                    typeof document !== "undefined" &&
                                    createPortal(
                                        <>
                                            <div
                                                className="fixed inset-0 z-100"
                                                onClick={() => setControllerDropdownOpen(false)}
                                                aria-hidden
                                            />
                                            <div
                                                className="fixed z-101 bg-white border border-border/60 rounded-xl shadow-lg"
                                                style={{
                                                    top: controllerDropdownRect.bottom + 4,
                                                    left: controllerDropdownRect.left,
                                                    width: Math.max(
                                                        controllerDropdownRect.width,
                                                        280
                                                    ),
                                                    minWidth: 280,
                                                }}
                                            >
                                                <div className="p-2 border-b border-border/40">
                                                    <div className="relative">
                                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <input
                                                            type="text"
                                                            value={controllerSearch}
                                                            onChange={(e) =>
                                                                setControllerSearch(e.target.value)
                                                            }
                                                            placeholder={
                                                                isEn
                                                                    ? "Search by name or brand…"
                                                                    : "Nach Name oder Marke…"
                                                            }
                                                            className="w-full pl-9 pr-3 h-9 text-sm border border-border/60 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto">
                                                    {controllerLoading &&
                                                        controllerResults.length === 0 ? (
                                                        <div className="flex items-center justify-center py-4">
                                                            <Spinner className="h-5 w-5" />
                                                            <span className="ml-2 text-sm text-muted-foreground">
                                                                {isEn ? "Loading…" : "Wird geladen…"}
                                                            </span>
                                                        </div>
                                                    ) : controllerResults.length === 0 ? (
                                                        <div className="px-4 py-3 text-sm text-muted-foreground">
                                                            {isEn
                                                                ? "No controllers found"
                                                                : "Keine Controller gefunden"}
                                                        </div>
                                                    ) : (
                                                        controllerResults.map((ctrl) => (
                                                            <button
                                                                key={ctrl.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    handleSelectController(ctrl)
                                                                }
                                                                className="w-full text-left px-4 py-3 hover:bg-primary/5 border-b border-border/40 last:border-b-0 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-foreground truncate">
                                                                        {ctrl.interfaceName}
                                                                    </span>
                                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-secondary text-primary-foreground shrink-0">
                                                                        {ctrl.brandDisplay ||
                                                                            ctrl.brandName}
                                                                    </span>
                                                                </div>
                                                                {ctrl.controllerNumber ? (
                                                                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                                                        {ctrl.controllerNumber}
                                                                    </p>
                                                                ) : null}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </>,
                                        document.body
                                    )}
                            </div>
                        </div>
                        <div>
                            {selectedController ? (
                                <ControllerSummaryPanel
                                    controller={selectedController}
                                    isEn={isEn}
                                    onRemove={handleRemoveController}
                                />
                            ) : (
                                <div className="rounded-xl border border-dashed border-border/60 bg-white/80 p-5 h-full flex flex-col justify-center text-center">
                                    <Monitor className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {isEn
                                            ? "Your selected controller will appear here with key specifications."
                                            : "Der gewählte Controller wird hier mit den wichtigsten Daten angezeigt."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </LeditorSectionAccordion>

                <LeditorSectionAccordion
                    value="notes-submission"
                    title={isEn ? "Notes & submission" : "Notizen & Absenden"}
                    className="scroll-mt-24"
                >
                    <div id="submit-enquiry-section">
                        {isAuthenticated ? (
                            <form
                                onSubmit={rhfHandleSubmit(onSubmitEnquiry)}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">
                                            {isEn ? "Your name" : "Ihr Name"}
                                        </Label>
                                        <Input
                                            value={user?.fullName || ""}
                                            disabled
                                            className={readOnlyInputClass}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">
                                            {isEn ? "Your email" : "Ihre E-Mail"}
                                        </Label>
                                        <Input
                                            value={user?.email || ""}
                                            disabled
                                            className={readOnlyInputClass}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="enquiry-message" className="text-sm font-medium">
                                        {isEn ? "Your message" : "Ihre Nachricht"}
                                        <span className="text-destructive ml-0.5">*</span>
                                    </Label>
                                    <Textarea
                                        id="enquiry-message"
                                        {...register("message")}
                                        placeholder={
                                            isEn
                                                ? "Describe your custom LED screen requirements…"
                                                : "Beschreiben Sie Ihre individuellen LED-Anforderungen…"
                                        }
                                        rows={4}
                                        className={cn(
                                            "text-sm min-h-[100px] resize-y",
                                            errors.message && "border-destructive"
                                        )}
                                    />
                                    {errors.message && (
                                        <p className="text-xs text-destructive">
                                            {errors.message.message}
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-lg border shadow-xs bg-white p-4 space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {isEn ? "Reference files" : "Referenzdateien"}
                                            <span className="text-muted-foreground font-normal ml-1">
                                                ({isEn ? "optional" : "optional"})
                                            </span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {isEn
                                                ? "Plans, photos, or drawings (PDF, JPG, PNG, DWG)"
                                                : "Pläne, Fotos oder Zeichnungen (PDF, JPG, PNG, DWG)"}
                                        </p>
                                    </div>
                                    <Label className="inline-flex items-center gap-2 cursor-pointer border border-border/60 rounded-lg px-4 py-2.5 hover:bg-muted/20 transition-colors text-sm font-medium w-fit">
                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                        {isEn ? "Attach files" : "Dateien anhängen"}
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png,.dwg"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </Label>
                                    {uploadedFiles.length > 0 && (
                                        <ul className="space-y-2">
                                            {uploadedFiles.map((file, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-center gap-3 bg-muted/20 border border-border/60 rounded-lg px-3 py-2"
                                                >
                                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <span className="text-sm flex-1 truncate text-foreground">
                                                        {file.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground shrink-0">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile(idx)}
                                                        className="text-destructive hover:text-destructive/80 transition-colors shrink-0"
                                                        aria-label={
                                                            isEn ? "Remove file" : "Datei entfernen"
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-start gap-2.5">
                                        <Controller
                                            name="privacy"
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    id="privacy-leditor"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="mt-0.5"
                                                />
                                            )}
                                        />
                                        <Label
                                            htmlFor="privacy-leditor"
                                            className="text-sm text-muted-foreground leading-relaxed font-normal cursor-pointer"
                                        >
                                            {isEn ? "I agree to the" : "Ich stimme der"}{" "}
                                            <Link
                                                href={privacyPolicyPdfUrl || "#"}
                                                target="_blank"
                                                className="font-semibold text-primary hover:text-primary/80"
                                            >
                                                {isEn ? "Privacy Policy" : "Datenschutzerklärung"}
                                            </Link>{" "}
                                            {isEn ? "and" : "und den"}{" "}
                                            <Link
                                                href="/terms-and-conditions"
                                                target="_blank"
                                                className="font-semibold text-primary hover:text-primary/80"
                                            >
                                                {isEn ? "Terms & Conditions" : "AGB"}
                                            </Link>
                                            .
                                        </Label>
                                    </div>
                                    {errors.privacy && (
                                        <p className="text-xs text-destructive pl-6">
                                            {errors.privacy.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-1">
                                    <div className="min-w-0">
                                        <ReCAPTCHA
                                            sitekey={NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                            onChange={(val) =>
                                                setValue("captcha", val || "", {
                                                    shouldValidate: true,
                                                })
                                            }
                                        />
                                        {errors.captcha && (
                                            <p className="text-xs text-destructive mt-1">
                                                {errors.captcha.message}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto shrink-0"
                                        size="lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Spinner className="h-4 w-4 mr-2" />
                                                {isEn ? "Submitting…" : "Wird gesendet…"}
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                {isEn ? "Submit enquiry" : "Anfrage absenden"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
                                <p className="text-sm text-foreground mb-4 leading-relaxed">
                                    {isEn
                                        ? "Please sign in to submit your custom LED enquiry."
                                        : "Bitte melden Sie sich an, um Ihre individuelle LED-Anfrage zu senden."}
                                </p>
                                <Button size="lg" onClick={() => router.push("/login")}>
                                    {isEn ? "Sign in to continue" : "Anmelden"}
                                </Button>
                            </div>
                        )}
                    </div>
                </LeditorSectionAccordion>
            </div>
        </div>
    );
}

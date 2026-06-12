"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "next-intl";
import { cmsField } from "@/lib/i18n/cms";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, FileText, Wrench } from "lucide-react";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { RestrictedContentOverlay } from "@/components/guest/Products/RestrictedContentOverlay";
import RelatedProductsSection from "@/components/guest/Products/RelatedProductsSection";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
    const params = useParams();
    const locale = useLocale();
    const t = useTranslations("Products.detail");
    const tList = useTranslations("Products.list");
    const tCommon = useTranslations("Common");
    const { addToCart } = useCart();
    const router = useRouter();
    const { isAuthenticated, isUser } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [datasheetLoading, setDatasheetLoading] = useState(false);
    const [pdfDownloading, setPdfDownloading] = useState(null); // 'installationManual' | 'maintenanceGuide' | 'certificatesPdf'

    useEffect(() => {
        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${params.id}`);
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch product");
            }
            setProduct(response.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadDatasheet = async () => {
        setDatasheetLoading(true);
        try {
            const res = await fetch(`/api/products/${product.id}/datasheet`);
            if (!res.ok) {
                throw new Error("Failed to generate datasheet");
            }

            // Wait for the full response to be received
            const blob = await res.blob();

            // Verify blob is not empty
            if (blob.size === 0) {
                return;
            }

            // Create download link (sanitize filename so extension is preserved)
            const safeName = String(product.productNumber || "datasheet").replace(/[/\\:*?"<>|]/g, "_").trim() || "datasheet";
            const filename = `${safeName}_datasheet.pdf`;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.style.display = "none";
            document.body.appendChild(a);

            // Trigger download
            a.click();

            // Clean up after a short delay to ensure download starts
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);

            toast.success("Datasheet downloaded successfully");
        } catch (error) {
            toast.error(error.message || "Failed to download datasheet");
        } finally {
            setDatasheetLoading(false);
        }
    };

    const handleDownloadPdf = async (type, filename) => {
        setPdfDownloading(type);
        try {
            const res = await fetch(`/api/products/${product.id}/download-pdf?type=${type}`);
            if (!res.ok) {
                throw new Error("Failed to download PDF");
            }
            const blob = await res.blob();
            if (blob.size === 0) return;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);
            toast.success("Download started");
        } catch (error) {
            toast.error(error.message || "Failed to download");
        } finally {
            setPdfDownloading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner className="h-6 w-6" />
                    <span className="text-sm">{t("loading")}</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
                <p className="text-base text-muted-foreground">{t("notFound")}</p>
                <Button variant="outline" size="default" onClick={() => router.push("/products")}>
                    {t("backToList")}
                </Button>
            </div>
        );
    }

    const selectedImage = product.images[selectedImageIndex] || product.images[0] || null;

    const localeTag = locale === "de" ? t("localeTagDe") : t("localeTagEn");
    const na = t("specs.notAvailable");

    // Format enum values for display
    const formatEnum = (value) => {
        if (!value)
            return na;
        return value
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const requireAuthForCta = (action) => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        if (!isUser) return;
        action();
    };

    const accordionPanel = "rounded-xl border border-border/60 overflow-hidden bg-white shadow-sm";
    const accordionTriggerClass =
        "text-sm sm:text-base font-semibold tracking-wide bg-primary/10 hover:no-underline hover:bg-primary/15 px-4 py-3.5 text-foreground data-[state=open]:bg-primary/15";
    const accordionContentClass = "bg-muted/20 px-4 pt-3 pb-4 border-t border-border/40";

    const SpecRow = ({ label, value, unit }) => {
        const displayValue = value ?? na;
        return (
            <div className="flex text-sm justify-between items-baseline gap-4 py-1">
                <span className="text-muted-foreground shrink-0 pr-2">{label}</span>
                <div className="flex items-baseline justify-end gap-2 min-w-0 flex-1 text-right">
                    <span className="font-medium text-foreground">{String(displayValue)}</span>
                    <span className="text-xs text-muted-foreground w-14 shrink-0 tabular-nums">
                        {unit || ""}
                    </span>
                </div>
            </div>
        );
    };

    const DownloadButton = ({ onClick, disabled, loading, label }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
            {loading ? (
                <>
                    <Spinner className="h-4 w-4" />
                    <span>{t("generating")}</span>
                </>
            ) : (
                <>
                    <FileText className="h-4 w-4 text-destructive/80 shrink-0" />
                    <span>{label}</span>
                </>
            )}
        </button>
    );

    return (
        <>
            <BreadCrumb title={product.productName}
                breadcrumbs={[
                    { label: tCommon("home"), href: "/" },
                    { label: tList("breadcrumb"), href: "/products" },
                    { label: product.productName }
                ]} />
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-10 lg:mb-14">
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative aspect-square overflow-hidden ">
                                {selectedImage ? (
                                    <Image
                                        src={selectedImage}
                                        alt={product.productName}
                                        fill
                                        className="object-contain"
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/30">
                                        <span className="text-sm">{t("noImage")}</span>
                                    </div>
                                )}
                            </div>

                            {/* Image Gallery */}
                            {product.images.length > 0 && (
                                <Carousel
                                    opts={{ align: "start", slidesToScroll: 1 }}
                                    className="w-full relative px-1"
                                >
                                    <CarouselContent className="-ml-2">
                                        {product.images.map((image, index) => (
                                            <CarouselItem
                                                key={index}
                                                className="pl-2 basis-1/4 sm:basis-1/5 md:basis-1/6"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedImageIndex(index)}
                                                    className={cn(
                                                        "relative aspect-square overflow-hidden rounded-lg w-full border-2 bg-white transition-all",
                                                        selectedImageIndex === index
                                                            ? "border-primary shadow-md ring-2 ring-primary/20"
                                                            : "border-border/60 hover:border-primary/40"
                                                    )}
                                                >
                                                    <Image
                                                        src={image}
                                                        alt={`${product.productName} ${index + 1}`}
                                                        fill
                                                        className="object-contain p-1.5"
                                                        sizes="80px"
                                                    />
                                                </button>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {product.images.length > 4 && (
                                        <>
                                            <CarouselPrevious className="left-0 h-8 w-8 border-primary/30 text-primary" />
                                            <CarouselNext className="right-0 h-8 w-8 border-primary/30 text-primary" />
                                        </>
                                    )}
                                </Carousel>
                            )}


                        </div>

                        <div className="space-y-6 lg:space-y-8">
                            <div className="bg-white rounded-xl border border-border/60 p-5 sm:p-6 lg:p-7 shadow-sm space-y-5">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold ound leading-tight tracking-tight mb-2">
                                        {product.productName}
                                    </h1>
                                    <p className="text-sm sm:text-base font-mono text-muted-foreground mb-3">
                                        {product.productNumber}
                                    </p>
                                    {product.areaOfUse && (
                                        <span className="inline-block bg-secondary text-primary-foreground text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-md mb-4">
                                            {product.areaOfUse}
                                        </span>
                                    )}
                                    {product.productDescription && (
                                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                            {product.productDescription}
                                        </p>
                                    )}
                                </div>

                                {product.features && product.features.length > 0 && (
                                    <div className="pt-4 border-t border-border/50">
                                        <h2 className="text-sm font-semibold  uppercase tracking-wide text-foreground mb-3">
                                            {t("features")}
                                        </h2>
                                        <ul className="space-y-2">
                                            {product.features.map((feature, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start gap-2.5 text-sm text-foreground/90 leading-relaxed"
                                                >
                                                    <span className="text-primary mt-1 shrink-0">•</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {(product.stockPieces > 0 || product.leadtimeDays > 0) && (
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        {product.stockPieces > 0 && (
                                            <div className="rounded-lg bg-muted/40 px-3 py-2">
                                                <span className="text-xs text-muted-foreground block">
                                                    {t("stock")}
                                                </span>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {product.stockPieces}{" "}
                                                    {t("pieces")}
                                                </span>
                                            </div>
                                        )}
                                        {product.leadtimeDays > 0 && (
                                            <div className="rounded-lg bg-muted/40 px-3 py-2">
                                                <span className="text-xs text-muted-foreground block">
                                                    {t("leadTime")}
                                                </span>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {product.leadtimeDays}{" "}
                                                    {t("days")}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isAuthenticated && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-semibold  uppercase tracking-wide text-foreground">
                                                {t("downloads")}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {t("datasheetSubtitle")}
                                            </p>
                                        </div>
                                        <DownloadButton
                                            onClick={handleDownloadDatasheet}
                                            disabled={datasheetLoading}
                                            loading={datasheetLoading}
                                            label={t("productDatasheet")}
                                        />
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="flex-1 sm:flex-none min-w-[140px]"
                                        onClick={() =>
                                            requireAuthForCta(() => {
                                                addToCart({
                                                    id: product.id,
                                                    productName: product.productName,
                                                    productNumber: product.productNumber,
                                                    imageUrl: product.images?.[0] || null,
                                                    categoryName: product.categoryName,
                                                });
                                                toast.success(t("addedToCart"));
                                            })
                                        }
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        {t("addToCart")}
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="flex-1 sm:flex-none min-w-[140px]"
                                        onClick={() =>
                                            requireAuthForCta(() => {
                                                addToCart({
                                                    id: product.id,
                                                    productName: product.productName,
                                                    productNumber: product.productNumber,
                                                    imageUrl: product.images?.[0] || null,
                                                    categoryName: product.categoryName,
                                                });
                                                router.push("/user/cart");
                                            })
                                        }
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        {t("getQuote")}
                                    </Button>
                                    {product.productType === "LED Display Single Cabinet" && (
                                        <Button
                                            onClick={() =>
                                                requireAuthForCta(() => router.push("/leditor"))
                                            }
                                            size="lg"
                                            variant="outline"
                                            className="flex-1 sm:flex-none min-w-[140px] text-primary border-primary hover:bg-primary/5"
                                        >
                                            <Wrench className="h-4 w-4 mr-2" />
                                            {t("customSolution")}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">

                        <div className="bg-white rounded-xl border border-border/60 p-3 shadow-sm space-y-5">
                            {product.productIcons && product.productIcons.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
                                    {product.productIcons.map((icon) => (
                                        <div key={icon.id} className="flex flex-col items-center text-center pb-2">
                                            <div className="flex w-full items-center justify-center aspect-square max-h-[60px]">
                                                <div className="relative h-12 w-12">
                                                    <Image
                                                        src={icon.imageUrl}
                                                        alt={icon.name}
                                                        fill
                                                        sizes="44px"
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs leading-snug line-clamp-2">
                                                {icon.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                                </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Basic Information */}
                            <Accordion type="single" defaultValue="basic-info" collapsible className={accordionPanel}>
                                <AccordionItem value="basic-info" className="border-0">
                                    <AccordionTrigger className={accordionTriggerClass}>
                                        {t("sections.basicInformation")}
                                    </AccordionTrigger>
                                    <AccordionContent className={accordionContentClass}>
                                        <div>
                                            <SpecRow label={t("specs.productType")} value={product.productType} />
                                            <SpecRow label={t("specs.design")} value={product.design} />
                                            <SpecRow label={t("specs.specialTypes")} value={product.specialTypes} />
                                            <SpecRow label={t("specs.application")} value={Array.isArray(product.application) ? product.application.join(", ") : product.application} />
                                            <SpecRow label={t("specs.category")} value={product.areaOfUse} />
                                            <SpecRow label={t("specs.service")} value={product.support} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Physical Specifications */}
                            <Accordion type="single" defaultValue="physical-specs" collapsible className={accordionPanel}>
                                <AccordionItem value="physical-specs" className="border-0">
                                    <AccordionTrigger className={accordionTriggerClass}>
                                        {t("sections.physicalSpecifications")}
                                    </AccordionTrigger>
                                    <AccordionContent className={accordionContentClass}>
                                        <div>
                                            <SpecRow label={t("specs.pixelPitch")} value={product.pixelPitch} unit="mm" />
                                            <SpecRow label={t("specs.pixelTechnology")} value={product.pixelTechnology} />
                                            <SpecRow label={t("specs.cabinetWidth")} value={product.cabinetWidth} unit="mm" />
                                            <SpecRow label={t("specs.cabinetHeight")} value={product.cabinetHeight} unit="mm" />
                                            <SpecRow label={t("specs.cabinetResolutionHorizontal")} value={product.cabinetResolutionHorizontal} unit="px" />
                                            <SpecRow label={t("specs.cabinetResolutionVertical")} value={product.cabinetResolutionVertical} unit="px" />
                                            <SpecRow label={t("specs.pixelDensity")} value={product.pixelDensity} unit="px/m²" />
                                            <SpecRow label={t("specs.weightWithoutPackaging")} value={product.weightWithoutPackaging} unit="kg" />
                                            <SpecRow label={t("specs.ipRating")} value={product.ipRating} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <RestrictedContentOverlay isAuthenticated={isAuthenticated} register={false}>

                                {/* Electrical Specifications */}
                                <Accordion type="single" defaultValue="electrical-specs" collapsible className={accordionPanel}>
                                    <AccordionItem value="electrical-specs" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {t("sections.electricalSpecifications")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow label={t("specs.inputVoltage")} value={product.inputVoltage} unit="V(AC)" />
                                                <SpecRow label={t("specs.powerConsumptionMax")} value={product.powerConsumptionMax} unit="W" />
                                                <SpecRow label={t("specs.powerConsumptionTypical")} value={product.powerConsumptionTypical} unit="W" />
                                                <SpecRow label={t("specs.drivingMethod")} value={formatEnum(product.drivingMethod)} />
                                                <SpecRow label={t("specs.currentGainControl")} value={product.currentGainControl} />
                                                <SpecRow label={t("specs.powerRedundancy")} value={formatEnum(product.powerRedundancy)} />
                                                <SpecRow label={t("specs.memoryOnModule")} value={formatEnum(product.memoryOnModule)} />
                                                <SpecRow label={t("specs.smartModule")} value={formatEnum(product.smartModule)} />
                                                <SpecRow label={t("specs.mtbfPowerSupply")} value={product.mtbfPowerSupply} unit="hours" />
                                                <SpecRow
                                                    label={t("specs.controlSystem")}
                                                    value={product.controlSystem === "other" && product.controlSystemOther ? product.controlSystemOther : formatEnum(product.controlSystem)}
                                                />
                                                <SpecRow label={t("specs.receivingCard")} value={product.receivingCard} />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                {/* Operating Conditions */}
                                <Accordion type="single" defaultValue="operating-conditions" collapsible className={accordionPanel}>
                                    <AccordionItem value="operating-conditions" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {t("sections.operatingConditions")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow label={t("specs.operatingTemperature")} value={product.operatingTemperature} unit="°C" />
                                                <SpecRow label={t("specs.operatingHumidity")} value={product.operatingHumidity} unit="%" />
                                                <SpecRow label={t("specs.cooling")} value={formatEnum(product.cooling)} />
                                                <SpecRow label={t("specs.heatDissipation")} value={product.heatDissipation} unit="W" />
                                                <SpecRow label={t("specs.monitoringFunction")} value={cmsField(product, "monitoringFunction", locale)} />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                {/* Downloads */}
                                <Accordion type="single" defaultValue="downloads" collapsible className={accordionPanel}>
                                    <AccordionItem value="downloads" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {t("sections.downloads")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div className="space-y-3 divide-y divide-border/30">
                                                <div className="flex items-center justify-between gap-4 py-2 first:pt-0">
                                                    <p className="text-sm text-muted-foreground">
                                                        {t("productDatasheet")}
                                                    </p>
                                                    <DownloadButton
                                                        onClick={handleDownloadDatasheet}
                                                        disabled={datasheetLoading}
                                                        loading={datasheetLoading}
                                                        label={t("download")}
                                                    />
                                                </div>
                                                {product.installationManualUrl && (
                                                    <div className="flex items-center justify-between gap-4 py-2">
                                                        <p className="text-sm text-muted-foreground">
                                                            {t("installationManual")}
                                                        </p>
                                                        <DownloadButton
                                                            onClick={() =>
                                                                handleDownloadPdf("installationManual", "Installation_Manual.pdf")
                                                            }
                                                            disabled={pdfDownloading !== null}
                                                            loading={pdfDownloading === "installationManual"}
                                                            label={t("download")}
                                                        />
                                                    </div>
                                                )}
                                                {product.maintenanceGuideUrl && (
                                                    <div className="flex items-center justify-between gap-4 py-2">
                                                        <p className="text-sm text-muted-foreground">
                                                            {t("maintenanceGuide")}
                                                        </p>
                                                        <DownloadButton
                                                            onClick={() =>
                                                                handleDownloadPdf("maintenanceGuide", "Maintenance_Guide.pdf")
                                                            }
                                                            disabled={pdfDownloading !== null}
                                                            loading={pdfDownloading === "maintenanceGuide"}
                                                            label={t("download")}
                                                        />
                                                    </div>
                                                )}
                                                {product.certificatesPdfUrl && (
                                                    <div className="flex items-center justify-between gap-4 py-2">
                                                        <p className="text-sm text-muted-foreground">
                                                            {t("certificatesPdf")}
                                                        </p>
                                                        <DownloadButton
                                                            onClick={() =>
                                                                handleDownloadPdf("certificatesPdf", "Certificates.pdf")
                                                            }
                                                            disabled={pdfDownloading !== null}
                                                            loading={pdfDownloading === "certificatesPdf"}
                                                            label={t("download")}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                            </RestrictedContentOverlay>

                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* LED Specifications */}
                            <Accordion type="single" defaultValue="led-specs" collapsible className={accordionPanel}>
                                <AccordionItem value="led-specs" className="border-0">
                                    <AccordionTrigger className={accordionTriggerClass}>
                                        {t("sections.ledSpecifications")}
                                    </AccordionTrigger>
                                    <AccordionContent className={accordionContentClass}>
                                        <div>
                                            <SpecRow label={t("specs.ledTechnology")} value={formatEnum(product.ledTechnology)} />
                                            <SpecRow label={t("specs.pixelConfiguration")} value={product.pixelConfiguration} />
                                            <SpecRow label={t("specs.ledLifespan")} value={product.ledLifespan} unit="hours" />

                                            <RestrictedContentOverlay isAuthenticated={isAuthenticated} register={false}>
                                                <SpecRow label={t("specs.chipBonding")} value={formatEnum(product.chipBonding)} />
                                                <SpecRow label={t("specs.ledChipManufacturer")} value={product.ledChipManufacturer} />
                                                <SpecRow label={t("specs.ledModulesPerCabinet")} value={product.ledModulesPerCabinet} />
                                            </RestrictedContentOverlay>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Display Performance */}
                            <Accordion type="single" defaultValue="display-performance" collapsible className={accordionPanel}>
                                <AccordionItem value="display-performance" className="border-0">
                                    <AccordionTrigger className={accordionTriggerClass}>
                                        {t("sections.displayPerformance")}
                                    </AccordionTrigger>
                                    <AccordionContent className={accordionContentClass}>
                                        <div>
                                            <SpecRow label={t("specs.refreshRate")} value={product.refreshRate} unit="Hz" />
                                            <SpecRow label={t("specs.brightnessValue")} value={product.brightnessValue} unit="cd/m²" />

                                            <RestrictedContentOverlay isAuthenticated={isAuthenticated} register={false}>
                                                <SpecRow label={t("specs.scanRate")} value={product.scanRateDenominator ? `1/${product.scanRateDenominator}${product.scanRateNumerator && product.scanRateNumerator !== 1 ? ` (${product.scanRateNumerator}/${product.scanRateDenominator})` : ""}` : null} />
                                                <SpecRow label={t("specs.videoRate")} value={product.videoRate} />
                                                <SpecRow label={t("specs.colourDepth")} value={product.colourDepth} unit="bit" />
                                                <SpecRow
                                                    label={t("specs.greyscaleProcessing")}
                                                    value={product.greyscaleProcessing === "other" && product.greyscaleProcessingOther ? product.greyscaleProcessingOther : product.greyscaleProcessing}
                                                />
                                                <SpecRow
                                                    label={t("specs.numberOfColours")}
                                                    value={product.numberOfColours ? t("specs.numberOfColoursBillion", { count: product.numberOfColours }) : null}
                                                />
                                                <SpecRow label={t("specs.viewingAngleHorizontal")} value={product.viewingAngleHorizontal} />
                                                <SpecRow label={t("specs.viewingAngleVertical")} value={product.viewingAngleVertical} />
                                                <SpecRow
                                                    label={t("specs.contrastRatio")}
                                                    value={product.contrastRatioNumerator ? `${product.contrastRatioNumerator}:${product.contrastRatioDenominator || 1}` : null}
                                                />
                                            </RestrictedContentOverlay>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <RestrictedContentOverlay isAuthenticated={isAuthenticated} register={false}>

                                {/* Calibration */}
                                <Accordion type="single" defaultValue="calibration" collapsible className={accordionPanel}>
                                    <AccordionItem value="calibration" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {t("sections.calibration")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow label={t("specs.calibrationMethod")} value={formatEnum(product.calibrationMethod)} />
                                                <SpecRow label={t("specs.whitePointCalibration")} value={product.whitePointCalibration} />
                                                <SpecRow label={t("specs.dciP3Coverage")} value={product.dciP3Coverage} unit="%" />

                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                {/* Certifications & Standards */}
                                {(product.productCertificates?.length > 0 || product.additionalCertification || product.emc || product.safety) && (
                                    <Accordion type="single" defaultValue="certifications" collapsible className={accordionPanel}>
                                        <AccordionItem value="certifications" className="border-0">
                                            <AccordionTrigger className={accordionTriggerClass}>
                                                {t("sections.certificationsStandards")}
                                            </AccordionTrigger>
                                            <AccordionContent className={accordionContentClass}>
                                                {product.productCertificates && product.productCertificates.length > 0 && (
                                                    <div className="mb-4 pb-3 border-b border-border/30">
                                                        <div className="flex flex-wrap gap-2">
                                                            {product.productCertificates.map((cert) => (
                                                                <div
                                                                    key={cert.id}
                                                                    className="flex items-center gap-2 bg-white border border-border/50 p-2 px-3 rounded-lg shadow-sm"
                                                                >
                                                                    <Image
                                                                        src={cert.imageUrl}
                                                                        alt={cert.name}
                                                                        width={36}
                                                                        height={36}
                                                                        className="object-contain"
                                                                    />
                                                                    <span className="text-xs sm:text-sm font-medium text-foreground">
                                                                        {cert.name}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <SpecRow label={t("specs.additionalCertification")} value={product.additionalCertification} />
                                                    <SpecRow label={t("specs.emc")} value={product.emc} />
                                                    <SpecRow label={t("specs.safety")} value={product.safety} />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                )}

                                {/* Warranty & Support */}
                                <Accordion type="single" defaultValue="warranty" collapsible className={accordionPanel}>
                                    <AccordionItem value="warranty" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {t("sections.warrantySupport")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow label={t("specs.warrantyPeriod")} value={product.warrantyPeriod} unit="months" />
                                                <SpecRow
                                                    label={t("supportDuringWarranty", { tag: localeTag })}
                                                    value={cmsField(product, "supportDuringWarranty", locale)}
                                                />
                                                <SpecRow
                                                    label={t("supportAfterWarranty", { tag: localeTag })}
                                                    value={cmsField(product, "supportAfterWarranty", locale)}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                            </RestrictedContentOverlay>
                        </div>
                    </div>
                    </div>
                    <RelatedProductsSection productId={product.id} />
                </div>
            </div>
        </>

    );
}

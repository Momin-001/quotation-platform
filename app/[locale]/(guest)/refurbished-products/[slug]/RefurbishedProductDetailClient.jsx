"use client";

import { useState } from "react";
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
import { ShoppingCart, FileText } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import BreadCrumb from "@/components/guest/BreadCrumb";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import RelatedNewProductsSection from "@/components/guest/RefurbishedProducts/RelatedNewProductsSection";
import { cn } from "@/lib/utils";

const na = "N/A";

export default function RefurbishedProductDetailClient({ product }) {
    const router = useRouter();
    const { addToCart } = useCart();
    const { isAuthenticated, isUser } = useAuth();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [datasheetLoading, setDatasheetLoading] = useState(false);

    const images = product.images || [];
    const selectedImage = images[selectedImageIndex] || images[0] || null;

    const ledTechnology =
        product.ledTechnology === "Other" && product.ledTechnologyOther
            ? product.ledTechnologyOther
            : product.ledTechnology;
    const controlSystem =
        product.controlSystem === "Other" && product.controlSystemOther
            ? product.controlSystemOther
            : product.controlSystem;

    const cartPayload = {
        id: product.id,
        productName: product.serie,
        serie: product.serie,
        productNumber: product.productNumber,
        imageUrl: images[0] || null,
        categoryName: product.areaOfUse,
        sellingPrice: product.sellingPrice,
        productSourceType: "refurbished",
    };

    const requireAuthForCta = (action) => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        if (!isUser) return;
        action();
    };

    const handleAddToCart = (goToCart = false) => {
        const added = addToCart(cartPayload, "refurbished");
        if (added === false) return; // blocked (cart not empty)
        if (goToCart) {
            router.push("/user/cart");
        } else {
            toast.success("Added to cart");
        }
    };

    const handleDownloadDatasheet = async () => {
        setDatasheetLoading(true);
        try {
            const res = await fetch(`/api/refurbished-products/${product.id}/datasheet`);
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

    const accordionPanel = "rounded-xl border border-border/60 overflow-hidden bg-white shadow-sm";
    const accordionTriggerClass =
        "text-sm sm:text-base font-semibold tracking-wide bg-primary/10 hover:no-underline hover:bg-primary/15 px-4 py-3.5 text-foreground data-[state=open]:bg-primary/15";
    const accordionContentClass = "bg-muted/20 px-4 pt-4 pb-5 border-t border-border/40";

    const SpecRow = ({ label, value, unit }) => {
        const isEmpty = value == null || value === "";
        return (
            <div className="flex text-sm justify-between items-baseline gap-4 py-1">
                <span className="text-muted-foreground shrink-0 pr-2">{label}</span>
                <div className="flex items-baseline justify-end gap-2 min-w-0 flex-1 text-right">
                    <span className="font-medium text-foreground">{isEmpty ? na : String(value)}</span>
                    <span className="text-xs text-muted-foreground w-14 shrink-0 tabular-nums">
                        {isEmpty ? "" : unit || ""}
                    </span>
                </div>
            </div>
        );
    };

    const SpecGroup = ({ title, children }) => (
        <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 pb-1.5 border-b border-border/50">
                {title}
            </h3>
            <div>{children}</div>
        </div>
    );

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
                    <span>Generating…</span>
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
            <BreadCrumb
                title={product.serie}
                titleTag="p"
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Refurbished Products", href: "/refurbished-products" },
                    { label: product.serie },
                ]}
            />
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-10 lg:mb-14">
                        {/* Gallery */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative aspect-square overflow-hidden">
                                {selectedImage ? (
                                    <Image
                                        src={selectedImage}
                                        alt={product.serie}
                                        fill
                                        className="object-contain"
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/30">
                                        <span className="text-sm">No Image</span>
                                    </div>
                                )}
                                {product.levelOfQuality ? (
                                    <span className="absolute top-3 left-3 z-10 text-xs font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded-md px-2.5 py-1">
                                        {product.levelOfQuality}
                                    </span>
                                ) : null}
                            </div>

                            {/* Image Gallery */}
                            {images.length > 0 && (
                                <Carousel
                                    opts={{ align: "start", slidesToScroll: 1 }}
                                    className="w-full relative px-1"
                                >
                                    <CarouselContent className="-ml-2">
                                        {images.map((image, index) => (
                                            <CarouselItem
                                                key={index}
                                                className="pl-2 basis-1/4 sm:basis-1/5 md:basis-1/6"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedImageIndex(index)}
                                                    aria-label={`${product.serie} – image ${index + 1}`}
                                                    aria-pressed={selectedImageIndex === index}
                                                    className={cn(
                                                        "relative aspect-square overflow-hidden rounded-lg w-full border-2 bg-white transition-all",
                                                        selectedImageIndex === index
                                                            ? "border-primary shadow-md ring-2 ring-primary/20"
                                                            : "border-border/60 hover:border-primary/40"
                                                    )}
                                                >
                                                    <Image
                                                        src={image}
                                                        alt={`${product.serie} ${index + 1}`}
                                                        fill
                                                        className="object-contain p-1.5"
                                                        sizes="80px"
                                                    />
                                                </button>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {images.length > 4 && (
                                        <>
                                            <CarouselPrevious className="left-0 h-8 w-8 border-primary/30 text-primary" />
                                            <CarouselNext className="right-0 h-8 w-8 border-primary/30 text-primary" />
                                        </>
                                    )}
                                </Carousel>
                            )}
                        </div>

                        {/* Info */}
                        <div className="space-y-6 lg:space-y-8">
                            <div className="bg-white rounded-xl border border-border/60 p-5 sm:p-6 lg:p-7 shadow-sm space-y-5">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight mb-2">
                                        {product.serie}
                                    </h1>
                                    <p className="text-sm sm:text-base font-mono text-muted-foreground mb-3">
                                        {product.productNumber}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        {product.areaOfUse && (
                                            <span className="inline-block bg-secondary text-primary-foreground text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-md">
                                                {product.areaOfUse}
                                            </span>
                                        )}
                                        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-md">
                                            Refurbished
                                        </span>
                                    </div>
                                    {product.sellingPrice ? (
                                        <p className="text-2xl font-bold text-foreground mb-3">
                                            $ {Number(product.sellingPrice).toLocaleString()}
                                        </p>
                                    ) : null}
                                    {product.productDescription && (
                                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                            {product.productDescription}
                                        </p>
                                    )}
                                </div>

                                {product.features && product.features.length > 0 && (
                                    <div className="pt-4 border-t border-border/50">
                                        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-3">
                                            Features
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
                                                <span className="text-xs text-muted-foreground block">Stock</span>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {product.stockPieces} pieces
                                                </span>
                                            </div>
                                        )}
                                        {product.leadtimeDays > 0 && (
                                            <div className="rounded-lg bg-muted/40 px-3 py-2">
                                                <span className="text-xs text-muted-foreground block">Lead Time</span>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {product.leadtimeDays} days
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                                            Downloads
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Download the full technical datasheet
                                        </p>
                                    </div>
                                    <DownloadButton
                                        onClick={handleDownloadDatasheet}
                                        disabled={datasheetLoading}
                                        loading={datasheetLoading}
                                        label="Product Datasheet"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="flex-1 sm:flex-none min-w-[140px]"
                                        onClick={() => requireAuthForCta(() => handleAddToCart(false))}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="flex-1 sm:flex-none min-w-[140px]"
                                        onClick={() => requireAuthForCta(() => handleAddToCart(true))}
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Get Quote
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Specifications — single accordion, two grids inside */}
                    <div className="space-y-4">
                        <Accordion type="single" defaultValue="specifications" collapsible className={accordionPanel}>
                            <AccordionItem value="specifications" className="border-0">
                                <AccordionTrigger className={accordionTriggerClass}>
                                    Specifications
                                </AccordionTrigger>
                                <AccordionContent className={accordionContentClass}>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                                        {/* Left grid */}
                                        <div className="space-y-6">
                                            <SpecGroup title="Basic Information">
                                                <SpecRow label="OEM / Brand" value={product.oemBrand} />
                                                <SpecRow label="Product Type" value={product.productType} />
                                                <SpecRow label="Area of Use" value={product.areaOfUse} />
                                                <SpecRow label="Design" value={product.design} />
                                                <SpecRow label="Special Types" value={product.specialTypes} />
                                                <SpecRow label="Year of Construction" value={product.yearOfConstruction} />
                                                <SpecRow label="Operating Hours" value={product.operatingHours} unit="h" />
                                                <SpecRow label="Service" value={product.service} />
                                            </SpecGroup>

                                            <SpecGroup title="Physical Specifications">
                                                <SpecRow label="Pixel Pitch" value={product.pixelPitch} unit="mm" />
                                                <SpecRow label="Cabinet Width" value={product.cabinetWidth} unit="mm" />
                                                <SpecRow label="Cabinet Height" value={product.cabinetHeight} unit="mm" />
                                                <SpecRow label="Cabinet Resolution (H)" value={product.cabinetResolutionHorizontal} unit="px" />
                                                <SpecRow label="Cabinet Resolution (V)" value={product.cabinetResolutionVertical} unit="px" />
                                                <SpecRow label="Weight (No Packaging)" value={product.weightWithoutPackaging} unit="kg" />
                                                <SpecRow label="IP Rating" value={product.ipRating} />
                                            </SpecGroup>

                                            <SpecGroup title="LED Specifications">
                                                <SpecRow label="LED Technology" value={ledTechnology} />
                                                <SpecRow label="LED / Chip Manufacturer" value={product.ledChipManufacturer} />
                                                <SpecRow label="Chip Bonding" value={product.chipBonding} />
                                                <SpecRow label="Brightness" value={product.brightnessValue} unit="nit" />
                                                <SpecRow label="LED Driver" value={product.ledDriver} />
                                            </SpecGroup>
                                        </div>

                                        {/* Right grid */}
                                        <div className="space-y-6">
                                            <SpecGroup title="Electrical & Performance">
                                                <SpecRow label="Input Voltage" value={product.inputVoltage} />
                                                <SpecRow label="Power Max" value={product.powerConsumptionMax} unit="W/m²" />
                                                <SpecRow label="Power Typical" value={product.powerConsumptionTypical} unit="W/m²" />
                                                <SpecRow label="Refresh Rate" value={product.refreshRate} unit="Hz" />
                                                <SpecRow label="Scan Rate" value={product.scanRate} />
                                                <SpecRow label="Control System" value={controlSystem} />
                                                <SpecRow label="Controller" value={product.controller} />
                                            </SpecGroup>

                                            <SpecGroup title="Mounting & Logistics">
                                                <SpecRow label="Hanging-Brackets" value={product.hangingBrackets} />
                                                <SpecRow label="Stacking System" value={product.stackingSystem} />
                                                <SpecRow label="Flight Cases" value={product.flightCases} />
                                                <SpecRow label="Stock Location" value={product.stockLocation} />
                                                <SpecRow label="Stock" value={product.stockPieces} unit="pcs" />
                                                <SpecRow label="Leadtime" value={product.leadtimeDays} unit="days" />
                                            </SpecGroup>

                                            {product.accessories ? (
                                                <SpecGroup title="Accessories">
                                                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line py-1">
                                                        {product.accessories}
                                                    </p>
                                                </SpecGroup>
                                            ) : null}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Related new products (by area of use) */}
                    <RelatedNewProductsSection refurbishedProductId={product.id} />
                </div>
            </div>
        </>
    );
}

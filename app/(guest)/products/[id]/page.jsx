"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { Download, ShoppingCart, FileText, Wrench } from "lucide-react";
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
import { RestrictedContentOverlay } from "@/components/guest/RestrictedContentOverlay";
import RelatedProductsSection from "@/components/guest/RelatedProductsSection";

export default function ProductDetailPage() {
    const params = useParams();
    const { language } = useLanguage();
    const { addToCart } = useCart();
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
            const res = await fetch(`/api/products/${params.id}/datasheet`);
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
            const res = await fetch(`/api/products/${params.id}/download-pdf?type=${type}`);
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
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg">Product not found</p>
            </div>
        );
    }

    const selectedImage = product.images[selectedImageIndex] || product.images[0] || null;

    // Helper function to get localized field
    const getLocalizedField = (enField, deField) => {
        return language === "de" && deField ? deField : enField || "";
    };

    // Format enum values for display
    const formatEnum = (value) => {
        if (!value) 
            return "N/A";
        return value
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const SpecRow = ({ label, value, unit }) => {
        const displayValue = value ?? "N/A";
        return (
            <div className="flex text-md font-normal justify-between items-baseline gap-4 py-1">
                <span className="shrink-0">{label}</span>
                <div className="flex items-baseline justify-end gap-3 min-w-0 flex-1">
                    <span className="text-right">{String(displayValue)}</span>
                    <span className="w-10 shrink-0"> {unit ? unit : ""}</span>
                </div>
            </div>
        );
    };

    return (
        <>
            <BreadCrumb title={product.productName}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Products" : "Produkte", href: "/products" },
                    { label: product.productName }
                ]} />
            <div className="min-h-screen bg-gray-50 font-open-sans">
                <div className="container mx-auto px-4 py-8">
                    {/* Make the left grid take less width then the right grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Left Side - Image Gallery */}
                        <div className="space-y-4">
                            {/* Main Selected Image */}
                            <div className="relative aspect-square overflow-hidden rounded-lg">
                                {selectedImage ? (
                                    <Image
                                        src={selectedImage}
                                        alt={product.productName}
                                        fill
                                        className="object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Image Carousel */}
                            {product.images.length > 0 && (
                                <Carousel
                                    opts={{
                                        align: "center",
                                        slidesToScroll: 1,
                                    }}
                                    className="w-full relative"
                                >
                                    <CarouselContent>
                                        {product.images.map((image, index) => (
                                            <CarouselItem 
                                                key={index} 
                                                className="py-2 basis-1/3 md:basis-1/4"
                                            >
                                                <button
                                                    onClick={() => setSelectedImageIndex(index)}
                                                    className="relative aspect-square overflow-hidden rounded-lg w-full"
                                                >
                                                    <Image
                                                        src={image}
                                                        alt={`${product.productName} ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </button>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {product.images.length > 3 && (
                                        <>
                                            <CarouselPrevious className="left-2" />
                                            <CarouselNext className="right-2" />
                                        </>
                                    )}
                                </Carousel>
                            )}
                        </div>

                        {/* Right Side - Product Info */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>
                                    <p className="text-xl font-semibold mb-2">{product.productNumber}</p>
                                    {product.areaOfUse && (
                                        <span className="inline-block bg-secondary text-white px-4 py-2 rounded-md text-lg font-semibold mb-4">
                                            {product.areaOfUse.toUpperCase()}
                                        </span>
                                    )}
                                    {product.productDescription && (
                                        <p className="mb-4 font-normal text-xl">{product.productDescription}</p>
                                    )}
                                </div>

                                {/* Features */}
                                {product.features && product.features.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Features</h2>
                                        <ul className="space-y-1 px-2">
                                            {product.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2 font-normal text-xl">
                                                    <span>•</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {(product.leadtimeDays || product.stockPieces) && (
                                    <div className="mt-4 space-y-1">
                                        {product.leadtimeDays && 
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-xl">Stock:</span>
                                            <span className="font-normal text-xl">
                                                {product.stockPieces} pieces
                                            </span>
                                        </div>
                                        }
                                        {product.leadtimeDays && 
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-xl">Lead Time:</span>
                                            <span className="font-normal text-xl">
                                                {product.leadtimeDays} days
                                            </span>
                                        </div>
                                        }
                                    </div>
                                )}
                            </div>

                            {/* Downloads */}
                            {isAuthenticated && isUser && (
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4">
                                <div>
                                    <h3 className="text-lg font-bold">Downloads</h3>
                                    <p className="text-sm text-gray-800">Product Datasheet</p>
                                </div>

                                <div className="mt-4 md:mt-0">
                                    <button
                                        onClick={handleDownloadDatasheet}
                                        disabled={datasheetLoading}
                                        className="flex items-center cursor-pointer font-bold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {datasheetLoading ? (
                                            <>
                                                <Spinner className="h-5 w-5 mr-2 text-blue-600" />
                                                <span>Generating…</span>
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-5 w-5 mr-2 text-red-500" />
                                                <span>Product Datasheet</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            )}
                            {/* Action Buttons */}
                            
                            {isAuthenticated && isUser && (
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => {
                                        if (product) {
                                            addToCart({
                                                id: product.id,
                                                productName: product.productName,
                                                productNumber: product.productNumber,
                                                imageUrl: product.images?.[0] || null,
                                                categoryName: product.categoryName,
                                            });
                                            toast.success("Product added to cart");
                                        }
                                    }}
                                >
                                    Add to Cart
                                </Button>
                                <Button variant="default" size="lg">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Get a Quote
                                </Button>
                                <Button size="lg" variant="outline" className="text-primary hover:bg-primary/10 border-primary">
                                    <Wrench className="h-5 w-5 mr-2" />
                                    Get Custom Solution
                                </Button>
                            </div>
                            )}

                            {/* Product feature icons (max 8 per line) */}
                            {product.productIcons && product.productIcons.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                                    {product.productIcons.map((icon) => (
                                        <div
                                            key={icon.id}
                                            className="aspect-square bg-white shadow-lg border-b-8 border-black border rounded flex flex-col items-center justify-end"
                                        >
                                            <div className="relative w-full flex-1">
                                                <Image
                                                    src={icon.imageUrl}
                                                    alt={icon.name}
                                                    fill
                                                    className="object-fill"
                                                />
                                            </div>
                                            {/* <p className="text-xs font-medium text-center line-clamp-2 leading-tight">
                                                {icon.name}
                                            </p> */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Specifications */}
                    <RestrictedContentOverlay isAuthenticated={isAuthenticated}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Basic Information */}
                            <Accordion type="single" defaultValue="basic-info" collapsible className="rounded-lg">
                                <AccordionItem value="basic-info">
                                    <AccordionTrigger className="font-bold text-2xl bg-blue-100 px-4">
                                        Basic Information
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 pb-2 bg-gray-100 px-4">
                                        <div>
                                            <SpecRow label="Product Type" value={product.productType} />
                                            <SpecRow label="Design" value={product.design} />
                                            <SpecRow label="Special Types" value={product.specialTypes } />
                                            <SpecRow label="Application" value={Array.isArray(product.application) ? product.application.join(", ") : product.application} />
                                            <SpecRow label="Category" value={product.areaOfUse} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Physical Specifications */}
                            <Accordion type="single" defaultValue="physical-specs" collapsible className="rounded-lg">
                                <AccordionItem value="physical-specs">
                                    <AccordionTrigger className="font-bold text-2xl bg-blue-100 px-4">
                                        Physical Specifications
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 pb-2 bg-gray-100 px-4">
                                        <div>
                                            <SpecRow label="Pixel Pitch" value={product.pixelPitch} unit="mm" />
                                            <SpecRow label="Pixel Technology" value={product.pixelTechnology} />
                                            <SpecRow label="Cabinet Width" value={product.cabinetWidth} unit="mm" />
                                            <SpecRow label="Cabinet Height" value={product.cabinetHeight} unit="mm" />
                                            <SpecRow label="Cabinet Resolution (Horizontal)" value={product.cabinetResolutionHorizontal} unit="px" />
                                            <SpecRow label="Cabinet Resolution (Vertical)" value={product.cabinetResolutionVertical} unit="px" />
                                            <SpecRow label="Pixel Density" value={product.pixelDensity} unit="px/m²" />
                                            <SpecRow label="Weight Without Packaging" value={product.weightWithoutPackaging} unit="kg" />
                                            <SpecRow label="IP Rating" value={product.ipRating} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Electrical Specifications */}
                            <Accordion type="single" defaultValue="electrical-specs" collapsible className="rounded-lg">
                                <AccordionItem value="electrical-specs">
                                    <AccordionTrigger className="font-bold text-2xl bg-blue-100 px-4">
                                        Electrical Specifications
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 pb-2 bg-gray-100 px-4">
                                        <div>
                                            <SpecRow label="Input Voltage" value={product.inputVoltage} unit="V(AC)" />
                                            <SpecRow label="Power Consumption (Max)" value={product.powerConsumptionMax} unit="W" />
                                            <SpecRow label="Power Consumption (Typical)" value={product.powerConsumptionTypical} unit="W" />
                                            <SpecRow label="Driving Method" value={formatEnum(product.drivingMethod)} />
                                            <SpecRow label="Current Gain Control" value={product.currentGainControl} />
                                            <SpecRow label="Power Redundancy" value={formatEnum(product.powerRedundancy)} />
                                            <SpecRow label="Memory on Module" value={formatEnum(product.memoryOnModule)} />
                                            <SpecRow label="Smart Module" value={formatEnum(product.smartModule)} />
                                            <SpecRow label="MTBF Power Supply" value={product.mtbfPowerSupply} unit="hours" />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Control System */}
                            <Accordion type="single" defaultValue="control-system" collapsible className="rounded-lg">
                                <AccordionItem value="control-system">
                                    <AccordionTrigger className="font-bold text-2xl bg-blue-100 px-4">
                                        Control System
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 pb-2 bg-gray-100 px-4">
                                        <div>
                                            <SpecRow
                                                label="Control System"
                                                value={product.controlSystem === "other" && product.controlSystemOther ? product.controlSystemOther : formatEnum(product.controlSystem)}
                                            />
                                            <SpecRow label="Receiving Card" value={product.receivingCard} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Operating Conditions */}
                            <Accordion type="single" defaultValue="operating-conditions" collapsible className="rounded-lg">
                                <AccordionItem value="operating-conditions">
                                    <AccordionTrigger className="font-bold text-2xl bg-blue-100 px-4">
                                        Operating Conditions
                                        </AccordionTrigger>
                                        <AccordionContent className="bg-white px-4 pb-4 pt-2">
                                        <div className="space-y-3">
                                            {/* Product Datasheet */}
                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <p className="text-sm text-gray-800">Product Datasheet</p>
                                                <button
                                                    onClick={handleDownloadDatasheet}
                                                    disabled={datasheetLoading}
                                                    className="flex items-center cursor-pointer font-bold text-blue-600 hover:text-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                                                >
                                                    {datasheetLoading ? (
                                                        <>
                                                            <Spinner className="h-5 w-5 mr-2 text-blue-600" />
                                                            <span>Generating…</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="h-5 w-5 mr-2 text-red-500 shrink-0" />
                                                            <span>Product Datasheet</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            {product.installationManualUrl && (
                                                <div className="flex items-center justify-between gap-4 py-1">
                                                    <p className="text-sm text-gray-800">Installation Manual</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadPdf("installationManual", "Installation_Manual.pdf")}
                                                        disabled={pdfDownloading !== null}
                                                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium underline shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {pdfDownloading === "installationManual" ? (
                                                            <>
                                                                <Spinner className="h-5 w-5 mr-2 text-blue-600 shrink-0" />
                                                                <span>Downloading…</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FileText className="h-5 w-5 mr-2 text-red-500 shrink-0" />
                                                                <span>Installation Manual</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                           
                                            {product.maintenanceGuideUrl && (
                                                <div className="flex items-center justify-between gap-4 py-1">
                                                    <p className="text-sm text-gray-800">Maintenance Guide</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadPdf("maintenanceGuide", "Maintenance_Guide.pdf")}
                                                        disabled={pdfDownloading !== null}
                                                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium underline shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {pdfDownloading === "maintenanceGuide" ? (
                                                            <>
                                                                <Spinner className="h-5 w-5 mr-2 text-blue-600 shrink-0" />
                                                                <span>Downloading…</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FileText className="h-5 w-5 mr-2 text-red-500 shrink-0" />
                                                                <span>Maintenance Guide</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                            {product.certificatesPdfUrl && (
                                                <div className="flex items-center justify-between gap-4 py-1">
                                                    <p className="text-sm text-gray-800">Certificates PDF</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadPdf("certificatesPdf", "Certificates.pdf")}
                                                        disabled={pdfDownloading !== null}
                                                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium underline shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {pdfDownloading === "certificatesPdf" ? (
                                                            <>
                                                                <Spinner className="h-5 w-5 mr-2 text-blue-600 shrink-0" />
                                                                <span>Downloading…</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FileText className="h-5 w-5 mr-2 text-red-500 shrink-0" />
                                                                <span>Certificates PDF</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* LED Specifications */}
                            <Accordion type="single" defaultValue="led-specs" collapsible className="rounded-lg">
                                <AccordionItem value="led-specs">
                                    <AccordionTrigger className="font-bold text-2xl bg-blue-100 px-4">
                                        LED Specifications
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 pb-2 bg-gray-100 px-4">
                                        <div>
                                            <SpecRow label="LED Technology" value={formatEnum(product.ledTechnology)} />
                                            <SpecRow label="Pixel Configuration" value={product.pixelConfiguration} />
                                            <SpecRow label="Chip Bonding" value={formatEnum(product.chipBonding)} />
                                            <SpecRow label="LED Lifespan" value={product.ledLifespan} unit="hours" />
                                            <SpecRow label="LED Chip Manufacturer" value={product.ledChipManufacturer} />
                                            <SpecRow label="LED Modules per Cabinet" value={product.ledModulesPerCabinet} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Display Performance */}
                            <Accordion type="single" defaultValue="display-performance" collapsible className="rounded-lg">
                                <AccordionItem value="display-performance">
                                    <AccordionTrigger className="font-bold text-2xl bg-blue-100 px-4">
                                        Display Performance
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 pb-2 bg-gray-100 px-4">
                                        <div>
                                            <SpecRow label="Refresh Rate" value={product.refreshRate} unit="Hz" />
                                            <SpecRow
                                                label="Scan Rate"
                                                value={product.scanRateDenominator ? `1/${product.scanRateDenominator}${product.scanRateNumerator && product.scanRateNumerator !== 1 ? ` (${product.scanRateNumerator}/${product.scanRateDenominator})` : ""}` : null}
                                            />
                                            <SpecRow label="Video Rate" value={product.videoRate} />
                                            <SpecRow label="Colour Depth" value={product.colourDepth} unit="bit" />
                                            <SpecRow
                                                label="Greyscale Processing"
                                                value={product.greyscaleProcessing === "other" && product.greyscaleProcessingOther ? product.greyscaleProcessingOther : product.greyscaleProcessing}
                                            />
                                            <SpecRow label="Number of Colours" value={product.numberOfColours} />
                                            <SpecRow label="Viewing Angle (Horizontal)" value={product.viewingAngleHorizontal} />
                                            <SpecRow label="Viewing Angle (Vertical)" value={product.viewingAngleVertical} />
                                            <SpecRow label="Brightness Control" value={product.brightnessControl} />
                                            <SpecRow
                                                label="Contrast Ratio"
                                                value={product.contrastRatioNumerator ? `${product.contrastRatioNumerator}:${product.contrastRatioDenominator || 1}` : null}
                                            />
                                            <SpecRow label="DCI-P3 Coverage" value={product.dciP3Coverage} unit="%" />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Calibration */}
                            <Accordion type="single" defaultValue="calibration" collapsible className="rounded-lg">
                                <AccordionItem value="calibration">
                                    <AccordionTrigger className="font-bold text-2xl bg-blue-100 px-4">
                                        Calibration
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 pb-2 bg-gray-100 px-4">
                                        <div>
                                            <SpecRow label="Calibration Method" value={formatEnum(product.calibrationMethod)} />
                                            <SpecRow label="White Point Calibration" value={product.whitePointCalibration} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Certifications & Standards */}
                            {(product.productCertificates?.length > 0 || product.additionalCertification || product.emc || product.safety) && (
                                <Accordion type="single" defaultValue="certifications" collapsible className="rounded-lg">
                                    <AccordionItem value="certifications">
                                        <AccordionTrigger className="font-bold text-2xl bg-blue-100 px-4">
                                            Certifications & Standards
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 pb-2 bg-gray-100 px-4">
                                            {product.productCertificates && product.productCertificates.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600 mb-2">Certificates</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {product.productCertificates.map((cert) => (
                                                            <div key={cert.id} className="flex items-center gap-2 bg-white p-2 px-4 rounded-md">
                                                                <Image
                                                                    src={cert.imageUrl}
                                                                    alt={cert.name}
                                                                    width={40}
                                                                    height={40}
                                                                    className="object-contain"
                                                                />
                                                                <span className="text-sm">{cert.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <SpecRow label="Additional Certification" value={product.additionalCertification} />
                                                <SpecRow label="EMC" value={product.emc} />
                                                <SpecRow label="Safety" value={product.safety} />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}
                           
                            {/* Warranty & Support */}
                            <Accordion type="single" defaultValue="warranty" collapsible className="rounded-lg">
                                <AccordionItem value="warranty">
                                    <AccordionTrigger className="font-bold text-2xl bg-blue-100 px-4">
                                        Warranty & Support
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 pb-2 bg-gray-100 px-4">
                                        <div>
                                            <SpecRow label="Warranty Period" value={product.warrantyPeriod} unit="months" />
                                            <SpecRow
                                                label={`Support During Warranty (${language === "de" ? "DE" : "EN"})`}
                                                value={getLocalizedField(product.supportDuringWarrantyEn, product.supportDuringWarrantyDe)}
                                            />
                                            <SpecRow
                                                label={`Support After Warranty (${language === "de" ? "DE" : "EN"})`}
                                                value={getLocalizedField(product.supportAfterWarrantyEn, product.supportAfterWarrantyDe)}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                    </RestrictedContentOverlay>

                    <RelatedProductsSection productId={product.id} language={language} />
                </div>
            </div>
        </>

    );
}

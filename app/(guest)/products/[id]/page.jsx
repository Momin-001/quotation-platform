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
import Header from "@/components/BreadCrumb";
import BreadCrumb from "@/components/BreadCrumb";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

export default function ProductDetailPage() {
    const params = useParams();
    const { language } = useLanguage();
    const { addToCart } = useCart();
    const { isAuthenticated, isUser } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${product.productNumber}_datasheet.pdf`;
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

    const images = product.images || [];
    const selectedImage = images[selectedImageIndex] || images[0] || null;

    // Helper function to get localized field
    const getLocalizedField = (enField, deField) => {
        return language === "de" && deField ? deField : enField || "";
    };

    // Format enum values for display
    const formatEnum = (value) => {
        if (!value) return "N/A";
        return value
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <>
            <BreadCrumb title={product.productName}
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Products", href: "/products" },
                    { label: product.productName }
                ]} />
            <div className="min-h-screen bg-gray-50">
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
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Image Carousel */}
                            {images.length > 0 && (
                                <Carousel
                                    opts={{
                                        align: "center",
                                        slidesToScroll: 1,
                                    }}
                                    className="w-full relative"
                                >
                                    <CarouselContent>
                                        {images.map((image, index) => (
                                            <CarouselItem 
                                                key={index} 
                                                className=" py-2 basis-1/3 md:basis-1/4"
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
                                    {images.length > 3 && (
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
                            <div className="space-y-2">
                                <div>
                                    <h1 className="text-3xl font-bold font-open-sans mb-2">{product.productName}</h1>
                                    <p className="text-lg text-gray-600 mb-2">{product.productNumber}</p>
                                    {product.categoryName && (
                                        <span className="inline-block bg-secondary text-white px-4 py-2 rounded-md text-sm font-semibold mb-4">
                                            {product.categoryName.toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Features */}
                                {product.features && product.features.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-2">Features</h2>
                                        <ul className="space-y-1 px-2">
                                            {product.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span>•</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Downloads */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4">
                                <div>
                                    <h3 className="text-lg font-bold">Downloads</h3>
                                    <p className="text-sm text-gray-800">Product Datasheet</p>
                                </div>

                                <div className="mt-4 md:mt-0">
                                    <button
                                        onClick={handleDownloadDatasheet}
                                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                    >
                                        <FileText className="h-5 w-5 mr-2 text-red-500" />
                                        <span>Product Datasheet</span>
                                    </button>
                                </div>
                            </div>

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
                                    <ShoppingCart className="h-5 w-5" />
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

                            {/* Placeholder squares */}
                            <div className="grid grid-cols-8 gap-2">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square bg-white shadow-lg border-b-8 border-black
                                     border"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Specifications */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Basic Information */}
                            <Accordion type="single" collapsible className="rounded-lg">
                                <AccordionItem value="basic-info">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Basic Information
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Product Type</p>
                                                <p className="font-medium">{product.productType || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Design</p>
                                                <p className="font-medium">{formatEnum(product.design)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Special Types</p>
                                                <p className="font-medium">{formatEnum(product.specialTypes)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Application</p>
                                                <p className="font-medium">{product.application || "N/A"}</p>
                                            </div>
                                            {product.categoryName && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Category</p>
                                                    <p className="font-medium">{product.categoryName}</p>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Physical Specifications */}
                            <Accordion type="single" collapsible className="rounded-lg">
                                <AccordionItem value="physical-specs">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Physical Specifications
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Pixel Pitch</p>
                                                <p className="font-medium">{product.pixelPitch} mm</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Pixel Technology</p>
                                                <p className="font-medium">{formatEnum(product.pixelTechnology)}</p>
                                            </div>
                                            {product.cabinetWidth && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Cabinet Width</p>
                                                    <p className="font-medium">{product.cabinetWidth} mm</p>
                                                </div>
                                            )}
                                            {product.cabinetHeight && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Cabinet Height</p>
                                                    <p className="font-medium">{product.cabinetHeight} mm</p>
                                                </div>
                                            )}
                                            {product.cabinetResolutionHorizontal && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Cabinet Resolution (Horizontal)</p>
                                                    <p className="font-medium">{product.cabinetResolutionHorizontal} px</p>
                                                </div>
                                            )}
                                            {product.cabinetResolutionVertical && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Cabinet Resolution (Vertical)</p>
                                                    <p className="font-medium">{product.cabinetResolutionVertical} px</p>
                                                </div>
                                            )}
                                            {product.pixelDensity && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Pixel Density</p>
                                                    <p className="font-medium">
                                                        {product.pixelDensity.toLocaleString()} pixels/m²
                                                    </p>
                                                </div>
                                            )}
                                            {product.weightWithoutPackaging && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Weight Without Packaging</p>
                                                    <p className="font-medium">{product.weightWithoutPackaging} kg</p>
                                                </div>
                                            )}
                                            {product.ipRating && (
                                                <div>
                                                    <p className="text-sm text-gray-600">IP Rating</p>
                                                    <p className="font-medium">{product.ipRating}</p>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Electrical Specifications */}
                            <Accordion type="single" collapsible className="rounded-lg">
                                <AccordionItem value="electrical-specs">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Electrical Specifications
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {product.inputVoltage && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Input Voltage</p>
                                                    <p className="font-medium">{product.inputVoltage}</p>
                                                </div>
                                            )}
                                            {product.powerConsumptionMax && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Power Consumption (Max)</p>
                                                    <p className="font-medium">{product.powerConsumptionMax} W</p>
                                                </div>
                                            )}
                                            {product.powerConsumptionTypical && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Power Consumption (Typical)</p>
                                                    <p className="font-medium">{product.powerConsumptionTypical} W</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-600">Driving Method</p>
                                                <p className="font-medium">{formatEnum(product.drivingMethod)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Current Gain Control</p>
                                                <p className="font-medium">{product.currentGainControl}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Power Redundancy</p>
                                                <p className="font-medium">{formatEnum(product.powerRedundancy)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Memory on Module</p>
                                                <p className="font-medium">{formatEnum(product.memoryOnModule)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Smart Module</p>
                                                <p className="font-medium">{formatEnum(product.smartModule)}</p>
                                            </div>
                                            {product.mtbfPowerSupply && (
                                                <div>
                                                    <p className="text-sm text-gray-600">MTBF Power Supply</p>
                                                    <p className="font-medium">{product.mtbfPowerSupply.toLocaleString()} hours</p>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Control System */}
                            <Accordion type="single" collapsible className="rounded-lg">
                                <AccordionItem value="control-system">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Control System
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Control System</p>
                                                <p className="font-medium">
                                                    {product.controlSystem === "other" && product.controlSystemOther
                                                        ? product.controlSystemOther
                                                        : formatEnum(product.controlSystem)}
                                                </p>
                                            </div>
                                            {product.receivingCard && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Receiving Card</p>
                                                    <p className="font-medium">{product.receivingCard}</p>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Operating Conditions */}
                            <Accordion type="single" collapsible className="rounded-lg">
                                <AccordionItem value="operating-conditions">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Operating Conditions
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {product.operatingTemperature && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Operating Temperature</p>
                                                    <p className="font-medium">{product.operatingTemperature}</p>
                                                </div>
                                            )}
                                            {product.operatingHumidity && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Operating Humidity</p>
                                                    <p className="font-medium">{product.operatingHumidity}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-600">Cooling</p>
                                                <p className="font-medium">{formatEnum(product.cooling)}</p>
                                            </div>
                                            {product.heatDissipation && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Heat Dissipation</p>
                                                    <p className="font-medium">{product.heatDissipation}</p>
                                                </div>
                                            )}
                                            {(product.monitoringFunctionEn || product.monitoringFunctionDe) && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Monitoring Function ({language === "de" ? "DE" : "EN"})</p>
                                                    <p className="font-medium">
                                                        {getLocalizedField(
                                                            product.monitoringFunctionEn,
                                                            product.monitoringFunctionDe
                                                        ) || "N/A"}
                                                    </p>
                                                </div>
                                            )}
                                            {product.support && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Support</p>
                                                    <p className="font-medium">{formatEnum(product.support)}</p>
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
                            <Accordion type="single" collapsible className="rounded-lg">
                                <AccordionItem value="led-specs">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        LED Specifications
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">LED Technology</p>
                                                <p className="font-medium">{formatEnum(product.ledTechnology)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Pixel Configuration</p>
                                                <p className="font-medium">{product.pixelConfiguration}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Chip Bonding</p>
                                                <p className="font-medium">{formatEnum(product.chipBonding)}</p>
                                            </div>
                                            {product.ledLifespan && (
                                                <div>
                                                    <p className="text-sm text-gray-600">LED Lifespan</p>
                                                    <p className="font-medium">{product.ledLifespan.toLocaleString()} hours</p>
                                                </div>
                                            )}
                                            {product.ledChipManufacturer && (
                                                <div>
                                                    <p className="text-sm text-gray-600">LED Chip Manufacturer</p>
                                                    <p className="font-medium">{product.ledChipManufacturer}</p>
                                                </div>
                                            )}
                                            {product.ledModulesPerCabinet && (
                                                <div>
                                                    <p className="text-sm text-gray-600">LED Modules per Cabinet</p>
                                                    <p className="font-medium">{product.ledModulesPerCabinet}</p>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Display Performance */}
                            <Accordion type="single" collapsible className="rounded-lg">
                                <AccordionItem value="display-performance">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Display Performance
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {product.refreshRate && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Refresh Rate</p>
                                                    <p className="font-medium">{product.refreshRate} Hz</p>
                                                </div>
                                            )}
                                            {product.scanRateDenominator && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Scan Rate</p>
                                                    <p className="font-medium">
                                                        1/{product.scanRateDenominator}
                                                        {product.scanRateNumerator && product.scanRateNumerator !== 1 
                                                            ? ` (${product.scanRateNumerator}/${product.scanRateDenominator})`
                                                            : ""}
                                                    </p>
                                                </div>
                                            )}
                                            {product.videoRate && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Video Rate</p>
                                                    <p className="font-medium">{product.videoRate}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-600">Colour Depth</p>
                                                <p className="font-medium">{product.colourDepth} bit</p>
                                            </div>
                                            {product.greyscaleProcessing && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Greyscale Processing</p>
                                                    <p className="font-medium">
                                                        {product.greyscaleProcessing === "other" && product.greyscaleProcessingOther
                                                            ? product.greyscaleProcessingOther
                                                            : product.greyscaleProcessing}
                                                    </p>
                                                </div>
                                            )}
                                            {product.numberOfColours && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Number of Colours</p>
                                                    <p className="font-medium">{product.numberOfColours.toLocaleString()}</p>
                                                </div>
                                            )}
                                            {product.viewingAngleHorizontal && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Viewing Angle (Horizontal)</p>
                                                    <p className="font-medium">{product.viewingAngleHorizontal}</p>
                                                </div>
                                            )}
                                            {product.viewingAngleVertical && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Viewing Angle (Vertical)</p>
                                                    <p className="font-medium">{product.viewingAngleVertical}</p>
                                                </div>
                                            )}
                                            {product.brightnessControl && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Brightness Control</p>
                                                    <p className="font-medium">{product.brightnessControl}</p>
                                                </div>
                                            )}
                                            {product.contrastRatioNumerator && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Contrast Ratio</p>
                                                    <p className="font-medium">
                                                        {product.contrastRatioNumerator}:{product.contrastRatioDenominator || 1}
                                                    </p>
                                                </div>
                                            )}
                                            {product.dciP3Coverage && (
                                                <div>
                                                    <p className="text-sm text-gray-600">DCI-P3 Coverage</p>
                                                    <p className="font-medium">{product.dciP3Coverage}</p>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Calibration */}
                            <Accordion type="single" collapsible className="rounded-lg">
                                <AccordionItem value="calibration">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Calibration
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {product.calibrationMethod && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Calibration Method</p>
                                                    <p className="font-medium">{formatEnum(product.calibrationMethod)}</p>
                                                </div>
                                            )}
                                            {product.whitePointCalibration && (
                                                <div>
                                                    <p className="text-sm text-gray-600">White Point Calibration</p>
                                                    <p className="font-medium">{product.whitePointCalibration}</p>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* Certifications & Standards */}
                            {(product.certificates?.length > 0 || product.additionalCertification || product.emc || product.safety) && (
                                <Accordion type="single" collapsible className="rounded-lg">
                                    <AccordionItem value="certifications">
                                        <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                            Certifications & Standards
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                            {product.certificates && product.certificates.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600 mb-2">Certificates</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {product.certificates.map((cert) => (
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
                                            <div className="grid grid-cols-2 gap-4">
                                                {product.additionalCertification && (
                                                    <div>
                                                        <p className="text-sm text-gray-600">Additional Certification</p>
                                                        <p className="font-medium">{product.additionalCertification}</p>
                                                    </div>
                                                )}
                                                {product.emc && (
                                                    <div>
                                                        <p className="text-sm text-gray-600">EMC</p>
                                                        <p className="font-medium">{product.emc}</p>
                                                    </div>
                                                )}
                                                {product.safety && (
                                                    <div>
                                                        <p className="text-sm text-gray-600">Safety</p>
                                                        <p className="font-medium">{product.safety}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}
                           
                            {/* Warranty & Support */}
                            <Accordion type="single" collapsible className="rounded-lg">
                                <AccordionItem value="warranty">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Warranty & Support
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {product.warrantyPeriod && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Warranty Period</p>
                                                    <p className="font-medium">{product.warrantyPeriod} months</p>
                                                </div>
                                            )}
                                            {(product.supportDuringWarrantyEn || product.supportDuringWarrantyDe) && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Support During Warranty ({language === "de" ? "DE" : "EN"})</p>
                                                    <p className="font-medium">
                                                        {getLocalizedField(
                                                            product.supportDuringWarrantyEn,
                                                            product.supportDuringWarrantyDe
                                                        ) || "N/A"}
                                                    </p>
                                                </div>
                                            )}
                                            {(product.supportAfterWarrantyEn || product.supportAfterWarrantyDe) && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Support After Warranty ({language === "de" ? "DE" : "EN"})</p>
                                                    <p className="font-medium">
                                                        {getLocalizedField(
                                                            product.supportAfterWarrantyEn,
                                                            product.supportAfterWarrantyDe
                                                        ) || "N/A"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}

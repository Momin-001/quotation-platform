"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Spinner } from "@/components/ui/spinner";
import { ShoppingCart } from "lucide-react";
import BreadCrumb from "@/components/user/BreadCrumb";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/context/LanguageContext";

function SpecRow({ label, value }) {
    const display = value !== null && value !== undefined && value !== "" ? String(value) : "N/A";
    return (
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="font-medium">{display}</p>
        </div>
    );
}

export default function ControllerDetailPage() {
    const params = useParams();
    const { language } = useLanguage();
    const router = useRouter();
    const { cartItems, addControllerToProduct, getControllerForProduct } = useCart();
    const [controller, setController] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectProductModalOpen, setSelectProductModalOpen] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchController();
        }
    }, [params.id]);

    const fetchController = async () => {
        try {
            const res = await fetch(`/api/controllers/${params.id}`);
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch controller");
            }
            setController(response.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!controller) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg">Controller not found</p>
            </div>
        );
    }

    const selectedImage = controller.images?.[selectedImageIndex] || controller.images?.[0] || null;
    const title = controller.interfaceName || "Controller";
    const hasMainOrAlternative = cartItems.length > 0;

    const handleAddToCart = () => {
        if (!hasMainOrAlternative) {
            toast.error("Add a Main or Alternative LED product to your cart first");
            router.push("/products");
            return;
        }
        const availableProducts = cartItems.filter((item) => !getControllerForProduct(item.id));
        if (availableProducts.length === 0) {
            toast.error("Both Main and Alternative products already have an additional controller. Remove one to add another.");
            return;
        }
        if (availableProducts.length === 1) {
            const controllerForCart = {
                id: controller.id,
                productName: controller.interfaceName,
                interfaceName: controller.interfaceName,
                brandName: controller.brandName,
                brandDisplay: controller.brandDisplay || controller.brandName || "N/A",
                sourceType: "controller",
            };
            addControllerToProduct(controllerForCart, availableProducts[0].id);
            toast.success(`Controller added as additional product for ${availableProducts[0].productName}`);
            router.push("/user/cart");
        } else {
            setSelectProductModalOpen(true);
        }
    };

    const handleSelectProduct = (product) => {
        const controllerForCart = {
            id: controller.id,
            productName: controller.interfaceName,
            interfaceName: controller.interfaceName,
            brandName: controller.brandName,
            brandDisplay: controller.brandDisplay || controller.brandName || "N/A",
            sourceType: "controller",
        };
        addControllerToProduct(controllerForCart, product.id);
        setSelectProductModalOpen(false);
        toast.success(`Controller added as additional product for ${product.productName}`);
        router.push("/user/cart");
    };

    return (
        <>
            <BreadCrumb
                title={title}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Controllers" : "Controller", href: "/controllers" },
                    { label: title },
                ]}
            />
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Left - Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-video overflow-hidden rounded-lg">
                                {selectedImage ? (
                                    <Image
                                        src={selectedImage}
                                        alt={title}
                                        fill
                                        className="object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                        No Image
                                    </div>
                                )}
                            </div>
                            {controller.images?.length > 0 && (
                                <Carousel
                                    opts={{ align: "center", slidesToScroll: 1 }}
                                    className="w-full relative"
                                >
                                    <CarouselContent>
                                        {controller.images.map((image, index) => (
                                            <CarouselItem key={index} className="py-2 basis-1/3 md:basis-1/4">
                                                <button
                                                    onClick={() => setSelectedImageIndex(index)}
                                                    className="relative aspect-square overflow-hidden rounded-lg w-full"
                                                >
                                                    <Image
                                                        src={image}
                                                        alt={`${title} ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </button>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {controller.images.length > 3 && (
                                        <>
                                            <CarouselPrevious className="left-2" />
                                            <CarouselNext className="right-2" />
                                        </>
                                    )}
                                </Carousel>
                            )}
                        </div>

                        {/* Right - Info & Add to Cart */}
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold font-open-sans mb-2">{title}</h1>
                                <span className="inline-block bg-secondary text-white px-4 py-2 rounded-md text-sm font-semibold">
                                    {controller.brandDisplay || "N/A"}
                                </span>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="secondary" size="lg" onClick={handleAddToCart}>
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Add to Cart
                                </Button>
                            </div>

                            <Dialog open={selectProductModalOpen} onOpenChange={setSelectProductModalOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Select a product</DialogTitle>
                                        <DialogDescription>
                                            Add this controller as an additional product for one of your cart items:
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2 mt-4">
                                        {cartItems
                                            .filter((item) => !getControllerForProduct(item.id))
                                            .map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => handleSelectProduct(item)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                                                >
                                                    {item.imageUrl ? (
                                                        <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden">
                                                            <Image
                                                                src={item.imageUrl}
                                                                alt={item.productName}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 shrink-0 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{item.productName}</p>
                                                        <p className="text-sm text-gray-500">{item.itemType === "main" ? "Main Product" : "Alternative Product"}</p>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Specifications - Accordions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Accordion type="single" defaultValue="basic" collapsible className="rounded-lg">
                                <AccordionItem value="basic">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Basic Information
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <SpecRow label="Interface Name" value={controller.interfaceName} />
                                            <SpecRow label="Brand" value={controller.brandDisplay} />
                                            <SpecRow label="Max. Pixel Capacity" value={controller.pixelCapacity != null ? controller.pixelCapacity.toLocaleString() : null} />
                                            <SpecRow label="Max. Width/Height (px)" value={controller.maxWidthHeight != null ? controller.maxWidthHeight.toLocaleString() : null} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <Accordion type="single" defaultValue="input" collapsible className="rounded-lg">
                                <AccordionItem value="input">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Input Ports
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <SpecRow label="DP 1.2" value={controller.dp12} />
                                            <SpecRow label="HDMI 2.0" value={controller.hdmi20} />
                                            <SpecRow label="HDMI 1.3" value={controller.hdmi13} />
                                            <SpecRow label="DVI (Single-Link)" value={controller.dviSingleLink} />
                                            <SpecRow label="12G-SDI" value={controller.sdi12g} />
                                            <SpecRow label="3G-SDI" value={controller.sdi3g} />
                                            <SpecRow label="10G Optical Fiber (In)" value={controller.opticalFiberIn10g} />
                                            <SpecRow label="USB 3.0 (Media Playback)" value={controller.usb30MediaPlayback} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <Accordion type="single" defaultValue="output" collapsible className="rounded-lg">
                                <AccordionItem value="output">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Output Ports
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <SpecRow label="Gigabit Ethernet (RJ45)" value={controller.gigabitEthernetRj45} />
                                            <SpecRow label="10G Optical Fiber (Out)" value={controller.opticalFiberOut10g} />
                                            <SpecRow label="5G Output Port" value={controller.output5g} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <Accordion type="single" defaultValue="monitoring" collapsible className="rounded-lg">
                                <AccordionItem value="monitoring">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Monitoring Ports
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <SpecRow label="HDMI 1.3 (Monitoring)" value={controller.hdmi13Monitoring} />
                                            <SpecRow label="3D Connector (Mini DIN 4)" value={controller.connector3dMiniDin4} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <Accordion type="single" defaultValue="loop" collapsible className="rounded-lg">
                                <AccordionItem value="loop">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Loop Ports
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <SpecRow label="HDMI 2.0 LOOP" value={controller.hdmi20Loop} />
                                            <SpecRow label="12G-SDI LOOP" value={controller.sdi12gLoop} />
                                            <SpecRow label="3G-SDI LOOP" value={controller.sdi3gLoop} />
                                            <SpecRow label="DVI LOOP" value={controller.dviLoop} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <Accordion type="single" defaultValue="audio" collapsible className="rounded-lg">
                                <AccordionItem value="audio">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Audio & Control Ports
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <SpecRow label="3.5 mm Audio Input" value={controller.audioInput35mm} />
                                            <SpecRow label="3.5 mm Audio Output" value={controller.audioOutput35mm} />
                                            <SpecRow label="Ethernet Control Port" value={controller.ethernetControlPort} />
                                            <SpecRow label="USB Type-B (PC Control)" value={controller.usbTypeBPcControl} />
                                            <SpecRow label="USB Type-A (Cascading)" value={controller.usbTypeACascading} />
                                            <SpecRow label="Genlock IN & LOOP" value={controller.genlockInLoop} />
                                            <SpecRow label="RS-232" value={controller.rs232} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        <div className="space-y-4">
                            <Accordion type="single" defaultValue="layer" collapsible className="rounded-lg">
                                <AccordionItem value="layer">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        Layer & Image Quality
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <SpecRow label="Maximum Layers" value={controller.maximumLayers} />
                                            <SpecRow label="Layer Scaling" value={controller.layerScaling} />
                                            <SpecRow label="HDR Support" value={controller.hdrSupport} />
                                            <SpecRow label="Color Depth (bit)" value={controller.colorDepthBit} />
                                            <SpecRow label="Low Latency" value={controller.lowLatency} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <Accordion type="single" defaultValue="system" collapsible className="rounded-lg">
                                <AccordionItem value="system">
                                    <AccordionTrigger className="font-semibold bg-blue-100 px-4">
                                        System & Special Features
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-4 bg-gray-100 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <SpecRow label="Fibre Converter Mode" value={controller.fibreConverterMode} />
                                            <SpecRow label="V-Can Support" value={controller.vCanSupport} />
                                            <SpecRow label="Backup Mode" value={controller.backupMode} />
                                            <SpecRow label="Genlock Sync" value={controller.genlockSync} />
                                            <SpecRow label="Multi-Viewer (MVR)" value={controller.multiViewerMvr} />
                                            <SpecRow label="USB Playback" value={controller.usbPlayback} />
                                            <SpecRow label="3D Support" value={controller.support3d} />
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

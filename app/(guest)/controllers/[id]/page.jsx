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
import { FileText, ShoppingCart } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function ControllerDetailPage() {
    const params = useParams();
    const { language } = useLanguage();
    const isEn = language === "en";
    const router = useRouter();
    const { isAuthenticated, isUser } = useAuth();
    const { cartItems, addControllerToProduct, getControllerForProduct } = useCart();
    const [controller, setController] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectProductModalOpen, setSelectProductModalOpen] = useState(false);
    const [downloadOpening, setDownloadOpening] = useState(false);

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

    const accordionPanel = "rounded-xl border border-border/60 overflow-hidden bg-white shadow-sm";
    const accordionTriggerClass =
        "text-sm sm:text-base font-semibold  tracking-wide bg-primary/10 hover:no-underline hover:bg-primary/15 px-4 py-3.5 text-foreground data-[state=open]:bg-primary/15";
    const accordionContentClass = "bg-muted/20 px-4 pt-3 pb-4 border-t border-border/40";

    const SpecRow = ({ label, value }) => {
        const display =
            value !== null && value !== undefined && value !== "" ? String(value) : "N/A";
        return (
            <div className="flex text-sm justify-between items-baseline gap-4 py-1">
                <span className="text-muted-foreground shrink-0 pr-2">{label}</span>
                <span className="font-medium text-foreground text-right min-w-0">{display}</span>
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
                    <span>{isEn ? "Opening…" : "Wird geöffnet…"}</span>
                </>
            ) : (
                <>
                    <FileText className="h-4 w-4 text-destructive/80 shrink-0" />
                    <span>{label}</span>
                </>
            )}
        </button>
    );

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner className="h-6 w-6" />
                    <span className="text-sm">
                        {isEn ? "Loading controller…" : "Controller wird geladen…"}
                    </span>
                </div>
            </div>
        );
    }

    if (!controller) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
                <p className="text-base text-muted-foreground">
                    {isEn ? "Controller not found" : "Controller nicht gefunden"}
                </p>
                <Button variant="outline" size="default" onClick={() => router.push("/controllers")}>
                    {isEn ? "Back to Controllers" : "Zurück zu Controllern"}
                </Button>
            </div>
        );
    }

    const selectedImage = controller.images?.[selectedImageIndex] || controller.images?.[0] || null;
    const title = controller.interfaceName || (isEn ? "Controller" : "Controller");
    const hasMainOrAlternative = cartItems.length > 0;
    const brandLabel = controller.brandDisplay || controller.brandName || "N/A";

    const handleAddToCart = () => {
        if (!hasMainOrAlternative) {
            toast.error(
                isEn
                    ? "Add a Main or Alternative LED product to your cart first"
                    : "Fügen Sie zuerst ein Haupt- oder Alternativ-LED-Produkt zum Warenkorb hinzu"
            );
            router.push("/products");
            return;
        }
        const availableProducts = cartItems.filter((item) => !getControllerForProduct(item.id));
        if (availableProducts.length === 0) {
            toast.error(
                isEn
                    ? "Both Main and Alternative products already have a controller. Remove one to add another."
                    : "Haupt- und Alternativprodukte haben bereits einen Controller."
            );
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
            toast.success(
                isEn
                    ? `Controller added for ${availableProducts[0].productName}`
                    : `Controller für ${availableProducts[0].productName} hinzugefügt`
            );
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
        toast.success(
            isEn
                ? `Controller added for ${product.productName}`
                : `Controller für ${product.productName} hinzugefügt`
        );
        router.push("/user/cart");
    };

    const handleOpenDownload = () => {
        const url = controller?.downloadUrl ? String(controller.downloadUrl).trim() : "";
        if (!url) {
            toast.error(
                isEn ? "No download link available" : "Kein Download-Link verfügbar"
            );
            return;
        }
        setDownloadOpening(true);
        try {
            window.open(url, "_blank", "noopener,noreferrer");
        } finally {
            setTimeout(() => setDownloadOpening(false), 300);
        }
    };

    return (
        <>
            <BreadCrumb
                title={title}
                breadcrumbs={[
                    { label: isEn ? "Home" : "Startseite", href: "/" },
                    { label: isEn ? "Controllers" : "Controller", href: "/controllers" },
                    { label: title },
                ]}
            />
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-10 lg:mb-14">
                        <div className="space-y-4">
                            <div className="relative aspect-video overflow-hidden rounded-xl">
                                {selectedImage ? (
                                    <Image
                                        src={selectedImage}
                                        alt={title}
                                        fill
                                        className="object-contain p-4 sm:p-6"
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/30">
                                        <span className="text-sm">No Image</span>
                                    </div>
                                )}
                            </div>

                            {controller.images?.length > 0 && (
                                <Carousel
                                    opts={{ align: "start", slidesToScroll: 1 }}
                                    className="w-full relative px-1"
                                >
                                    <CarouselContent className="-ml-2">
                                        {controller.images.map((image, index) => (
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
                                                        alt={`${title} ${index + 1}`}
                                                        fill
                                                        className="object-contain p-1.5"
                                                        sizes="80px"
                                                    />
                                                </button>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {controller.images.length > 4 && (
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
                                    <h1 className="text-2xl sm:text-3xl font-bold  text-foreground leading-tight tracking-tight mb-2">
                                        {title}
                                    </h1>
                                    <p className="text-sm sm:text-base font-mono text-muted-foreground mb-3">
                                        {controller.controllerNumber}
                                    </p>
                                    <span className="inline-block bg-secondary text-primary-foreground text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-md mb-4">
                                        {brandLabel}
                                    </span>
                                    {controller.interfaceDescription ? (
                                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                            {controller.interfaceDescription}
                                        </p>
                                    ) : null}
                                </div>
                                {isAuthenticated && controller.downloadUrl && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold  uppercase tracking-wide text-foreground">
                                            {isEn ? "Downloads" : "Downloads"}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {isEn ? "Controller manual" : "Controller-Handbuch"}
                                        </p>
                                    </div>
                                    <DownloadButton
                                        onClick={handleOpenDownload}
                                        disabled={downloadOpening}
                                        loading={downloadOpening}
                                        label={isEn ? "Open manual" : "Handbuch öffnen"}
                                    />
                                </div>
                            )}

                            {isAuthenticated && isUser && (
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="flex-1 sm:flex-none min-w-[160px]"
                                        onClick={handleAddToCart}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        {isEn ? "Add to Cart" : "In den Warenkorb"}
                                    </Button>
                                </div>
                            )}
                            </div>



                            <Dialog open={selectProductModalOpen} onOpenChange={setSelectProductModalOpen}>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className=" text-lg">
                                            {isEn ? "Select a product" : "Produkt auswählen"}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm leading-relaxed">
                                            {isEn
                                                ? "Add this controller as an additional item for one cart product:"
                                                : "Controller als Zusatzprodukt für einen Warenkorb-Artikel hinzufügen:"}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2 mt-2 max-h-[60vh] overflow-y-auto">
                                        {cartItems
                                            .filter((item) => !getControllerForProduct(item.id))
                                            .map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => handleSelectProduct(item)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-white hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
                                                >
                                                    {item.imageUrl ? (
                                                        <div className="relative w-11 h-11 shrink-0 rounded-md overflow-hidden border border-border/40">
                                                            <Image
                                                                src={item.imageUrl}
                                                                alt={item.productName}
                                                                fill
                                                                className="object-cover"
                                                                sizes="44px"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-11 h-11 shrink-0 bg-muted/40 rounded-md flex items-center justify-center text-[10px] text-muted-foreground">
                                                            —
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-foreground truncate">
                                                            {item.productName}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.itemType === "main"
                                                                ? isEn
                                                                    ? "Main product"
                                                                    : "Hauptprodukt"
                                                                : isEn
                                                                  ? "Alternative product"
                                                                  : "Alternativprodukt"}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <Accordion type="single" defaultValue="basic-info" collapsible className={accordionPanel}>
                                    <AccordionItem value="basic-info" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {isEn ? "Basic Information" : "Grundinformationen"}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={isEn ? "Interface name" : "Schnittstellenname"}
                                                    value={controller.interfaceName}
                                                />
                                                <SpecRow label={isEn ? "Brand" : "Marke"} value={brandLabel} />
                                                <SpecRow
                                                    label={isEn ? "Max. pixel capacity" : "Max. Pixelkapazität"}
                                                    value={
                                                        controller.pixelCapacity != null
                                                            ? controller.pixelCapacity.toLocaleString()
                                                            : null
                                                    }
                                                />
                                                <SpecRow
                                                    label={isEn ? "Max. width/height (px)" : "Max. Breite/Höhe (px)"}
                                                    value={
                                                        controller.maxWidthHeight != null
                                                            ? controller.maxWidthHeight.toLocaleString()
                                                            : null
                                                    }
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Accordion type="single" defaultValue="input-ports" collapsible className={accordionPanel}>
                                    <AccordionItem value="input-ports" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {isEn ? "Input Ports" : "Eingangsports"}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow label="DP 1.2" value={controller.dp12} />
                                                <SpecRow label="HDMI 2.0" value={controller.hdmi20} />
                                                <SpecRow label="HDMI 1.3" value={controller.hdmi13} />
                                                <SpecRow
                                                    label={isEn ? "DVI (Single-Link)" : "DVI (Single-Link)"}
                                                    value={controller.dviSingleLink}
                                                />
                                                <SpecRow label="12G-SDI" value={controller.sdi12g} />
                                                <SpecRow label="3G-SDI" value={controller.sdi3g} />
                                                <SpecRow
                                                    label={isEn ? "10G Optical Fiber (In)" : "10G Glasfaser (In)"}
                                                    value={controller.opticalFiberIn10g}
                                                />
                                                <SpecRow
                                                    label={isEn ? "USB 3.0 (Media Playback)" : "USB 3.0 (Medienwiedergabe)"}
                                                    value={controller.usb30MediaPlayback}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Accordion type="single" defaultValue="monitoring-ports" collapsible className={accordionPanel}>
                                    <AccordionItem value="monitoring-ports" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {isEn ? "Monitoring Ports" : "Monitoring-Ports"}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={isEn ? "HDMI 1.3 (Monitoring)" : "HDMI 1.3 (Monitoring)"}
                                                    value={controller.hdmi13Monitoring}
                                                />
                                                <SpecRow
                                                    label={isEn ? "3D Connector (Mini DIN 4)" : "3D-Anschluss (Mini DIN 4)"}
                                                    value={controller.connector3dMiniDin4}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Accordion type="single" defaultValue="audio-control-ports" collapsible className={accordionPanel}>
                                    <AccordionItem value="audio-control-ports" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {isEn ? "Audio & Control Ports" : "Audio- & Steuerungsports"}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={isEn ? "3.5 mm Audio Input" : "3,5 mm Audio-Eingang"}
                                                    value={controller.audioInput35mm}
                                                />
                                                <SpecRow
                                                    label={isEn ? "3.5 mm Audio Output" : "3,5 mm Audio-Ausgang"}
                                                    value={controller.audioOutput35mm}
                                                />
                                                <SpecRow
                                                    label={isEn ? "Ethernet Control Port" : "Ethernet-Steuerungsport"}
                                                    value={controller.ethernetControlPort}
                                                />
                                                <SpecRow
                                                    label={isEn ? "USB Type-B (PC Control)" : "USB Typ-B (PC-Steuerung)"}
                                                    value={controller.usbTypeBPcControl}
                                                />
                                                <SpecRow
                                                    label={isEn ? "USB Type-A (Cascading)" : "USB Typ-A (Kaskade)"}
                                                    value={controller.usbTypeACascading}
                                                />
                                                <SpecRow label="Genlock IN & LOOP" value={controller.genlockInLoop} />
                                                <SpecRow label="RS-232" value={controller.rs232} />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                {isAuthenticated && controller.downloadUrl && (
                                    <Accordion type="single" defaultValue="downloads" collapsible className={accordionPanel}>
                                        <AccordionItem value="downloads" className="border-0">
                                            <AccordionTrigger className={accordionTriggerClass}>
                                                {isEn ? "Downloads" : "Downloads"}
                                            </AccordionTrigger>
                                            <AccordionContent className={accordionContentClass}>
                                                <div className="space-y-3 divide-y divide-border/30">
                                                    <div className="flex items-center justify-between gap-4 py-2 first:pt-0">
                                                        <p className="text-sm text-muted-foreground">
                                                            {isEn ? "Controller Manual" : "Controller-Handbuch"}
                                                        </p>
                                                        <DownloadButton
                                                            onClick={handleOpenDownload}
                                                            disabled={downloadOpening}
                                                            loading={downloadOpening}
                                                            label={isEn ? "Download" : "Herunterladen"}
                                                        />
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <Accordion type="single" defaultValue="layer-image-quality" collapsible className={accordionPanel}>
                                    <AccordionItem value="layer-image-quality" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {isEn ? "Layer & Image Quality" : "Layer & Bildqualität"}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={isEn ? "Maximum layers" : "Maximale Layer"}
                                                    value={controller.maximumLayers}
                                                />
                                                <SpecRow
                                                    label={isEn ? "Layer scaling" : "Layer-Skalierung"}
                                                    value={controller.layerScaling}
                                                />
                                                <SpecRow
                                                    label={isEn ? "HDR support" : "HDR-Unterstützung"}
                                                    value={controller.hdrSupport}
                                                />
                                                <SpecRow
                                                    label={isEn ? "Color depth (bit)" : "Farbtiefe (Bit)"}
                                                    value={controller.colorDepthBit}
                                                />
                                                <SpecRow
                                                    label={isEn ? "Low latency" : "Niedrige Latenz"}
                                                    value={controller.lowLatency}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Accordion type="single" defaultValue="system-features" collapsible className={accordionPanel}>
                                    <AccordionItem value="system-features" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {isEn ? "System & Special Features" : "System & Sonderfunktionen"}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={isEn ? "Fibre converter mode" : "Glasfaser-Konverter-Modus"}
                                                    value={controller.fibreConverterMode}
                                                />
                                                <SpecRow label="V-Can Support" value={controller.vCanSupport} />
                                                <SpecRow
                                                    label={isEn ? "Backup mode" : "Backup-Modus"}
                                                    value={controller.backupMode}
                                                />
                                                <SpecRow label="Genlock Sync" value={controller.genlockSync} />
                                                <SpecRow
                                                    label={isEn ? "Multi-Viewer (MVR)" : "Multi-Viewer (MVR)"}
                                                    value={controller.multiViewerMvr}
                                                />
                                                <SpecRow
                                                    label={isEn ? "USB playback" : "USB-Wiedergabe"}
                                                    value={controller.usbPlayback}
                                                />
                                                <SpecRow
                                                    label={isEn ? "3D support" : "3D-Unterstützung"}
                                                    value={controller.support3d}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Accordion type="single" defaultValue="loop-ports" collapsible className={accordionPanel}>
                                    <AccordionItem value="loop-ports" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {isEn ? "Loop Ports" : "Loop-Ports"}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow label="HDMI 2.0 LOOP" value={controller.hdmi20Loop} />
                                                <SpecRow label="12G-SDI LOOP" value={controller.sdi12gLoop} />
                                                <SpecRow label="3G-SDI LOOP" value={controller.sdi3gLoop} />
                                                <SpecRow label="DVI LOOP" value={controller.dviLoop} />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Accordion type="single" defaultValue="output-ports" collapsible className={accordionPanel}>
                                    <AccordionItem value="output-ports" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {isEn ? "Output Ports" : "Ausgangsports"}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={isEn ? "Gigabit Ethernet (RJ45)" : "Gigabit Ethernet (RJ45)"}
                                                    value={controller.gigabitEthernetRj45}
                                                />
                                                <SpecRow
                                                    label={isEn ? "10G Optical Fiber (Out)" : "10G Glasfaser (Out)"}
                                                    value={controller.opticalFiberOut10g}
                                                />
                                                <SpecRow
                                                    label={isEn ? "5G output port" : "5G-Ausgangsport"}
                                                    value={controller.output5g}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

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
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function ControllerDetailPage() {
    const params = useParams();
    const locale = useLocale();
    const t = useTranslations("Controllers.detail");
    const tList = useTranslations("Controllers.list");
    const tCommon = useTranslations("Common");
    const router = useRouter();
    const { isAuthenticated, isUser } = useAuth();
    const { cartItems, addControllerToProduct, getControllerForProduct } = useCart();
    const [controller, setController] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectProductModalOpen, setSelectProductModalOpen] = useState(false);
    const [downloadOpening, setDownloadOpening] = useState(false);

    const na = t("specs.notAvailable");

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
            value !== null && value !== undefined && value !== "" ? String(value) : na;
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
                    <span>{t("opening")}</span>
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
                    <span className="text-sm">{t("loading")}</span>
                </div>
            </div>
        );
    }

    if (!controller) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
                <p className="text-base text-muted-foreground">{t("notFound")}</p>
                <Button variant="outline" size="default" onClick={() => router.push("/controllers")}>
                    {t("backToList")}
                </Button>
            </div>
        );
    }

    const selectedImage = controller.images?.[selectedImageIndex] || controller.images?.[0] || null;
    const title = controller.interfaceName || t("titleFallback");
    const hasMainOrAlternative = cartItems.length > 0;
    const brandLabel = controller.brandDisplay || controller.brandName || na;

    const handleAddToCart = () => {
        if (!hasMainOrAlternative) {
            toast.error(t("addProductFirst"));
            router.push("/products");
            return;
        }
        const availableProducts = cartItems.filter((item) => !getControllerForProduct(item.id));
        if (availableProducts.length === 0) {
            toast.error(t("bothHaveController"));
            return;
        }
        if (availableProducts.length === 1) {
            const controllerForCart = {
                id: controller.id,
                productName: controller.interfaceName,
                interfaceName: controller.interfaceName,
                brandName: controller.brandName,
                brandDisplay: controller.brandDisplay || controller.brandName || na,
                sourceType: "controller",
            };
            addControllerToProduct(controllerForCart, availableProducts[0].id);
            toast.success(
                t("addedForProduct", { productName: availableProducts[0].productName })
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
            brandDisplay: controller.brandDisplay || controller.brandName || na,
            sourceType: "controller",
        };
        addControllerToProduct(controllerForCart, product.id);
        setSelectProductModalOpen(false);
        toast.success(t("addedForProduct", { productName: product.productName }));
        router.push("/user/cart");
    };

    const handleOpenDownload = () => {
        const url = controller?.downloadUrl ? String(controller.downloadUrl).trim() : "";
        if (!url) {
            toast.error(t("noDownloadLink"));
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
                    { label: tCommon("home"), href: "/" },
                    { label: tList("breadcrumb"), href: "/controllers" },
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
                                        <span className="text-sm">{t("noImage")}</span>
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
                                            {t("downloads")}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {t("manualSubtitle")}
                                        </p>
                                    </div>
                                    <DownloadButton
                                        onClick={handleOpenDownload}
                                        disabled={downloadOpening}
                                        loading={downloadOpening}
                                        label={t("openManual")}
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
                                        {t("addToCart")}
                                    </Button>
                                </div>
                            )}
                            </div>



                            <Dialog open={selectProductModalOpen} onOpenChange={setSelectProductModalOpen}>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className=" text-lg">
                                            {t("selectProduct")}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm leading-relaxed">
                                            {t("selectProductDescription")}
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
                                                                ? t("mainProduct")
                                                                : t("alternativeProduct")}
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
                            <div className="space-y-4">
                                <Accordion type="single" defaultValue="basic-info" collapsible className={accordionPanel}>
                                    <AccordionItem value="basic-info" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {t("sections.basicInformation")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={t("specs.interfaceName")}
                                                    value={controller.interfaceName}
                                                />
                                                <SpecRow label={t("specs.brand")} value={brandLabel} />
                                                <SpecRow
                                                    label={t("specs.maxPixelCapacity")}
                                                    value={
                                                        controller.pixelCapacity != null
                                                            ? controller.pixelCapacity.toLocaleString(locale)
                                                            : null
                                                    }
                                                />
                                                <SpecRow
                                                    label={t("specs.maxWidthHeight")}
                                                    value={
                                                        controller.maxWidthHeight != null
                                                            ? controller.maxWidthHeight.toLocaleString(locale)
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
                                            {t("sections.inputPorts")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow label="DP 1.2" value={controller.dp12} />
                                                <SpecRow label="HDMI 2.0" value={controller.hdmi20} />
                                                <SpecRow label="HDMI 1.3" value={controller.hdmi13} />
                                                <SpecRow
                                                    label={t("specs.dviSingleLink")}
                                                    value={controller.dviSingleLink}
                                                />
                                                <SpecRow label="12G-SDI" value={controller.sdi12g} />
                                                <SpecRow label="3G-SDI" value={controller.sdi3g} />
                                                <SpecRow
                                                    label={t("specs.opticalFiberIn10g")}
                                                    value={controller.opticalFiberIn10g}
                                                />
                                                <SpecRow
                                                    label={t("specs.usb30MediaPlayback")}
                                                    value={controller.usb30MediaPlayback}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Accordion type="single" defaultValue="monitoring-ports" collapsible className={accordionPanel}>
                                    <AccordionItem value="monitoring-ports" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {t("sections.monitoringPorts")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={t("specs.hdmi13Monitoring")}
                                                    value={controller.hdmi13Monitoring}
                                                />
                                                <SpecRow
                                                    label={t("specs.connector3dMiniDin4")}
                                                    value={controller.connector3dMiniDin4}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Accordion type="single" defaultValue="audio-control-ports" collapsible className={accordionPanel}>
                                    <AccordionItem value="audio-control-ports" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {t("sections.audioControlPorts")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={t("specs.audioInput35mm")}
                                                    value={controller.audioInput35mm}
                                                />
                                                <SpecRow
                                                    label={t("specs.audioOutput35mm")}
                                                    value={controller.audioOutput35mm}
                                                />
                                                <SpecRow
                                                    label={t("specs.ethernetControlPort")}
                                                    value={controller.ethernetControlPort}
                                                />
                                                <SpecRow
                                                    label={t("specs.usbTypeBPcControl")}
                                                    value={controller.usbTypeBPcControl}
                                                />
                                                <SpecRow
                                                    label={t("specs.usbTypeACascading")}
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
                                                {t("sections.downloads")}
                                            </AccordionTrigger>
                                            <AccordionContent className={accordionContentClass}>
                                                <div className="space-y-3 divide-y divide-border/30">
                                                    <div className="flex items-center justify-between gap-4 py-2 first:pt-0">
                                                        <p className="text-sm text-muted-foreground">
                                                            {t("controllerManual")}
                                                        </p>
                                                        <DownloadButton
                                                            onClick={handleOpenDownload}
                                                            disabled={downloadOpening}
                                                            loading={downloadOpening}
                                                            label={t("download")}
                                                        />
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Accordion type="single" defaultValue="layer-image-quality" collapsible className={accordionPanel}>
                                    <AccordionItem value="layer-image-quality" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {t("sections.layerImageQuality")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={t("specs.maximumLayers")}
                                                    value={controller.maximumLayers}
                                                />
                                                <SpecRow
                                                    label={t("specs.layerScaling")}
                                                    value={controller.layerScaling}
                                                />
                                                <SpecRow
                                                    label={t("specs.hdrSupport")}
                                                    value={controller.hdrSupport}
                                                />
                                                <SpecRow
                                                    label={t("specs.colorDepthBit")}
                                                    value={controller.colorDepthBit}
                                                />
                                                <SpecRow
                                                    label={t("specs.lowLatency")}
                                                    value={controller.lowLatency}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Accordion type="single" defaultValue="system-features" collapsible className={accordionPanel}>
                                    <AccordionItem value="system-features" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {t("sections.systemSpecialFeatures")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={t("specs.fibreConverterMode")}
                                                    value={controller.fibreConverterMode}
                                                />
                                                <SpecRow label="V-Can Support" value={controller.vCanSupport} />
                                                <SpecRow
                                                    label={t("specs.backupMode")}
                                                    value={controller.backupMode}
                                                />
                                                <SpecRow label="Genlock Sync" value={controller.genlockSync} />
                                                <SpecRow
                                                    label={t("specs.multiViewerMvr")}
                                                    value={controller.multiViewerMvr}
                                                />
                                                <SpecRow
                                                    label={t("specs.usbPlayback")}
                                                    value={controller.usbPlayback}
                                                />
                                                <SpecRow
                                                    label={t("specs.support3d")}
                                                    value={controller.support3d}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Accordion type="single" defaultValue="loop-ports" collapsible className={accordionPanel}>
                                    <AccordionItem value="loop-ports" className="border-0">
                                        <AccordionTrigger className={accordionTriggerClass}>
                                            {t("sections.loopPorts")}
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
                                            {t("sections.outputPorts")}
                                        </AccordionTrigger>
                                        <AccordionContent className={accordionContentClass}>
                                            <div>
                                                <SpecRow
                                                    label={t("specs.gigabitEthernetRj45")}
                                                    value={controller.gigabitEthernetRj45}
                                                />
                                                <SpecRow
                                                    label={t("specs.opticalFiberOut10g")}
                                                    value={controller.opticalFiberOut10g}
                                                />
                                                <SpecRow
                                                    label={t("specs.output5g")}
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

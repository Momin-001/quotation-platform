"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const yesNoOptions = ["Yes", "No"];

const defaultFormData = {
    productName: "",
    productNumber: "",
    brandName: "",
    interfaceName: "",
    pixelCapacity: "",
    maxWidthHeight: "",
    dp12: "0",
    hdmi20: "0",
    hdmi13: "0",
    dviSingleLink: "0",
    sdi12g: "0",
    sdi3g: "0",
    opticalFiberIn10g: "0",
    usb30MediaPlayback: "0",
    gigabitEthernetRj45: "0",
    opticalFiberOut10g: "0",
    output5g: "",
    hdmi13Monitoring: "0",
    connector3dMiniDin4: "0",
    hdmi20Loop: "0",
    sdi12gLoop: "0",
    sdi3gLoop: "0",
    dviLoop: "0",
    audioInput35mm: "0",
    audioOutput35mm: "0",
    ethernetControlPort: "0",
    usbTypeBPcControl: "0",
    usbTypeACascading: "0",
    genlockInLoop: "0",
    rs232: "0",
    maximumLayers: "",
    layerScaling: "",
    hdrSupport: "",
    colorDepthBit: "",
    lowLatency: "",
    fibreConverterMode: "",
    vCanSupport: "",
    backupMode: "",
    genlockSync: "",
    multiViewerMvr: "",
    usbPlayback: "",
    support3d: "",
    purchasePrice: "",
    retailPrice: "",
};

export default function ControllerForm({ mode = "add", initialData = null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState(() => {
        if (initialData) {
            return {
                productName: initialData.productName || "",
                productNumber: initialData.productNumber || "",
                brandName: initialData.brandName || "",
                interfaceName: initialData.interfaceName || "",
                pixelCapacity: initialData.pixelCapacity?.toString() || "",
                maxWidthHeight: initialData.maxWidthHeight?.toString() || "",
                dp12: initialData.dp12?.toString() || "0",
                hdmi20: initialData.hdmi20?.toString() || "0",
                hdmi13: initialData.hdmi13?.toString() || "0",
                dviSingleLink: initialData.dviSingleLink?.toString() || "0",
                sdi12g: initialData.sdi12g?.toString() || "0",
                sdi3g: initialData.sdi3g?.toString() || "0",
                opticalFiberIn10g: initialData.opticalFiberIn10g?.toString() || "0",
                usb30MediaPlayback: initialData.usb30MediaPlayback?.toString() || "0",
                gigabitEthernetRj45: initialData.gigabitEthernetRj45?.toString() || "0",
                opticalFiberOut10g: initialData.opticalFiberOut10g?.toString() || "0",
                output5g: initialData.output5g || "",
                hdmi13Monitoring: initialData.hdmi13Monitoring?.toString() || "0",
                connector3dMiniDin4: initialData.connector3dMiniDin4?.toString() || "0",
                hdmi20Loop: initialData.hdmi20Loop?.toString() || "0",
                sdi12gLoop: initialData.sdi12gLoop?.toString() || "0",
                sdi3gLoop: initialData.sdi3gLoop?.toString() || "0",
                dviLoop: initialData.dviLoop?.toString() || "0",
                audioInput35mm: initialData.audioInput35mm?.toString() || "0",
                audioOutput35mm: initialData.audioOutput35mm?.toString() || "0",
                ethernetControlPort: initialData.ethernetControlPort?.toString() || "0",
                usbTypeBPcControl: initialData.usbTypeBPcControl?.toString() || "0",
                usbTypeACascading: initialData.usbTypeACascading?.toString() || "0",
                genlockInLoop: initialData.genlockInLoop?.toString() || "0",
                rs232: initialData.rs232?.toString() || "0",
                maximumLayers: initialData.maximumLayers || "",
                layerScaling: initialData.layerScaling || "",
                hdrSupport: initialData.hdrSupport || "",
                colorDepthBit: initialData.colorDepthBit?.toString() || "",
                lowLatency: initialData.lowLatency || "",
                fibreConverterMode: initialData.fibreConverterMode || "",
                vCanSupport: initialData.vCanSupport || "",
                backupMode: initialData.backupMode || "",
                genlockSync: initialData.genlockSync || "",
                multiViewerMvr: initialData.multiViewerMvr || "",
                usbPlayback: initialData.usbPlayback || "",
                support3d: initialData.support3d || "",
                purchasePrice: initialData.purchasePrice?.toString() || "",
                retailPrice: initialData.retailPrice?.toString() || "",
            };
        }
        return { ...defaultFormData };
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = mode === "edit"
                ? `/api/admin/controllers/${initialData.id}`
                : "/api/admin/controllers";
            const method = mode === "edit" ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to save controller");
            }

            toast.success(response.message || `Controller ${mode === "edit" ? "updated" : "created"} successfully`);
            router.push("/admin/products");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, field, type = "text", props = {}) => (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input
                type={type}
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                {...props}
            />
        </div>
    );

    const renderSelect = (label, field, options) => (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Select value={formData[field]} onValueChange={(val) => handleChange(field, val)}>
                <SelectTrigger>
                    <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {renderInput("Product Name *", "productName", "text", { required: true })}
                    {renderInput("Product Number *", "productNumber", "text", {
                        required: true,
                        disabled: mode === "edit",
                    })}
                    {renderInput("Brand Name", "brandName")}
                    {renderInput("Interface Name", "interfaceName")}
                    {renderInput("Max. Pixel Capacity", "pixelCapacity", "number")}
                    {renderInput("Max. Width/Height (px)", "maxWidthHeight", "number")}
                </div>
            </div>

            {/* Input Ports */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Input Ports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    {renderInput("DP 1.2", "dp12", "number", { min: 0 })}
                    {renderInput("HDMI 2.0", "hdmi20", "number", { min: 0 })}
                    {renderInput("HDMI 1.3", "hdmi13", "number", { min: 0 })}
                    {renderInput("DVI (Single-Link)", "dviSingleLink", "number", { min: 0 })}
                    {renderInput("12G-SDI", "sdi12g", "number", { min: 0 })}
                    {renderInput("3G-SDI", "sdi3g", "number", { min: 0 })}
                    {renderInput("10G Optical Fiber (In)", "opticalFiberIn10g", "number", { min: 0 })}
                    {renderInput("USB 3.0 (Media Playback)", "usb30MediaPlayback", "number", { min: 0 })}
                </div>
            </div>

            {/* Output Ports */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Output Ports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderInput("Gigabit Ethernet (RJ45)", "gigabitEthernetRj45", "number", { min: 0 })}
                    {renderInput("10G Optical Fiber (Out)", "opticalFiberOut10g", "number", { min: 0 })}
                    {renderSelect("5G Output Port", "output5g", yesNoOptions)}
                </div>
            </div>

            {/* Monitoring Ports */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Monitoring Ports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderInput("HDMI 1.3 (Monitoring)", "hdmi13Monitoring", "number", { min: 0 })}
                    {renderInput("3D Connector (Mini DIN 4)", "connector3dMiniDin4", "number", { min: 0 })}
                </div>
            </div>

            {/* Loop Ports */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Loop Ports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderInput("HDMI 2.0 LOOP", "hdmi20Loop", "number", { min: 0 })}
                    {renderInput("12G-SDI LOOP", "sdi12gLoop", "number", { min: 0 })}
                    {renderInput("3G-SDI LOOP", "sdi3gLoop", "number", { min: 0 })}
                    {renderInput("DVI LOOP", "dviLoop", "number", { min: 0 })}
                </div>
            </div>

            {/* Audio & Control Ports */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Audio & Control Ports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderInput("3.5mm Audio Input", "audioInput35mm", "number", { min: 0 })}
                    {renderInput("3.5mm Audio Output", "audioOutput35mm", "number", { min: 0 })}
                    {renderInput("Ethernet Control Port", "ethernetControlPort", "number", { min: 0 })}
                    {renderInput("USB Type-B (PC Control)", "usbTypeBPcControl", "number", { min: 0 })}
                    {renderInput("USB Type-A (Cascading)", "usbTypeACascading", "number", { min: 0 })}
                    {renderInput("Genlock IN & LOOP", "genlockInLoop", "number", { min: 0 })}
                    {renderInput("RS-232", "rs232", "number", { min: 0 })}
                </div>
            </div>

            {/* Features */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderInput("Maximum Layers", "maximumLayers")}
                    {renderSelect("Layer Scaling", "layerScaling", yesNoOptions)}
                    {renderInput("HDR Support", "hdrSupport", "text", { placeholder: "e.g. HDR10 / HLG" })}
                    {renderInput("Color Depth (bit)", "colorDepthBit", "number")}
                    {renderSelect("Low Latency", "lowLatency", yesNoOptions)}
                    {renderSelect("Fibre Converter Mode", "fibreConverterMode", yesNoOptions)}
                    {renderSelect("V-Can Support", "vCanSupport", yesNoOptions)}
                    {renderInput("Backup Mode", "backupMode", "text", { placeholder: "e.g. Device & Port" })}
                    {renderSelect("Genlock Sync", "genlockSync", yesNoOptions)}
                    {renderSelect("Multi-Viewer (MVR)", "multiViewerMvr", yesNoOptions)}
                    {renderSelect("USB Playback", "usbPlayback", yesNoOptions)}
                    {renderSelect("3D Support", "support3d", yesNoOptions)}
                </div>
            </div>

            {/* Pricing */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("Purchase Price (€)", "purchasePrice", "number", { min: 0, step: "0.01" })}
                    {renderInput("Retail Price (€)", "retailPrice", "number", { min: 0, step: "0.01" })}
                </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
                <Button type="submit" disabled={loading} size="lg">
                    {loading && <Spinner className="h-4 w-4 mr-2" />}
                    {mode === "edit" ? "Update Controller" : "Add Controller"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/admin/products")}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}

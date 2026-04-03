"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const yesNoOptions = ["Yes", "No"];

const controllerSchema = z.object({
    brandName: z.string().optional(),
    brandNameOther: z.string().optional(),
    interfaceName: z.string().optional(),
    interfaceDescription: z.string().optional(),
    controllerNumber: z.string().optional(),
    pixelCapacity: z.union([z.string(), z.number()]).optional(),
    maxWidthHeight: z.union([z.string(), z.number()]).optional(),
    dp12: z.union([z.string(), z.number()]).optional(),
    hdmi20: z.union([z.string(), z.number()]).optional(),
    hdmi13: z.union([z.string(), z.number()]).optional(),
    dviSingleLink: z.union([z.string(), z.number()]).optional(),
    sdi12g: z.union([z.string(), z.number()]).optional(),
    sdi3g: z.union([z.string(), z.number()]).optional(),
    opticalFiberIn10g: z.union([z.string(), z.number()]).optional(),
    usb30MediaPlayback: z.union([z.string(), z.number()]).optional(),
    gigabitEthernetRj45: z.union([z.string(), z.number()]).optional(),
    opticalFiberOut10g: z.union([z.string(), z.number()]).optional(),
    output5g: z.string().optional(),
    hdmi13Monitoring: z.union([z.string(), z.number()]).optional(),
    connector3dMiniDin4: z.union([z.string(), z.number()]).optional(),
    hdmi20Loop: z.union([z.string(), z.number()]).optional(),
    sdi12gLoop: z.union([z.string(), z.number()]).optional(),
    sdi3gLoop: z.union([z.string(), z.number()]).optional(),
    dviLoop: z.union([z.string(), z.number()]).optional(),
    audioInput35mm: z.union([z.string(), z.number()]).optional(),
    audioOutput35mm: z.union([z.string(), z.number()]).optional(),
    ethernetControlPort: z.union([z.string(), z.number()]).optional(),
    usbTypeBPcControl: z.union([z.string(), z.number()]).optional(),
    usbTypeACascading: z.union([z.string(), z.number()]).optional(),
    genlockInLoop: z.union([z.string(), z.number()]).optional(),
    rs232: z.union([z.string(), z.number()]).optional(),
    maximumLayers: z.string().optional(),
    layerScaling: z.string().optional(),
    hdrSupport: z.string().optional(),
    colorDepthBit: z.union([z.string(), z.number()]).optional(),
    lowLatency: z.string().optional(),
    fibreConverterMode: z.string().optional(),
    vCanSupport: z.string().optional(),
    backupMode: z.string().optional(),
    genlockSync: z.string().optional(),
    multiViewerMvr: z.string().optional(),
    usbPlayback: z.string().optional(),
    support3d: z.string().optional(),
    downloadUrl: z.string().optional(),
    pricePerControllerUsd: z.union([z.string(), z.number()]).optional(),
    stockPieces: z.union([z.string(), z.number()]).optional(),
    leadtimeDays: z.union([z.string(), z.number()]).optional(),
});

const defaultValues = {
    brandName: "",
    brandNameOther: "",
    interfaceName: "",
    interfaceDescription: "",
    controllerNumber: "",
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
};

export default function ControllerForm({ mode = "add", initialData = null, initialImages = [] }) {
    const router = useRouter();
    const isEdit = mode === "edit";

    const [controllerImages, setControllerImages] = useState([]);
    const [existingImages, setExistingImages] = useState(initialImages);
    const [removedImageIds, setRemovedImageIds] = useState([]);

    const formDefaultValues = initialData ? {
        interfaceName: initialData.interfaceName || "",
        brandName: initialData.brandName || "",
        brandNameOther: initialData.brandNameOther || "",
        interfaceDescription: initialData.interfaceDescription || "",
        controllerNumber: initialData.controllerNumber || "",
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
        downloadUrl: initialData.downloadUrl || "",
        pricePerControllerUsd: initialData.pricePerControllerUsd?.toString() || "",
        stockPieces: initialData.stockPieces?.toString() || "",
        leadtimeDays: initialData.leadtimeDays?.toString() || "",
    } : defaultValues;

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(controllerSchema),
        defaultValues: formDefaultValues,
    });

    const brandName = watch("brandName");

    const onSubmit = async (data) => {
        try {
            const url = isEdit
                ? `/api/admin/controllers/${initialData.id}`
                : "/api/admin/controllers";
            const method = isEdit ? "PUT" : "POST";

            const formData = new FormData();
            formData.append("fields", JSON.stringify({
                ...data,
                removedImageIds,
            }));

            controllerImages.forEach((file) => {
                formData.append("images", file);
            });

            const res = await fetch(url, { method, body: formData });
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to save controller");
            }

            toast.success(response.message || `Controller ${isEdit ? "updated" : "created"} successfully`);
            router.push("/admin/products");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        setControllerImages((prev) => [...prev, ...files]);
    };

    const removeNewImage = (index) => {
        setControllerImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId) => {
        setRemovedImageIds((prev) => [...prev, imageId]);
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    };

    const renderInput = (label, field, type = "text", props = {}) => (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input
                type={type}
                {...register(field)}
                className={errors[field] ? "border-red-500" : ""}
                {...props}
            />
            {errors[field] && (
                <p className="text-sm text-red-500">{errors[field].message}</p>
            )}
        </div>
    );

    const renderSelect = (label, field, options) => (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Controller
                name={field}
                control={control}
                render={({ field: controllerField }) => (
                    <Select
                        value={controllerField.value}
                        onValueChange={controllerField.onChange}
                    >
                        <SelectTrigger className={errors[field] ? "border-red-500" : ""}>
                            <SelectValue placeholder={`Select ${label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {renderInput("Interface Name", "interfaceName", "text", { placeholder: "e.g. VX2000 Pro Max" })}
                    {renderSelect("Brand Name", "brandName", ["Colorlight", "Novastar", "Brompton", "LINSN", "Other"])}
                    {brandName === "Other" && renderInput("Brand Name Other", "brandNameOther", "text", { placeholder: "Enter brand name" })}
                    {renderInput("Interface Description", "interfaceDescription", "text", { placeholder: "Enter interface description" })}
                    {renderInput("Controller Number", "controllerNumber", "text", { placeholder: "e.g. 1234567890" })}
                    {renderInput("Max. Pixel Capacity", "pixelCapacity", "number", { placeholder: "e.g. 13000000" })}
                    {renderInput("Max. Width/Height (px)", "maxWidthHeight", "number", { placeholder: "e.g. 10240" })}
                </div>
            </div>

            {/* Input Ports */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Input Ports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    {renderInput("DP 1.2", "dp12", "number", { min: 0, placeholder: "0" })}
                    {renderInput("HDMI 2.0", "hdmi20", "number", { min: 0, placeholder: "0" })}
                    {renderInput("HDMI 1.3", "hdmi13", "number", { min: 0, placeholder: "0" })}
                    {renderInput("DVI (Single-Link)", "dviSingleLink", "number", { min: 0, placeholder: "0" })}
                    {renderInput("12G-SDI", "sdi12g", "number", { min: 0, placeholder: "0" })}
                    {renderInput("3G-SDI", "sdi3g", "number", { min: 0, placeholder: "0" })}
                    {renderInput("10G Optical Fiber (In)", "opticalFiberIn10g", "number", { min: 0, placeholder: "0" })}
                    {renderInput("USB 3.0 (Media Playback)", "usb30MediaPlayback", "number", { min: 0, placeholder: "0" })}
                </div>
            </div>

            {/* Output Ports */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Output Ports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderInput("Gigabit Ethernet (RJ45)", "gigabitEthernetRj45", "number", { min: 0, placeholder: "0" })}
                    {renderInput("10G Optical Fiber (Out)", "opticalFiberOut10g", "number", { min: 0, placeholder: "0" })}
                    {renderSelect("5G Output Port", "output5g", yesNoOptions)}
                </div>
            </div>

            {/* Monitoring Ports */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Monitoring Ports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderInput("HDMI 1.3 (Monitoring)", "hdmi13Monitoring", "number", { min: 0, placeholder: "0" })}
                    {renderInput("3D Connector (Mini DIN 4)", "connector3dMiniDin4", "number", { min: 0, placeholder: "0" })}
                </div>
            </div>

            {/* Loop Ports */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Loop Ports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderInput("HDMI 2.0 LOOP", "hdmi20Loop", "number", { min: 0, placeholder: "0" })}
                    {renderInput("12G-SDI LOOP", "sdi12gLoop", "number", { min: 0, placeholder: "0" })}
                    {renderInput("3G-SDI LOOP", "sdi3gLoop", "number", { min: 0, placeholder: "0" })}
                    {renderInput("DVI LOOP", "dviLoop", "number", { min: 0, placeholder: "0" })}
                </div>
            </div>

            {/* Audio & Control Ports */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Audio & Control Ports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderInput("3.5mm Audio Input", "audioInput35mm", "number", { min: 0, placeholder: "0" })}
                    {renderInput("3.5mm Audio Output", "audioOutput35mm", "number", { min: 0, placeholder: "0" })}
                    {renderInput("Ethernet Control Port", "ethernetControlPort", "number", { min: 0, placeholder: "0" })}
                    {renderInput("USB Type-B (PC Control)", "usbTypeBPcControl", "number", { min: 0, placeholder: "0" })}
                    {renderInput("USB Type-A (Cascading)", "usbTypeACascading", "number", { min: 0, placeholder: "0" })}
                    {renderInput("Genlock IN & LOOP", "genlockInLoop", "number", { min: 0, placeholder: "0" })}
                    {renderInput("RS-232", "rs232", "number", { min: 0, placeholder: "0" })}
                </div>
            </div>

            {/* Features */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderInput("Maximum Layers", "maximumLayers", "text", { placeholder: "e.g. 4 (4K×2K)" })}
                    {renderSelect("Layer Scaling", "layerScaling", yesNoOptions)}
                    {renderInput("HDR Support", "hdrSupport", "text", { placeholder: "e.g. HDR10 / HLG" })}
                    {renderInput("Color Depth (bit)", "colorDepthBit", "number", { placeholder: "e.g. 12" })}
                    {renderSelect("Low Latency", "lowLatency", yesNoOptions)}
                    {renderSelect("Fibre Converter Mode", "fibreConverterMode", yesNoOptions)}
                    {renderSelect("V-Can Support", "vCanSupport", yesNoOptions)}
                    {renderInput("Backup Mode", "backupMode", "text", { placeholder: "e.g. Device & Port" })}
                    {renderSelect("Genlock Sync", "genlockSync", yesNoOptions)}
                    {renderSelect("Multi-Viewer (MVR)", "multiViewerMvr", yesNoOptions)}
                    {renderSelect("USB Playback", "usbPlayback", yesNoOptions)}
                    {renderSelect("3D Support", "support3d", yesNoOptions)}
                    {renderInput("Download URL", "downloadUrl", "text", { placeholder: "e.g. https://www.example.com/controller.pdf" })}
                    {renderInput("Price Per Controller (USD)", "pricePerControllerUsd", "number", { step: "0.01", placeholder: "e.g. 1000.00" })}
                    {renderInput("Stock Pieces", "stockPieces", "number", { step: "1", placeholder: "e.g. 10" })}
                    {renderInput("Leadtime (days)", "leadtimeDays", "number", { step: "1", placeholder: "e.g. 14" })}
                </div>
            </div>

            {/* Controller Images */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Controller Images</h3>
                <div className="space-y-2">
                    <Label>Images</Label>
                    <div className="flex flex-wrap gap-4">
                        {existingImages.map((img) => (
                            <div key={img.id} className="relative">
                                <Image
                                    src={img.imageUrl}
                                    alt="Controller image"
                                    width={100}
                                    height={100}
                                    className="rounded-lg object-cover border w-[100px] h-[100px]"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                                    onClick={() => removeExistingImage(img.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {controllerImages.map((file, index) => (
                            <div key={`new-${index}`} className="relative">
                                <Image
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index + 1}`}
                                    width={100}
                                    height={100}
                                    className="rounded-lg object-cover border w-[100px] h-[100px]"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                                    onClick={() => removeNewImage(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="cursor-pointer"
                    />
                </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
                <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting && <Spinner className="h-4 w-4 mr-2" />}
                    {isEdit ? "Update Controller" : "Add Controller"}
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

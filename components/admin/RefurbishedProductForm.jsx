"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { slugify } from "@/lib/helpers/slugify";

// Dropdown option lists (refurbished-specific)
const PRODUCT_TYPES = ["Complete System", "LED Display Single Cabinet"];
const DESIGNS = ["Mobil", "Fix"];
const SPECIAL_TYPES = ["Standard", "Transparent", "Curved", "Floor", "LED pendant"];
const LED_TECHNOLOGIES = ["SMD", "SMD+GOB", "IMD", "COB", "DIP", "LOB", "MIP", "Other"];
const CHIP_BONDINGS = ["Gold Wire", "Copper Wire", "Flip-Chip"];
const CONTROL_SYSTEMS = ["Colorlight", "Novastar", "Brompton", "LINSN", "Other"];
const SERVICES = ["Frontside and Backside", "Frontside", "Backside"];
const YES_NO = ["Yes", "No"];
const QUALITY_LEVELS = ["Okay", "Good", "Excellent"];

// All editable fields are strings in the form; the API maps them to typed columns.
const FIELD_KEYS = [
    "serie", "productNumber", "productDescription", "oemBrand",
    "productType", "areaOfUseId", "design", "specialTypes",
    "yearOfConstruction", "operatingHours", "levelOfQuality",
    "pixelPitch", "cabinetWidth", "cabinetHeight", "cabinetResolutionHorizontal", "cabinetResolutionVertical", "weightWithoutPackaging",
    "ledTechnology", "ledTechnologyOther", "ledChipManufacturer", "chipBonding", "brightnessValue", "ledDriver",
    "inputVoltage", "powerConsumptionMax", "powerConsumptionTypical", "refreshRate", "scanRate",
    "controlSystem", "controlSystemOther", "controller",
    "ipRating", "service", "hangingBrackets", "stackingSystem", "flightCases", "accessories",
    "pricePerCabinetUsd", "pricePerMetreSquareUsd", "sellingPrice", "stockLocation", "stockPieces", "leadtimeDays", "notes",
    "metaTitleEn", "metaTitleDe", "metaDescriptionEn", "metaDescriptionDe",
];

function getDefaultValuesFromInitial(initialData) {
    const str = (v) => (v !== undefined && v !== null ? String(v) : "");
    const out = {};
    for (const key of FIELD_KEYS) out[key] = str(initialData?.[key]);
    return out;
}

// Only serie / productNumber / areaOfUseId are required; the API stores the rest as-is.
const refurbishedSchema = z
    .object({
        serie: z.string().min(1, "Serie is required"),
        productNumber: z.string().min(1, "Product number is required"),
        areaOfUseId: z.string().min(1, "Area of use is required"),
        ...Object.fromEntries(
            FIELD_KEYS.filter((k) => !["serie", "productNumber", "areaOfUseId"].includes(k)).map((k) => [k, z.string().optional()])
        ),
    })
    .refine((data) => !(data.ledTechnology === "Other" && !data.ledTechnologyOther?.trim()), {
        message: "Please specify LED technology",
        path: ["ledTechnologyOther"],
    })
    .refine((data) => !(data.controlSystem === "Other" && !data.controlSystemOther?.trim()), {
        message: "Please specify control system",
        path: ["controlSystemOther"],
    });

export default function RefurbishedProductForm({
    mode = "add",
    initialData = null,
    initialImages = [],
    initialFeatures = [],
}) {
    const router = useRouter();
    const isEdit = mode === "edit";
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const [productImages, setProductImages] = useState([]); // new File objects
    const [existingImages, setExistingImages] = useState(() =>
        [...(Array.isArray(initialImages) ? initialImages : [])].sort((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0))
    );
    const [removedImageIds, setRemovedImageIds] = useState([]);

    const [features, setFeatures] = useState(() =>
        (Array.isArray(initialFeatures) ? initialFeatures : []).map((f) => (typeof f === "string" ? f : f?.feature ?? f))
    );
    const [featureInput, setFeatureInput] = useState("");

    const defaultValues = useMemo(() => getDefaultValuesFromInitial(initialData), [initialData]);

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(refurbishedSchema),
        defaultValues,
    });

    useEffect(() => {
        if (!isEdit || !initialData) return;
        reset(getDefaultValuesFromInitial(initialData));
        setExistingImages([...(Array.isArray(initialImages) ? initialImages : [])].sort((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0)));
        setFeatures((Array.isArray(initialFeatures) ? initialFeatures : []).map((f) => (typeof f === "string" ? f : f?.feature ?? f)));
    }, [isEdit, initialData, initialImages, initialFeatures, reset]);

    const serie = watch("serie");
    const slugPreview = useMemo(() => slugify(serie), [serie]);
    const ledTechnology = watch("ledTechnology");
    const controlSystem = watch("controlSystem");

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/admin/categories");
                const response = await res.json();
                if (!response.success) throw new Error(response.message || "Failed to fetch categories");
                setCategories(response.data);
            } catch (error) {
                toast.error(error.message);
            }
        })();
    }, []);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append(
                "fields",
                JSON.stringify({
                    ...data,
                    features,
                    ...(isEdit ? { removedImageIds } : {}),
                })
            );
            productImages.forEach((file) => formData.append("images", file));

            const url = isEdit ? `/api/admin/refurbished-products/${initialData.id}` : "/api/admin/refurbished-products";
            const res = await fetch(url, { method: isEdit ? "PUT" : "POST", body: formData });
            const response = await res.json();
            if (!response.success) throw new Error(response.message || "Failed to save refurbished product");
            toast.success(response.message);
            router.push("/admin/refurbished-products");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddFeature = () => {
        const trimmed = featureInput.trim();
        if (trimmed) {
            setFeatures((prev) => [...prev, trimmed]);
            setFeatureInput("");
        }
    };

    const renderInput = (label, field, type = "text", props = {}) => (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Input id={field} type={type} {...register(field)} placeholder={`Enter ${label}`} {...props} />
            {errors[field] && <p className="text-sm text-red-500">{errors[field].message}</p>}
        </div>
    );

    const renderTextarea = (label, field, props = {}) => (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Textarea id={field} {...register(field)} placeholder={`Enter ${label}`} {...props} />
            {errors[field] && <p className="text-sm text-red-500">{errors[field].message}</p>}
        </div>
    );

    const renderSelect = (label, field, options) => (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Controller
                name={field}
                control={control}
                render={({ field: f }) => (
                    <Select onValueChange={f.onChange} value={f.value ?? ""}>
                        <SelectTrigger>
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
            {errors[field] && <p className="text-sm text-red-500">{errors[field].message}</p>}
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("Serie *", "serie", "text")}
                    {renderInput("Product Number *", "productNumber", "text", { disabled: isEdit })}
                    <div className="space-y-2">
                        <Label htmlFor="slugPreview">URL Slug</Label>
                        <Input id="slugPreview" value={slugPreview} placeholder="Auto-generated from serie" disabled readOnly />
                        <p className="text-xs text-muted-foreground">Generated from the serie and used for the product&apos;s URL.</p>
                    </div>
                    {renderTextarea("Product Description", "productDescription")}
                    {renderInput("OEM / Brand", "oemBrand", "text")}
                    {renderSelect("Product Type", "productType", PRODUCT_TYPES)}
                    <div className="space-y-2">
                        <Label htmlFor="areaOfUseId">Area of Use *</Label>
                        <Controller
                            name="areaOfUseId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select area of use" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.areaOfUseId && <p className="text-sm text-red-500">{errors.areaOfUseId.message}</p>}
                    </div>
                    {renderSelect("Design", "design", DESIGNS)}
                    {renderSelect("Special Types", "specialTypes", SPECIAL_TYPES)}
                    {renderInput("Year of Construction", "yearOfConstruction", "number", { step: "1", placeholder: "e.g., 2025" })}
                    {renderInput("Operating Hours", "operatingHours", "text", { placeholder: "e.g., 10000 / NA" })}
                    {renderSelect("Level of Quality", "levelOfQuality", QUALITY_LEVELS)}
                </div>
            </div>

            {/* Physical Specifications */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold">Physical Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("Pixel Pitch (mm)", "pixelPitch", "number", { step: "0.01", placeholder: "e.g., 6.60" })}
                    {renderInput("Cabinet Width (mm)", "cabinetWidth", "number", { step: "0.01", placeholder: "e.g., 1280" })}
                    {renderInput("Cabinet Height (mm)", "cabinetHeight", "number", { step: "0.01", placeholder: "e.g., 960" })}
                    {renderInput("Cabinet Resolution Horizontal (px)", "cabinetResolutionHorizontal", "number", { step: "1", placeholder: "e.g., 192" })}
                    {renderInput("Cabinet Resolution Vertical (px)", "cabinetResolutionVertical", "number", { step: "1", placeholder: "e.g., 144" })}
                    {renderInput("Weight Without Packaging (kg)", "weightWithoutPackaging", "number", { step: "0.01", placeholder: "e.g., 30.4" })}
                </div>
            </div>

            {/* LED Specifications */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold">LED Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderSelect("LED Technology", "ledTechnology", LED_TECHNOLOGIES)}
                    {ledTechnology === "Other" && renderInput("LED Technology (Other)", "ledTechnologyOther", "text")}
                    {renderInput("LED / CHIP Manufacturer and Type", "ledChipManufacturer", "text", { placeholder: "e.g., Nationstar FM-1921-RGBA" })}
                    {renderSelect("Chip-Bonding", "chipBonding", CHIP_BONDINGS)}
                    {renderInput("Brightness Value (nit)", "brightnessValue", "text", { placeholder: "e.g., 7,000" })}
                    {renderInput("LED Driver", "ledDriver", "text", { placeholder: "e.g., MBI5252" })}
                </div>
            </div>

            {/* Electrical & Performance */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold">Electrical & Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("Input Voltage Range", "inputVoltage", "text", { placeholder: "e.g., 100 bis ca. 240 V, 50/60 Hz" })}
                    {renderInput("Power Consumption Max (W/m²)", "powerConsumptionMax", "number", { step: "1", placeholder: "e.g., 800" })}
                    {renderInput("Power Consumption Typical (W/m²)", "powerConsumptionTypical", "number", { step: "1", placeholder: "e.g., 267" })}
                    {renderInput("Refresh Rate (Hz)", "refreshRate", "number", { step: "1", placeholder: "e.g., 3840" })}
                    {renderInput("Scan Rate", "scanRate", "text", { placeholder: "e.g., 1/2" })}
                </div>
            </div>

            {/* Control */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold">Control System</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderSelect("Control System", "controlSystem", CONTROL_SYSTEMS)}
                    {controlSystem === "Other" && renderInput("Control System (Other)", "controlSystemOther", "text")}
                    {renderInput("Controller", "controller", "text", { placeholder: "e.g., VX4s" })}
                </div>
            </div>

            {/* Service & Mounting */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold">Service & Mounting</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("IP Rating (Front/Back)", "ipRating", "text", { placeholder: "e.g., IP66/IP66" })}
                    {renderSelect("Service", "service", SERVICES)}
                    {renderSelect("Hanging-Brackets", "hangingBrackets", YES_NO)}
                    {renderSelect("Stacking System", "stackingSystem", YES_NO)}
                    {renderSelect("Flight Cases", "flightCases", YES_NO)}
                    {renderTextarea("Accessories", "accessories", { placeholder: "e.g., Power connection: Neutrik TRUE1 ..." })}
                </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold">Pricing & Stock</h2>
                <p className="text-sm text-muted-foreground">Price per cabinet and price per m² are for internal/admin use only. Selling price is shown to customers.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("Price Per Cabinet (USD) — admin only", "pricePerCabinetUsd", "number", { step: "0.01", placeholder: "e.g., 250" })}
                    {renderInput("Price Per m² (USD) — admin only", "pricePerMetreSquareUsd", "number", { step: "0.01", placeholder: "e.g., 1000" })}
                    {renderInput("Selling Price (USD)", "sellingPrice", "number", { step: "0.01", placeholder: "e.g., 1200" })}
                    {renderInput("Stock Location", "stockLocation", "text", { placeholder: "e.g., Frankfurt" })}
                    {renderInput("Stock (pieces)", "stockPieces", "number", { step: "1", placeholder: "e.g., 200" })}
                    {renderInput("Leadtime (days)", "leadtimeDays", "number", { step: "1", placeholder: "e.g., 20" })}
                    {renderTextarea("Notes — admin only", "notes", { placeholder: "Internal notes" })}
                </div>
            </div>

            {/* SEO */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold">SEO / Meta Tags</h2>
                <p className="text-sm text-muted-foreground">Optional. Falls back to the serie and description when left blank.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("Meta Title (DE)", "metaTitleDe", "text", { maxLength: 70 })}
                    {renderInput("Meta Title (EN)", "metaTitleEn", "text", { maxLength: 70 })}
                    {renderTextarea("Meta Description (DE)", "metaDescriptionDe", { maxLength: 200 })}
                    {renderTextarea("Meta Description (EN)", "metaDescriptionEn", { maxLength: 200 })}
                </div>
            </div>

            {/* Features */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold">Product Features</h2>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddFeature();
                            }
                        }}
                        placeholder="Enter a feature"
                        className="flex-1"
                    />
                    <Button type="button" onClick={handleAddFeature} size="lg" className="h-12">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                    </Button>
                </div>
                {features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 bg-secondary/10 px-3 py-2 rounded-md border">
                                <span className="text-sm">{feature}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => setFeatures((prev) => prev.filter((_, i) => i !== index))}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Media — images only */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold">Media</h2>
                <div className="space-y-2">
                    <Label>Upload Product Images</Label>
                    <div className="flex flex-wrap items-start gap-3">
                        {existingImages.map((img) => (
                            <div key={img.id} className="relative h-20 w-20 border rounded-lg overflow-hidden bg-white shadow-xs">
                                <Image src={img.imageUrl} alt="Product image" fill className="object-contain p-1" />
                                <button
                                    type="button"
                                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs hover:bg-red-600"
                                    onClick={() => {
                                        setRemovedImageIds((prev) => [...prev, img.id]);
                                        setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                        {productImages.map((file, index) => (
                            <div key={`new-${index}`} className="relative h-20 w-20 border rounded-lg overflow-hidden bg-white shadow-xs">
                                <Image src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} fill className="object-contain p-1" />
                                <button
                                    type="button"
                                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs hover:bg-red-600"
                                    onClick={() => setProductImages((prev) => prev.filter((_, i) => i !== index))}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                        <label className="flex items-center justify-center h-20 w-20 border rounded-lg cursor-pointer bg-white shadow-xs hover:bg-gray-50 transition-colors">
                            <span className="text-4xl text-gray-400">+</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setProductImages((prev) => [...prev, ...Array.from(e.target.files || [])])}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <Button type="submit" size="lg" disabled={submitting}>
                    {submitting ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Refurbished Product" : "Create Refurbished Product"}
                </Button>
                <Button type="button" size="lg" variant="outline" onClick={() => router.push("/admin/refurbished-products")}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

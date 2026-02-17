"use client";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

// Zod schema for product validation
const productSchema = z.object({
    // String fields (Point 1)
    productName: z.string().min(1, "Product name is required"),
    productNumber: z.string().min(1, "Product number is required"),
    viewingAngleHorizontal: z.string().optional(),
    viewingAngleVertical: z.string().optional(),
    brightnessControl: z.string().optional(),
    dciP3Coverage: z.string().optional(),
    operatingTemperature: z.string().optional(),
    operatingHumidity: z.string().optional(),
    ipRating: z.string().optional(),
    ledModulesPerCabinet: z.string().optional(),
    ledChipManufacturer: z.string().optional(),
    whitePointCalibration: z.string().optional(),
    brightnessValue: z.coerce.number().optional(),
    inputVoltage: z.string().optional(),
    receivingCard: z.string().optional(),
    heatDissipation: z.string().optional(),
    monitoringFunctionEn: z.string().optional(),
    monitoringFunctionDe: z.string().optional(),
    additionalCertification: z.string().optional(),
    emc: z.string().optional(),
    safety: z.string().optional(),
    supportDuringWarrantyEn: z.string().optional(),
    supportDuringWarrantyDe: z.string().optional(),
    supportAfterWarrantyEn: z.string().optional(),
    supportAfterWarrantyDe: z.string().optional(),
    
    // Dropdown fields (ENUMs - Point 2)
    productType: z.enum(["AIO Systems", "LED Display Single Cabinet"], {
        required_error: "Product type is required",
    }),
    design: z.enum(["Fix", "Mobil"], {
        required_error: "Design is required",
    }),
    specialTypes: z.enum(["Transparent", "Curved", "Floor", "Other"], {
        required_error: "Special types is required",
    }),
    specialTypesOther: z.string().optional(),
    application: z.enum([
        "DOOH",
        "Indoor Signage",
        "Home Theater",
        "Stadium Scoreboard",
        "Video Cube",
        "Conference",
        "Stadium Ribbons",
        "Corporate Design",
        "Staging",
        "Virtual Production"
    ], {
        required_error: "Application is required",
    }),
    pixelPitch: z.coerce.number("Pixel pitch must be a number"),
    pixelConfiguration: z.enum(["1R1G1B", "2R1G1B"], {
        required_error: "Pixel configuration is required",
    }),
    pixelTechnology: z.enum(["Real", "Virtual"], {
        required_error: "Pixel technology is required",
    }),
    ledTechnology: z.enum(["SMD", "SMD+GOB", "IMD", "COB", "DIP", "LOB", "Other"], {
        required_error: "LED technology is required",
    }),
    ledTechnologyOther: z.string().optional(),
    chipBonding: z.enum(["Gold Wire", "Copper Wire", "Flip-Chip"], {
        required_error: "Chip bonding is required",
    }),
    colourDepth: z.enum(["8", "10", "12"], {
        required_error: "Colour depth is required",
    }),
    currentGainControl: z.enum(["4", "8"], {
        required_error: "Current gain control is required",
    }),
    videoRate: z.enum(["50/60", "120", "240"], {
        required_error: "Video rate is required",
    }),
    calibrationMethod: z.enum([
        "No Calibration",
        "Multiple Layers Chroma",
        "Multiple Layers Brightness",
        "Brightness",
        "Chroma",
        "Other"
    ], {
        required_error: "Calibration method is required",
    }),
    calibrationMethodOther: z.string().optional(),
    drivingMethod: z.enum(["Common Anode", "Common Cathode"], {
        required_error: "Driving method is required",
    }),
    controlSystem: z.enum(["Colorlight", "Novastar", "Brompton", "LINSN", "Other"], {
        required_error: "Control system is required",
    }),
    cooling: z.enum(["Convection", "Fan"], {
        required_error: "Cooling is required",
    }),
    powerRedundancy: z.enum(["Yes", "No"], {
        required_error: "Power redundancy is required",
    }),
    memoryOnModule: z.enum(["Yes", "No"], {
        required_error: "Memory on module is required",
    }),
    smartModule: z.enum(["Yes", "No"], {
        required_error: "Smart module is required",
    }),
    support: z.enum(["Frontendside", "Backside", "Frontside and Backside"]).optional(),
    
    // Foreign Key
    areaOfUseId: z.string().min(1, "Area of use is required"),
    
    // Decimal fields
    cabinetWidth: z.coerce.number().optional(),
    cabinetHeight: z.coerce.number().optional(),
    weightWithoutPackaging: z.coerce.number().optional(),
    
    // Integer fields (Point 3)
    refreshRate: z.coerce.number().int("Refresh rate must be an integer"),
    scanRateDenominator: z.coerce.number().int("Scan rate denominator must be an integer"),
    contrastRatioNumerator: z.coerce.number().int().optional(),
    cabinetResolutionHorizontal: z.coerce.number().int().optional(),
    cabinetResolutionVertical: z.coerce.number().int().optional(),
    pixelDensity: z.coerce.number().int().optional(),
    ledLifespan: z.coerce.number().int().optional(),
    greyscaleProcessing: z.enum(["<16", "16", "18+", "22+", "Other"], {
        required_error: "Greyscale processing is required",
    }),
    greyscaleProcessingOther: z.string().optional(),
    controlSystemOther: z.string().optional(),
    numberOfColours: z.coerce.number().int().optional(),
    mtbfPowerSupply: z.coerce.number().int().optional(),
    
    // Power & Performance
    powerConsumptionMax: z.coerce.number().int().optional(),
    powerConsumptionTypical: z.coerce.number().int().optional(),
    warrantyPeriod: z.coerce.number().int().optional(),
}).refine((data) => {
    if (data.greyscaleProcessing === "Other" && !data.greyscaleProcessingOther?.trim()) {
        return false;
    }
    return true;
}, {
    message: "Please specify greyscale processing value",
    path: ["greyscaleProcessingOther"],
}).refine((data) => {
    if (data.controlSystem === "Other" && !data.controlSystemOther?.trim()) {
        return false;
    }
    return true;
}, {
    message: "Please specify control system name",
    path: ["controlSystemOther"],
}).refine((data) => {
    if (data.calibrationMethod === "Other" && !data.calibrationMethodOther?.trim()) {
        return false;
    }
    return true;
}, {
    message: "Please specify calibration method name",
    path: ["calibrationMethodOther"],
}).refine((data) => {
    if (data.ledTechnology === "Other" && !data.ledTechnologyOther?.trim()) {
        return false;
    }
    return true;
}, {
    message: "Please specify led technology name",
    path: ["ledTechnologyOther"],
}).refine((data) => {
    if (data.specialTypes === "Other" && !data.specialTypesOther?.trim()) {
        return false;
    }
    return true;
}, {
    message: "Please specify special types name",
    path: ["specialTypesOther"],
});

export default function ProductForm({
    mode = "add",
    initialData = null,
    initialImages = [],
    initialFeatures = [],
    initialCertificateIds = [],
}) {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    
    // File states
    const [productImages, setProductImages] = useState([]); // new File objects
    const [existingImages, setExistingImages] = useState(initialImages); // from DB
    const [removedImageIds, setRemovedImageIds] = useState([]); // IDs to remove
    const [selectedCertificates, setSelectedCertificates] = useState(initialCertificateIds);
    
    // Features state
    const [features, setFeatures] = useState(initialFeatures.map(f => typeof f === "string" ? f : f.feature));
    const [featureInput, setFeatureInput] = useState("");

    const isEdit = mode === "edit";

    // Build default values for react-hook-form
    const defaultValues = initialData ? {
        productName: initialData.productName || "",
        productNumber: initialData.productNumber || "",
        viewingAngleHorizontal: initialData.viewingAngleHorizontal || "",
        viewingAngleVertical: initialData.viewingAngleVertical || "",
        brightnessControl: initialData.brightnessControl || "",
        dciP3Coverage: initialData.dciP3Coverage || "",
        operatingTemperature: initialData.operatingTemperature || "",
        operatingHumidity: initialData.operatingHumidity || "",
        ipRating: initialData.ipRating || "",
        ledModulesPerCabinet: initialData.ledModulesPerCabinet || "",
        ledChipManufacturer: initialData.ledChipManufacturer || "",
        whitePointCalibration: initialData.whitePointCalibration || "",
        brightnessValue: initialData.brightnessValue || "",
        inputVoltage: initialData.inputVoltage || "",
        receivingCard: initialData.receivingCard || "",
        heatDissipation: initialData.heatDissipation || "",
        monitoringFunctionEn: initialData.monitoringFunctionEn || "",
        monitoringFunctionDe: initialData.monitoringFunctionDe || "",
        additionalCertification: initialData.additionalCertification || "",
        emc: initialData.emc || "",
        safety: initialData.safety || "",
        supportDuringWarrantyEn: initialData.supportDuringWarrantyEn || "",
        supportDuringWarrantyDe: initialData.supportDuringWarrantyDe || "",
        supportAfterWarrantyEn: initialData.supportAfterWarrantyEn || "",
        supportAfterWarrantyDe: initialData.supportAfterWarrantyDe || "",
        productType: initialData.productType || undefined,
        design: initialData.design || undefined,
        specialTypes: initialData.specialTypes || undefined,
        specialTypesOther: initialData.specialTypesOther || "",
        application: initialData.application || undefined,
        pixelPitch: initialData.pixelPitch || "",
        pixelConfiguration: initialData.pixelConfiguration || undefined,
        pixelTechnology: initialData.pixelTechnology || undefined,
        ledTechnology: initialData.ledTechnology || undefined,
        ledTechnologyOther: initialData.ledTechnologyOther || "",
        chipBonding: initialData.chipBonding || undefined,
        colourDepth: initialData.colourDepth || undefined,
        currentGainControl: initialData.currentGainControl || undefined,
        videoRate: initialData.videoRate || undefined,
        calibrationMethod: initialData.calibrationMethod || undefined,
        calibrationMethodOther: initialData.calibrationMethodOther || "",
        drivingMethod: initialData.drivingMethod || undefined,
        controlSystem: initialData.controlSystem || undefined,
        controlSystemOther: initialData.controlSystemOther || "",
        cooling: initialData.cooling || undefined,
        powerRedundancy: initialData.powerRedundancy || undefined,
        memoryOnModule: initialData.memoryOnModule || undefined,
        smartModule: initialData.smartModule || undefined,
        support: initialData.support || undefined,
        areaOfUseId: initialData.areaOfUseId || "",
        cabinetWidth: initialData.cabinetWidth || "",
        cabinetHeight: initialData.cabinetHeight || "",
        weightWithoutPackaging: initialData.weightWithoutPackaging || "",
        refreshRate: initialData.refreshRate || "",
        scanRateDenominator: initialData.scanRateDenominator || "",
        contrastRatioNumerator: initialData.contrastRatioNumerator || "",
        cabinetResolutionHorizontal: initialData.cabinetResolutionHorizontal || "",
        cabinetResolutionVertical: initialData.cabinetResolutionVertical || "",
        pixelDensity: initialData.pixelDensity || "",
        ledLifespan: initialData.ledLifespan || "",
        greyscaleProcessing: initialData.greyscaleProcessing || undefined,
        greyscaleProcessingOther: initialData.greyscaleProcessingOther || "",
        numberOfColours: initialData.numberOfColours || "",
        mtbfPowerSupply: initialData.mtbfPowerSupply || "",
        powerConsumptionMax: initialData.powerConsumptionMax || "",
        powerConsumptionTypical: initialData.powerConsumptionTypical || "",
        warrantyPeriod: initialData.warrantyPeriod || "",
    } : {};

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues,
    });

    // Watch for conditional fields
    const greyscaleProcessing = watch("greyscaleProcessing");
    const controlSystem = watch("controlSystem");
    const specialTypes = watch("specialTypes");
    const ledTechnology = watch("ledTechnology");
    const calibrationMethod = watch("calibrationMethod");

    useEffect(() => {
        fetchCategories();
        fetchCertificates();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/categories");
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch categories");
            }
            setCategories(response.data);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const fetchCertificates = async () => {
        try {
            const res = await fetch("/api/admin/certificates");
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch certificates");
            }
            setCertificates(response.data);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            if (isEdit) {
                // Use FormData for edit to handle file uploads
                const formData = new FormData();
                
                // Append all form fields as JSON
                formData.append("fields", JSON.stringify({
                    ...data,
                    features: features,
                    productCertificates: selectedCertificates,
                    removedImageIds: removedImageIds,
                }));

                // Append new image files
                productImages.forEach((file) => {
                    formData.append("images", file);
                });

                const res = await fetch(`/api/admin/products/${initialData.id}`, {
                    method: "PUT",
                    body: formData,
                });

                const response = await res.json();
                if (!response.success) {
                    throw new Error(response.message || "Failed to update product");
                }
                toast.success(response.message || "Product updated successfully");
                router.push("/admin/products");
            } else {
                // Use FormData for add too to handle file uploads
                const formData = new FormData();
                
                formData.append("fields", JSON.stringify({
                    ...data,
                    features: features,
                    productCertificates: selectedCertificates,
                }));

                // Append new image files
                productImages.forEach((file) => {
                    formData.append("images", file);
                });

                const res = await fetch("/api/admin/products", {
                    method: "POST",
                    body: formData,
                });

                const response = await res.json();
                if (!response.success) {
                    throw new Error(response.message || "Failed to create product");
                }
                toast.success(response.message || "Product created successfully");
                router.push("/admin/products");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        setProductImages((prev) => [...prev, ...files]);
    };

    const removeNewImage = (index) => {
        setProductImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId) => {
        setRemovedImageIds((prev) => [...prev, imageId]);
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    };

    const handleCertificateToggle = (certificateId) => {
        setSelectedCertificates((prev) => {
            if (prev.includes(certificateId)) {
                return prev.filter((id) => id !== certificateId);
            } else {
                return [...prev, certificateId];
            }
        });
    };

    const handleAddFeature = () => {
        const trimmedFeature = featureInput.trim();
        if (trimmedFeature) {
            setFeatures((prev) => [...prev, trimmedFeature]);
            setFeatureInput("");
        }
    };

    const handleRemoveFeature = (index) => {
        setFeatures((prev) => prev.filter((_, i) => i !== index));
    };
    
    const renderInput = (label, field, type = "text", props = {}) => (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Input
                type={type}
                {...register(field)}
                placeholder={`Enter ${label}`}
                {...props}
            />
            {errors[field] && (
                <p className="text-sm text-red-500">{errors[field].message}</p>
            )}
        </div>
    );

    const renderTextarea = (label, field, props = {}) => (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Textarea 
            {...register(field)} 
            placeholder={`Enter ${label}`} 
            {...props} />

            {errors[field] && (
                <p className="text-sm text-red-500">{errors[field].message}</p>
            )}
        </div>
    );

    const renderSelect = (label, field, options) => (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Controller
                name={field}
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
            {errors[field] && (
                <p className="text-sm text-red-500">{errors[field].message}</p>
            )}
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold font-archivo">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product Name */}
                    {renderInput("Product Name *", "productName", "text", { required: true })}

                    {/* Product Number */}
                    {renderInput("Product Number *", "productNumber", "text", { required: true, disabled: isEdit })}

                    {/* Product Type */}
                    {renderSelect("Product Type *", "productType", ["AIO Systems", "LED Display Single Cabinet"])}

                    {/* Area of Use */}
                    {renderSelect("Area of Use (Category) *", "areaOfUseId", categories.map((cat) => cat.name))}

                    {/* Design */}
                    {renderSelect("Design *", "design", ["Fix", "Mobil"])}
                    {renderSelect("Special Types *", "specialTypes", ["Transparent", "Curved", "Floor", "Other"])}
                    {specialTypes === "Other" && renderInput("Special Types Other", "specialTypesOther", "text", { required: true })}
                    {renderSelect("Application *", "application", ["DOOH", "Indoor Signage", "Home Theater", "Stadium Scoreboard", "Video Cube", "Conference", "Stadium Ribbons", "Corporate Design", "Staging", "Virtual Production"])}
                </div>
            </div>

            {/* Pixel Configuration Section */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold font-archivo">Pixel Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pixel Pitch */}
                   
                    {renderInput("Pixel Pitch *", "pixelPitch", "number", { required: true, step: "0.01", placeholder: "e.g., 0.9" })}
                   
                    {/* Pixel Configuration */}
                    {renderSelect("Pixel Configuration *", "pixelConfiguration", ["1R1G1B", "2R1G1B"])}
                    {renderSelect("Pixel Technology *", "pixelTechnology", ["Real", "Virtual"])}
                </div>
            </div>

            {/* Cabinet Dimensions Section */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold font-archivo">Cabinet Dimensions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("Cabinet Width (mm)", "cabinetWidth", "number", { required: true, step: "0.01", placeholder: "e.g., 500.00" })}
                    {renderInput("Cabinet Height (mm)", "cabinetHeight", "number", { required: true, step: "0.01", placeholder: "e.g., 500.00" })}
                    {renderInput("Cabinet Resolution Horizontal", "cabinetResolutionHorizontal", "number", { required: true, step: "0.01", placeholder: "e.g., 192px" })}
                    {renderInput("Cabinet Resolution Vertical", "cabinetResolutionVertical", "number", { required: true, step: "0.01", placeholder: "e.g., 144px" })}
                    {renderInput("Pixel Density", "pixelDensity", "number", { required: true, step: "0.01", placeholder: "e.g., 100000" })}
                    {renderInput("Weight Without Packaging (kg)", "weightWithoutPackaging", "number", { required: true, step: "0.01", placeholder: "e.g., 25.50" })}
                </div>
            </div>

            {/* LED Technology Section */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold font-archivo">LED Technology</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderSelect("LED Technology *", "ledTechnology", ["SMD", "SMD+GOB", "IMD", "COB", "DIP", "LOB", "Other"])}
                    {ledTechnology === "Other" && renderInput("LED Technology Other", "ledTechnologyOther", "text", { required: true })}
                    {renderSelect("Chip-Bonding *", "chipBonding", ["Gold Wire", "Copper Wire", "Flip-Chip"])}
                    {renderInput("LED Chip Manufacturer", "ledChipManufacturer", "text", { required: true })}
                    {renderInput("LED Lifespan (hours)", "ledLifespan", "number", { required: true, step: "0.01", placeholder: "e.g., 100000" })}
                </div>
            </div>

            {/* Display Properties Section */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold font-archivo">Display Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("Viewing Angle Horizontal", "viewingAngleHorizontal", "number", { required: true, step: "0.01", placeholder: "e.g., 160°" })}
                    {renderInput("Viewing Angle Vertical", "viewingAngleVertical", "number", { required: true, step: "0.01", placeholder: "e.g., 160°" })}
                    {renderInput("Brightness Value", "brightnessValue", "number", { required: true, step: "0.01", placeholder: "e.g., 1000" })}
                    {renderInput("Brightness Control", "brightnessControl", "text", { required: true, placeholder: "Enter brightness control" })}
                    {renderInput("DCI-P3 Coverage", "dciP3Coverage", "number", { required: true, step: "0.01", placeholder: "e.g., 100" })}
                    {renderInput("Contrast Ratio (Numerator)", "contrastRatioNumerator", "number", { required: true, step: "0.01", placeholder: "e.g., 7000" })}
                    {renderSelect("Colour Depth (bit) *", "colourDepth", ["8", "10", "12"])}
                    {renderSelect("Greyscale Processing *", "greyscaleProcessing", ["<16", "16", "18+", "22+", "Other"])}
                    {greyscaleProcessing === "Other" && renderInput("Greyscale Processing Other", "greyscaleProcessingOther", "text", { required: true })}
                    {renderInput("Number of Colours", "numberOfColours", "number", { required: true, step: "0.01", placeholder: "e.g., 16777216" })}
                </div>
            </div>

            {/* Control & Calibration Section */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold font-archivo">Control & Calibration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderSelect("Current Gain Control *", "currentGainControl", ["4", "8"])}
                    {renderSelect("Video Rate *", "videoRate", ["50/60", "120", "240"])}
                    {renderSelect("Calibration Method *", "calibrationMethod", ["No Calibration", "Multiple Layers Chroma", "Multiple Layers Brightness", "Brightness", "Chroma", "Other"])}
                    {calibrationMethod === "Other" && renderInput("Calibration Method Other", "calibrationMethodOther", "text", { required: true })}
                    {renderSelect("Driving Method *", "drivingMethod", ["Common Anode", "Common Cathode"])}
                    {renderInput("White Point Calibration", "whitePointCalibration", "text", { required: true, placeholder: "Enter white point calibration" })}
                </div>
            </div>

            {/* Power & Performance Section */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold font-archivo">Power & Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("Power Consumption Max (W)", "powerConsumptionMax", "number", { required: true, step: "0.01", placeholder: "e.g., 500" })}
                    {renderInput("Power Consumption Typical (W)", "powerConsumptionTypical", "number", { required: true, step: "0.01", placeholder: "e.g., 300" })}
                    {renderInput("Refresh Rate (Hz)", "refreshRate", "number", { required: true, step: "0.01", placeholder: "e.g., 1920" })}
                    {renderInput("Scan Rate Denominator", "scanRateDenominator", "number", { required: true, step: "0.01", placeholder: "e.g., 16" })}
                    {renderSelect("Power Redundancy *", "powerRedundancy", ["Yes", "No"])}
                    {renderSelect("Memory on Module *", "memoryOnModule", ["Yes", "No"])}
                    {renderSelect("Smart Module *", "smartModule", ["Yes", "No"])}
                    {renderSelect("Control System *", "controlSystem", ["Colorlight", "Novastar", "Brompton", "LINSN", "Other"])}
                    {controlSystem === "Other" && renderInput("Control System Other", "controlSystemOther", "text", { required: true })}
                    {renderInput("Input Voltage", "inputVoltage", "text", { required: true, placeholder: "e.g., 100-240V AC" })}
                    {renderInput("Receiving Card", "receivingCard", "text", { required: true, placeholder: "Enter receiving card" })}
                    {renderInput("Heat Dissipation", "heatDissipation", "text", { required: true, placeholder: "Enter heat dissipation" })}
                    {renderInput("MTBF Power Supply (hours)", "mtbfPowerSupply", "number", { required: true, step: "0.01", placeholder: "e.g., 50000" })}
                </div>
            </div>

            {/* Operating Conditions Section */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold font-archivo">Operating Conditions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("Operating Temperature", "operatingTemperature", "text", { required: true, placeholder: "e.g., -40°C to 55°C" })}
                    {renderInput("Operating Humidity", "operatingHumidity", "text", { required: true, placeholder: "e.g., 10% to 80% RH" })}
                    {renderInput("IP Rating", "ipRating", "text", { required: true, placeholder: "e.g., IP65" })}
                    {renderInput("LED Modules per Cabinet", "ledModulesPerCabinet", "text", { required: true, placeholder: "e.g., 4x2" })}
                    {renderSelect("Cooling *", "cooling", ["Convection", "Fan"])}
                </div>
            </div>

            {/* Support & Warranty Section */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold font-archivo">Support & Warranty</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderSelect("Support *", "support", ["Frontendside", "Backside", "Frontside and Backside"]) }
                    {renderInput("Warranty Period (months)", "warrantyPeriod", "number", { required: true, step: "0.01", placeholder: "e.g., 24" }, {type: "description"})}
                    {renderTextarea("Monitoring Function (EN)", "monitoringFunctionEn", { required: true, placeholder: "Enter monitoring function in English" })}
                    {renderTextarea("Monitoring Function (DE)", "monitoringFunctionDe", { required: true, placeholder: "Enter monitoring function in German" })}
                    {renderTextarea("Additional Certification", "additionalCertification", { required: true, placeholder: "Enter additional certification" })}
                    {renderTextarea("EMC", "emc", { required: true, placeholder: "Enter EMC information" })}
                    {renderTextarea("Safety", "safety", { required: true, placeholder: "Enter safety information" })}
                    {renderTextarea("Support During Warranty (EN)", "supportDuringWarrantyEn", { required: true, placeholder: "Enter support during warranty in English" })}
                    {renderTextarea("Support During Warranty (DE)", "supportDuringWarrantyDe", { required: true, placeholder: "Enter support during warranty in German" })}
                    {renderTextarea("Support After Warranty (EN)", "supportAfterWarrantyEn", { required: true, placeholder: "Enter support after warranty in English" })}
                    {renderTextarea("Support After Warranty (DE)", "supportAfterWarrantyDe", { required: true, placeholder: "Enter support after warranty in German" })}
                </div>
            </div>

            {/* Features Section */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold font-archivo">Product Features</h2>
                <div className="space-y-4">
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
                        <Button
                            type="button"
                            onClick={handleAddFeature}
                            variant="default"
                            size="lg"
                            className="h-12"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </div>
                    {features.length > 0 && (
                        <div className="space-y-2">
                            <Label>Added Features</Label>
                            <div className="flex flex-wrap gap-2">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-secondary/10 px-3 py-2 rounded-md border"
                                    >
                                        <span className="text-sm">{feature}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                            onClick={() => handleRemoveFeature(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* File Uploads Section */}
            <div className="space-y-4 py-4">
                <h2 className="text-lg font-semibold font-archivo">Product Files</h2>
                
                {/* Product Images */}
                <div className="space-y-2">
                    <Label>Product Images</Label>
                    <div className="flex flex-wrap gap-4">
                        {/* Existing images (edit mode) */}
                        {existingImages.map((img) => (
                            <div key={img.id} className="relative">
                                <Image
                                    src={img.imageUrl}
                                    alt="Product image"
                                    width={100}
                                    height={100}
                                    className="rounded object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2"
                                    onClick={() => removeExistingImage(img.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {/* New images */}
                        {productImages.map((file, index) => (
                            <div key={`new-${index}`} className="relative">
                                <Image
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index + 1}`}
                                    width={100}
                                    height={100}
                                    className="rounded object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2"
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

                {/* Product Certificates */}
                <div className="space-y-2">
                    <Label>Product Certificates</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                        Select certificates that apply to this product. Manage certificates from the Certificates page.
                    </p>
                    {certificates.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {certificates.map((certificate) => (
                                <div
                                    key={certificate.id}
                                    className={`border rounded-lg p-3 bg-white transition-all ${
                                        selectedCertificates.includes(certificate.id)
                                            ? "border-primary"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={selectedCertificates.includes(certificate.id)}
                                            onCheckedChange={() => {
                                                handleCertificateToggle(certificate.id);
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{certificate.name}</p>
                                            <div className="mt-2">
                                                <Image
                                                    src={certificate.imageUrl}
                                                    alt={certificate.name}
                                                    width={80}
                                                    height={80}
                                                    className="rounded object-cover"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No certificates available. Please add certificates first.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex gap-4">
                <Button type="submit" size="lg" disabled={submitting}>
                    {submitting
                        ? isEdit ? "Updating Product..." : "Creating Product..."
                        : isEdit ? "Update Product" : "Create Product"
                    }
                </Button>
                <Button 
                    type="button" 
                    size="lg" 
                    variant="outline" 
                    onClick={() => router.push("/admin/products")}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}

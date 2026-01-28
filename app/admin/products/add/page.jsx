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
import { X, ArrowLeft, Plus } from "lucide-react";
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
    productType: z.enum(["AIO systems", "LED Display single cabinet"], {
        required_error: "Product type is required",
    }),
    design: z.enum(["fix", "mobil"], {
        required_error: "Design is required",
    }),
    specialTypes: z.enum(["transparent", "curved", "floor", "N/A"], {
        required_error: "Special types is required",
    }),
    application: z.enum([
        "DOOH",
        "Indoor signage",
        "Home theater",
        "Stadium scoreboard",
        "Video cube",
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
    pixelTechnology: z.enum(["real", "virtual"], {
        required_error: "Pixel technology is required",
    }),
    ledTechnology: z.enum(["SMD", "SMD+GOB", "IMD", "COB", "DIP", "LOB"], {
        required_error: "LED technology is required",
    }),
    chipBonding: z.enum(["gold wire", "cooper wire", "Flip chip"], {
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
        "no calibration",
        "multiple layers chroma",
        "multiple layers brightness",
        "Brightness",
        "chroma"
    ], {
        required_error: "Calibration method is required",
    }),
    drivingMethod: z.enum(["common anode", "common cathode"], {
        required_error: "Driving method is required",
    }),
    controlSystem: z.enum(["Colorlight", "Novastar", "Brompton", "LINSN", "other"], {
        required_error: "Control system is required",
    }),
    cooling: z.enum(["convection", "fan"], {
        required_error: "Cooling is required",
    }),
    powerRedundancy: z.enum(["yes", "no"], {
        required_error: "Power redundancy is required",
    }),
    memoryOnModule: z.enum(["yes", "no"], {
        required_error: "Memory on module is required",
    }),
    smartModule: z.enum(["yes", "no"], {
        required_error: "Smart module is required",
    }),
    support: z.enum(["frontendside", "backside", "frontside and backside"]).optional(),
    
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
    greyscaleProcessing: z.enum(["<16", "16", "18+", "22+", "other"], {
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
    // If greyscaleProcessing is "other", greyscaleProcessingOther is required
    if (data.greyscaleProcessing === "other" && !data.greyscaleProcessingOther?.trim()) {
        return false;
    }
    return true;
}, {
    message: "Please specify greyscale processing value",
    path: ["greyscaleProcessingOther"],
}).refine((data) => {
    // If controlSystem is "other", controlSystemOther is required
    if (data.controlSystem === "other" && !data.controlSystemOther?.trim()) {
        return false;
    }
    return true;
}, {
    message: "Please specify control system name",
    path: ["controlSystemOther"],
});

export default function AddProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    
    // File states
    const [productImages, setProductImages] = useState([]);
    const [selectedCertificates, setSelectedCertificates] = useState([]);
    
    // Features state
    const [features, setFeatures] = useState([]);
    const [featureInput, setFeatureInput] = useState("");

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productSchema),
    });

    // Watch for conditional fields
    const greyscaleProcessing = watch("greyscaleProcessing");
    const controlSystem = watch("controlSystem");

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
            
            // Append all form fields including features and certificates
            const res = await fetch("/api/admin/products", {
                method: "POST",
                body: JSON.stringify({
                    ...data,
                    features: features,
                    productCertificates: selectedCertificates,
                }),
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to create product");
            }
            toast.success(response.message || "Product created successfully");
            router.push("/admin/products");
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

    const removeImage = (index) => {
        setProductImages((prev) => prev.filter((_, i) => i !== index));
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        
                        <h1 className="text-2xl font-bold font-archivo">Add New Product</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Create a new product with detailed specifications.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-4 py-4">
                    <h2 className="text-lg font-semibold font-archivo">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="productName">Product Name *</Label>
                            <Input
                                id="productName"
                                {...register("productName")}
                                placeholder="Enter product name"
                            />
                            {errors.productName && (
                                <p className="text-sm text-red-500">{errors.productName.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="productNumber">Product Number *</Label>
                            <Input
                                id="productNumber"
                                {...register("productNumber")}
                                placeholder="e.g., PROD-001"
                            />
                            {errors.productNumber && (
                                <p className="text-sm text-red-500">{errors.productNumber.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="productType">Product Type *</Label>
                            <Controller
                                name="productType"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AIO systems">AIO systems</SelectItem>
                                            <SelectItem value="LED Display single cabinet">LED Display single cabinet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.productType && (
                                <p className="text-sm text-red-500">{errors.productType.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="areaOfUseId">Area of Use (Category) *</Label>
                            <Controller
                                name="areaOfUseId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.areaOfUseId && (
                                <p className="text-sm text-red-500">{errors.areaOfUseId.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="design">Design *</Label>
                            <Controller
                                name="design"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select design" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fix">Fix</SelectItem>
                                            <SelectItem value="mobil">Mobil</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.design && (
                                <p className="text-sm text-red-500">{errors.design.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="specialTypes">Special Types *</Label>
                            <Controller
                                name="specialTypes"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select special type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="transparent">Transparent</SelectItem>
                                            <SelectItem value="curved">Curved</SelectItem>
                                            <SelectItem value="floor">Floor</SelectItem>
                                            <SelectItem value="N/A">N/A</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.specialTypes && (
                                <p className="text-sm text-red-500">{errors.specialTypes.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="application">Application *</Label>
                            <Controller
                                name="application"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select application" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DOOH">DOOH</SelectItem>
                                            <SelectItem value="Indoor signage">Indoor signage</SelectItem>
                                            <SelectItem value="Home theater">Home theater</SelectItem>
                                            <SelectItem value="Stadium scoreboard">Stadium scoreboard</SelectItem>
                                            <SelectItem value="Video cube">Video cube</SelectItem>
                                            <SelectItem value="Conference">Conference</SelectItem>
                                            <SelectItem value="Stadium Ribbons">Stadium Ribbons</SelectItem>
                                            <SelectItem value="Corporate Design">Corporate Design</SelectItem>
                                            <SelectItem value="Staging">Staging</SelectItem>
                                            <SelectItem value="Virtual Production">Virtual Production</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.application && (
                                <p className="text-sm text-red-500">{errors.application.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pixel Configuration Section */}
                <div className="space-y-4 py-4">
                    <h2 className="text-lg font-semibold font-archivo">Pixel Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pixelPitch">Pixel Pitch *</Label>
                            <Input
                                id="pixelPitch"
                                type="number"
                                step="0.01"
                                {...register("pixelPitch")}
                                placeholder="e.g., 0.9"
                            />
                            {errors.pixelPitch && (
                                <p className="text-sm text-red-500">{errors.pixelPitch.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pixelConfiguration">Pixel Configuration *</Label>
                            <Controller
                                name="pixelConfiguration"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select pixel configuration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1R1G1B">1R1G1B</SelectItem>
                                            <SelectItem value="2R1G1B">2R1G1B</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.pixelConfiguration && (
                                <p className="text-sm text-red-500">{errors.pixelConfiguration.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pixelTechnology">Pixel Technology *</Label>
                            <Controller
                                name="pixelTechnology"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select pixel technology" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="real">Real</SelectItem>
                                            <SelectItem value="virtual">Virtual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.pixelTechnology && (
                                <p className="text-sm text-red-500">{errors.pixelTechnology.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cabinet Dimensions Section */}
                <div className="space-y-4 py-4">
                    <h2 className="text-lg font-semibold font-archivo">Cabinet Dimensions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cabinetWidth">Cabinet Width (mm)</Label>
                            <Input
                                id="cabinetWidth"
                                type="number"
                                step="0.01"
                                {...register("cabinetWidth")}
                                placeholder="e.g., 500.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cabinetHeight">Cabinet Height (mm)</Label>
                            <Input
                                id="cabinetHeight"
                                type="number"
                                step="0.01"
                                {...register("cabinetHeight")}
                                placeholder="e.g., 500.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cabinetResolutionHorizontal">Cabinet Resolution Horizontal</Label>
                            <Input
                                id="cabinetResolutionHorizontal"
                                type="number"
                                {...register("cabinetResolutionHorizontal")}
                                placeholder="e.g., 1920"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cabinetResolutionVertical">Cabinet Resolution Vertical</Label>
                            <Input
                                id="cabinetResolutionVertical"
                                type="number"
                                {...register("cabinetResolutionVertical")}
                                placeholder="e.g., 1080"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pixelDensity">Pixel Density</Label>
                            <Input
                                id="pixelDensity"
                                type="number"
                                {...register("pixelDensity")}
                                placeholder="e.g., 100000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weightWithoutPackaging">Weight Without Packaging (kg)</Label>
                            <Input
                                id="weightWithoutPackaging"
                                type="number"
                                step="0.01"
                                {...register("weightWithoutPackaging")}
                                placeholder="e.g., 25.50"
                            />
                        </div>
                    </div>
                </div>

                {/* LED Technology Section */}
                <div className="space-y-4 py-4">
                    <h2 className="text-lg font-semibold font-archivo">LED Technology</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ledTechnology">LED Technology *</Label>
                            <Controller
                                name="ledTechnology"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select LED technology" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SMD">SMD</SelectItem>
                                            <SelectItem value="SMD+GOB">SMD+GOB</SelectItem>
                                            <SelectItem value="IMD">IMD</SelectItem>
                                            <SelectItem value="COB">COB</SelectItem>
                                            <SelectItem value="DIP">DIP</SelectItem>
                                            <SelectItem value="LOB">LOB</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.ledTechnology && (
                                <p className="text-sm text-red-500">{errors.ledTechnology.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="chipBonding">Chip-Bonding *</Label>
                            <Controller
                                name="chipBonding"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select chip bonding" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gold wire">Gold Wire</SelectItem>
                                            <SelectItem value="cooper wire">Cooper Wire</SelectItem>
                                            <SelectItem value="Flip chip">Flip Chip</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.chipBonding && (
                                <p className="text-sm text-red-500">{errors.chipBonding.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ledChipManufacturer">LED Chip Manufacturer</Label>
                            <Input
                                id="ledChipManufacturer"
                                {...register("ledChipManufacturer")}
                                placeholder="Enter LED chip manufacturer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ledLifespan">LED Lifespan (hours)</Label>
                            <Input
                                id="ledLifespan"
                                type="number"
                                {...register("ledLifespan")}
                                placeholder="e.g., 100000"
                            />
                        </div>
                    </div>
                </div>

                {/* Display Properties Section */}
                <div className="space-y-4 py-4">
                    <h2 className="text-lg font-semibold font-archivo">Display Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="viewingAngleHorizontal">Viewing Angle Horizontal</Label>
                            <Input
                                id="viewingAngleHorizontal"
                                {...register("viewingAngleHorizontal")}
                                placeholder="e.g., 160°"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="viewingAngleVertical">Viewing Angle Vertical</Label>
                            <Input
                                id="viewingAngleVertical"
                                {...register("viewingAngleVertical")}
                                placeholder="e.g., 160°"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brightnessControl">Brightness Control</Label>
                            <Input
                                id="brightnessControl"
                                {...register("brightnessControl")}
                                placeholder="Enter brightness control"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dciP3Coverage">DCI-P3 Coverage</Label>
                            <Input
                                id="dciP3Coverage"
                                {...register("dciP3Coverage")}
                                placeholder="Enter DCI-P3 coverage"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contrastRatioNumerator">Contrast Ratio (Numerator)</Label>
                            <Input
                                id="contrastRatioNumerator"
                                type="number"
                                {...register("contrastRatioNumerator")}
                                placeholder="e.g., 7000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="colourDepth">Colour Depth (bit) *</Label>
                            <Controller
                                name="colourDepth"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select colour depth" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="8">8</SelectItem>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="12">12</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.colourDepth && (
                                <p className="text-sm text-red-500">{errors.colourDepth.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="greyscaleProcessing">Greyscale Processing *</Label>
                            <Controller
                                name="greyscaleProcessing"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select greyscale processing" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="<16">&lt;16</SelectItem>
                                            <SelectItem value="16">16</SelectItem>
                                            <SelectItem value="18+">18+</SelectItem>
                                            <SelectItem value="22+">22+</SelectItem>
                                            <SelectItem value="other">Other (specify)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.greyscaleProcessing && (
                                <p className="text-sm text-red-500">{errors.greyscaleProcessing.message}</p>
                            )}
                        </div>
                        {greyscaleProcessing === "other" && (
                            <div className="space-y-2">
                                <Label htmlFor="greyscaleProcessingOther">Greyscale Processing (Specify) *</Label>
                                <Input
                                    id="greyscaleProcessingOther"
                                    {...register("greyscaleProcessingOther")}
                                    placeholder="Enter greyscale processing value"
                                />
                                {errors.greyscaleProcessingOther && (
                                    <p className="text-sm text-red-500">{errors.greyscaleProcessingOther.message}</p>
                                )}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="numberOfColours">Number of Colours</Label>
                            <Input
                                id="numberOfColours"
                                type="number"
                                {...register("numberOfColours")}
                                placeholder="e.g., 16777216"
                            />
                        </div>
                    </div>
                </div>

                {/* Control & Calibration Section */}
                <div className="space-y-4 py-4">
                    <h2 className="text-lg font-semibold font-archivo">Control & Calibration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentGainControl">Current Gain Control *</Label>
                            <Controller
                                name="currentGainControl"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select current gain control" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="4">4</SelectItem>
                                            <SelectItem value="8">8</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.currentGainControl && (
                                <p className="text-sm text-red-500">{errors.currentGainControl.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="videoRate">Video Rate *</Label>
                            <Controller
                                name="videoRate"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select video rate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="50/60">50/60</SelectItem>
                                            <SelectItem value="120">120</SelectItem>
                                            <SelectItem value="240">240</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.videoRate && (
                                <p className="text-sm text-red-500">{errors.videoRate.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="calibrationMethod">Calibration Method *</Label>
                            <Controller
                                name="calibrationMethod"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select calibration method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no calibration">No Calibration</SelectItem>
                                            <SelectItem value="multiple layers chroma">Multiple Layers Chroma</SelectItem>
                                            <SelectItem value="multiple layers brightness">Multiple Layers Brightness</SelectItem>
                                            <SelectItem value="Brightness">Brightness</SelectItem>
                                            <SelectItem value="chroma">Chroma</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.calibrationMethod && (
                                <p className="text-sm text-red-500">{errors.calibrationMethod.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="drivingMethod">Driving Method *</Label>
                            <Controller
                                name="drivingMethod"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select driving method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="common anode">Common Anode</SelectItem>
                                            <SelectItem value="common cathode">Common Cathode</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.drivingMethod && (
                                <p className="text-sm text-red-500">{errors.drivingMethod.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whitePointCalibration">White Point Calibration</Label>
                            <Input
                                id="whitePointCalibration"
                                {...register("whitePointCalibration")}
                                placeholder="Enter white point calibration"
                            />
                        </div>
                    </div>
                </div>

                {/* Power & Performance Section */}
                <div className="space-y-4 py-4">
                    <h2 className="text-lg font-semibold font-archivo">Power & Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="powerConsumptionMax">Power Consumption Max (W)</Label>
                            <Input
                                id="powerConsumptionMax"
                                type="number"
                                {...register("powerConsumptionMax")}
                                placeholder="e.g., 500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="powerConsumptionTypical">Power Consumption Typical (W)</Label>
                            <Input
                                id="powerConsumptionTypical"
                                type="number"
                                {...register("powerConsumptionTypical")}
                                placeholder="e.g., 300"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="refreshRate">Refresh Rate (Hz) *</Label>
                            <Input
                                id="refreshRate"
                                type="number"
                                {...register("refreshRate")}
                                placeholder="e.g., 1920"
                            />
                            {errors.refreshRate && (
                                <p className="text-sm text-red-500">{errors.refreshRate.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="scanRateDenominator">Scan Rate Denominator *</Label>
                            <Input
                                id="scanRateDenominator"
                                type="number"
                                {...register("scanRateDenominator")}
                                placeholder="e.g., 16"
                            />
                            {errors.scanRateDenominator && (
                                <p className="text-sm text-red-500">{errors.scanRateDenominator.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="powerRedundancy">Power Redundancy *</Label>
                            <Controller
                                name="powerRedundancy"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select power redundancy" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.powerRedundancy && (
                                <p className="text-sm text-red-500">{errors.powerRedundancy.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="memoryOnModule">Memory on Module *</Label>
                            <Controller
                                name="memoryOnModule"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select memory on module" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.memoryOnModule && (
                                <p className="text-sm text-red-500">{errors.memoryOnModule.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smartModule">Smart Module *</Label>
                            <Controller
                                name="smartModule"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select smart module" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.smartModule && (
                                <p className="text-sm text-red-500">{errors.smartModule.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="controlSystem">Control System *</Label>
                            <Controller
                                name="controlSystem"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select control system" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Colorlight">Colorlight</SelectItem>
                                            <SelectItem value="Novastar">Novastar</SelectItem>
                                            <SelectItem value="Brompton">Brompton</SelectItem>
                                            <SelectItem value="LINSN">LINSN</SelectItem>
                                            <SelectItem value="other">Other (specify)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.controlSystem && (
                                <p className="text-sm text-red-500">{errors.controlSystem.message}</p>
                            )}
                        </div>
                        {controlSystem === "other" && (
                            <div className="space-y-2">
                                <Label htmlFor="controlSystemOther">Control System (Specify) *</Label>
                                <Input
                                    id="controlSystemOther"
                                    {...register("controlSystemOther")}
                                    placeholder="Enter control system name"
                                />
                                {errors.controlSystemOther && (
                                    <p className="text-sm text-red-500">{errors.controlSystemOther.message}</p>
                                )}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="inputVoltage">Input Voltage</Label>
                            <Input
                                id="inputVoltage"
                                {...register("inputVoltage")}
                                placeholder="e.g., 100-240V AC"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="receivingCard">Receiving Card</Label>
                            <Input
                                id="receivingCard"
                                {...register("receivingCard")}
                                placeholder="Enter receiving card"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="heatDissipation">Heat Dissipation</Label>
                            <Input
                                id="heatDissipation"
                                {...register("heatDissipation")}
                                placeholder="Enter heat dissipation"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mtbfPowerSupply">MTBF Power Supply (hours)</Label>
                            <Input
                                id="mtbfPowerSupply"
                                type="number"
                                {...register("mtbfPowerSupply")}
                                placeholder="e.g., 50000"
                            />
                        </div>
                    </div>
                </div>

                {/* Operating Conditions Section */}
                <div className="space-y-4 py-4">
                    <h2 className="text-lg font-semibold font-archivo">Operating Conditions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="operatingTemperature">Operating Temperature</Label>
                            <Input
                                id="operatingTemperature"
                                {...register("operatingTemperature")}
                                placeholder="e.g., -40°C to 55°C"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="operatingHumidity">Operating Humidity</Label>
                            <Input
                                id="operatingHumidity"
                                {...register("operatingHumidity")}
                                placeholder="e.g., 10% to 80% RH"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ipRating">IP Rating</Label>
                            <Input
                                id="ipRating"
                                {...register("ipRating")}
                                placeholder="e.g., IP65"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ledModulesPerCabinet">LED Modules per Cabinet</Label>
                            <Input
                                id="ledModulesPerCabinet"
                                {...register("ledModulesPerCabinet")}
                                placeholder="e.g., 4x2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cooling">Cooling *</Label>
                            <Controller
                                name="cooling"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select cooling type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="convection">Convection</SelectItem>
                                            <SelectItem value="fan">Fan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.cooling && (
                                <p className="text-sm text-red-500">{errors.cooling.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Support & Warranty Section */}
                <div className="space-y-4 py-4">
                    <h2 className="text-lg font-semibold font-archivo">Support & Warranty</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="support">Support</Label>
                            <Controller
                                name="support"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select support" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="frontendside">Frontend Side</SelectItem>
                                            <SelectItem value="backside">Backside</SelectItem>
                                            <SelectItem value="frontside and backside">Frontside and Backside</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.support && (
                                <p className="text-sm text-red-500">{errors.support.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="warrantyPeriod">Warranty Period (months)</Label>
                            <Input
                                id="warrantyPeriod"
                                type="number"
                                {...register("warrantyPeriod")}
                                placeholder="e.g., 24"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="monitoringFunctionEn">Monitoring Function (EN)</Label>
                            <Textarea
                                id="monitoringFunctionEn"
                                {...register("monitoringFunctionEn")}
                                placeholder="Enter monitoring function in English"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="monitoringFunctionDe">Monitoring Function (DE)</Label>
                            <Textarea
                                id="monitoringFunctionDe"
                                {...register("monitoringFunctionDe")}
                                placeholder="Enter monitoring function in German"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="additionalCertification">Additional Certification</Label>
                            <Textarea
                                id="additionalCertification"
                                {...register("additionalCertification")}
                                placeholder="Enter additional certification"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emc">EMC</Label>
                            <Textarea
                                id="emc"
                                {...register("emc")}
                                placeholder="Enter EMC information"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="safety">Safety</Label>
                            <Textarea
                                id="safety"
                                {...register("safety")}
                                placeholder="Enter safety information"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supportDuringWarrantyEn">Support During Warranty (EN)</Label>
                            <Textarea
                                id="supportDuringWarrantyEn"
                                {...register("supportDuringWarrantyEn")}
                                placeholder="Enter support during warranty in English"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supportDuringWarrantyDe">Support During Warranty (DE)</Label>
                            <Textarea
                                id="supportDuringWarrantyDe"
                                {...register("supportDuringWarrantyDe")}
                                placeholder="Enter support during warranty in German"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supportAfterWarrantyEn">Support After Warranty (EN)</Label>
                            <Textarea
                                id="supportAfterWarrantyEn"
                                {...register("supportAfterWarrantyEn")}
                                placeholder="Enter support after warranty in English"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supportAfterWarrantyDe">Support After Warranty (DE)</Label>
                            <Textarea
                                id="supportAfterWarrantyDe"
                                {...register("supportAfterWarrantyDe")}
                                placeholder="Enter support after warranty in German"
                                rows={3}
                            />
                        </div>
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
                                variant="outline"
                                size="lg"
                                
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
                            {productImages.map((file, index) => (
                                <div key={index} className="relative">
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
                                        onClick={() => removeImage(index)}
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
                        {submitting ? "Creating Product..." : "Create Product"}
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
        </div>
    );
}


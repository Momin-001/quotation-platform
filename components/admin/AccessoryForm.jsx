"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const productGroups = ["Mechanics", "Service", "Software", "Maintenance"];

const accessorySchema = z.object({
    productName: z.string().min(1, "Product name is required"),
    productNumber: z.string().min(1, "Product number is required"),
    shortText: z.string().optional(),
    longText: z.string().optional(),
    productGroup: z.string().min(1, "Product group is required").refine(
        (val) => productGroups.includes(val),
        { message: "Invalid product group" }
    ),
    unit: z.string().optional(),
    manufacturer: z.string().optional(),
    supplier: z.string().optional(),
    purchasePrice: z.union([z.string(), z.number()]).optional(),
    retailPrice: z.union([z.string(), z.number()]).optional(),
    leadTime: z.string().optional(),
});

const defaultValues = {
    productName: "",
    productNumber: "",
    shortText: "",
    longText: "",
    productGroup: "",
    unit: "",
    manufacturer: "",
    supplier: "",
    purchasePrice: "",
    retailPrice: "",
    leadTime: "",
};

export default function AccessoryForm({ mode = "add", initialData = null }) {
    const router = useRouter();
    const isEdit = mode === "edit";

    const formDefaultValues = initialData ? {
        productName: initialData.productName || "",
        productNumber: initialData.productNumber || "",
        shortText: initialData.shortText || "",
        longText: initialData.longText || "",
        productGroup: initialData.productGroup || "",
        unit: initialData.unit || "",
        manufacturer: initialData.manufacturer || "",
        supplier: initialData.supplier || "",
        purchasePrice: initialData.purchasePrice?.toString() || "",
        retailPrice: initialData.retailPrice?.toString() || "",
        leadTime: initialData.leadTime || "",
    } : defaultValues;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(accessorySchema),
        defaultValues: formDefaultValues,
    });

    const onSubmit = async (data) => {
        try {
            const url = isEdit
                ? `/api/admin/accessories/${initialData.id}`
                : "/api/admin/accessories";
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to save accessory");
            }

            toast.success(response.message || `Accessory ${isEdit ? "updated" : "created"} successfully`);
            router.push("/admin/products");
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <Label>Product Name *</Label>
                        <Input
                            {...register("productName")}
                            placeholder="e.g. M-Halterung-FUHD217"
                            className={errors.productName ? "border-red-500" : ""}
                        />
                        {errors.productName && (
                            <p className="text-sm text-red-500">{errors.productName.message}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label>Product Number *</Label>
                        <Input
                            {...register("productNumber")}
                            placeholder="e.g. M-700120"
                            className={errors.productNumber ? "border-red-500" : ""}
                            disabled={isEdit}
                        />
                        {errors.productNumber && (
                            <p className="text-sm text-red-500">{errors.productNumber.message}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label>Product Group *</Label>
                        <Controller
                            name="productGroup"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={errors.productGroup ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select product group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productGroups.map((group) => (
                                            <SelectItem key={group} value={group}>{group}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.productGroup && (
                            <p className="text-sm text-red-500">{errors.productGroup.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Descriptions */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Descriptions</h3>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label>Short Text</Label>
                        <Input
                            {...register("shortText")}
                            placeholder="Brief product description"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Long Text</Label>
                        <Textarea
                            {...register("longText")}
                            placeholder="Detailed product description"
                            rows={4}
                        />
                    </div>
                </div>
            </div>

            {/* Supply & Pricing */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Supply & Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <Label>Unit</Label>
                        <Input
                            {...register("unit")}
                            placeholder="e.g. 1, pcs, set"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Manufacturer</Label>
                        <Input {...register("manufacturer")} placeholder="e.g. Hagor" />
                    </div>
                    <div className="space-y-1">
                        <Label>Supplier</Label>
                        <Input {...register("supplier")} placeholder="e.g. LEDALL" />
                    </div>
                    <div className="space-y-1">
                        <Label>Purchase Price (€)</Label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...register("purchasePrice")}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Retail Price (€)</Label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...register("retailPrice")}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Lead Time</Label>
                        <Input
                            {...register("leadTime")}
                            placeholder="e.g. 20 Days"
                        />
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
                <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting && <Spinner className="h-4 w-4 mr-2" />}
                    {isEdit ? "Update Accessory" : "Add Accessory"}
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

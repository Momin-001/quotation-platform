"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const defaultFormData = {
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
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState(() => {
        if (initialData) {
            return {
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
                ? `/api/admin/accessories/${initialData.id}`
                : "/api/admin/accessories";
            const method = mode === "edit" ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to save accessory");
            }

            toast.success(response.message || `Accessory ${mode === "edit" ? "updated" : "created"} successfully`);
            router.push("/admin/products");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
                <h3 className="text-lg font-semibold font-archivo mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <Label>Product Name *</Label>
                        <Input
                            value={formData.productName}
                            onChange={(e) => handleChange("productName", e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Product Number *</Label>
                        <Input
                            value={formData.productNumber}
                            onChange={(e) => handleChange("productNumber", e.target.value)}
                            required
                            disabled={mode === "edit"}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Product Group *</Label>
                        <Select
                            value={formData.productGroup}
                            onValueChange={(val) => handleChange("productGroup", val)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select product group" />
                            </SelectTrigger>
                            <SelectContent>
                                {productGroups.map((group) => (
                                    <SelectItem key={group} value={group}>{group}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                            value={formData.shortText}
                            onChange={(e) => handleChange("shortText", e.target.value)}
                            placeholder="Brief product description"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Long Text</Label>
                        <Textarea
                            value={formData.longText}
                            onChange={(e) => handleChange("longText", e.target.value)}
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
                            value={formData.unit}
                            onChange={(e) => handleChange("unit", e.target.value)}
                            placeholder="e.g. 1, pcs, set"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Manufacturer</Label>
                        <Input
                            value={formData.manufacturer}
                            onChange={(e) => handleChange("manufacturer", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Supplier</Label>
                        <Input
                            value={formData.supplier}
                            onChange={(e) => handleChange("supplier", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Purchase Price (€)</Label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.purchasePrice}
                            onChange={(e) => handleChange("purchasePrice", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Retail Price (€)</Label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.retailPrice}
                            onChange={(e) => handleChange("retailPrice", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Lead Time</Label>
                        <Input
                            value={formData.leadTime}
                            onChange={(e) => handleChange("leadTime", e.target.value)}
                            placeholder="e.g. 20 Days"
                        />
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
                <Button type="submit" disabled={loading} size="lg">
                    {loading && <Spinner className="h-4 w-4 mr-2" />}
                    {mode === "edit" ? "Update Accessory" : "Add Accessory"}
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

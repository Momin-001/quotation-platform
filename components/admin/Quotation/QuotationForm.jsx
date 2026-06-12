import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import QuotationCatalogDropDown from "@/components/admin/Quotation/QuotationCatalogDropDown";
import { getQuotationDefaultUnitPrice } from "@/lib/helpers/helpers";

export default function QuotationForm({ 
    item, 
    onUpdate, 
    onRemove, 
    isMainProduct = false,
    productDisabled = false,
    isOptionalItem = false,
    isAdditionalItem = false,
    label = "Product"
}) {
    const handleChange = (field, value) => {
        onUpdate({ ...item, [field]: value });
    };

    const handleProductChange = (product) => {
        onUpdate({
            ...item,
            product,
            unitPrice: getQuotationDefaultUnitPrice(product, { isOptionalItem, isAdditionalItem }),
        });
    };

    const catalogType = isOptionalItem ? "accessory" : isAdditionalItem ? "controller" : "product";

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold ">{label}</h3>
                {onRemove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product
                    </label>
                    <QuotationCatalogDropDown
                        catalogType={catalogType}
                        value={item.product}
                        onChange={handleProductChange}
                        disabled={productDisabled}
                    />
                </div>

                {/* Quantity */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                    </label>
                    <Input
                        type="number"
                        min="1"
                        value={item.product?.isCustom ? item.product?.customTotalCabinets : item.quantity || ""}
                        onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 1)}
                        placeholder="0"
                        disabled={isMainProduct}
                    />
                </div>

                {/* Unit Price */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price (€)
                    </label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice || ""}
                        onChange={(e) => handleChange("unitPrice", e.target.value)}
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Discount % */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount %
                    </label>
                    <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discountPercentage || ""}
                        onChange={(e) => handleChange("discountPercentage", e.target.value)}
                        placeholder="0%"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                    </label>
                    <Textarea
                        value={item.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Write here"
                        rows={2}
                        className="resize-none"
                    />
                </div>
            </div>
        </div>
    );
}

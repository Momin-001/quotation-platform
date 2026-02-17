import QuotationForm from "@/components/admin/Quotation/QuotationForm";
import { Plus } from "lucide-react";

export default function QuotationBuilderSection({
    title,
    titleColor,
    borderColor,
    bgColor,
    productData,
    onUpdateProduct,
    optionalItems,
    onAddOptional,
    onUpdateOptional,
    onRemoveOptional,
    isMainProduct = false,
    productFromEnquiry = false,
    onAddAlternative,
    showAddAlternativeButton = false,
}) {
    return (
        <div className={`${bgColor} rounded-xl p-6 border-2 ${borderColor}`}>
            <h2 className={`text-xl font-bold font-archivo mb-4 ${titleColor}`}>{title}</h2>
            
            {productData ? (
                <div className="space-y-4">
                    {/* Main Product Form */}
                    <QuotationForm
                        item={productData}
                        onUpdate={onUpdateProduct}
                        isMainProduct={isMainProduct}
                        productDisabled={productFromEnquiry}
                        label={isMainProduct ? "Main Product" : "Alternative Product"}
                    />

                    {/* Optional Products */}
                    {optionalItems.length > 0 && (
                        <div className="ml-4 border-l-3 border-blue-300 pl-4 space-y-4">
                            <h4 className="text-sm font-semibold text-blue-700">Optional Products</h4>
                            {optionalItems.map((optItem, optIndex) => (
                                <QuotationForm
                                    key={optIndex}
                                    item={optItem}
                                    onUpdate={(updated) => onUpdateOptional(optIndex, updated)}
                                    onRemove={() => onRemoveOptional(optIndex)}
                                    isOptionalItem={true}
                                    label={`Optional Product ${optIndex + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Add Optional Products Button */}
                    <div className="ml-4">
                        <button
                            type="button"
                            onClick={onAddOptional}
                            className="w-full border-2 border-dashed border-blue-300 rounded-lg py-3 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Optional Product
                        </button>
                    </div>
                </div>
            ) : showAddAlternativeButton ? (
                <button
                    type="button"
                    onClick={onAddAlternative}
                    className="w-full border-2 border-dashed border-green-400 rounded-lg py-6 text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add Alternative Product
                </button>
            ) : null}
        </div>
    );
}
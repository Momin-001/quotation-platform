import { calculateItemTotal, formatCurrency } from "@/lib/helpers";
import Image from "next/image";

export default function ProductItemDisplay({ product, quantity, unitPrice, description, taxPercentage, discountPercentage, badge, badgeColor }) {
    const total = calculateItemTotal(unitPrice, quantity, taxPercentage, discountPercentage);
    
    return (
        <div className="flex items-start gap-4 py-4">
            <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border">
                {product?.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.productName || "Product"}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">
                                {product?.productName || "Unknown Product"}
                            </h4>
                            {product?.sourceType === "controller" && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">Controller</span>
                            )}
                            {product?.sourceType === "accessory" && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                                    {product.productGroup || "Accessory"}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">
                            (Artikel: {product?.productNumber || "N/A"})
                        </p>
                        {badge && (
                            <span className={`inline-block mt-1 px-2 py-0.5 ${badgeColor} text-white text-xs rounded`}>
                                {badge}
                            </span>
                        )}
                        {description && (
                            <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                                {description}
                            </p>
                        )}
                    </div>
                    <div className="text-right shrink-0">
                        <div className="grid grid-cols-3 gap-8 text-sm">
                            <div>
                                <span className="text-gray-500">Qty:</span>{" "}
                                <span className="font-medium">{quantity || 1}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Unit:</span>{" "}
                                <span className="font-medium">{formatCurrency(unitPrice || 0)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Total:</span>{" "}
                                <span className="font-semibold">{formatCurrency(total)}</span>
                            </div>
                        </div>
                        {(taxPercentage > 0 || discountPercentage > 0) && (
                            <div className="text-xs text-gray-500 mt-1">
                                {taxPercentage > 0 && <span>Tax: {taxPercentage}%</span>}
                                {taxPercentage > 0 && discountPercentage > 0 && <span> | </span>}
                                {discountPercentage > 0 && <span>Discount: {discountPercentage}%</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
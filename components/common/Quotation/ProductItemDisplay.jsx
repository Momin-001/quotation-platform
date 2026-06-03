import { calculateLineNetAfterDiscount, formatCurrency } from "@/lib/helpers/helpers";
import Image from "next/image";


export default function ProductItemDisplay({product, quantity, unitPrice, description, discountPercentage, badge, badgeColor}) {
    const lineNet = calculateLineNetAfterDiscount(unitPrice, quantity, discountPercentage);

    const qtyLabel = product?.isCustom ? "Cabinets:" : "Qty:";

    const pricingRows = [
        {
            label: qtyLabel,
            value: quantity || 1,
            valueClass: "font-medium",
        },
        {
            label: "Unit:",
            value: formatCurrency(unitPrice || 0),
            valueClass: "font-medium",
        },
        {
            label: "Net:",
            value: formatCurrency(lineNet),
            valueClass: "font-semibold",
        },
    ];

    return (
        <div className="flex flex-col sm:flex-row gap-4 py-4">
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

            <div className="flex flex-1 min-w-0 flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 lg:gap-8">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-gray-900 wrap-break-word">
                            {product?.productName || "Unknown Product"}
                        </h4>
                        {product?.sourceType === "controller" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 shrink-0">
                                Controller
                            </span>
                        )}
                        {product?.sourceType === "accessory" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 shrink-0">
                                {product.productGroup || "Accessory"}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 break-all">
                        (Artikel: {product?.productNumber || "N/A"})
                    </p>
                    {badge && (
                        <span
                            className={`inline-block mt-1 px-2 py-0.5 ${badgeColor} text-white text-xs rounded`}
                        >
                            {badge}
                        </span>
                    )}
                    {description && (
                        <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap wrap-break-word">
                            {description}
                        </p>
                    )}
                </div>

                <div className="w-full md:w-auto md:shrink-0 border-t border-gray-100 pt-3 md:border-t-0 md:pt-0 md:text-right">
                    <div className="flex flex-col gap-2.5 text-sm md:min-w-40 lg:min-w-48">
                        <div className="flex justify-between gap-6">
                        {pricingRows.map((row) => (
                            <div
                                key={row.label}
                                className="flex items-baseline justify-between gap-4 md:justify-end md:gap-3"
                            >
                                <span className="text-gray-500 shrink-0">{row.label}</span>
                                <span className={`tabular-nums break-all text-right ${row.valueClass}`}>
                                    {row.value}
                                </span>
                            </div>
                        ))}
                        </div>
                        {discountPercentage > 0 && (
                            <div className="flex items-baseline gap-4 md:justify-end md:gap-3 text-xs text-gray-500">
                                <span className="shrink-0">Discount:</span>
                                <span className="font-medium tabular-nums text-right">
                                    {discountPercentage}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

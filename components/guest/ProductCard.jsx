"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

function formatEnumLabel(value) {
    if (value == null || value === "") return "N/A";
    return String(value)
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatDesign(value) {
    if (value == null || value === "") return "N/A";
    return formatEnumLabel(value);
}

function formatSpecialTypes(product) {
    if (!product.specialTypes) return "N/A";
    if (product.specialTypes === "Other" && product.specialTypesOther) {
        return product.specialTypesOther;
    }
    return formatEnumLabel(product.specialTypes);
}

/**
 * Single product card for listing and related sections.
 * - **listing** (default): plain card; wrap with `<Link href={...}>` on the listing page.
 * - **related**: eye icon opens detail page; shows Design + Special Types; card itself is not a link.
 */
export default function ProductCard({ product, className = "", variant = "listing" }) {
    const isRelated = variant === "related";

    return (
        <div
            className={cn(
                "bg-white border rounded-lg overflow-hidden",
                isRelated && "shadow-sm",
                className
            )}
        >
            <div className="relative aspect-square bg-gray-100">
                {product.images && product.images.length > 0 ? (
                    <Image
                        src={product.images[0]}
                        alt={product.productName}
                        fill
                        className="object-contain"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
                {isRelated ? (
                    <Link
                        href={`/products/${product.id}`}
                        className="absolute top-2 right-2 z-10 flex h-14 w-14 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                        aria-label="View product details"
                    >
                        <Eye className="h-5 w-5" />
                    </Link>
                ) : null}
            </div>
            <div className="p-4">
                <h3
                    className={cn(
                        "font-bold font-open-sans text-xl mb-1",
                        isRelated && "uppercase"
                    )}
                >
                    {product.productName}
                </h3>
                <p
                    className={cn(
                        "text-lg font-open-sans mb-1",
                        isRelated && "text-gray-600"
                    )}
                >
                    {product.productNumber}
                </p>
                <p className="text-sm font-semibold font-open-sans bg-secondary text-white uppercase rounded-md px-4 py-1 w-fit">
                    {product.areaOfUse || "N/A"}
                </p>
                {isRelated ? (
                    <div className="grid grid-cols-2 gap-3 mt-3  font-open-sans">
                        <div>
                            <p className="text-lg">Design</p>
                            <p className="font-bold text-lg">{formatDesign(product.design)}</p>
                        </div>
                        <div>
                            <p className="text-lg">Special Types</p>
                            <p className="font-bold text-lg">{formatSpecialTypes(product)}</p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

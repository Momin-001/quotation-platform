"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
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

export default function ProductCard({ product, className = "", variant = "listing" }) {
    const isRelated = variant === "related";

    return (
        <article
            className={cn(
                "flex flex-col h-full bg-white border border-border/60 rounded-xl overflow-hidden transition-all duration-300",
                "hover:shadow-lg hover:border-primary/25 hover:-translate-y-0.5",
                isRelated && "shadow-sm",
                className
            )}
        >
            <div className="relative aspect-square bg-white overflow-hidden border-b border-border/40">
                {product.images && product.images.length > 0 ? (
                    <Image
                        src={product.images[0]}
                        alt={product.productName}
                        fill
                        className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground/60">
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}
                {isRelated ? (
                    <Link
                        href={`/products/${product.id}`}
                        className="absolute top-2.5 right-2.5 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                        aria-label="View product details"
                    >
                        <Eye className="h-4 w-4" />
                    </Link>
                ) : null}
            </div>

            <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2">
                <h3
                    className={cn(
                        "font-semibold  text-base sm:text-lg leading-snug line-clamp-2 text-foreground",
                        isRelated && "uppercase tracking-wide"
                    )}
                >
                    {product.productName}
                </h3>
                <p
                    className={cn(
                        "text-xs sm:text-sm text-muted-foreground font-mono tracking-tight",
                        isRelated && "text-foreground/70"
                    )}
                >
                    {product.productNumber}
                </p>
                <span className="inline-flex self-start text-[11px] sm:text-xs font-semibold uppercase tracking-wide bg-secondary text-primary-foreground rounded-md px-2.5 py-1 mt-0.5">
                    {product.areaOfUse || "N/A"}
                </span>

                {isRelated ? (
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/50">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Design</p>
                            <p className="text-sm font-semibold text-foreground">{formatDesign(product.design)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Special Types</p>
                            <p className="text-sm font-semibold text-foreground">{formatSpecialTypes(product)}</p>
                        </div>
                    </div>
                ) : null}
            </div>
        </article>
    );
}

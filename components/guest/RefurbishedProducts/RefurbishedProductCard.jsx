"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export default function RefurbishedProductCard({ product, className = "" }) {
    return (
        <article
            className={cn(
                "flex flex-col h-full bg-white border border-border/60 rounded-xl overflow-hidden transition-all duration-300",
                "hover:shadow-lg hover:border-primary/25 hover:-translate-y-0.5",
                className
            )}
        >
            <div className="relative aspect-square bg-white overflow-hidden border-b border-border/40">
                {product.images && product.images.length > 0 ? (
                    <Image
                        src={product.images[0]}
                        alt={product.serie}
                        fill
                        className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground/60">
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}
                {product.levelOfQuality ? (
                    <span className="absolute top-2.5 left-2.5 z-10 text-[11px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded-md px-2.5 py-1">
                        {product.levelOfQuality}
                    </span>
                ) : null}
            </div>

            <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2">
                <h3 className="font-semibold text-base sm:text-lg leading-snug line-clamp-2 text-foreground">
                    {product.serie}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono tracking-tight">
                    {product.productNumber}
                </p>
                <span className="inline-flex self-start text-[11px] sm:text-xs font-semibold uppercase tracking-wide bg-secondary text-primary-foreground rounded-md px-2.5 py-1 mt-0.5">
                    {product.areaOfUse || "N/A"}
                </span>
                {product.sellingPrice ? (
                    <p className="text-base font-bold text-foreground mt-1">
                        $ {Number(product.sellingPrice).toLocaleString()}
                    </p>
                ) : null}
            </div>
        </article>
    );
}

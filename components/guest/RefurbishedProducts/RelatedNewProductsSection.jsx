"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/guest/Products/ProductCard";

// Shows up to 4 NEW products sharing the refurbished product's area of use.
// Cards link to /products/[slug] (the related route returns new products).
export default function RelatedNewProductsSection({ refurbishedProductId }) {
    const [items, setItems] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!refurbishedProductId) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/refurbished-products/${refurbishedProductId}/related`);
                const json = await res.json();
                if (!cancelled) setItems(json.success && Array.isArray(json.data) ? json.data : []);
            } catch {
                if (!cancelled) setItems([]);
            } finally {
                if (!cancelled) setReady(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [refurbishedProductId]);

    if (!ready || !items || items.length === 0) return null;

    return (
        <section className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-border/60">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight mb-6 md:mb-8">
                Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {items.map((product) => (
                    <ProductCard key={product.id} product={product} variant="related" />
                ))}
            </div>
        </section>
    );
}

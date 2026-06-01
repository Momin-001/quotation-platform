"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/guest/ProductCard";

import { useTranslations } from "next-intl";

export default function RelatedProductsSection({ productId }) {
    const t = useTranslations("RelatedProducts");
    const [items, setItems] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!productId) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/products/${productId}/related`);
                const json = await res.json();
                if (!cancelled && json.success && Array.isArray(json.data)) {
                    setItems(json.data);
                } else if (!cancelled) {
                    setItems([]);
                }
            } catch {
                if (!cancelled) setItems([]);
            } finally {
                if (!cancelled) setReady(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [productId]);

    if (!ready || !items || items.length === 0) {
        return null;
    }

    return (
        <section className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-border/60">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold  text-foreground leading-tight tracking-tight mb-6 md:mb-8">
                {t("title")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {items.map((product) => (
                    <ProductCard key={product.id} product={product} variant="related" />
                ))}
            </div>
        </section>
    );
}

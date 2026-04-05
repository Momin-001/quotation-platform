"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/guest/ProductCard";

export default function RelatedProductsSection({ productId, language = "en" }) {
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
        <section className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-[55px] font-bold font-archivo mb-6">
                {language === "de" ? "Ähnliche Produkte" : "Related Products"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((product) => (
                    <ProductCard key={product.id} product={product} variant="related" />
                ))}
            </div>
        </section>
    );
}

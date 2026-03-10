"use client";

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const RichTextEditor = lazy(() => import("@/components/admin/RichTextEditor"));

export default function QuotationPdfTab({ onSaveHandlerReady }) {
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState({
        sectionOfferHtml: "",
        sectionConditionsHtml: "",
        sectionOptionsHtml: "",
    });

    useEffect(() => {
        fetchDefaults();
    }, []);

    const fetchDefaults = async () => {
        try {
            const res = await fetch("/api/admin/quotations/section-defaults");
            const response = await res.json();
            if (response.success) {
                setSections({
                    sectionOfferHtml: response.data.sectionOfferHtml || "",
                    sectionConditionsHtml: response.data.sectionConditionsHtml || "",
                    sectionOptionsHtml: response.data.sectionOptionsHtml || "",
                });
            }
        } catch {
            toast.error("Failed to load quotation section defaults");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/quotations/section-defaults", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sections),
            });
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            toast.success("Default quotation sections saved");
            return { success: true };
        } catch (err) {
            toast.error(err.message || "Failed to save defaults");
            return { success: false };
        }
    }, [sections]);

    useEffect(() => {
        onSaveHandlerReady?.(handleSave);
    }, [handleSave, onSaveHandlerReady]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner className="h-6 w-6" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Edit the default content for quotation PDF sections. These defaults are copied into every new quotation. 
                You can also override them per-quotation from the quotation detail page.
            </p>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    1. Unser Angebot / Our Offer
                </label>
                <Suspense fallback={<div className="border rounded-lg p-3 min-h-[120px] bg-gray-50 animate-pulse" />}>
                    <RichTextEditor
                        content={sections.sectionOfferHtml}
                        onChange={(html) =>
                            setSections((prev) => ({ ...prev, sectionOfferHtml: html }))
                        }
                    />
                </Suspense>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    3. Konditionen / Conditions
                </label>
                <Suspense fallback={<div className="border rounded-lg p-3 min-h-[120px] bg-gray-50 animate-pulse" />}>
                    <RichTextEditor
                        content={sections.sectionConditionsHtml}
                        onChange={(html) =>
                            setSections((prev) => ({ ...prev, sectionConditionsHtml: html }))
                        }
                    />
                </Suspense>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    5. Optionen / Options
                </label>
                <Suspense fallback={<div className="border rounded-lg p-3 min-h-[120px] bg-gray-50 animate-pulse" />}>
                    <RichTextEditor
                        content={sections.sectionOptionsHtml}
                        onChange={(html) =>
                            setSections((prev) => ({ ...prev, sectionOptionsHtml: html }))
                        }
                    />
                </Suspense>
            </div>
        </div>
    );
}

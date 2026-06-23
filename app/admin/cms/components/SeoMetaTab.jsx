"use client";

import { useEffect, useCallback, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Advisory length limits — Google typically truncates beyond these.
const TITLE_LIMIT = 60;
const DESC_LIMIT = 160;

function CharCounter({ value = "", limit }) {
    const len = (value || "").length;
    const over = len > limit;
    return (
        <span className={`text-xs ${over ? "text-red-500" : "text-muted-foreground"}`}>
            {len}/{limit}
        </span>
    );
}

export default function SeoMetaTab({ onSaveHandlerReady }) {
    const [loading, setLoading] = useState(true);

    const { register, control, reset, watch } = useForm({
        defaultValues: { pages: [] },
    });

    const { fields } = useFieldArray({ control, name: "pages" });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/page-seo");
            const data = await res.json();
            if (data.success) {
                reset({
                    pages: data.data.map((p) => ({
                        pageKey: p.pageKey,
                        label: p.label,
                        titleDe: p.titleDe || "",
                        titleEn: p.titleEn || "",
                        descriptionDe: p.descriptionDe || "",
                        descriptionEn: p.descriptionEn || "",
                        noindex: Boolean(p.noindex),
                    })),
                });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to fetch page SEO");
        } finally {
            setLoading(false);
        }
    }, [reset]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onSave = useCallback(async () => {
        try {
            const pages = watch("pages");
            const res = await fetch("/api/admin/page-seo", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pages),
            });
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to save page SEO");
            }
            toast.success(response.message || "Page SEO saved successfully");
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false };
        }
    }, [watch]);

    useEffect(() => {
        if (onSaveHandlerReady) {
            onSaveHandlerReady(onSave);
        }
    }, [onSave, onSaveHandlerReady]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <Spinner className="h-6 w-6" />
                    <span>Loading page SEO...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Edit the SEO title and meta description shown in search results for each main
                page, in German (DE) and English (EN). Leave English blank to reuse the German
                copy. Enable <strong>No-index</strong> to keep a page out of search engines.
            </p>

            {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">{field.label}</h3>
                        <Controller
                            control={control}
                            name={`pages.${index}.noindex`}
                            render={({ field: f }) => (
                                <label className="flex items-center gap-2 text-sm">
                                    No-index
                                    <Switch
                                        checked={!!f.value}
                                        onCheckedChange={f.onChange}
                                        className="data-[state=checked]:bg-secondary"
                                    />
                                </label>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Meta Title (DE)</Label>
                                <CharCounter value={watch(`pages.${index}.titleDe`)} limit={TITLE_LIMIT} />
                            </div>
                            <Input
                                {...register(`pages.${index}.titleDe`)}
                                placeholder="LED Videowand kaufen | … | ProLEDALL"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Meta Title (EN)</Label>
                                <CharCounter value={watch(`pages.${index}.titleEn`)} limit={TITLE_LIMIT} />
                            </div>
                            <Input
                                {...register(`pages.${index}.titleEn`)}
                                placeholder="Buy LED Video Walls | … | ProLEDALL"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Meta Description (DE)</Label>
                                <CharCounter value={watch(`pages.${index}.descriptionDe`)} limit={DESC_LIMIT} />
                            </div>
                            <Textarea
                                rows={3}
                                {...register(`pages.${index}.descriptionDe`)}
                                placeholder="Beschreibung für Suchmaschinen…"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Meta Description (EN)</Label>
                                <CharCounter value={watch(`pages.${index}.descriptionEn`)} limit={DESC_LIMIT} />
                            </div>
                            <Textarea
                                rows={3}
                                {...register(`pages.${index}.descriptionEn`)}
                                placeholder="Description for search engines…"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

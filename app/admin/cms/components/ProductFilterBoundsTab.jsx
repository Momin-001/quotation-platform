"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function ProductFilterBoundsTab({ onSaveHandlerReady }) {
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        pixelPitchMin: "",
        pixelPitchMax: "",
        powerConsumptionMaxMin: "",
        powerConsumptionMaxMax: "",
        powerConsumptionTypicalMin: "",
        powerConsumptionTypicalMax: "",
    });

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/product-filter-bounds");
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            const d = json.data;
            setForm({
                pixelPitchMin: String(d.pixelPitchMin),
                pixelPitchMax: String(d.pixelPitchMax),
                powerConsumptionMaxMin: String(d.powerConsumptionMaxMin),
                powerConsumptionMaxMax: String(d.powerConsumptionMaxMax),
                powerConsumptionTypicalMin: String(d.powerConsumptionTypicalMin),
                powerConsumptionTypicalMax: String(d.powerConsumptionTypicalMax),
            });
        } catch (e) {
            toast.error(e.message || "Failed to load product filter bounds");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleSave = useCallback(async () => {
        const pixelPitchMin = parseFloat(form.pixelPitchMin);
        const pixelPitchMax = parseFloat(form.pixelPitchMax);
        const powerConsumptionMaxMin = parseInt(form.powerConsumptionMaxMin, 10);
        const powerConsumptionMaxMax = parseInt(form.powerConsumptionMaxMax, 10);
        const powerConsumptionTypicalMin = parseInt(form.powerConsumptionTypicalMin, 10);
        const powerConsumptionTypicalMax = parseInt(form.powerConsumptionTypicalMax, 10);
        if (
            Number.isNaN(pixelPitchMin) ||
            Number.isNaN(pixelPitchMax) ||
            Number.isNaN(powerConsumptionMaxMin) ||
            Number.isNaN(powerConsumptionMaxMax) ||
            Number.isNaN(powerConsumptionTypicalMin) ||
            Number.isNaN(powerConsumptionTypicalMax)
        ) {
            toast.error("Please enter valid numbers for all bounds");
            return { success: false };
        }
        try {
            const res = await fetch("/api/admin/product-filter-bounds", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pixelPitchMin,
                    pixelPitchMax,
                    powerConsumptionMaxMin,
                    powerConsumptionMaxMax,
                    powerConsumptionTypicalMin,
                    powerConsumptionTypicalMax,
                }),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            toast.success("Product filter bounds saved");
            return { success: true };
        } catch (e) {
            toast.error(e.message || "Failed to save");
            return { success: false };
        }
    }, [form]);

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

    const row = (title, children) => (
        <div className="space-y-3">
            <h3 className="font-semibold text-base">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Set the minimum and maximum values shown on the public products page for pixel pitch and power
                consumption range filters. Products are only filtered when shoppers narrow the range below the full
                span.
            </p>

            {row("Pixel pitch (mm)", (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="pixelPitchMin">Minimum</Label>
                        <Input
                            id="pixelPitchMin"
                            type="number"
                            step="0.01"
                            value={form.pixelPitchMin}
                            onChange={(e) => setForm((f) => ({ ...f, pixelPitchMin: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="pixelPitchMax">Maximum</Label>
                        <Input
                            id="pixelPitchMax"
                            type="number"
                            step="0.01"
                            value={form.pixelPitchMax}
                            onChange={(e) => setForm((f) => ({ ...f, pixelPitchMax: e.target.value }))}
                        />
                    </div>
                </div>
            ))}

            {row("Power consumption max (W)", (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="powerMaxMin">Minimum</Label>
                        <Input
                            id="powerMaxMin"
                            type="number"
                            step="1"
                            value={form.powerConsumptionMaxMin}
                            onChange={(e) => setForm((f) => ({ ...f, powerConsumptionMaxMin: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="powerMaxMax">Maximum</Label>
                        <Input
                            id="powerMaxMax"
                            type="number"
                            step="1"
                            value={form.powerConsumptionMaxMax}
                            onChange={(e) => setForm((f) => ({ ...f, powerConsumptionMaxMax: e.target.value }))}
                        />
                    </div>
                </div>
            ))}

            {row("Power consumption typical (W)", (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="powerTypMin">Minimum</Label>
                        <Input
                            id="powerTypMin"
                            type="number"
                            step="1"
                            value={form.powerConsumptionTypicalMin}
                            onChange={(e) => setForm((f) => ({ ...f, powerConsumptionTypicalMin: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="powerTypMax">Maximum</Label>
                        <Input
                            id="powerTypMax"
                            type="number"
                            step="1"
                            value={form.powerConsumptionTypicalMax}
                            onChange={(e) => setForm((f) => ({ ...f, powerConsumptionTypicalMax: e.target.value }))}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const PERSON_HEIGHT_M = 1.6;
const OUTLINE_BOX = { width: 190, height: 130 };
/** Same figure the full preview canvas draws. public/person.jpg is 600x995. */
const PERSON_SRC = "/person.jpg";
const PERSON_ASPECT = 600 / 995;
/** Breathing room between the figure and the wall, in viewBox units. */
const PERSON_GAP = 6;

/** Rows mirror the Screen Info section, so the labels reuse its translation keys. */
function buildRows(t) {
    return {
        cabinet: [
            { key: "ledTechnology", label: t("ledTechnology"), get: (s) => `${s.config.ledTechnology || ""}${s.config.ledTechnologyOther ? ` - ${s.config.ledTechnologyOther}` : ""}`.trim() },
            { key: "brightness", label: t("brightnessNits"), get: (s) => s.config.brightnessValue },
            { key: "pixelPitch", label: t("pixelPitch"), get: (s) => s.config.pixelPitch },
            { key: "refreshRate", label: t("refreshRateHz"), get: (s) => s.config.refreshRate },
            { key: "cabinetWidth", label: t("cabinetWidth"), get: (s) => s.config.cabinetWidth },
            { key: "cabinetHeight", label: t("cabinetHeight"), get: (s) => s.config.cabinetHeight },
        ],
        summary: [
            { key: "totalCabinets", label: t("totalCabinets"), get: (s) => `${s.computed.totalCabinets}` },
            { key: "totalResolution", label: t("totalResolution"), get: (s) => (s.computed.totalResH && s.computed.totalResV ? `${s.computed.totalResH} × ${s.computed.totalResV} px` : "") },
            { key: "dimension", label: t("dimension"), get: (s) => s.computed.dimension },
            { key: "displayArea", label: t("displayArea"), get: (s) => (s.computed.displayArea ? `${s.computed.displayArea} m²` : "") },
            { key: "totalWeight", label: t("totalWeight"), get: (s) => (s.computed.totalWeight ? `${s.computed.totalWeight} kg` : "") },
            { key: "powerMax", label: t("powerMax"), get: (s) => (s.computed.powerMax ? `${s.computed.powerMax} kW` : "") },
            { key: "powerTypical", label: t("powerTypical"), get: (s) => (s.computed.powerTypical ? `${s.computed.powerTypical} kW` : "") },
        ],
    };
}

/**
 * Wall drawn to a scale shared across every column, so the rectangles are
 * directly comparable. Cabinet seams and a 1.6 m human silhouette give the size
 * something to read against, the same cues the full preview canvas uses.
 */
function WallOutline({ snapshot, scale }) {
    const wM = snapshot.config.screenWidth || 0;
    const hM = snapshot.config.screenHeight || 0;
    if (!wM || !hM) return null;

    const w = wM * scale;
    const h = hM * scale;
    const personH = PERSON_HEIGHT_M * scale;
    const personW = personH * PERSON_ASPECT;
    const gap = personH > 0 ? personW + PERSON_GAP : 0;

    const { countH, countV } = snapshot.computed.cabInfo || { countH: 1, countV: 1 };
    const baseY = OUTLINE_BOX.height;

    return (
        <svg
            viewBox={`0 0 ${OUTLINE_BOX.width} ${OUTLINE_BOX.height}`}
            className="w-full h-[130px]"
            role="img"
            aria-label={snapshot.computed.dimension}
        >
            {/* 1.6 m figure for scale, standing on the same ground line as the wall */}
            {personH > 4 ? (
                <image
                    href={PERSON_SRC}
                    x={2}
                    y={baseY - personH}
                    width={personW}
                    height={personH}
                    preserveAspectRatio="xMidYMax meet"
                />
            ) : null}

            <rect
                x={2 + gap}
                y={baseY - h}
                width={w}
                height={h}
                className="fill-[#1a2d4a] stroke-primary"
                strokeWidth={1.5}
            />

            {/* Cabinet seams, capped so a large wall stays legible */}
            {countH <= 40 &&
                Array.from({ length: Math.max(0, countH - 1) }, (_, i) => (
                    <line
                        key={`v${i}`}
                        x1={2 + gap + ((i + 1) * w) / countH}
                        y1={baseY - h}
                        x2={2 + gap + ((i + 1) * w) / countH}
                        y2={baseY}
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth={0.5}
                    />
                ))}
            {countV <= 40 &&
                Array.from({ length: Math.max(0, countV - 1) }, (_, i) => (
                    <line
                        key={`h${i}`}
                        x1={2 + gap}
                        y1={baseY - h + ((i + 1) * h) / countV}
                        x2={2 + gap + w}
                        y2={baseY - h + ((i + 1) * h) / countV}
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth={0.5}
                    />
                ))}
        </svg>
    );
}

export default function LeditorComparisonDialog({ open, onOpenChange, snapshots = [] }) {
    const t = useTranslations("Leditor");

    // Keep the original display numbers so a populated Display 3 stays "Display 3".
    const columns = useMemo(
        () =>
            snapshots
                .map((snapshot, index) => ({ snapshot, index }))
                .filter((c) => c.snapshot),
        [snapshots]
    );

    const rows = useMemo(() => buildRows(t), [t]);

    // One scale for every wall so the columns are directly comparable.
    //
    // The figure is sized from the same scale, so it has to be part of the fit:
    // width must hold figure + gap + widest wall, and height must hold whichever
    // is taller, the tallest wall or the 1.6 m figure.
    const scale = useMemo(() => {
        const maxW = Math.max(...columns.map((c) => c.snapshot.config.screenWidth || 0), 0.001);
        const maxH = Math.max(
            ...columns.map((c) => c.snapshot.config.screenHeight || 0),
            PERSON_HEIGHT_M
        );
        const personWidthPerScale = PERSON_HEIGHT_M * PERSON_ASPECT;
        return Math.min(
            (OUTLINE_BOX.width - 4 - PERSON_GAP) / (maxW + personWidthPerScale),
            (OUTLINE_BOX.height - 6) / maxH
        );
    }, [columns]);

    const gridCols =
        columns.length >= 3 ? "grid-cols-[minmax(140px,1fr)_repeat(3,minmax(150px,1fr))]"
            : columns.length === 2 ? "grid-cols-[minmax(140px,1fr)_repeat(2,minmax(150px,1fr))]"
                : "grid-cols-[minmax(140px,1fr)_minmax(150px,1fr)]";

    const renderGroup = (title, groupRows) => (
        <>
            <div className={`grid ${gridCols} bg-muted/40`}>
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
                    {title}
                </div>
                {columns.map((c) => (
                    <div key={c.index} className="px-3 py-2" />
                ))}
            </div>
            {groupRows.map((row) => {
                const values = columns.map((c) => {
                    const v = row.get(c.snapshot);
                    return v === null || v === undefined || v === "" ? null : String(v);
                });
                // Skip a row nobody has a value for.
                if (values.every((v) => v === null)) return null;
                const varies = new Set(values.filter(Boolean)).size > 1;

                return (
                    <div key={row.key} className={`grid ${gridCols} border-t border-border/50`}>
                        <div className="px-3 py-2 text-sm text-muted-foreground">{row.label}</div>
                        {values.map((v, i) => (
                            <div
                                key={columns[i].index}
                                className={`px-3 py-2 text-sm ${varies ? "font-semibold text-foreground" : "text-foreground/80"}`}
                            >
                                {v ?? "—"}
                            </div>
                        ))}
                    </div>
                );
            })}
        </>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl lg:max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="text-lg">{t("comparisonTitle")}</DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed">
                        {t("comparisonSubtitle")}
                    </DialogDescription>
                </DialogHeader>

                {columns.length < 2 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        {t("comparisonHint")}
                    </p>
                ) : (
                    <div className="max-h-[70vh] overflow-y-auto overflow-x-auto rounded-lg border border-border/60">
                        <div className="min-w-[640px]">
                            {/* Header: display name, product, scaled wall */}
                            <div className={`grid ${gridCols} bg-muted/30`}>
                                <div className="px-3 py-3" />
                                {columns.map((c) => (
                                    <div key={c.index} className="px-3 py-3">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            {t("display", { number: c.index + 1 })}
                                        </p>
                                        <p className="text-sm font-semibold text-foreground leading-snug">
                                            {c.snapshot.product?.productName || t("noProductSelected")}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className={`grid ${gridCols} border-t border-border/50`}>
                                <div className="px-3 py-2 text-sm text-muted-foreground self-end pb-4">
                                    {t("relativeSize")}
                                </div>
                                {columns.map((c) => (
                                    <div key={c.index} className="px-3 py-2">
                                        <WallOutline snapshot={c.snapshot} scale={scale} />
                                    </div>
                                ))}
                            </div>

                            {renderGroup(t("cabinetSpecs"), rows.cabinet)}
                            {renderGroup(t("customSummary"), rows.summary)}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

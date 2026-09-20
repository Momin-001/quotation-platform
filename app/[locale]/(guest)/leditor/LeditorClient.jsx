"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Columns3, Copy } from "lucide-react";

import SchemaScript from "@/components/guest/SchemaScript";
import BreadCrumb from "@/components/guest/BreadCrumb";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASE_URL } from "@/lib/constants";
import LeditorWorkspace from "@/components/guest/Leditor/LeditorWorkspace";
import LeditorComparisonDialog from "@/components/guest/Leditor/LeditorComparisonDialog";

const DISPLAY_COUNT = 3;

/**
 * Shell around three LEDitor workspaces.
 *
 * Every workspace stays mounted (TabsContent forceMount) so a configured display
 * survives tab switching; each is told whether it is the visible one. Workspaces
 * push a snapshot upward, which is all the comparison dialog needs.
 */
export default function LeditorClient() {
    const t = useTranslations("Leditor");
    const locale = useLocale();
    const searchParams = useSearchParams();

    const [activeIndex, setActiveIndex] = useState(0);
    const [snapshots, setSnapshots] = useState(() => Array(DISPLAY_COUNT).fill(null));
    const [copyPayloads, setCopyPayloads] = useState(() => Array(DISPLAY_COUNT).fill(null));
    const [compareOpen, setCompareOpen] = useState(false);

    const siteUrl = BASE_URL || "https://www.proledall.eu";
    const canonicalPath = locale === "en" ? "/en/leditor" : "/leditor";
    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "LED Display B2B Matchmaking & Configuration",
        serviceType: "B2B Procurement Matchmaking",
        description:
            "ProLEDALL matches B2B buyers with certified LED manufacturers across Europe. Use LEDITOR to configure your screen dimensions, mounting, IP rating, and controller — then receive multiple comparable quotes.",
        provider: { "@type": "Organization", name: "ProLEDALL", url: siteUrl },
        areaServed: { "@type": "Place", name: "Europe" },
        url: `${siteUrl}${canonicalPath}`,
        audience: {
            "@type": "Audience",
            audienceType: "System Integrators, AV Planners, LED Distributors",
        },
    };

    // Stable identity: the workspaces depend on this in an effect.
    const handleSnapshotChange = useCallback((index, snapshot) => {
        setSnapshots((prev) => {
            if (prev[index] === snapshot) return prev;
            const next = [...prev];
            next[index] = snapshot;
            return next;
        });
    }, []);

    const configuredCount = snapshots.filter(Boolean).length;
    const canCompare = configuredCount >= 2;

    // Only Display 1 honours ?product=<slug>.
    const preselectSlug = useMemo(() => searchParams.get("product"), [searchParams]);

    const handleCopyFromFirst = () => {
        const source = snapshots[0];
        if (!source || activeIndex === 0) return;
        setCopyPayloads((prev) => {
            const next = [...prev];
            next[activeIndex] = {
                token: `${Date.now()}-${activeIndex}`,
                product: source.product,
                config: source.config,
            };
            return next;
        });
    };

    const canCopy = activeIndex !== 0 && Boolean(snapshots[0]);

    return (
        <div className="min-h-screen">
            <SchemaScript data={serviceSchema} />
            <BreadCrumb
                title={t("title")}
                breadcrumbs={[
                    { label: t("breadcrumbHome"), href: "/" },
                    { label: t("title") },
                ]}
            />

            <div className="container mx-auto px-4 lg:px-6 py-6 sm:py-8 space-y-4">
                <Tabs
                    value={String(activeIndex)}
                    onValueChange={(v) => setActiveIndex(Number(v))}
                    className="w-full"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
                            {Array.from({ length: DISPLAY_COUNT }, (_, i) => (
                                <TabsTrigger
                                    key={i}
                                    value={String(i)}
                                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                                >
                                    <span className="truncate">
                                        {t("display", { number: i + 1 })}
                                    </span>
                                    {snapshots[i] ? (
                                        <span
                                            aria-hidden="true"
                                            className="ml-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70"
                                        />
                                    ) : null}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className="flex items-center gap-2">
                            {canCopy ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCopyFromFirst}
                                    className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    {t("copyFromFirst")}
                                </Button>
                            ) : null}

                            <Button
                                type="button"
                                onClick={() => setCompareOpen(true)}
                                disabled={!canCompare}
                                title={canCompare ? undefined : t("comparisonHint")}
                            >
                                <Columns3 className="h-4 w-4 mr-2" />
                                {t("compare")}
                            </Button>
                        </div>
                    </div>

                    {Array.from({ length: DISPLAY_COUNT }, (_, i) => (
                        // forceMount keeps each display's configuration alive across
                        // switches, but it also stops Radix hiding inactive panels. Hide
                        // the panel itself rather than a child: the Tabs root is a flex
                        // column with a gap, so a zero-height panel would still add its
                        // gap and margin and push the active one further down per tab.
                        <TabsContent
                            key={i}
                            value={String(i)}
                            forceMount
                            className={activeIndex === i ? "mt-4" : "hidden"}
                        >
                            <LeditorWorkspace
                                displayIndex={i}
                                isActive={activeIndex === i}
                                preselectSlug={i === 0 ? preselectSlug : null}
                                onSnapshotChange={handleSnapshotChange}
                                copyPayload={copyPayloads[i]}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            <LeditorComparisonDialog
                open={compareOpen}
                onOpenChange={setCompareOpen}
                snapshots={snapshots}
            />
        </div>
    );
}

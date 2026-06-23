import { db } from "@/lib/db";
import { pageSeo } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { verifySuperAdmin } from "@/lib/helpers/auth-helpers";
import { PAGE_SEO_ORDER, defaultPageSeoRow } from "@/lib/i18n/seo-pages";

const VALID_KEYS = new Set(PAGE_SEO_ORDER.map((p) => p.key));

// GET /api/admin/page-seo - List SEO copy for all static pages (seeding any missing rows from defaults)
export async function GET() {
    try {
        const { isSuperAdmin, error } = await verifySuperAdmin();
        if (!isSuperAdmin) {
            return errorResponse(error || "Forbidden", 403);
        }

        const existing = await db.select().from(pageSeo);
        const byKey = new Map(existing.map((row) => [row.pageKey, row]));

        // Seed any page that doesn't have a row yet from the static defaults.
        const missing = PAGE_SEO_ORDER.filter((p) => !byKey.has(p.key)).map((p) =>
            defaultPageSeoRow(p.key)
        );
        if (missing.length) {
            const inserted = await db.insert(pageSeo).values(missing).returning();
            inserted.forEach((row) => byKey.set(row.pageKey, row));
        }

        // Return in the curated display order, attaching labels.
        const data = PAGE_SEO_ORDER.map((p) => ({
            ...byKey.get(p.key),
            label: p.label,
        }));

        return successResponse("Page SEO fetched successfully", data);
    } catch (err) {
        console.error("GET /api/admin/page-seo error:", err);
        return errorResponse("Failed to fetch page SEO", 500);
    }
}

// PUT /api/admin/page-seo - Upsert SEO copy for an array of pages
export async function PUT(req) {
    try {
        const { isSuperAdmin, error } = await verifySuperAdmin();
        if (!isSuperAdmin) {
            return errorResponse(error || "Forbidden", 403);
        }

        const body = await req.json();
        const rows = Array.isArray(body) ? body : body?.pages;
        if (!Array.isArray(rows)) {
            return errorResponse("Expected an array of page SEO entries", 400);
        }

        for (const row of rows) {
            if (!row?.pageKey || !VALID_KEYS.has(row.pageKey)) continue;

            const values = {
                pageKey: row.pageKey,
                titleEn: (row.titleEn ?? "").trim(),
                titleDe: (row.titleDe ?? "").trim(),
                descriptionEn: (row.descriptionEn ?? "").trim(),
                descriptionDe: (row.descriptionDe ?? "").trim(),
                noindex: Boolean(row.noindex),
            };

            await db
                .insert(pageSeo)
                .values(values)
                .onConflictDoUpdate({
                    target: pageSeo.pageKey,
                    set: {
                        titleEn: values.titleEn,
                        titleDe: values.titleDe,
                        descriptionEn: values.descriptionEn,
                        descriptionDe: values.descriptionDe,
                        noindex: values.noindex,
                        updatedAt: new Date(),
                    },
                });
        }

        const updated = await db.select().from(pageSeo);
        return successResponse("Page SEO updated successfully", updated);
    } catch (err) {
        console.error("PUT /api/admin/page-seo error:", err);
        return errorResponse("Failed to update page SEO", 500);
    }
}

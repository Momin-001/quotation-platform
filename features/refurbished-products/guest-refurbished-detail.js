import { cache } from "react";
import { db } from "@/lib/db";
import { refurbishedProducts } from "@/db/schema";
import { eq } from "drizzle-orm";

// Customer-facing columns (admin-only price-per-cabinet/m² and notes are excluded).
const DETAIL_COLUMNS = {
    id: true,
    slug: true,
    serie: true,
    productNumber: true,
    productDescription: true,
    oemBrand: true,
    metaTitleEn: true,
    metaTitleDe: true,
    metaDescriptionEn: true,
    metaDescriptionDe: true,
    productType: true,
    design: true,
    specialTypes: true,
    yearOfConstruction: true,
    operatingHours: true,
    pixelPitch: true,
    cabinetWidth: true,
    cabinetHeight: true,
    cabinetResolutionHorizontal: true,
    cabinetResolutionVertical: true,
    weightWithoutPackaging: true,
    ledTechnology: true,
    ledTechnologyOther: true,
    ledChipManufacturer: true,
    chipBonding: true,
    brightnessValue: true,
    ledDriver: true,
    inputVoltage: true,
    powerConsumptionMax: true,
    powerConsumptionTypical: true,
    refreshRate: true,
    scanRate: true,
    controlSystem: true,
    controlSystemOther: true,
    controller: true,
    ipRating: true,
    service: true,
    hangingBrackets: true,
    stackingSystem: true,
    flightCases: true,
    accessories: true,
    sellingPrice: true,
    stockLocation: true,
    stockPieces: true,
    leadtimeDays: true,
    levelOfQuality: true,
};

/** Fetch a guest-facing refurbished product by slug, with images + features. */
export const fetchGuestRefurbishedBySlug = cache(async function fetchGuestRefurbishedBySlug(slug) {
    if (!slug) return null;

    const product = await db.query.refurbishedProducts.findFirst({
        where: eq(refurbishedProducts.slug, slug),
        columns: DETAIL_COLUMNS,
        with: {
            areaOfUse: { columns: { name: true } },
            images: { columns: { imageUrl: true } },
            features: { columns: { feature: true } },
        },
    });

    if (!product) return null;

    return {
        ...product,
        areaOfUse: product.areaOfUse?.name ?? null,
        images: product.images?.map((image) => image.imageUrl) ?? [],
        features: product.features?.map((f) => f.feature) ?? [],
    };
});

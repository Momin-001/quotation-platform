/**
 * Fields that genuinely differ between products in the same related-products
 * group. Everything else is shared, so creating a sibling product seeds all the
 * other fields from an existing member and the admin only fills these in.
 *
 * Media (images, installation manual, maintenance guide, certificates PDF) is
 * also per-variant, but those are files rather than form fields and are handled
 * separately — a seeded form starts with no uploads attached.
 */
export const GROUP_VARIANT_FIELDS = [
    // Identity
    "productName",
    "productNumber",
    "slug",
    // Physical / electrical values that vary per variant
    "cabinetWidth",
    "cabinetHeight",
    "chipBonding",
    "brightnessValue",
    "contrastRatioNumerator",
    "contrastRatioDenominator",
    "drivingMethod",
    // SEO is written per product
    "metaTitleEn",
    "metaTitleDe",
    "metaDescriptionEn",
    "metaDescriptionDe",
];

/** Columns that are never copied because they belong to the row, not the spec. */
const ROW_FIELDS = [
    "id",
    "isActive",
    "createdAt",
    "updatedAt",
    "installationManualUrl",
    "installationManualPublicId",
    "maintenanceGuideUrl",
    "maintenanceGuidePublicId",
    "certificatesPdfUrl",
    "certificatesPdfPublicId",
];

const EXCLUDED = new Set([...GROUP_VARIANT_FIELDS, ...ROW_FIELDS]);

/** Strip a product row down to the values a sibling should inherit. */
export function pickSharedProductFields(product) {
    if (!product) return {};
    return Object.fromEntries(
        Object.entries(product).filter(([key]) => !EXCLUDED.has(key))
    );
}

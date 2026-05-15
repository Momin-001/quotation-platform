/**
 * Parse features JSON from admin form data.
 * @param {string | null | undefined} raw
 * @returns {{ en: string, de: string }[]}
 */
export function parseCategoryFeatures(raw) {
    if (!raw || typeof raw !== "string") return [];
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((f) => ({
                en: String(f?.en ?? "").trim(),
                de: String(f?.de ?? "").trim(),
            }))
            .filter((f) => f.en || f.de);
    } catch {
        return [];
    }
}

/**
 * Map a category row to homepage card fields for the active language.
 * @param {Record<string, unknown>} category
 * @param {"en" | "de"} lang
 */
export function categoryToShowcaseCard(category, lang) {
    const isDe = lang === "de";
    const features = Array.isArray(category.features) ? category.features : [];
    return {
        id: category.id,
        categoryName: category.name,
        title: (isDe ? category.titleDe : category.titleEn) || category.name,
        description: (isDe ? category.descriptionDe : category.descriptionEn) || "",
        features: features
            .map((f) => (isDe ? f?.de : f?.en) || f?.en || f?.de || "")
            .filter(Boolean),
        imageUrl: category.imageUrl || null,
    };
}

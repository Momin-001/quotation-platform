/**
 * Resolve a CMS field stored as baseNameEn / baseNameDe for the active locale.
 */
export function cmsField(record, baseName, locale) {
    if (!record) return "";
    const key = locale === "de" ? `${baseName}De` : `${baseName}En`;
    return record[key] ?? record[`${baseName}En`] ?? "";
}

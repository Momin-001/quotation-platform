/** Controller brand filter values — must match `controllers.brandName` in the DB. */
export const CONTROLLER_BRANDS = ["Colorlight", "Novastar", "Brompton", "LINSN", "Other"];

/** URL segment for a brand on /controllers/brand/[brandSlug]. */
export function controllerBrandSlug(brand) {
    return brand.toLowerCase();
}

/** Resolve a /controllers/brand/[brandSlug] segment back to the brand name. */
export function controllerBrandFromSlug(slug) {
    return (
        CONTROLLER_BRANDS.find((brand) => controllerBrandSlug(brand) === slug) ?? null
    );
}

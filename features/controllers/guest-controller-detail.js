import { cache } from "react";
import { db } from "@/lib/db";
import { controllers, productImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Fetch a single active controller by its URL slug together with its ordered
 * images. Returns the formatted controller object (with `images` and
 * `brandDisplay`) or null if not found / inactive.
 *
 * Shared by the guest controller API route and the server-rendered detail page.
 * Wrapped in React `cache` so `generateMetadata` and the page component share
 * a single query per request.
 */
export const fetchGuestControllerBySlug = cache(async function fetchGuestControllerBySlug(slug) {
    if (!slug) return null;

    const [controller] = await db
        .select()
        .from(controllers)
        .where(and(eq(controllers.slug, slug), eq(controllers.isActive, true)))
        .limit(1);

    if (!controller) return null;

    const imageRows = await db
        .select({ imageUrl: productImages.imageUrl })
        .from(productImages)
        .where(eq(productImages.controllerId, controller.id))
        .orderBy(productImages.imageOrder);

    return {
        ...controller,
        images: imageRows.map((r) => r.imageUrl),
        brandDisplay:
            controller.brandName === "Other"
                ? controller.brandNameOther || "Other"
                : controller.brandName || "N/A",
    };
});

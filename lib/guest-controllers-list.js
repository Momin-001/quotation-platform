import { db } from "@/lib/db";
import { controllers, productImages } from "@/db/schema";
import { desc, eq, and, ilike, or, inArray } from "drizzle-orm";

/**
 * Fetch active guest controllers for the listing page (server or API).
 */
export async function fetchGuestControllersListing({
    limit = 10,
    offset = 0,
    search = "",
    brand = "",
} = {}) {
    const conditions = [eq(controllers.isActive, true)];

    const brandTrimmed = (brand || "").trim();
    if (brandTrimmed) {
        conditions.push(eq(controllers.brandName, brandTrimmed));
    }

    const searchTrimmed = (search || "").trim();
    if (searchTrimmed) {
        conditions.push(
            or(ilike(controllers.interfaceName, `%${searchTrimmed}%`))
        );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const list = await db
        .select({
            id: controllers.id,
            interfaceName: controllers.interfaceName,
            controllerNumber: controllers.controllerNumber,
            brandName: controllers.brandName,
            brandNameOther: controllers.brandNameOther,
        })
        .from(controllers)
        .where(whereClause)
        .orderBy(desc(controllers.createdAt))
        .limit(limit)
        .offset(offset);

    const ids = list.map((c) => c.id);
    if (ids.length === 0) {
        return [];
    }

    const images = await db
        .select({
            controllerId: productImages.controllerId,
            imageUrl: productImages.imageUrl,
            imageOrder: productImages.imageOrder,
        })
        .from(productImages)
        .where(inArray(productImages.controllerId, ids))
        .orderBy(productImages.controllerId, productImages.imageOrder);

    const imagesByController = {};
    for (const row of images) {
        if (row.controllerId) {
            if (!imagesByController[row.controllerId]) {
                imagesByController[row.controllerId] = [];
            }
            imagesByController[row.controllerId].push(row.imageUrl);
        }
    }

    return list
        .filter((c) => (imagesByController[c.id]?.length || 0) > 0)
        .map((c) => ({
            ...c,
            images: imagesByController[c.id] || [],
            brandDisplay:
                c.brandName === "Other"
                    ? c.brandNameOther || "Other"
                    : c.brandName || "N/A",
        }));
}

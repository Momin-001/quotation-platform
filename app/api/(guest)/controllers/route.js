import { db } from "@/lib/db";
import { controllers, productImages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, eq, and, ilike, or, inArray } from "drizzle-orm";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = (searchParams.get("search") || "").trim();
        const brand = (searchParams.get("brand") || "").trim();

        const offset = (page - 1) * limit;

        const conditions = [eq(controllers.isActive, true)];

        if (brand) {
            conditions.push(eq(controllers.brandName, brand));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(controllers.interfaceName, `%${search}%`),
                )
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const list = await db
            .select({
                id: controllers.id,
                interfaceName: controllers.interfaceName,
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
            return successResponse("Controllers fetched successfully", []);
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
                if (!imagesByController[row.controllerId]) imagesByController[row.controllerId] = [];
                imagesByController[row.controllerId].push(row.imageUrl);
            }
        }

        const result = list
            .filter((c) => (imagesByController[c.id]?.length || 0) > 0)
            .map((c) => ({
                ...c,
                images: imagesByController[c.id] || [],
                brandDisplay: c.brandName === "Other" ? (c.brandNameOther || "Other") : (c.brandName || "N/A"),
            }));

        return successResponse("Controllers fetched successfully", result);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch controllers");
    }
}

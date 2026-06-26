import { refurbishedProducts } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { fetchGuestRefurbishedListing } from "@/features/refurbished-products/guest-refurbished-list";
import { ilike, or, and, eq, gte, lte, isNotNull } from "drizzle-orm";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        const search = searchParams.get("search") || "";
        const categoryId = searchParams.get("categoryId") || "";
        const productType = searchParams.get("productType") || "";
        const design = searchParams.get("design") || "";
        const hangingBrackets = searchParams.get("hangingBrackets") || "";
        const stackingSystem = searchParams.get("stackingSystem") || "";
        const flightCases = searchParams.get("flightCases") || "";
        const pixelPitchMin = searchParams.get("pixelPitchMin") || "";
        const pixelPitchMax = searchParams.get("pixelPitchMax") || "";

        const conditions = [eq(refurbishedProducts.isActive, true)];

        if (search) {
            conditions.push(
                or(
                    ilike(refurbishedProducts.serie, `%${search}%`),
                    ilike(refurbishedProducts.productNumber, `%${search}%`)
                )
            );
        }
        if (categoryId) conditions.push(eq(refurbishedProducts.areaOfUseId, categoryId));
        if (productType) conditions.push(eq(refurbishedProducts.productType, productType));
        if (design) conditions.push(eq(refurbishedProducts.design, design));
        if (hangingBrackets) conditions.push(eq(refurbishedProducts.hangingBrackets, hangingBrackets));
        if (stackingSystem) conditions.push(eq(refurbishedProducts.stackingSystem, stackingSystem));
        if (flightCases) conditions.push(eq(refurbishedProducts.flightCases, flightCases));

        if (pixelPitchMin && pixelPitchMax) {
            const pMin = parseFloat(pixelPitchMin);
            const pMax = parseFloat(pixelPitchMax);
            if (!Number.isNaN(pMin) && !Number.isNaN(pMax) && pMin <= pMax) {
                conditions.push(
                    and(
                        isNotNull(refurbishedProducts.pixelPitch),
                        gte(refurbishedProducts.pixelPitch, pMin.toFixed(2)),
                        lte(refurbishedProducts.pixelPitch, pMax.toFixed(2))
                    )
                );
            }
        }

        const whereClause = and(...conditions);
        const formatted = await fetchGuestRefurbishedListing({ limit, offset, whereClause });
        return successResponse("Refurbished products fetched successfully", formatted);
    } catch (error) {
        console.error("GET /api/refurbished-products error:", error);
        return errorResponse("Failed to fetch refurbished products", 500);
    }
}

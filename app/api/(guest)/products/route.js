import { db } from "@/lib/db";
import { products, productImages, productCertificates, certificates, categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, ilike, or, and, eq, sql } from "drizzle-orm";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const categoryId = searchParams.get("categoryId") || "";

        // Filter parameters
        const productType = searchParams.get("productType") || "";
        const design = searchParams.get("design") || "";
        const specialTypes = searchParams.get("specialTypes") || "";
        const application = searchParams.get("application") || "";
        const pixelPitch = searchParams.get("pixelPitch") || "";
        const ledTechnology = searchParams.get("ledTechnology") || "";
        const chipBonding = searchParams.get("chipBonding") || "";
        const brightnessControl = searchParams.get("brightnessControl") || "";
        const contrastRatio = searchParams.get("contrastRatio") || "";
        const powerConsumptionMax = searchParams.get("powerConsumptionMax") || "";
        const powerConsumptionTypical = searchParams.get("powerConsumptionTypical") || "";
        const refreshRate = searchParams.get("refreshRate") || "";
        const powerRedundancy = searchParams.get("powerRedundancy") || "";
        const memoryOnModule = searchParams.get("memoryOnModule") || "";
        const smartModule = searchParams.get("smartModule") || "";
        const controlSystem = searchParams.get("controlSystem") || "";
        const receivingCard = searchParams.get("receivingCard") || "";
        const ipRating = searchParams.get("ipRating") || "";
        const warrantyPeriod = searchParams.get("warrantyPeriod") || "";

        const offset = (page - 1) * limit;

        // Build where clause
        let conditions = [];

        // Search filter
        if (search) {
            conditions.push(
                or(
                    ilike(products.productName, `%${search}%`),
                    ilike(products.productNumber, `%${search}%`)
                )
            );
        }

        // Category filter
        if (categoryId) {
            conditions.push(eq(products.areaOfUseId, categoryId));
        }

        // Product Type filter
        if (productType) {
            conditions.push(eq(products.productType, productType));
        }

        // Design filter
        if (design) {
            conditions.push(eq(products.design, design));
        }

        // Special Types filter
        if (specialTypes) {
            conditions.push(eq(products.specialTypes, specialTypes));
        }

        // Application filter
        if (application) {
            conditions.push(eq(products.application, application));
        }

        // Pixel Pitch filter (decimal - exact match or range)
        if (pixelPitch) {
            const pitchNum = parseFloat(pixelPitch);
            if (!isNaN(pitchNum)) {
                conditions.push(eq(products.pixelPitch, pixelPitch));
            }
        }

        // LED Technology filter
        if (ledTechnology) {
            conditions.push(eq(products.ledTechnology, ledTechnology));
        }

        // Chip Bonding filter (ENUM)
        if (chipBonding) {
            conditions.push(eq(products.chipBonding, chipBonding));
        }

        // Brightness Control filter (text search)
        if (brightnessControl) {
            conditions.push(ilike(products.brightnessControl, `%${brightnessControl}%`));
        }

        // Contrast Ratio filter (integer match - numerator)
        if (contrastRatio) {
            const ratioNum = parseInt(contrastRatio);
            if (!isNaN(ratioNum)) {
                conditions.push(eq(products.contrastRatioNumerator, ratioNum));
            }
        }

        // Power Consumption Max filter (integer match)
        if (powerConsumptionMax) {
            const powerNum = parseInt(powerConsumptionMax);
            if (!isNaN(powerNum)) {
                conditions.push(eq(products.powerConsumptionMax, powerNum));
            }
        }

        // Power Consumption Typical filter (integer match)
        if (powerConsumptionTypical) {
            const powerNum = parseInt(powerConsumptionTypical);
            if (!isNaN(powerNum)) {
                conditions.push(eq(products.powerConsumptionTypical, powerNum));
            }
        }

        // Refresh Rate filter (integer match)
        if (refreshRate) {
            const refreshNum = parseInt(refreshRate);
            if (!isNaN(refreshNum)) {
                conditions.push(eq(products.refreshRate, refreshNum));
            }
        }

        // Power Redundancy filter (ENUM: yes/no)
        if (powerRedundancy !== "") {
            conditions.push(eq(products.powerRedundancy, powerRedundancy));
        }

        // Memory on Module filter (ENUM: yes/no)
        if (memoryOnModule !== "") {
            conditions.push(eq(products.memoryOnModule, memoryOnModule));
        }

        // Smart Module filter (ENUM: yes/no)
        if (smartModule !== "") {
            conditions.push(eq(products.smartModule, smartModule));
        }

        // Control System filter (ENUM - includes "other")
        if (controlSystem) {
            if (controlSystem === "other") {
                // Filter for products where controlSystem is "other" (has controlSystemOther value)
                conditions.push(
                    and(
                        eq(products.controlSystem, "other"),
                        sql`${products.controlSystemOther} IS NOT NULL`
                    )
                );
            } else {
                conditions.push(eq(products.controlSystem, controlSystem));
            }
        }

        // Receiving Card filter (text search)
        if (receivingCard) {
            conditions.push(ilike(products.receivingCard, `%${receivingCard}%`));
        }

        // IP Rating filter (text search)
        if (ipRating) {
            conditions.push(ilike(products.ipRating, `%${ipRating}%`));
        }

        // Warranty Period filter (integer match)
        if (warrantyPeriod) {
            const warrantyNum = parseInt(warrantyPeriod);
            if (!isNaN(warrantyNum)) {
                conditions.push(eq(products.warrantyPeriod, warrantyNum));
            }
        }

        // Build final where clause
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Fetch products with images, certificates, and category
        const allProducts = await db
            .select({
                id: products.id,
                productName: products.productName,
                productNumber: products.productNumber,
                areaOfUseId: products.areaOfUseId,
                categoryName: categories.name,
            })
            .from(products)
            .leftJoin(categories, eq(products.areaOfUseId, categories.id))
            .where(whereClause)
            .orderBy(desc(products.createdAt))
            .limit(limit)
            .offset(offset);

        // Fetch images and certificates for each product
        const productsWithDetails = await Promise.all(
            allProducts.map(async (product) => {
                // Get first product image
                const image = await db
                    .select()
                    .from(productImages)
                    .where(eq(productImages.productId, product.id))
                    .orderBy(productImages.imageOrder)
                    .limit(1)
                    .then((res) => res[0]);

                // Get product certificates
                const productCerts = await db
                    .select({
                        id: certificates.id,
                        name: certificates.name,
                        imageUrl: certificates.imageUrl,
                    })
                    .from(productCertificates)
                    .innerJoin(certificates, eq(productCertificates.certificateId, certificates.id))
                    .where(eq(productCertificates.productId, product.id));

                return {
                    ...product,
                    imageUrl: image?.imageUrl || null,
                    certificates: productCerts,
                };
            })
        );

        return successResponse("Products fetched successfully", productsWithDetails);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch products");
    }
}


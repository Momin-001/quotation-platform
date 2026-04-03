import { db } from "@/lib/db";
import { products, productImages, productCertificates, certificates, categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, ilike, or, and, eq, sql, gte, lte, isNotNull } from "drizzle-orm";

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
        const pixelPitchMin = searchParams.get("pixelPitchMin") || "";
        const pixelPitchMax = searchParams.get("pixelPitchMax") || "";
        const ledTechnology = searchParams.get("ledTechnology") || "";
        const ledLifespan = searchParams.get("ledLifespan") || "";
        const chipBonding = searchParams.get("chipBonding") || "";
        const brightnessControl = searchParams.get("brightnessControl") || "";
        const contrastRatio = searchParams.get("contrastRatio") || "";
        const viewingAngleHorizontal = searchParams.get("viewingAngleHorizontal") || "";
        const viewingAngleVertical = searchParams.get("viewingAngleVertical") || "";
        const powerConsumptionMax = searchParams.get("powerConsumptionMax") || "";
        const powerConsumptionTypical = searchParams.get("powerConsumptionTypical") || "";
        const powerConsumptionMaxMin = searchParams.get("powerConsumptionMaxMin") || "";
        const powerConsumptionMaxMax = searchParams.get("powerConsumptionMaxMax") || "";
        const powerConsumptionTypicalMin = searchParams.get("powerConsumptionTypicalMin") || "";
        const powerConsumptionTypicalMax = searchParams.get("powerConsumptionTypicalMax") || "";
        const refreshRate = searchParams.get("refreshRate") || "";
        const powerRedundancy = searchParams.get("powerRedundancy") || "";
        const memoryOnModule = searchParams.get("memoryOnModule") || "";
        const smartModule = searchParams.get("smartModule") || "";
        const controlSystem = searchParams.get("controlSystem") || "";
        const receivingCard = searchParams.get("receivingCard") || "";
        const ipRating = searchParams.get("ipRating") || "";
        const warrantyPeriod = searchParams.get("warrantyPeriod") || "";
        const supportDuringWarrantyEn = searchParams.get("supportDuringWarrantyEn") || "";
        const offset = (page - 1) * limit;

        // Build where clause
        let conditions = [];

        // Only show active products on guest side
        conditions.push(eq(products.isActive, true));

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

        // Application filter (products.application is text[], check if array contains the value)
        if (application) {
            conditions.push(sql`${products.application} @> ARRAY[${application}]::text[]`);
        }

        // Pixel Pitch filter: inclusive range (preferred) or legacy exact value
        if (pixelPitchMin && pixelPitchMax) {
            const pMin = parseFloat(pixelPitchMin);
            const pMax = parseFloat(pixelPitchMax);
            if (!Number.isNaN(pMin) && !Number.isNaN(pMax) && pMin <= pMax) {
                const lo = pMin.toFixed(2);
                const hi = pMax.toFixed(2);
                conditions.push(
                    and(
                        isNotNull(products.pixelPitch),
                        gte(products.pixelPitch, lo),
                        lte(products.pixelPitch, hi)
                    )
                );
            }
        } else if (pixelPitch) {
            const pitchNum = parseFloat(pixelPitch);
            if (!Number.isNaN(pitchNum)) {
                conditions.push(eq(products.pixelPitch, pixelPitch));
            }
        }

        // LED Technology filter
        if (ledTechnology) {
            conditions.push(eq(products.ledTechnology, ledTechnology));
        }

        // LED Lifespan filter (integer match)
        if (ledLifespan) {
            const lifespanNum = parseInt(ledLifespan);
            if (!isNaN(lifespanNum)) {
                conditions.push(eq(products.ledLifespan, lifespanNum));
            }
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

        // Viewing Angle Horizontal filter (text search)
        if (viewingAngleHorizontal) {
            conditions.push(ilike(products.viewingAngleHorizontal, `%${viewingAngleHorizontal}%`));
        }

        // Viewing Angle Vertical filter (text search)
        if (viewingAngleVertical) {
            conditions.push(ilike(products.viewingAngleVertical, `%${viewingAngleVertical}%`));
        }

        // Power consumption max: inclusive integer range or legacy exact match
        if (powerConsumptionMaxMin !== "" && powerConsumptionMaxMax !== "") {
            const pMin = parseInt(powerConsumptionMaxMin, 10);
            const pMax = parseInt(powerConsumptionMaxMax, 10);
            if (!Number.isNaN(pMin) && !Number.isNaN(pMax) && pMin <= pMax) {
                conditions.push(
                    and(
                        isNotNull(products.powerConsumptionMax),
                        gte(products.powerConsumptionMax, pMin),
                        lte(products.powerConsumptionMax, pMax)
                    )
                );
            }
        } else if (powerConsumptionMax) {
            const powerNum = parseInt(powerConsumptionMax, 10);
            if (!Number.isNaN(powerNum)) {
                conditions.push(eq(products.powerConsumptionMax, powerNum));
            }
        }

        // Power consumption typical: inclusive integer range or legacy exact match
        if (powerConsumptionTypicalMin !== "" && powerConsumptionTypicalMax !== "") {
            const pMin = parseInt(powerConsumptionTypicalMin, 10);
            const pMax = parseInt(powerConsumptionTypicalMax, 10);
            if (!Number.isNaN(pMin) && !Number.isNaN(pMax) && pMin <= pMax) {
                conditions.push(
                    and(
                        isNotNull(products.powerConsumptionTypical),
                        gte(products.powerConsumptionTypical, pMin),
                        lte(products.powerConsumptionTypical, pMax)
                    )
                );
            }
        } else if (powerConsumptionTypical) {
            const powerNum = parseInt(powerConsumptionTypical, 10);
            if (!Number.isNaN(powerNum)) {
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

        // Support During Warranty filter (ENUM: yes/no)
        if (supportDuringWarrantyEn !== "") {
            conditions.push(ilike(products.supportDuringWarrantyEn, `%${supportDuringWarrantyEn}%`));
        }

        // Build final where clause
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Fetch products with images, certificates, and category
        const allProducts = await db.query.products.findMany({
            where: whereClause,
            orderBy: desc(products.createdAt),
            limit: limit,
            offset: offset,
            columns: {
                id: true,
                productName: true,
                productNumber: true,
            },
            with: {
                areaOfUse: {
                    columns: {
                        name: true,
                    },
                },
                images: {
                    columns: {
                        imageUrl: true,
                    },
                },
                productCertificates: {
                    columns: {},
                    with: {
                        certificate: {
                            columns: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
                
            },
        });
        

        const formattedProducts = allProducts.flatMap((product) => ({
            ...product,
            areaOfUse: product.areaOfUse.name,
            images: product.images.flatMap((image) => image.imageUrl),
            productCertificates: product.productCertificates.flatMap((certificate) => certificate.certificate),
        }));
        return successResponse("Products fetched successfully", formattedProducts);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch products");
    }
}


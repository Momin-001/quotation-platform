import { db } from "@/lib/db";
import { products, productImages, productCertificates, certificates, categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, ilike, or, and, eq, sql, gte, lte, gt, lt, isNotNull } from "drizzle-orm";

/** Numeric brightness from text column (admin stores plain numbers). */
function brightnessNumericSql() {
    return sql`(CASE
        WHEN trim(${products.brightnessValue}) ~ '^[0-9]+(\\.[0-9]*)?$' THEN trim(${products.brightnessValue})::numeric
        ELSE NULL
    END)`;
}

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
        const brightnessValue = searchParams.get("brightnessValue") || "";
        const contrastRatio = searchParams.get("contrastRatio") || "";
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
        const warrantyPeriod = searchParams.get("warrantyPeriod") || "";
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

        // LED Lifespan: bucket tokens or legacy exact integer
        if (ledLifespan) {
            if (ledLifespan === "lt_50000") {
                conditions.push(and(isNotNull(products.ledLifespan), lt(products.ledLifespan, 50000)));
            } else if (ledLifespan === "50000_70000") {
                conditions.push(
                    and(isNotNull(products.ledLifespan), gte(products.ledLifespan, 50000), lte(products.ledLifespan, 70000))
                );
            } else if (ledLifespan === "70000_100000") {
                conditions.push(
                    and(isNotNull(products.ledLifespan), gte(products.ledLifespan, 70000), lte(products.ledLifespan, 100000))
                );
            } else if (ledLifespan === "gte_100000") {
                conditions.push(and(isNotNull(products.ledLifespan), gte(products.ledLifespan, 100000)));
            } else {
                const lifespanNum = parseInt(ledLifespan, 10);
                if (!Number.isNaN(lifespanNum)) {
                    conditions.push(eq(products.ledLifespan, lifespanNum));
                }
            }
        }

        // Chip Bonding filter (ENUM)
        if (chipBonding) {
            conditions.push(eq(products.chipBonding, chipBonding));
        }

        // Brightness (text column storing numeric string): bucket tokens or legacy substring search
        if (brightnessValue) {
            const b = brightnessValue;
            const bn = brightnessNumericSql();
            if (b === "lt_1000") {
                conditions.push(and(isNotNull(products.brightnessValue), sql`${bn} IS NOT NULL`, lt(bn, 1000)));
            } else if (b === "1000_2000") {
                conditions.push(and(isNotNull(products.brightnessValue), sql`${bn} IS NOT NULL`, gte(bn, 1000), lte(bn, 2000)));
            } else if (b === "2000_4000") {
                conditions.push(and(isNotNull(products.brightnessValue), sql`${bn} IS NOT NULL`, gte(bn, 2000), lte(bn, 4000)));
            } else if (b === "4000_6000") {
                conditions.push(and(isNotNull(products.brightnessValue), sql`${bn} IS NOT NULL`, gte(bn, 4000), lte(bn, 6000)));
            } else if (b === "6000_8000") {
                conditions.push(and(isNotNull(products.brightnessValue), sql`${bn} IS NOT NULL`, gte(bn, 6000), lte(bn, 8000)));
            } else if (b === "gte_8000") {
                conditions.push(and(isNotNull(products.brightnessValue), sql`${bn} IS NOT NULL`, gte(bn, 8000)));
            } else {
                conditions.push(ilike(products.brightnessValue, `%${brightnessValue}%`));
            }
        }

        // Contrast ratio (numerator): buckets or legacy exact match
        if (contrastRatio) {
            if (contrastRatio === "lt_3000") {
                conditions.push(and(isNotNull(products.contrastRatioNumerator), lt(products.contrastRatioNumerator, 3000)));
            } else if (contrastRatio === "3000_5000") {
                conditions.push(
                    and(
                        isNotNull(products.contrastRatioNumerator),
                        gte(products.contrastRatioNumerator, 3000),
                        lte(products.contrastRatioNumerator, 5000)
                    )
                );
            } else if (contrastRatio === "5000_10000") {
                conditions.push(
                    and(
                        isNotNull(products.contrastRatioNumerator),
                        gt(products.contrastRatioNumerator, 5000),
                        lte(products.contrastRatioNumerator, 10000)
                    )
                );
            } else if (contrastRatio === "gte_10000") {
                conditions.push(and(isNotNull(products.contrastRatioNumerator), gte(products.contrastRatioNumerator, 10000)));
            } else {
                const ratioNum = parseInt(contrastRatio, 10);
                if (!Number.isNaN(ratioNum)) {
                    conditions.push(eq(products.contrastRatioNumerator, ratioNum));
                }
            }
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

        // Refresh rate: bucket tokens or legacy exact integer
        if (refreshRate) {
            if (refreshRate === "lt_1000") {
                conditions.push(and(isNotNull(products.refreshRate), lt(products.refreshRate, 1000)));
            } else if (refreshRate === "1000_1920") {
                conditions.push(
                    and(isNotNull(products.refreshRate), gte(products.refreshRate, 1000), lte(products.refreshRate, 1920))
                );
            } else if (refreshRate === "gt_1920_le_3840") {
                conditions.push(and(isNotNull(products.refreshRate), gt(products.refreshRate, 1920), lte(products.refreshRate, 3840)));
            } else if (refreshRate === "gt_3840_le_7680") {
                conditions.push(and(isNotNull(products.refreshRate), gt(products.refreshRate, 3840), lte(products.refreshRate, 7680)));
            } else if (refreshRate === "gt_7680") {
                conditions.push(and(isNotNull(products.refreshRate), gt(products.refreshRate, 7680)));
            } else {
                const refreshNum = parseInt(refreshRate, 10);
                if (!Number.isNaN(refreshNum)) {
                    conditions.push(eq(products.refreshRate, refreshNum));
                }
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

        // Warranty period (months): dropdown exact tiers or premium >=60, or legacy exact int
        if (warrantyPeriod) {
            if (warrantyPeriod === "gte_60") {
                conditions.push(and(isNotNull(products.warrantyPeriod), gte(products.warrantyPeriod, 60)));
            } else if (warrantyPeriod === "12" || warrantyPeriod === "24" || warrantyPeriod === "36") {
                const m = parseInt(warrantyPeriod, 10);
                conditions.push(and(isNotNull(products.warrantyPeriod), eq(products.warrantyPeriod, m)));
            } else {
                const warrantyNum = parseInt(warrantyPeriod, 10);
                if (!Number.isNaN(warrantyNum)) {
                    conditions.push(eq(products.warrantyPeriod, warrantyNum));
                }
            }
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


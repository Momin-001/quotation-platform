import { db } from "@/lib/db";
import { enquiries, enquiryItems, quotations, products } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, desc, and, ne } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(req) {
    try {
        const {user, error} = await getCurrentUser();
        if (error) {
            return errorResponse(error, 401);
        }
        const body = await req.json();
        const { message, items } = body;

        if (!message || !items || !Array.isArray(items) || items.length === 0) {
            return errorResponse("Message and at least one product item are required", 400);
        }

        // Create enquiry
        const [enquiry] = await db
            .insert(enquiries)
            .values({
                userId: user.id,
                message: message.trim(),
                status: "pending",
            })
            .returning();

        // Create enquiry items (supports both regular cart and custom Leditor items)
        const itemsToInsert = items.map((item) => ({
            enquiryId: enquiry.id,
            productId: item.productId,
            quantity: item.quantity || 1,
            isCustom: item.isCustom || false,
            ...(item.isCustom && {
                customLedTechnology: item.customLedTechnology || null,
                customBrightnessValue: item.customBrightnessValue || null,
                customPixelPitch: item.customPixelPitch || null,
                customRefreshRate: item.customRefreshRate || null,
                customResolutionHorizontal: item.customResolutionHorizontal || null,
                customResolutionVertical: item.customResolutionVertical || null,
                customCabinetWidth: item.customCabinetWidth || null,
                customCabinetHeight: item.customCabinetHeight || null,
                customScreenWidth: item.customScreenWidth || null,
                customScreenHeight: item.customScreenHeight || null,
                // Calculated Leditor fields
                customTotalResolutionH: item.customTotalResolutionH || null,
                customTotalResolutionV: item.customTotalResolutionV || null,
                customWeight: item.customWeight || null,
                customDisplayArea: item.customDisplayArea || null,
                customDimension: item.customDimension || null,
                customPowerConsumptionMax: item.customPowerConsumptionMax || null,
                customPowerConsumptionTyp: item.customPowerConsumptionTyp || null,
                customTotalCabinets: item.customTotalCabinets || null,
            }),
        }));

        await db.insert(enquiryItems).values(itemsToInsert);

        return successResponse(
            "Enquiry submitted successfully",
            { enquiryId: enquiry.id }
        );
    } catch (error) {
        return errorResponse(error.message || "Failed to create enquiry");
    }
}

export async function GET(req) {
    try {
        const {user, error} = await getCurrentUser();
        if (error) {
            return errorResponse(error, 401);
        }
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let whereConditions = eq(enquiries.userId, user.id);
        
        if (status) {
            whereConditions = and(whereConditions, eq(enquiries.status, status));
        }

        const userEnquiries = await db.query.enquiries.findMany({
            where: whereConditions,
            orderBy: desc(enquiries.createdAt),
            with: {
                quotations: {
                    columns: {
                        id: true,
                        quotationNumber: true,
                    },
                },
                items: {
                    columns: {
                        isCustom: true,
                    },
                    with: {
                        product: {
                            columns: {
                                productName: true,
                                productNumber: true,
                            },
                        },
                    },
                },
            },
        });

        return successResponse("Enquiries fetched successfully", userEnquiries);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch enquiries");
    }
}

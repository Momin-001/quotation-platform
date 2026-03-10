import { db } from "@/lib/db";
import { userHeader } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/admin/user-header - Get user header content
export async function GET() {
    try {
        const userHeaderContent = await db.select().from(userHeader).limit(1).then((res) => res[0]);
        return successResponse("User header content fetched successfully", userHeaderContent);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch user header content");
    }
}

// PUT /api/admin/user-header - Update user header content
export async function PUT(req) {
    try {
        const body = await req.json();
        const {
            userHeaderMyEnquiryEn,
            userHeaderMyEnquiryDe,
            userHeaderMyQuotationEn,
            userHeaderMyQuotationDe,
            userHeaderMyAccountEn,
            userHeaderMyAccountDe,
            userHeaderMyCartEn,
            userHeaderMyCartDe,
        } = body;

        // Get existing user header or create new one
        const existing = await db.select().from(userHeader).limit(1).then((res) => res[0]);

        let result;
        if (existing) {
            // Update existing
            result = await db
                .update(userHeader)
                .set({
                    userHeaderMyEnquiryEn: userHeaderMyEnquiryEn || "",
                    userHeaderMyEnquiryDe: userHeaderMyEnquiryDe || "",
                    userHeaderMyQuotationEn: userHeaderMyQuotationEn || "",
                    userHeaderMyQuotationDe: userHeaderMyQuotationDe || "",
                    userHeaderMyAccountEn: userHeaderMyAccountEn || "",
                    userHeaderMyAccountDe: userHeaderMyAccountDe || "",
                    userHeaderMyCartEn: userHeaderMyCartEn || "",
                    userHeaderMyCartDe: userHeaderMyCartDe || "",
                    updatedAt: new Date(),
                })
                .returning();
        } else {
            // Create new
            result = await db
                .insert(userHeader)
                .values({
                    userHeaderMyEnquiryEn: userHeaderMyEnquiryEn || "",
                    userHeaderMyEnquiryDe: userHeaderMyEnquiryDe || "",
                    userHeaderMyQuotationEn: userHeaderMyQuotationEn || "",
                    userHeaderMyQuotationDe: userHeaderMyQuotationDe || "",
                    userHeaderMyAccountEn: userHeaderMyAccountEn || "",
                    userHeaderMyAccountDe: userHeaderMyAccountDe || "",
                    userHeaderMyCartEn: userHeaderMyCartEn || "",
                    userHeaderMyCartDe: userHeaderMyCartDe || "",
                })
                .returning();
        }

        return successResponse("User header content updated successfully", result[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to update user header content");
    }
}
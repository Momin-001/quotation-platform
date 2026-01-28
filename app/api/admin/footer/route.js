import { db } from "@/lib/db";
import { footer } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/admin/footer - Get footer content
export async function GET() {
    try {
        const footerContent = await db.select().from(footer).limit(1).then((res) => res[0]);

        // If no footer content exists, create default one
        if (!footerContent) {
            const defaultFooter = await db
                .insert(footer)
                .values({
                    descriptionEn: "",
                    descriptionDe: "",
                    ourAddressTitleEn: "",
                    ourAddressTitleDe: "",
                    quickLinksTitleEn: "",
                    quickLinksTitleDe: "",
                    quickLink1En: "",
                    quickLink1De: "",
                    quickLink2En: "",
                    quickLink2De: "",
                    quickLink3En: "",
                    quickLink3De: "",
                    quickLink4En: "",
                    quickLink4De: "",
                    quickLink5En: "",
                    quickLink5De: "",
                    newsletterTitleEn: "",
                    newsletterTitleDe: "",
                    emailPlaceholderEn: "",
                    emailPlaceholderDe: "",
                    subscribeButtonEn: "",
                    subscribeButtonDe: "",
                    copyrightTextEn: "",
                    copyrightTextDe: "",
                })
                .returning();

            return successResponse("Footer content fetched successfully", defaultFooter[0]);
        }

        return successResponse("Footer content fetched successfully", footerContent);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch footer content");
    }
}

// PUT /api/admin/footer - Update footer content
export async function PUT(req) {
    try {
        const body = await req.json();
        const {
            descriptionEn,
            descriptionDe,
            ourAddressTitleEn,
            ourAddressTitleDe,
            quickLinksTitleEn,
            quickLinksTitleDe,
            quickLink1En,
            quickLink1De,
            quickLink2En,
            quickLink2De,
            quickLink3En,
            quickLink3De,
            quickLink4En,
            quickLink4De,
            quickLink5En,
            quickLink5De,
            newsletterTitleEn,
            newsletterTitleDe,
            emailPlaceholderEn,
            emailPlaceholderDe,
            subscribeButtonEn,
            subscribeButtonDe,
            copyrightTextEn,
            copyrightTextDe,
        } = body;

        // Get existing footer or create new one
        const existing = await db.select().from(footer).limit(1).then((res) => res[0]);

        let result;
        if (existing) {
            // Update existing
            result = await db
                .update(footer)
                .set({
                    descriptionEn: descriptionEn || "",
                    descriptionDe: descriptionDe || "",
                    ourAddressTitleEn: ourAddressTitleEn || "",
                    ourAddressTitleDe: ourAddressTitleDe || "",
                    quickLinksTitleEn: quickLinksTitleEn || "",
                    quickLinksTitleDe: quickLinksTitleDe || "",
                    quickLink1En: quickLink1En || "",
                    quickLink1De: quickLink1De || "",
                    quickLink2En: quickLink2En || "",
                    quickLink2De: quickLink2De || "",
                    quickLink3En: quickLink3En || "",
                    quickLink3De: quickLink3De || "",
                    quickLink4En: quickLink4En || "",
                    quickLink4De: quickLink4De || "",
                    quickLink5En: quickLink5En || "",
                    quickLink5De: quickLink5De || "",
                    newsletterTitleEn: newsletterTitleEn || "",
                    newsletterTitleDe: newsletterTitleDe || "",
                    emailPlaceholderEn: emailPlaceholderEn || "",
                    emailPlaceholderDe: emailPlaceholderDe || "",
                    subscribeButtonEn: subscribeButtonEn || "",
                    subscribeButtonDe: subscribeButtonDe || "",
                    copyrightTextEn: copyrightTextEn || "",
                    copyrightTextDe: copyrightTextDe || "",
                    updatedAt: new Date(),
                })
                .returning();
        } else {
            // Create new
            result = await db
                .insert(footer)
                .values({
                    descriptionEn: descriptionEn || "",
                    descriptionDe: descriptionDe || "",
                    ourAddressTitleEn: ourAddressTitleEn || "",
                    ourAddressTitleDe: ourAddressTitleDe || "",
                    quickLinksTitleEn: quickLinksTitleEn || "",
                    quickLinksTitleDe: quickLinksTitleDe || "",
                    quickLink1En: quickLink1En || "",
                    quickLink1De: quickLink1De || "",
                    quickLink2En: quickLink2En || "",
                    quickLink2De: quickLink2De || "",
                    quickLink3En: quickLink3En || "",
                    quickLink3De: quickLink3De || "",
                    quickLink4En: quickLink4En || "",
                    quickLink4De: quickLink4De || "",
                    quickLink5En: quickLink5En || "",
                    quickLink5De: quickLink5De || "",
                    newsletterTitleEn: newsletterTitleEn || "",
                    newsletterTitleDe: newsletterTitleDe || "",
                    emailPlaceholderEn: emailPlaceholderEn || "",
                    emailPlaceholderDe: emailPlaceholderDe || "",
                    subscribeButtonEn: subscribeButtonEn || "",
                    subscribeButtonDe: subscribeButtonDe || "",
                    copyrightTextEn: copyrightTextEn || "",
                    copyrightTextDe: copyrightTextDe || "",
                })
                .returning();
        }

        return successResponse("Footer content updated successfully", result[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to update footer content");
    }
}


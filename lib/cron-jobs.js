import { quotations, enquiries } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and, or, lt, ne } from "drizzle-orm";

export async function checkExpiredQuotations() {
    let processed = 0;

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const expiredQuotations = await db
            .select({
                id: quotations.id,
                enquiryId: quotations.enquiryId,
                status: quotations.status,
                createdAt: quotations.createdAt,
            })
            .from(quotations)
            .where(
                and(
                    or(
                        eq(quotations.status, "pending"),
                        eq(quotations.status, "revision_requested")
                    ),
                    lt(quotations.createdAt, thirtyDaysAgo)
                )
            );

        if (expiredQuotations.length === 0) {
            return { processed };
        }

        for (const quotation of expiredQuotations) {
            try {
                const didUpdate = await db.transaction(async (tx) => {
                    const enquiry = await tx
                        .select({ status: enquiries.status })
                        .from(enquiries)
                        .where(eq(enquiries.id, quotation.enquiryId))
                        .limit(1)
                        .then((res) => res[0]);

                    if (enquiry && (enquiry.status === "completed" || enquiry.status === "cancelled")) {
                        return false;
                    }

                    const newerQuotation = await tx
                        .select({ id: quotations.id })
                        .from(quotations)
                        .where(
                            and(
                                eq(quotations.enquiryId, quotation.enquiryId),
                                ne(quotations.id, quotation.id),
                                ne(quotations.status, "draft"),
                                ne(quotations.status, "closed")
                            )
                        )
                        .limit(1);

                    if (newerQuotation.length > 0) {
                        return false;
                    }

                    const now = new Date();

                    await tx
                        .update(quotations)
                        .set({
                            status: "closed",
                            updatedAt: now,
                        })
                        .where(eq(quotations.id, quotation.id));

                    await tx
                        .update(enquiries)
                        .set({
                            status: "expired",
                            updatedAt: now,
                        })
                        .where(eq(enquiries.id, quotation.enquiryId));

                    return true;
                });

                if (didUpdate) {
                    processed += 1;
                }
            } catch (innerError) {
                console.error("Error updating quotation status:", innerError);
            }
        }
    } catch (error) {
        console.error("Error checking expired quotations:", error);
        throw error;
    }

    return { processed };
}

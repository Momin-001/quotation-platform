import cron from "node-cron";
import { quotations, enquiries } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and, or, lt, ne } from "drizzle-orm";

async function checkExpiredQuotations() {
    try {


        // Calculate the date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Find quotations that are:
        // - Status is "pending" or "revision_requested"
        // - Created more than 30 days ago
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
            return;
        }


        // Process each expired quotation
        for (const quotation of expiredQuotations) {
            try {
                await db.transaction(async (tx) => {
                    // Get the enquiry to check its current status
                    const enquiry = await tx
                        .select({ status: enquiries.status })
                        .from(enquiries)
                        .where(eq(enquiries.id, quotation.enquiryId))
                        .limit(1)
                        .then((res) => res[0]);

                    // Skip if enquiry is already completed or cancelled
                    if (enquiry && (enquiry.status === "completed" || enquiry.status === "cancelled")) {
                        return;
                    }

                    // Check if there's a newer quotation for this enquiry
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

                    // If there's a newer active quotation, skip this one
                    if (newerQuotation.length > 0) {
                        return;
                    }

                    const now = new Date();

                    // Update quotation status to "closed"
                    await tx
                        .update(quotations)
                        .set({
                            status: "closed",
                            updatedAt: now,
                        })
                        .where(eq(quotations.id, quotation.id));

                    // Update enquiry status to "expired"
                    await tx
                        .update(enquiries)
                        .set({
                            status: "expired",
                            updatedAt: now,
                        })
                        .where(eq(enquiries.id, quotation.enquiryId));
                });

            } catch (innerError) {
                console.error('Error updating quotation status:', innerError);
            }
        }
    } catch (error) {
        console.error('Error checking expired quotations:', error);
    }
}

export function startCronJobs() {
    // In dev, Next/Hot Reload can evaluate modules more than once.
    // Ensure we only register the schedule once per process.
    if (globalThis.__quotationCronStarted) return;
    globalThis.__quotationCronStarted = true;

    cron.schedule("0 0 0 * * *", checkExpiredQuotations);
}

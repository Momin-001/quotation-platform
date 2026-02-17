const cron = require("node-cron");
const { quotations, enquiries } = require("@/db/schema");
const { db } = require("./db.js");
const { eq, and, or, lt, ne } = require("drizzle-orm");

async function checkExpiredQuotations() {
    try {

        console.log("[Cron] Checking for expired quotations...");

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
            console.log("[Cron] No expired quotations found.");
            return;
        }

        console.log(`[Cron] Found ${expiredQuotations.length} expired quotation(s).`);

        // Process each expired quotation
        for (const quotation of expiredQuotations) {
            try {
                // Get the enquiry to check its current status
                const enquiry = await db
                    .select({ status: enquiries.status })
                    .from(enquiries)
                    .where(eq(enquiries.id, quotation.enquiryId))
                    .limit(1)
                    .then((res) => res[0]);

                // Skip if enquiry is already completed or cancelled
                if (enquiry && (enquiry.status === "completed" || enquiry.status === "cancelled")) {
                    console.log(`[Cron] Skipping quotation ${quotation.id} - enquiry already ${enquiry.status}`);
                    continue;
                }

                // Check if there's a newer quotation for this enquiry
                const newerQuotation = await db
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
                    console.log(`[Cron] Skipping quotation ${quotation.id} - newer quotation exists`);
                    continue;
                }

                // Update quotation status to "closed"
                await db
                    .update(quotations)
                    .set({
                        status: "closed",
                        updatedAt: new Date(),
                    })
                    .where(eq(quotations.id, quotation.id));

                // Update enquiry status to "expired"
                await db
                    .update(enquiries)
                    .set({
                        status: "expired",
                        updatedAt: new Date(),
                    })
                    .where(eq(enquiries.id, quotation.enquiryId));

                console.log(`[Cron] Closed quotation ${quotation.id} and expired enquiry ${quotation.enquiryId}`);
            } catch (innerError) {
                console.error(`[Cron] Error processing quotation ${quotation.id}:`, innerError);
            }
        }

        console.log("[Cron] Expired quotations check completed.");
    } catch (error) {
        console.error("[Cron] Error checking expired quotations:", error);
    }
}

cron.schedule('0 0 * * *', checkExpiredQuotations);
console.log("Cron jobs initialized: Expired Quotations check daily at midnight");

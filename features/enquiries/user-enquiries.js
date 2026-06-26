import { db } from "@/lib/db";
import { enquiries, quotations } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";

/**
 * Fetch enquiries for the authenticated user (server page or API).
 */
export async function fetchUserEnquiries(userId, { status } = {}) {
    let whereConditions = eq(enquiries.userId, userId);

    if (status) {
        whereConditions = and(whereConditions, eq(enquiries.status, status));
    }

    return db.query.enquiries.findMany({
        where: whereConditions,
        orderBy: desc(enquiries.createdAt),
        with: {
            quotations: {
                where: ne(quotations.status, "draft"),
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
                    refurbishedProduct: {
                        columns: {
                            serie: true,
                            productNumber: true,
                        },
                    },
                },
            },
        },
    });
}

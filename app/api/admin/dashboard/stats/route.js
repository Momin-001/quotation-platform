import { db } from "@/lib/db";
import {
    enquiries,
    quotations,
    users,
    products,
    controllers,
    accessories,
    categories,
    partners,
    faqs,
    certificates,
} from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-helpers";
import { sql, eq, gte } from "drizzle-orm";

async function countTable(table, alias = "count") {
    const result = await db
        .select({ [alias]: sql`count(*)::int` })
        .from(table);
    return result[0]?.[alias] ?? 0;
}

export async function GET() {
    try {
        const { user, error } = await getCurrentUser();
        if (error || !user) {
            return errorResponse("Unauthorized", 401);
        }
        if (user.role !== "admin" && user.role !== "super_admin") {
            return errorResponse("Forbidden: Admin access required", 403);
        }

        let dbConnected = false;
        const stats = {
            totalEnquiries: 0,
            totalQuotations: 0,
            totalUsers: 0,
            totalProducts: 0,
            totalControllers: 0,
            totalAccessories: 0,
            totalCategories: 0,
            totalPartners: 0,
            totalFaqs: 0,
            totalCertificates: 0,
            enquiriesByStatus: {},
            quotationsByStatus: {},
            activeProducts: 0,
            activeUsers: 0,
            enquiriesLast30Days: 0,
            quotationsLast30Days: 0,
        };

        try {
            const [
                totalEnquiries,
                totalQuotations,
                totalUsers,
                totalProducts,
                totalControllers,
                totalAccessories,
                totalCategories,
                totalPartners,
                totalFaqs,
                totalCertificates,
            ] = await Promise.all([
                countTable(enquiries, "totalEnquiries"),
                countTable(quotations, "totalQuotations"),
                countTable(users, "totalUsers"),
                countTable(products, "totalProducts"),
                countTable(controllers, "totalControllers"),
                countTable(accessories, "totalAccessories"),
                countTable(categories, "totalCategories"),
                countTable(partners, "totalPartners"),
                countTable(faqs, "totalFaqs"),
                countTable(certificates, "totalCertificates"),
            ]);

            stats.totalEnquiries = totalEnquiries;
            stats.totalQuotations = totalQuotations;
            stats.totalUsers = totalUsers;
            stats.totalProducts = totalProducts;
            stats.totalControllers = totalControllers;
            stats.totalAccessories = totalAccessories;
            stats.totalCategories = totalCategories;
            stats.totalPartners = totalPartners;
            stats.totalFaqs = totalFaqs;
            stats.totalCertificates = totalCertificates;

            // Enquiries by status
            const enquiryStatusRows = await db
                .select({
                    status: enquiries.status,
                    count: sql`count(*)::int`,
                })
                .from(enquiries)
                .groupBy(enquiries.status);
            enquiryStatusRows.forEach((row) => {
                stats.enquiriesByStatus[row.status || "pending"] = row.count;
            });

            // Quotations by status
            const quotationStatusRows = await db
                .select({
                    status: quotations.status,
                    count: sql`count(*)::int`,
                })
                .from(quotations)
                .groupBy(quotations.status);
            quotationStatusRows.forEach((row) => {
                stats.quotationsByStatus[row.status || "draft"] = row.count;
            });

            // Active products (isActive = true)
            const activeProductsResult = await db
                .select({ count: sql`count(*)::int` })
                .from(products)
                .where(eq(products.isActive, true));
            stats.activeProducts = activeProductsResult[0]?.count ?? 0;

            // Active users
            const activeUsersResult = await db
                .select({ count: sql`count(*)::int` })
                .from(users)
                .where(eq(users.isActive, true));
            stats.activeUsers = activeUsersResult[0]?.count ?? 0;

            // Enquiries last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const enquiriesRecent = await db
                .select({ count: sql`count(*)::int` })
                .from(enquiries)
                .where(gte(enquiries.createdAt, thirtyDaysAgo));
            stats.enquiriesLast30Days = enquiriesRecent[0]?.count ?? 0;

            // Quotations last 30 days
            const quotationsRecent = await db
                .select({ count: sql`count(*)::int` })
                .from(quotations)
                .where(gte(quotations.createdAt, thirtyDaysAgo));
            stats.quotationsLast30Days = quotationsRecent[0]?.count ?? 0;

            dbConnected = true;
        } catch (dbErr) {
            console.error("Dashboard stats DB error:", dbErr);
        }

        return successResponse("Dashboard stats fetched", {
            ...stats,
            apiStatus: dbConnected ? "connected" : "disconnected",
        });
    } catch (err) {
        console.error("Dashboard stats error:", err);
        return errorResponse(err.message || "Failed to fetch dashboard stats", 500);
    }
}

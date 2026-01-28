import { db } from "@/lib/db";
import { enquiries, enquiryItems, users } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, desc, asc, and, or, ilike, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

// Format enquiry ID: Enquiry #YYYY-XXXX (last 4 chars of UUID)
function formatEnquiryId(enquiryId, createdAt) {
    const year = new Date(createdAt).getFullYear();
    const number = enquiryId.slice(-4).toUpperCase();
    return `Enquiry #${year}-${number}`;
}

export async function GET(req) {
    try {
        // Verify admin access
        const { user, error } = await getCurrentUser();
        if (error || !user) {
            return errorResponse("Unauthorized", 401);
        }
        if (user.role !== "admin" && user.role !== "super_admin") {
            return errorResponse("Forbidden: Admin access required", 403);
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "desc"; // asc or desc
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        // Build where conditions
        let whereConditions = [];

        // Search by enquiry ID or customer name
        if (search) {
            const searchPattern = `%${search}%`;
            const searchUpper = search.toUpperCase().trim();
            
            // Build search conditions
            const searchConditions = [
                // Search in customer name
                ilike(users.fullName, searchPattern),
                // Search in customer email
                ilike(users.email, searchPattern),
            ];

            // Search in enquiry ID (last 4 chars of UUID)
            // Extract numeric part if search contains numbers (like "1472" from "Enquiry #2025-1472")
            const numericMatch = search.match(/\d+/);
            if (numericMatch) {
                const numericPart = numericMatch[0];
                const numericPatternUpper = `%${numericPart.toUpperCase()}%`;
                // Search in last 4 chars of UUID (case-insensitive)
                searchConditions.push(
                    sql`UPPER(SUBSTRING(${enquiries.id}::text, -4)) LIKE ${numericPatternUpper}`
                );
                // Also search in year if it's a 4-digit number (like 2025)
                if (numericPart.length === 4 && parseInt(numericPart) >= 2000 && parseInt(numericPart) <= 2100) {
                    const yearPattern = `%${numericPart}%`;
                    searchConditions.push(
                        sql`EXTRACT(YEAR FROM ${enquiries.createdAt})::text LIKE ${yearPattern}`
                    );
                }
            }
            
            // Always try to match last 4 chars for any search (handles partial UUID searches)
            if (searchUpper.length >= 1) {
                const uuidPattern = `%${searchUpper}%`;
                searchConditions.push(
                    sql`UPPER(SUBSTRING(${enquiries.id}::text, -4)) LIKE ${uuidPattern}`
                );
            }

            whereConditions.push(or(...searchConditions));
        }

        // Build base query
        let query = db
            .select({
                id: enquiries.id,
                userId: enquiries.userId,
                message: enquiries.message,
                status: enquiries.status,
                createdAt: enquiries.createdAt,
                updatedAt: enquiries.updatedAt,
                customerName: users.fullName,
                customerEmail: users.email,
            })
            .from(enquiries)
            .innerJoin(users, eq(enquiries.userId, users.id));

        // Apply where conditions
        if (whereConditions.length > 0) {
            query = query.where(and(...whereConditions));
        }

        // Apply sorting
        if (sortBy === "asc") {
            query = query.orderBy(asc(enquiries.createdAt));
        } else {
            query = query.orderBy(desc(enquiries.createdAt));
        }

        // Apply pagination
        query = query.limit(limit).offset(offset);

        const allEnquiries = await query;

        // Format the response with enquiry ID
        const formattedEnquiries = allEnquiries.map((enquiry) => ({
            ...enquiry,
            enquiryId: formatEnquiryId(enquiry.id, enquiry.createdAt),
        }));

        // Get total count for pagination (if needed in future)
        // For now, we'll use the length to determine if there are more pages
        const hasMore = formattedEnquiries.length === limit;

        return successResponse("Enquiries fetched successfully", {
            enquiries: formattedEnquiries,
            hasMore,
            page,
            limit,
        });
    } catch (error) {
        console.error("Error fetching enquiries:", error);
        return errorResponse(error.message || "Failed to fetch enquiries");
    }
}

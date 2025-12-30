import { db } from "@/lib/db";
import { navbar } from "@/drizzle/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/admin/navbar - Get navbar content
export async function GET() {
    try {
        const navbarContent = await db.select().from(navbar).limit(1).then((res) => res[0]);

        // If no navbar content exists, create default one
        if (!navbarContent) {
            const defaultNavbar = await db
                .insert(navbar)
                .values({
                    navItem1En: "",
                    navItem1De: "",
                    navItem2En: "",
                    navItem2De: "",
                    navItem3En: "",
                    navItem3De: "",
                    navItem4En: "",
                    navItem4De: "",
                    navItem5En: "",
                    navItem5De: "",
                })
                .returning();

            return successResponse(defaultNavbar[0], "Navbar content fetched successfully");
        }

        return successResponse(navbarContent, "Navbar content fetched successfully");
    } catch (error) {
        console.error("Error fetching navbar content:", error);
        return errorResponse("Failed to fetch navbar content", 500);
    }
}

// PUT /api/admin/navbar - Update navbar content
export async function PUT(req) {
    try {
        const body = await req.json();
        const {
            navItem1En,
            navItem1De,
            navItem2En,
            navItem2De,
            navItem3En,
            navItem3De,
            navItem4En,
            navItem4De,
            navItem5En,
            navItem5De,
        } = body;

        // Get existing navbar or create new one
        const existing = await db.select().from(navbar).limit(1).then((res) => res[0]);

        let result;
        if (existing) {
            // Update existing
            result = await db
                .update(navbar)
                .set({
                    navItem1En: navItem1En || "",
                    navItem1De: navItem1De || "",
                    navItem2En: navItem2En || "",
                    navItem2De: navItem2De || "",
                    navItem3En: navItem3En || "",
                    navItem3De: navItem3De || "",
                    navItem4En: navItem4En || "",
                    navItem4De: navItem4De || "",
                    navItem5En: navItem5En || "",
                    navItem5De: navItem5De || "",
                    updatedAt: new Date(),
                })
                .returning();
        } else {
            // Create new
            result = await db
                .insert(navbar)
                .values({
                    navItem1En: navItem1En || "",
                    navItem1De: navItem1De || "",
                    navItem2En: navItem2En || "",
                    navItem2De: navItem2De || "",
                    navItem3En: navItem3En || "",
                    navItem3De: navItem3De || "",
                    navItem4En: navItem4En || "",
                    navItem4De: navItem4De || "",
                    navItem5En: navItem5En || "",
                    navItem5De: navItem5De || "",
                })
                .returning();
        }

        return successResponse(result[0], "Navbar content updated successfully");
    } catch (error) {
        console.error("Error updating navbar content:", error);
        return errorResponse("Failed to update navbar content", 500);
    }
}







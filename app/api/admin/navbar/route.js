import { db } from "@/lib/db";
import { navbar } from "@/db/schema";
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

            return successResponse("Navbar content fetched successfully", defaultNavbar[0]);
        }

        return successResponse("Navbar content fetched successfully", navbarContent);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch navbar content");
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

        return successResponse("Navbar content updated successfully", result[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to update navbar content");
    }
}









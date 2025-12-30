import { db } from "@/lib/db";
import { navbar } from "@/drizzle/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/navbar - Get navbar content for public use
export async function GET() {
    try {
        const navbarContent = await db.select().from(navbar).limit(1).then((res) => res[0]);

        if (!navbarContent) {
            // Return default empty values if no navbar exists
            return successResponse({
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
            }, "Navbar content fetched successfully");
        }

        return successResponse(navbarContent, "Navbar content fetched successfully");
    } catch (error) {
        console.error("Error fetching navbar content:", error);
        return errorResponse("Failed to fetch navbar content", 500);
    }
}


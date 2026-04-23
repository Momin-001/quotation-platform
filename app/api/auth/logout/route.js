
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies()
        cookieStore.delete("token")
        return successResponse("Logged out successfully")
    } catch (error) {
        console.error("POST /api/auth/logout error:", error);
        return errorResponse("Failed to logout", 500);
    }
}

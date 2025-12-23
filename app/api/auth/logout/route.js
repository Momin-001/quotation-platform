
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies()
        cookieStore.delete("token")
        return successResponse(null, "Logged out successfully")
    } catch (error) {
        return errorResponse("Failed to logout", error)
    }
}

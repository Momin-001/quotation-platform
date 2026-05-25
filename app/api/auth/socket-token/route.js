import jwt from "jsonwebtoken";
import { getCurrentUser } from "@/lib/auth-helpers";
import { JWT_SECRET } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
    try {
        const { user, error } = await getCurrentUser();

        if (error || !user) {
            return errorResponse("Unauthorized", 401);
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                purpose: "socket",
            },
            JWT_SECRET,
            { expiresIn: "5m" }
        );

        return successResponse("Socket token issued", { token });
    } catch (err) {
        console.error("GET /api/auth/socket-token error:", err);
        return errorResponse("Failed to issue socket token", 500);
    }
}

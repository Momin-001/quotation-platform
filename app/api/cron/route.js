import { checkExpiredQuotations } from "@/lib/cron-jobs";
import { CRON_SECRET } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api-response";

function isCronAuthorized(req) {
    if (!CRON_SECRET) {
        return false;
    }

    const authHeader = req.headers.get("authorization");
    if (authHeader === `Bearer ${CRON_SECRET}`) {
        return true;
    }

    const cronHeader = req.headers.get("x-cron-secret");
    if (cronHeader === CRON_SECRET) {
        return true;
    }

    return false;
}

async function handleCron(req) {
    if (!CRON_SECRET) {
        console.error("CRON_SECRET is not configured");
        return errorResponse("Cron is not configured", 503);
    }

    if (!isCronAuthorized(req)) {
        return errorResponse("Unauthorized", 401);
    }

    try {
        const result = await checkExpiredQuotations();
        return successResponse("Cron completed", result);
    } catch (error) {
        console.error("Cron job failed:", error);
        return errorResponse("Cron job failed", 500);
    }
}

export async function GET(req) {
    return handleCron(req);
}

export async function POST(req) {
    return handleCron(req);
}

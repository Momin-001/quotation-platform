import { pool } from "./db.js";

export async function canJoinQuotationRoom(userId, userRole, quotationId) {
    if (!quotationId || !userId || !userRole) {
        return false;
    }

    if (userRole === "admin" || userRole === "super_admin") {
        const result = await pool.query(
            "SELECT id FROM quotations WHERE id = $1 LIMIT 1",
            [quotationId]
        );
        return result.rowCount > 0;
    }

    if (userRole === "user") {
        const result = await pool.query(
            `SELECT e.id
             FROM enquiries e
             INNER JOIN quotations q ON q.enquiry_id = e.id
             WHERE q.id = $1 AND e.user_id = $2
             LIMIT 1`,
            [quotationId, userId]
        );
        return result.rowCount > 0;
    }

    return false;
}

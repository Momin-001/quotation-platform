import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-helpers";
import { desc, eq } from "drizzle-orm";

function formatExportRow(user) {
    return {
        ID: user.id,
        "Full Name": user.fullName,
        Email: user.email,
        "Company Name": user.companyName ?? "",
        "Company Address": user.companyAddress ?? "",
        "Phone Number": user.phoneNumber ?? "",
        "Commercial Register Number": user.commercialRegisterNumber ?? "",
        Role: user.role,
        Status: user.isActive ? "Active" : "Inactive",
        "Joined Date": user.createdAt
            ? new Date(user.createdAt).toISOString()
            : "",
    };
}

export async function GET() {
    try {
        const { user, error } = await getCurrentUser();
        if (error || !user) {
            return errorResponse(error || "Unauthorized", 401);
        }
        if (user.role !== "admin" && user.role !== "super_admin") {
            return errorResponse("Forbidden", 403);
        }

        const customers = await db
            .select({
                id: users.id,
                fullName: users.fullName,
                companyName: users.companyName,
                companyAddress: users.companyAddress,
                email: users.email,
                phoneNumber: users.phoneNumber,
                commercialRegisterNumber: users.commercialRegisterNumber,
                role: users.role,
                isActive: users.isActive,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.role, "user"))
            .orderBy(desc(users.createdAt));

        const rows = customers.map(formatExportRow);
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        const filename = `customers-${new Date().toISOString().slice(0, 10)}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (err) {
        console.error("GET /api/admin/users/export-customers error:", err);
        return errorResponse("Failed to export customers", 500);
    }
}

import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/helpers/auth-helpers";
import { desc, eq } from "drizzle-orm";

function formatExportRow(product) {
    return {
        ID: product.id,
        Slug: product.slug ?? "",
        "Product Name": product.productName,
        "Product Number": product.productNumber,
        Type: product.productType ?? "",
        Category: product.categoryName ?? "",
        "Pixel Pitch": product.pixelPitch ?? "",
        Brightness: product.brightnessValue ?? "",
        "Price Per Cabinet (USD)": product.pricePerCabinetUsd ?? "",
        "Price Per Metre Square (USD)": product.pricePerMetreSquareUsd ?? "",
        "Stock Pieces": product.stockPieces ?? "",
        "Leadtime (Days)": product.leadtimeDays ?? "",
        "OEM Brand": product.oemBrand ?? "",
        Status: product.isActive ? "Active" : "Inactive",
        "Created At": product.createdAt
            ? new Date(product.createdAt).toISOString()
            : "",
        "Last Updated": product.updatedAt
            ? new Date(product.updatedAt).toISOString()
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

        const allProducts = await db
            .select({
                id: products.id,
                slug: products.slug,
                productName: products.productName,
                productNumber: products.productNumber,
                productType: products.productType,
                pixelPitch: products.pixelPitch,
                brightnessValue: products.brightnessValue,
                pricePerCabinetUsd: products.pricePerCabinetUsd,
                pricePerMetreSquareUsd: products.pricePerMetreSquareUsd,
                stockPieces: products.stockPieces,
                leadtimeDays: products.leadtimeDays,
                oemBrand: products.oemBrand,
                isActive: products.isActive,
                createdAt: products.createdAt,
                updatedAt: products.updatedAt,
                categoryName: categories.name,
            })
            .from(products)
            .leftJoin(categories, eq(products.areaOfUseId, categories.id))
            .orderBy(desc(products.createdAt));

        const rows = allProducts.map(formatExportRow);
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        const filename = `products-${new Date().toISOString().slice(0, 10)}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (err) {
        console.error("GET /api/admin/products/export-products error:", err);
        return errorResponse("Failed to export products", 500);
    }
}

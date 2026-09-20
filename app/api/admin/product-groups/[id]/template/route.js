import { db } from "@/lib/db";
import {
    productGroups,
    products,
    productFeatures,
    productCertificates,
    productProductIcons,
} from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { asc, desc, eq } from "drizzle-orm";
import { pickSharedProductFields } from "@/features/products/group-template";

/**
 * GET /api/admin/product-groups/[id]/template
 *
 * Returns the shared specification of an existing member of the group, used to
 * seed the create-product form. `template` is null when the group has no
 * products yet — the caller then tells the admin this is the first one.
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const [group] = await db
            .select({ id: productGroups.id, name: productGroups.name })
            .from(productGroups)
            .where(eq(productGroups.id, id))
            .limit(1);

        if (!group) return errorResponse("Product group not found", 404);

        // Newest member wins: it is the most likely to carry current values.
        const [source] = await db
            .select()
            .from(products)
            .where(eq(products.groupId, id))
            .orderBy(desc(products.createdAt))
            .limit(1);

        if (!source) {
            return successResponse("Group has no products yet", {
                group,
                template: null,
            });
        }

        const [features, certificateRows, iconRows] = await Promise.all([
            db
                .select({ feature: productFeatures.feature })
                .from(productFeatures)
                .where(eq(productFeatures.productId, source.id)),
            db
                .select({ certificateId: productCertificates.certificateId })
                .from(productCertificates)
                .where(eq(productCertificates.productId, source.id)),
            db
                .select({ productIconId: productProductIcons.productIconId })
                .from(productProductIcons)
                .where(eq(productProductIcons.productId, source.id))
                .orderBy(asc(productProductIcons.iconOrder)),
        ]);

        return successResponse("Group template fetched successfully", {
            group,
            template: {
                sourceProductName: source.productName,
                fields: pickSharedProductFields(source),
                features: features.map((f) => f.feature),
                certificateIds: certificateRows.map((c) => c.certificateId),
                iconIds: iconRows.map((i) => i.productIconId),
            },
        });
    } catch (error) {
        console.error("GET /api/admin/product-groups/[id]/template error:", error);
        return errorResponse("Failed to fetch group template", 500);
    }
}

import { db } from "@/lib/db";
import { refurbishedProducts, refurbishedProductImages } from "@/db/schema";
import { eq } from "drizzle-orm";

/** First image URL for a refurbished product (lowest imageOrder). */
export async function getRefurbishedFirstImage(refurbishedProductId) {
    if (!refurbishedProductId) return null;
    const imgs = await db
        .select({ imageUrl: refurbishedProductImages.imageUrl })
        .from(refurbishedProductImages)
        .where(eq(refurbishedProductImages.refurbishedProductId, refurbishedProductId))
        .orderBy(refurbishedProductImages.imageOrder)
        .limit(1);
    return imgs[0]?.imageUrl || null;
}

/**
 * Normalized refurbished product details for the enquiry/quotation builder.
 * `serie` maps to productName and `sellingPrice` maps to pricePerCabinetUsd so the
 * quotation builder defaults the unit price to the refurbished selling price.
 */
export async function getRefurbishedQuotationDetails(refurbishedProductId) {
    if (!refurbishedProductId) return null;
    const [r] = await db
        .select({
            id: refurbishedProducts.id,
            serie: refurbishedProducts.serie,
            productNumber: refurbishedProducts.productNumber,
            pixelPitch: refurbishedProducts.pixelPitch,
            sellingPrice: refurbishedProducts.sellingPrice,
            cabinetResolutionHorizontal: refurbishedProducts.cabinetResolutionHorizontal,
            cabinetResolutionVertical: refurbishedProducts.cabinetResolutionVertical,
        })
        .from(refurbishedProducts)
        .where(eq(refurbishedProducts.id, refurbishedProductId))
        .limit(1);

    if (!r) return null;

    const imageUrl = await getRefurbishedFirstImage(refurbishedProductId);
    return {
        id: r.id,
        productName: r.serie,
        productNumber: r.productNumber,
        pixelPitch: r.pixelPitch,
        pricePerCabinetUsd: r.sellingPrice,
        cabinetResolutionHorizontal: r.cabinetResolutionHorizontal,
        cabinetResolutionVertical: r.cabinetResolutionVertical,
        imageUrl,
        sourceType: "refurbished",
        productSourceType: "refurbished",
    };
}

/**
 * Fetches full quotation data for PDF generation.
 * Used by both admin and user PDF APIs.
 * Uses batch queries to avoid N+1 round-trips.
 *
 * Money fields (unitPrice, tax/discount percentages, etc.) are returned as stored in the DB;
 * display formatting (EUR with two decimal places) is applied when rendering the PDF in
 * `lib/quotation-react-pdf.jsx` using `formatCurrency` from `lib/helpers.js`.
 */
import { db } from "@/lib/db";
import {
    quotations,
    quotationItems,
    quotationOptionalItems,
    quotationAdditionalItems,
    products,
    productImages,
    productFeatures,
    controllers,
    accessories,
    enquiries,
    enquiryItems,
    users,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

const productSelectFields = {
    id: products.id,
    productName: products.productName,
    productNumber: products.productNumber,
    pixelPitch: products.pixelPitch,
    cabinetWidth: products.cabinetWidth,
    cabinetHeight: products.cabinetHeight,
    cabinetResolutionHorizontal: products.cabinetResolutionHorizontal,
    cabinetResolutionVertical: products.cabinetResolutionVertical,
    brightnessValue: products.brightnessValue,
    refreshRate: products.refreshRate,
    contrastRatioNumerator: products.contrastRatioNumerator,
    contrastRatioDenominator: products.contrastRatioDenominator,
    powerConsumptionTypical: products.powerConsumptionTypical,
    powerConsumptionMax: products.powerConsumptionMax,
    weightWithoutPackaging: products.weightWithoutPackaging,
};

function pickFirstImagePerId(rows, idKey) {
    const byId = {};
    for (const row of rows) {
        const id = row[idKey];
        if (id && !byId[id]) byId[id] = row.imageUrl;
    }
    return byId;
}

function groupFeaturesByProductId(rows) {
    const byId = {};
    for (const row of rows) {
        const id = row.productId;
        if (!id) continue;
        if (!byId[id]) byId[id] = [];
        byId[id].push(row.feature);
    }
    return byId;
}

/**
 * @param {string} quotationId
 * @param {{ isAdmin?: boolean; userId?: string }} options
 * @returns {Promise<{ quotation, enquiry, mainProduct, alternativeProduct } | null>}
 */
export async function getQuotationDataForPDF(quotationId, options = {}) {
    const { isAdmin, userId } = options;

    const [quotation] = await db
        .select()
        .from(quotations)
        .where(eq(quotations.id, quotationId))
        .limit(1);

    if (!quotation) return null;

    const [enquiry] = await db
        .select({
            id: enquiries.id,
            message: enquiries.message,
            status: enquiries.status,
            userId: enquiries.userId,
            customerName: users.fullName,
            customerEmail: users.email,
            customerPhone: users.phoneNumber,
            customerCompany: users.companyName,
            customerAddress: users.companyAddress,
            customerCommercialRegisterNumber: users.commercialRegisterNumber,
        })
        .from(enquiries)
        .innerJoin(users, eq(enquiries.userId, users.id))
        .where(eq(enquiries.id, quotation.enquiryId))
        .limit(1);

    if (!enquiry) return null;

    if (!isAdmin && userId && enquiry.userId !== userId) return null;

    const [items, enquiryItemRows] = await Promise.all([
        db
            .select()
            .from(quotationItems)
            .where(eq(quotationItems.quotationId, quotationId))
            .orderBy(quotationItems.itemOrder),
        db
            .select({
                productId: enquiryItems.productId,
                itemType: enquiryItems.itemType,
                isCustom: enquiryItems.isCustom,
                customTotalResolutionH: enquiryItems.customTotalResolutionH,
                customTotalResolutionV: enquiryItems.customTotalResolutionV,
                customWeight: enquiryItems.customWeight,
                customDisplayArea: enquiryItems.customDisplayArea,
                customScreenWidth: enquiryItems.customScreenWidth,
                customScreenHeight: enquiryItems.customScreenHeight,
                customPowerConsumptionMax: enquiryItems.customPowerConsumptionMax,
                customPowerConsumptionTyp: enquiryItems.customPowerConsumptionTyp,
                customTotalCabinets: enquiryItems.customTotalCabinets,
            })
            .from(enquiryItems)
            .where(eq(enquiryItems.enquiryId, quotation.enquiryId)),
    ]);

    if (items.length === 0) {
        return {
            quotation,
            enquiry,
            mainProduct: null,
            alternativeProduct: null,
        };
    }

    // Index enquiry items by `${productId}|${itemType}` so main/alternative custom data
    // maps to the correct quotation item. Fallback index by productId only.
    const enquiryItemByCompositeKey = new Map();
    const enquiryItemByProductId = new Map();
    for (const row of enquiryItemRows) {
        if (!row.productId) continue;
        const composite = `${row.productId}|${row.itemType || "main"}`;
        if (!enquiryItemByCompositeKey.has(composite)) {
            enquiryItemByCompositeKey.set(composite, row);
        }
        if (!enquiryItemByProductId.has(row.productId)) {
            enquiryItemByProductId.set(row.productId, row);
        }
    }

    const itemIds = items.map((i) => i.id);

    const [optionalRows, additionalRows] = await Promise.all([
        db
            .select()
            .from(quotationOptionalItems)
            .where(inArray(quotationOptionalItems.quotationItemId, itemIds))
            .orderBy(quotationOptionalItems.quotationItemId, quotationOptionalItems.itemOrder),
        db
            .select()
            .from(quotationAdditionalItems)
            .where(inArray(quotationAdditionalItems.quotationItemId, itemIds))
            .orderBy(quotationAdditionalItems.quotationItemId, quotationAdditionalItems.itemOrder),
    ]);

    const productIds = new Set(items.map((i) => i.productId).filter(Boolean));
    const controllerIds = new Set(additionalRows.map((r) => r.controllerId).filter(Boolean));
    const accessoryIds = new Set();

    for (const opt of optionalRows) {
        if (opt.itemSourceType === "controller" && opt.controllerId) controllerIds.add(opt.controllerId);
        else if (opt.itemSourceType === "accessory" && opt.accessoryId) accessoryIds.add(opt.accessoryId);
        else if (opt.productId) productIds.add(opt.productId);
    }

    const productIdList = [...productIds];
    const controllerIdList = [...controllerIds];
    const accessoryIdList = [...accessoryIds];

    const [
        productRows,
        productImageRows,
        featureRows,
        controllerRows,
        controllerImageRows,
        accessoryRows,
    ] = await Promise.all([
        productIdList.length > 0
            ? db
                .select(productSelectFields)
                .from(products)
                .where(inArray(products.id, productIdList))
            : [],
        productIdList.length > 0
            ? db
                .select({
                    productId: productImages.productId,
                    imageUrl: productImages.imageUrl,
                    imageOrder: productImages.imageOrder,
                })
                .from(productImages)
                .where(inArray(productImages.productId, productIdList))
                .orderBy(productImages.productId, productImages.imageOrder)
            : [],
        productIdList.length > 0
            ? db
                .select({
                    productId: productFeatures.productId,
                    feature: productFeatures.feature,
                })
                .from(productFeatures)
                .where(inArray(productFeatures.productId, productIdList))
                .orderBy(productFeatures.productId, productFeatures.id)
            : [],
        controllerIdList.length > 0
            ? db
                .select({
                    id: controllers.id,
                    productName: controllers.interfaceName,
                    brandName: controllers.brandName,
                })
                .from(controllers)
                .where(inArray(controllers.id, controllerIdList))
            : [],
        controllerIdList.length > 0
            ? db
                .select({
                    controllerId: productImages.controllerId,
                    imageUrl: productImages.imageUrl,
                    imageOrder: productImages.imageOrder,
                })
                .from(productImages)
                .where(inArray(productImages.controllerId, controllerIdList))
                .orderBy(productImages.controllerId, productImages.imageOrder)
            : [],
        accessoryIdList.length > 0
            ? db
                .select({
                    id: accessories.id,
                    productName: accessories.productName,
                    productNumber: accessories.productNumber,
                    productGroup: accessories.productGroup,
                })
                .from(accessories)
                .where(inArray(accessories.id, accessoryIdList))
            : [],
    ]);

    const productImageByProductId = pickFirstImagePerId(productImageRows, "productId");
    const controllerImageByControllerId = pickFirstImagePerId(controllerImageRows, "controllerId");
    const featuresByProductId = groupFeaturesByProductId(featureRows);

    const productsById = {};
    for (const p of productRows) {
        productsById[p.id] = {
            ...p,
            imageUrl: productImageByProductId[p.id] || null,
            sourceType: "product",
            features: featuresByProductId[p.id] || [],
        };
    }

    const controllersById = {};
    for (const c of controllerRows) {
        controllersById[c.id] = {
            ...c,
            productNumber: c.brandName || c.id?.slice(0, 8) || "N/A",
            imageUrl: controllerImageByControllerId[c.id] || null,
            sourceType: "controller",
            features: [],
        };
    }

    const accessoriesById = {};
    for (const a of accessoryRows) {
        accessoriesById[a.id] = { ...a, imageUrl: null, sourceType: "accessory", features: [] };
    }

    const optionalsByItemId = new Map();
    for (const opt of optionalRows) {
        const list = optionalsByItemId.get(opt.quotationItemId) || [];
        list.push(opt);
        optionalsByItemId.set(opt.quotationItemId, list);
    }

    const additionalsByItemId = new Map();
    for (const add of additionalRows) {
        const list = additionalsByItemId.get(add.quotationItemId) || [];
        list.push(add);
        additionalsByItemId.set(add.quotationItemId, list);
    }

    function resolveOptionalProduct(opt) {
        const sourceType = opt.itemSourceType || "product";
        if (sourceType === "controller" && opt.controllerId) return controllersById[opt.controllerId] ?? null;
        if (sourceType === "accessory" && opt.accessoryId) return accessoriesById[opt.accessoryId] ?? null;
        if (opt.productId) return productsById[opt.productId] ?? null;
        return null;
    }

    const itemsWithDetails = items.map((item) => {
        const baseProduct = productsById[item.productId] ?? null;
        const matchingEnquiryItem =
            enquiryItemByCompositeKey.get(`${item.productId}|${item.itemType}`) ||
            enquiryItemByProductId.get(item.productId) ||
            null;

        // Merge custom Leditor fields onto the product so PDF renderers can detect them.
        const product = baseProduct
            ? {
                ...baseProduct,
                isCustom: !!matchingEnquiryItem?.isCustom,
                customTotalResolutionH: matchingEnquiryItem?.customTotalResolutionH ?? null,
                customTotalResolutionV: matchingEnquiryItem?.customTotalResolutionV ?? null,
                customWeight: matchingEnquiryItem?.customWeight ?? null,
                customDisplayArea: matchingEnquiryItem?.customDisplayArea ?? null,
                customScreenWidth: matchingEnquiryItem?.customScreenWidth ?? null,
                customScreenHeight: matchingEnquiryItem?.customScreenHeight ?? null,
                customPowerConsumptionMax: matchingEnquiryItem?.customPowerConsumptionMax ?? null,
                customPowerConsumptionTyp: matchingEnquiryItem?.customPowerConsumptionTyp ?? null,
                customTotalCabinets: matchingEnquiryItem?.customTotalCabinets ?? null,
            }
            : null;
        const optionalItemsData = optionalsByItemId.get(item.id) || [];
        const optionalItems = optionalItemsData.map((opt) => ({
            ...opt,
            product: resolveOptionalProduct(opt),
        }));
        const additionalItemsData = additionalsByItemId.get(item.id) || [];
        const additionalItems = additionalItemsData.map((add) => ({
            ...add,
            product: controllersById[add.controllerId] ?? null,
        }));
        return {
            ...item,
            product,
            optionalItems,
            additionalItems,
        };
    });

    const mainProduct =
        itemsWithDetails.find((i) => i.itemType === "main") || itemsWithDetails[0];
    const alternativeProduct =
        itemsWithDetails.find((i) => i.itemType === "alternative") || null;

    return {
        quotation,
        enquiry,
        mainProduct,
        alternativeProduct,
    };
}

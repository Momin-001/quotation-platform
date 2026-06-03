import { format } from "date-fns";

export function calculateLineNetAfterDiscount(unitPrice, quantity, discountPercentage) {
    const gross = parseFloat(unitPrice || 0) * parseInt(quantity ?? 1, 10);
    const discountAmount = gross * (parseFloat(discountPercentage || 0) / 100);
    return gross - discountAmount;
}

export function calculateOfferTotalWithQuotationTax({ lines, quotationTaxPercentage }) {
    const taxPct = parseFloat(quotationTaxPercentage ?? 19);
    let offerNet = 0;
    for (const line of lines) {
        offerNet += calculateLineNetAfterDiscount(
            line.unitPrice,
            line.quantity,
            line.discountPercentage
        );
    }
    const tax = offerNet * (taxPct / 100);
    return { offerNet, tax, offerTotal: offerNet + tax, taxPercentage: taxPct };
}

export function collectOfferLinesFromQuotationItem(item) {
    if (!item?.product) return [];
    const mainQty =
        item.product?.isCustom
            ? item.product?.customTotalCabinets ?? item.quantity
            : item.quantity;
    const lines = [
        {
            unitPrice: item.unitPrice,
            quantity: mainQty ?? 1,
            discountPercentage: item.discountPercentage,
        },
    ];
    for (const add of item.additionalItems || []) {
        lines.push({
            unitPrice: add.unitPrice,
            quantity: add.quantity ?? 1,
            discountPercentage: add.discountPercentage,
        });
    }
    for (const opt of item.optionalItems || []) {
        lines.push({
            unitPrice: opt.unitPrice,
            quantity: opt.quantity ?? 1,
            discountPercentage: opt.discountPercentage,
        });
    }
    return lines;
}

export function calculateQuotationOfferTotals(item, quotationTaxPercentage) {
    const lines = collectOfferLinesFromQuotationItem(item);
    return calculateOfferTotalWithQuotationTax({ lines, quotationTaxPercentage });
}

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export const formatEnquiryNumber = (enquiryId, createdAt) => {
    const year = new Date(createdAt).getFullYear();
    const number = enquiryId.slice(-4);
    return `Enquiry #${year}-${number}`;
}

export const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
}

export const formatDate = (date) => {
    return format(new Date(date), "dd MMM yyyy");
}

export const getQuotationStatusColor = (status) => {
    switch (status) {
        case "draft":
            return "bg-gray-100 text-gray-700";
        case "pending":
            return "bg-yellow-100 text-yellow-700";
        case "accepted":
            return "bg-green-100 text-green-700";
        case "rejected":
            return "bg-red-100 text-red-700";
        case "revision_requested":
            return "bg-blue-100 text-blue-700";
        case "closed":
            return "bg-amber-100 text-amber-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

export const getEnquiryStatusColor = (status) => {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-700";
        case "in_progress":
            return "bg-blue-100 text-blue-700";
        case "completed":
            return "bg-green-100 text-green-700";
    }
};

export const formatRole = (role) => {
    switch (role) {
        case "user":
            return "User";
        case "admin":
            return "Admin";
        case "super_admin":
            return "Super Admin";
    }
};
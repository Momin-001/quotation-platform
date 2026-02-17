import { format } from "date-fns";
export const calculateItemTotal = (unitPrice, quantity, taxPercentage, discountPercentage) => {
    const basePrice = parseFloat(unitPrice || 0) * parseInt(quantity || 1);
    const taxAmount = basePrice * (parseFloat(taxPercentage || 0) / 100);
    const discountAmount = basePrice * (parseFloat(discountPercentage || 0) / 100);
    return basePrice + taxAmount - discountAmount;
}

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
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
            return "bg-gray-100 text-gray-700";
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
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import { formatEnquiryNumber, formatDate, getStatusLabel, getQuotationStatusColor } from "@/lib/helpers";

export default function MyQuotationsPage() {
    const router = useRouter();
    const [quotations, setQuotations] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const res = await fetch("/api/user/quotations");
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch quotations");
            }
            setQuotations(response.data.quotations || []);
            setPendingCount(response.data.pendingCount || 0);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb 
                title="My Quotations" 
                breadcrumbs={[
                    { label: "Home", href: "/" }, 
                    { label: "Quotations" }
                ]} 
            />
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-primary">
                    Active Quotations: {pendingCount}
                </h1>
                </div>

                {/* Quotations List */}
                {quotations.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No quotations found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {quotations.map((quotation) => (
                            <div
                                key={quotation.id}
                                className="bg-white rounded-lg p-4 shadow-sm px-6 transition-shadow cursor-pointer"
                                onClick={() => {
                                    // Navigate to quotation detail page (to be implemented)
                                    router.push(`/user/my-quotations/${quotation.id}`);
                                }}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                    <h3 className="text-lg font-bold mb-1">
                                        Quotation {quotation.quotationNumber}
                                    </h3>
                                    {quotation.enquiryId && (
                                        <p className="text-sm text-gray-600">
                                            {formatEnquiryNumber(
                                                quotation.enquiryId,
                                                quotation.createdAt
                                            )}
                                        </p>
                                    )}
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <span className={`text-sm px-2 py-1 rounded-md ${getQuotationStatusColor(quotation.status)}`}>
                                            {getStatusLabel(quotation.status)}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {formatDate(quotation.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

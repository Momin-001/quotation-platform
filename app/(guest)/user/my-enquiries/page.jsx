"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import { formatEnquiryNumber, formatDate, getStatusLabel, getEnquiryStatusColor } from "@/lib/helpers";
import { useRouter } from "next/navigation";

export default function MyEnquiriesPage() {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
            fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            const res = await fetch("/api/user/enquiries");
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch enquiries");
            }
            setEnquiries(response.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter active enquiries (pending, in_progress)
    const activeEnquiries = enquiries.filter(
        (enquiry) => enquiry.status === "pending" || enquiry.status === "in_progress"
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb title="My Enquiries" 
            breadcrumbs={[
                { label: "Home", href: "/" }, 
                { label: "Enquiries" }
                ]} />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 text-primary">
                    Active Enquiries: {activeEnquiries.length}
                </h1>

                {activeEnquiries.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No active enquiries found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Accordion type="single" collapsible className="space-y-4">
                            {activeEnquiries.map((enquiry) => (
                                <AccordionItem
                                    key={enquiry.id}
                                    value={enquiry.id}
                                    className="bg-white rounded-lg border-0 shadow-sm"
                                >
                                    <AccordionTrigger className="hover:no-underline px-6 py-4">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold">
                                                        {enquiry.items && enquiry.items.length > 0
                                                            ? enquiry.items[0]?.product?.productName ||
                                                              "Product Enquiry"
                                                            : "Product Enquiry"}
                                                    </h3>
                                                    {enquiry.items?.some((item) => item.isCustom) && (
                                                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">
                                                            Custom Solution
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {formatEnquiryNumber(
                                                        enquiry.id,
                                                        enquiry.createdAt
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <span className={`text-sm px-2 py-1 rounded-md ${getEnquiryStatusColor(enquiry.status)}`}>
                                                    {getStatusLabel(enquiry.status)}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(enquiry.createdAt)}
                                                </span>
                                            </div>
                                            </div>
                                           
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-4">
                                        {enquiry.quotations && enquiry.quotations.length > 0 ? (
                                            <div className="space-y-3">
                                                {enquiry.quotations.map((quotation) => (
                                                    <div
                                                        key={quotation.id}
                                                        className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm px-6 cursor-pointer"
                                                        onClick={() => {
                                                            router.push(`/user/my-quotations/${quotation.id}`);
                                                        }}
                                                  >
                                                        <div>
                                                            <p className="text-sm text-gray-600">Quotation</p>
                                                            <h4 className="font-bold text-base mb-1">
                                                                {quotation.quotationNumber}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <p>No quotations yet for this enquiry.</p>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                )}
            </div>
        </div>
    );
}

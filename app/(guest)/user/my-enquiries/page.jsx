"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import BreadCrumb from "@/components/BreadCrumb";
import { toast } from "sonner";

export default function MyEnquiriesPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/login");
                return;
            }
            fetchEnquiries();
        }
    }, [isAuthenticated, authLoading]);

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

    // Format enquiry number
    const formatEnquiryNumber = (enquiryId, createdAt) => {
        const year = new Date(createdAt).getFullYear();
        // Use last 4 characters of UUID as number
        const number = enquiryId.slice(-4);
        return `Enquiry #${year}-${number}`;
    };

    if (authLoading || loading) {
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
                                                <h3 className="text-lg font-bold mb-1">
                                                    {enquiry.items && enquiry.items.length > 0
                                                        ? enquiry.items[0]?.productName ||
                                                          "Product Enquiry"
                                                        : "Product Enquiry"}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {formatEnquiryNumber(
                                                        enquiry.id,
                                                        enquiry.createdAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-4">
                                        {enquiry.quotations && enquiry.quotations.length > 0 ? (
                                            <div className="space-y-3">
                                                {enquiry.quotations.map((quotation) => (
                                                    <Card
                                                        key={quotation.id}
                                                        className="bg-white border rounded-lg shadow-sm"
                                                    >
                                                        <CardContent>
                                                            <h4 className="font-bold text-base mb-1">
                                                                {quotation.quotationNumber}
                                                            </h4>
                                                            {quotation.description && (
                                                                <p className="text-sm text-gray-600">
                                                                    {quotation.description}
                                                                </p>
                                                            )}
                                                        </CardContent>
                                                    </Card>
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

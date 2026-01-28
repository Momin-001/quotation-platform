"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BreadCrumb from "@/components/BreadCrumb";
import { toast } from "sonner";

export default function MyQuotationsPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [quotations, setQuotations] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/login");
                return;
            }
            fetchQuotations();
        }
    }, [isAuthenticated, authLoading]);

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

    const handleRequestNewQuotation = () => {
        // Navigate to products page or enquiry form
        router.push("/");
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
                    <Button
                        onClick={handleRequestNewQuotation}
                        variant="default"
                        size="lg"
                    >
                        Request New Quotation
                    </Button>
                </div>

                {/* Quotations List */}
                {quotations.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No quotations found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {quotations.map((quotation) => (
                            <Card
                                key={quotation.id}
                                className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => {
                                    // Navigate to quotation detail page (to be implemented)
                                    router.push(`/user/my-quotations/${quotation.id}`);
                                }}
                            >
                                <CardContent>
                                    <h3 className="text-lg font-bold mb-2">
                                        Quotation {quotation.quotationNumber}
                                    </h3>
                                    {quotation.description ? (
                                        <p className="text-sm text-gray-600">
                                            {quotation.description}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-600">
                                            No description available
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

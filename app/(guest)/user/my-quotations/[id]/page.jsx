"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import { format } from "date-fns";
import { FileText, ArrowLeft } from "lucide-react";
import { calculateItemTotal, formatCurrency } from "@/lib/helpers";
import { formatEnquiryNumber } from "@/lib/helpers";
import UserQuotationChat from "@/components/user/Quotation/UserQuotationChat";
import ProductItemDisplay from "@/components/common/ProductItemDisplay";

export default function QuotationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchQuotation();
    }, [params.id]);

    const fetchQuotation = async () => {
        try {
            const res = await fetch(`/api/user/quotations/${params.id}`);
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch quotation");
            }
            setQuotation(response.data);
        } catch (error) {
            toast.error(error.message);
            router.push("/user/my-quotations");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        if (actionLoading) return;

        const confirmMessages = {
            accept: "Are you sure you want to accept this quotation?",
            reject: "Are you sure you want to reject this quotation?",
            request_revision: "Are you sure you want to request a revision?",
        };

        if (!confirm(confirmMessages[action])) return;

        setActionLoading(action);
        try {
            const res = await fetch(`/api/user/quotations/${params.id}/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message);
            }
            toast.success(response.message);
            fetchQuotation(); // Refresh data
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownloadPDF = () => {
        toast.info("PDF download coming soon");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!quotation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Quotation not found</p>
            </div>
        );
    }

    const { mainProduct, alternativeProduct } = quotation;

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb
                title="Quotation Details"
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Quotations", href: "/user/my-quotations" },
                    { label: quotation.quotationNumber }
                ]}
            />

            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Back Button */}
                <Button
                    onClick={() => router.push("/user/my-quotations")}
                    variant="ghost"
                    className="p-0!"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Quotations
                </Button>

                {/* Header Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-primary font-medium">
                        {formatEnquiryNumber(quotation.enquiry?.id || "", quotation.createdAt)}
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Quotation {quotation.quotationNumber}
                    </h1>
                    {quotation.description && (
                        <p className="text-gray-600">{quotation.description}</p>
                    )}
                </div>

                {/* Project Info */}
                <div className="grid grid-cols-3 gap-4 bg-white rounded-lg border p-4">
                    <div>
                        <p className="text-sm text-gray-500">Project</p>
                        <p className="font-medium">{mainProduct?.product?.productName || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Valid Until</p>
                        <p className="font-medium">
                            {format(new Date(new Date(quotation.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000), "MMM dd, yyyy")}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    {/* Main Product Section */}
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold text-blue-700 mb-4">Main Product</h3>
                        {mainProduct.product && (
                            <>
                                <ProductItemDisplay
                                    product={mainProduct.product}
                                    quantity={mainProduct.quantity}
                                    unitPrice={mainProduct.unitPrice}
                                    description={mainProduct.description}
                                    taxPercentage={mainProduct.taxPercentage}
                                    discountPercentage={mainProduct.discountPercentage}
                                    badge="Main"
                                    badgeColor="bg-blue-600"

                                />

                                {/* Main Product Optional Items */}
                                {mainProduct.optionalItems && mainProduct.optionalItems.length > 0 && (
                                    <div className="mt-4 ml-8 border-l-3 border-blue-300 pl-4 space-y-2">
                                        <h5 className="text-sm font-semibold text-blue-600">Optional Products</h5>
                                        {mainProduct.optionalItems.map((opt, optIndex) => (
                                            <div key={optIndex} className="bg-blue-50/50 rounded-lg px-3 py-2">
                                                <ProductItemDisplay
                                                    product={opt.product}
                                                    quantity={opt.quantity}
                                                    unitPrice={opt.unitPrice}
                                                    description={opt.description}
                                                    taxPercentage={opt.taxPercentage}
                                                    discountPercentage={opt.discountPercentage}
                                                    badge="Optional"
                                                    badgeColor="bg-blue-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Main Product Total */}
                                <div className="mt-6 pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900">Main Product Total</p>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-700">
                                            {formatCurrency(
                                                calculateItemTotal(mainProduct.unitPrice, mainProduct.quantity, mainProduct.taxPercentage, mainProduct.discountPercentage) +
                                                (mainProduct.optionalItems?.reduce((sum, opt) => sum + calculateItemTotal(opt.unitPrice, opt.quantity, opt.taxPercentage, opt.discountPercentage), 0) || 0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Alternative Product Section */}
                    {alternativeProduct?.product && (
                        <div className="p-6 border-b bg-green-50/30">
                            <h3 className="text-xl font-semibold text-green-700 mb-4">Alternative Product</h3>
                            <ProductItemDisplay
                                product={alternativeProduct.product}
                                quantity={alternativeProduct.quantity}
                                unitPrice={alternativeProduct.unitPrice}
                                description={alternativeProduct.description}
                                taxPercentage={alternativeProduct.taxPercentage}
                                discountPercentage={alternativeProduct.discountPercentage}
                                badge="Alternative"
                                badgeColor="bg-green-600"
                            />

                            {/* Alternative Product Optional Items */}
                            {alternativeProduct.optionalItems && alternativeProduct.optionalItems.length > 0 && (
                                <div className="mt-4 ml-8 border-l-3 border-green-300 pl-4 space-y-2">
                                    <h5 className="text-sm font-semibold text-green-600">Optional Products</h5>
                                    {alternativeProduct.optionalItems.map((opt, optIndex) => (
                                        <div key={optIndex} className="bg-green-50 rounded-lg px-3 py-2">
                                            <ProductItemDisplay
                                                product={opt.product}
                                                quantity={opt.quantity}
                                                unitPrice={opt.unitPrice}
                                                description={opt.description}
                                                taxPercentage={opt.taxPercentage}
                                                discountPercentage={opt.discountPercentage}
                                                badge="Optional"
                                                badgeColor="bg-green-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Alternative Product Total */}
                            <div className="mt-6 pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900">Alternative Product Total</p>
                                    </div>
                                    <span className="text-2xl font-bold text-green-700">
                                        {formatCurrency(
                                            calculateItemTotal(alternativeProduct.unitPrice, alternativeProduct.quantity, alternativeProduct.taxPercentage, alternativeProduct.discountPercentage) +
                                            (alternativeProduct.optionalItems?.reduce((sum, opt) => sum + calculateItemTotal(opt.unitPrice, opt.quantity, opt.taxPercentage, opt.discountPercentage), 0) || 0)
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg border shadow-sm p-4">
                    <h3 className="text-lg font-semibold mb-4">Actions</h3>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Show action buttons if not disabled */}
                        {!quotation.buttonsDisabled ? (
                            <>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => handleAction("accept")}
                                    disabled={actionLoading !== null}
                                >
                                    {actionLoading === "accept" ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                    Accept
                                </Button>
                                <Button
                                    onClick={() => handleAction("reject")}
                                    disabled={actionLoading !== null}
                                    variant="destructive"
                                    size="lg"
                                >
                                    {actionLoading === "reject" ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => handleAction("request_revision")}
                                    disabled={actionLoading !== null}
                                    className="bg-yellow-500 hover:bg-yellow-600"
                                    size="lg"
                                >
                                    {actionLoading === "request_revision" ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                    Request Revision
                                </Button>
                            </>
                        ) : (
                            <div className="text-sm text-gray-600">
                                <p>
                                    Status: <span className="font-semibold capitalize">{quotation.status.replace("_", " ")}</span>
                                </p>
                                {quotation.buttonsDisabledReason && (
                                    <p className="text-xs text-gray-500 mt-1">{quotation.buttonsDisabledReason}</p>
                                )}
                            </div>
                        )}
                        <Button
                            onClick={handleDownloadPDF}
                            variant="default"
                            size="lg"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Chat Section */}
                <UserQuotationChat
                    quotationId={params.id}
                    chatDisabled={quotation.chatDisabled}
                    chatDisabledReason={quotation.chatDisabledReason}
                    currentUserId={user?.id}
                />
            </div>
        </div>
    );
}
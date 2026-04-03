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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/context/LanguageContext";

export default function QuotationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { language } = useLanguage();
    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

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

    const openConfirmDialog = (action) => {
        setPendingAction(action);
        setConfirmDialogOpen(true);
    };

    const handleAction = async (action) => {
        if (actionLoading) return;
        setConfirmDialogOpen(false);
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
            setPendingAction(null);
        }
    };

    const handleDownloadPDF = async () => {
        if (pdfLoading) return;
        setPdfLoading(true);
        try {
            const res = await fetch(`/api/user/quotations/${params.id}/pdf`);
            if (!res.ok) throw new Error("PDF generation failed");
            const blob = await res.blob();
            if (blob.size === 0) {
                return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Angebot-${quotation.quotationNumber}.pdf`;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("PDF downloaded");
            setTimeout(() => setPdfLoading(false), 4000);
        } catch (err) {
            toast.error(err.message || "Failed to download PDF");
        } finally {
            setPdfLoading(false);
        }
    };

    const confirmMessages = {
        accept: {
            title: "Accept quotation",
            description: "Are you sure you want to accept this quotation?",
        },
        reject: {
            title: "Reject quotation",
            description: "Are you sure you want to reject this quotation?",
        },
        request_revision: {
            title: "Request revision",
            description: "Are you sure you want to request a revision?",
        },
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
                title={language === "en" ? "Quotation Details" : "Angebot Details"}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Quotations" : "Angebote", href: "/user/my-quotations" },
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
                <div className="container mx-auto space-y-6 bg-gray-100 rounded-lg border shadow-sm p-4">
                <div className="p-2">
                    <p className="text-primary text-lg underline font-archivo font-bold">
                        {formatEnquiryNumber(quotation.enquiry?.id || "", quotation.createdAt)}
                    </p>
                    <h1 className="text-xl font-bold font-archivo text-gray-900">
                        Quotation {quotation.quotationNumber}
                    </h1>
                    {quotation.description && (
                        <p className="text-gray-600">{quotation.description}</p>
                    )}
                </div>

                {/* Project Info */}
                <div className="grid grid-cols-3 gap-4 px-6 py-2">
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

                <div className="bg-primary-foreground/80 rounded-lg border shadow-sm overflow-hidden">
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

                                {/* Main Product Additional Items (included in total) */}
                                {mainProduct.additionalItems && mainProduct.additionalItems.length > 0 && (
                                    <div className="mt-4 ml-8 border-l-3 border-purple-300 pl-4 space-y-2">
                                        <h5 className="text-sm font-semibold text-purple-600">Additional Products</h5>
                                        {mainProduct.additionalItems.map((add, addIndex) => (
                                            <div key={addIndex} className="bg-purple-50/50 rounded-lg px-3 py-2">
                                                <ProductItemDisplay
                                                    product={add.product}
                                                    quantity={add.quantity}
                                                    unitPrice={add.unitPrice}
                                                    description={add.description}
                                                    taxPercentage={add.taxPercentage}
                                                    discountPercentage={add.discountPercentage}
                                                    badge="Additional"
                                                    badgeColor="bg-purple-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Main Product Optional Items (not in total) */}
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

                                {/* Main Product Total (LED + additional only; optional excluded) */}
                                <div className="mt-6 pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900">Main Product Total</p>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-700">
                                            {formatCurrency(
                                                calculateItemTotal(mainProduct.unitPrice, mainProduct.quantity, mainProduct.taxPercentage, mainProduct.discountPercentage) +
                                                (mainProduct.additionalItems?.reduce((sum, add) => sum + calculateItemTotal(add.unitPrice, add.quantity, add.taxPercentage, add.discountPercentage), 0) || 0)
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

                            {/* Alternative Product Additional Items (included in total) */}
                            {alternativeProduct.additionalItems && alternativeProduct.additionalItems.length > 0 && (
                                <div className="mt-4 ml-8 border-l-3 border-purple-300 pl-4 space-y-2">
                                    <h5 className="text-sm font-semibold text-purple-600">Additional Products</h5>
                                    {alternativeProduct.additionalItems.map((add, addIndex) => (
                                        <div key={addIndex} className="bg-purple-50 rounded-lg px-3 py-2">
                                            <ProductItemDisplay
                                                product={add.product}
                                                quantity={add.quantity}
                                                unitPrice={add.unitPrice}
                                                description={add.description}
                                                taxPercentage={add.taxPercentage}
                                                discountPercentage={add.discountPercentage}
                                                badge="Additional"
                                                badgeColor="bg-purple-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Alternative Product Optional Items (not in total) */}
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

                            {/* Alternative Product Total (LED + additional only; optional excluded) */}
                            <div className="mt-6 pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900">Alternative Product Total</p>
                                    </div>
                                    <span className="text-2xl font-bold text-green-700">
                                        {formatCurrency(
                                            calculateItemTotal(alternativeProduct.unitPrice, alternativeProduct.quantity, alternativeProduct.taxPercentage, alternativeProduct.discountPercentage) +
                                            (alternativeProduct.additionalItems?.reduce((sum, add) => sum + calculateItemTotal(add.unitPrice, add.quantity, add.taxPercentage, add.discountPercentage), 0) || 0)
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Action Buttons */}
                <div className="p-4 border-b border-black/20">
                    <h3 className="text-xl font-bold font-open-sans mb-4">Actions</h3>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Show action buttons if not disabled */}
                        {!quotation.buttonsDisabled ? (
                            <>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => openConfirmDialog("accept")}
                                    disabled={actionLoading !== null || pdfLoading}
                                >
                                    {actionLoading === "accept" ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                    Accept
                                </Button>
                                <Button
                                    onClick={() => openConfirmDialog("reject")}
                                    disabled={actionLoading !== null || pdfLoading}
                                    variant="destructive"
                                    size="lg"
                                >
                                    {actionLoading === "reject" ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => openConfirmDialog("request_revision")}
                                    disabled={actionLoading !== null || pdfLoading}
                                    className="bg-[#FFE62E] text-black hover:bg-[#FFE62E]/90"
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
                            disabled={pdfLoading}
                        >
                            {pdfLoading ? <Spinner className="h-4 w-4 mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                            Download PDF
                        </Button>
                    </div>
                </div>

                <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {pendingAction ? confirmMessages[pendingAction]?.title : ""}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {pendingAction ? confirmMessages[pendingAction]?.description : ""}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => pendingAction && handleAction(pendingAction)}
                                className={pendingAction === "reject" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
                            >
                                Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Chat Section */}
                <UserQuotationChat
                    quotationId={params.id}
                    currentUserName={user?.fullName}
                    chatDisabled={quotation.chatDisabled}
                    chatDisabledReason={quotation.chatDisabledReason}
                    currentUserId={user?.id}
                />
            </div>
            </div>
        </div>
    );
}
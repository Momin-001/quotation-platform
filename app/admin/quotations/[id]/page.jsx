"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { FileText, ArrowLeft, ChevronDown, ChevronUp, Save } from "lucide-react";
import Link from "next/link";
import { calculateItemTotal, formatCurrency } from "@/lib/helpers";
import AdminQuotationChat from "@/components/admin/Quotation/AdminQuotationChat";
import ProductItemDisplay from "@/components/common/ProductItemDisplay";

const RichTextEditor = lazy(() => import("@/components/admin/RichTextEditor"));

export default function AdminQuotationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [sectionsOpen, setSectionsOpen] = useState(false);
    const [sections, setSections] = useState({
        sectionOfferHtml: "",
        sectionConditionsHtml: "",
        sectionOptionsHtml: "",
    });
    const [sectionsLoading, setSectionsLoading] = useState(false);
    const [sectionsSaving, setSectionsSaving] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchQuotation();
        }
    }, [params.id]);

    const fetchQuotation = async () => {
        try {
            const res = await fetch(`/api/admin/quotations/${params.id}`);
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch quotation");
            }
            setQuotation(response.data);
        } catch (error) {
            toast.error(error.message);
            router.push("/admin/quotations");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSections = async () => {
        const opening = !sectionsOpen;
        setSectionsOpen(opening);
        if (opening && !sections.sectionOfferHtml) {
            setSectionsLoading(true);
            try {
                const res = await fetch(`/api/admin/quotations/${params.id}/sections`);
                const response = await res.json();
                if (response.success) {
                    setSections({
                        sectionOfferHtml: response.data.sectionOfferHtml || "",
                        sectionConditionsHtml: response.data.sectionConditionsHtml || "",
                        sectionOptionsHtml: response.data.sectionOptionsHtml || "",
                    });
                }
            } catch (err) {
                toast.error("Failed to load sections");
            } finally {
                setSectionsLoading(false);
            }
        }
    };

    const handleSaveSections = async () => {
        setSectionsSaving(true);
        try {
            const res = await fetch(`/api/admin/quotations/${params.id}/sections`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sections),
            });
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            toast.success("PDF sections saved");
        } catch (err) {
            toast.error(err.message || "Failed to save sections");
        } finally {
            setSectionsSaving(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (pdfLoading) return;
        setPdfLoading(true);
        try {
            const res = await fetch(`/api/admin/quotations/${params.id}/pdf`);
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
            URL.revokeObjectURL(url);
            toast.success("PDF downloaded");
        } catch (err) {
            toast.error(err.message || "Failed to download PDF");
        } finally {
            setPdfLoading(false);
        }
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

    // Status color classes
    const getStatusColor = (status) => {
        switch (status) {
            case "draft": return "bg-gray-100 text-gray-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "accepted": return "bg-green-100 text-green-700";
            case "rejected": return "bg-red-100 text-red-700";
            case "revision_requested": return "bg-blue-100 text-blue-700";
            case "closed": return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    // Format status for display
    const formatStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Back Button */}
            <div>
                <Button 
                    onClick={() => router.back()} 
                    variant="ghost" 
                    className="mb-2 p-0!"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <h1 className="text-2xl font-bold font-archivo">
                    Quotation {quotation.quotationNumber}
                </h1>
            </div>

            {/* Quotation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border shadow-sm p-4">
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quotation.status)}`}>
                        {formatStatus(quotation.status)}
                    </span>
                </div>
                <div className="bg-white rounded-lg border shadow-sm p-4">
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{format(new Date(quotation.createdAt), "MMM dd, yyyy")}</p>
                </div>
                <div className="bg-white rounded-lg border shadow-sm p-4">
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

                            {/* Main Product Total (LED + additional only) */}
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

                        {/* Alternative Product Total (LED + additional only) */}
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

            {/* Actions */}
            <div className="bg-white rounded-lg border shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleDownloadPDF}
                        variant="default"
                        size="lg"
                        disabled={pdfLoading}
                    >
                        {pdfLoading ? <Spinner className="h-4 w-4 mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                        Download PDF
                    </Button>
                    <Link href={`/admin/enquiries/${quotation.enquiry?.id}/quotation`}>
                        <Button variant="secondary" size="lg">
                            Create New Revision
                        </Button>
                    </Link>
                </div>
            </div>

            {/* PDF Sections Editor */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <button
                    onClick={handleToggleSections}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                    <h3 className="text-lg font-semibold">Edit PDF Sections</h3>
                    {sectionsOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>
                {sectionsOpen && (
                    <div className="px-4 pb-4 space-y-6 border-t">
                        {sectionsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Spinner className="h-6 w-6" />
                            </div>
                        ) : (
                            <>
                                <div className="pt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        1. Unser Angebot / Our Offer
                                    </label>
                                    <Suspense fallback={<div className="border rounded-lg p-3 min-h-[120px] bg-gray-50 animate-pulse" />}>
                                        <RichTextEditor
                                            content={sections.sectionOfferHtml}
                                            onChange={(html) =>
                                                setSections((prev) => ({ ...prev, sectionOfferHtml: html }))
                                            }
                                        />
                                    </Suspense>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        3. Konditionen / Conditions
                                    </label>
                                    <Suspense fallback={<div className="border rounded-lg p-3 min-h-[120px] bg-gray-50 animate-pulse" />}>
                                        <RichTextEditor
                                            content={sections.sectionConditionsHtml}
                                            onChange={(html) =>
                                                setSections((prev) => ({ ...prev, sectionConditionsHtml: html }))
                                            }
                                        />
                                    </Suspense>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        5. Optionen / Options
                                    </label>
                                    <Suspense fallback={<div className="border rounded-lg p-3 min-h-[120px] bg-gray-50 animate-pulse" />}>
                                        <RichTextEditor
                                            content={sections.sectionOptionsHtml}
                                            onChange={(html) =>
                                                setSections((prev) => ({ ...prev, sectionOptionsHtml: html }))
                                            }
                                        />
                                    </Suspense>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveSections}
                                        disabled={sectionsSaving}
                                        size="lg"
                                    >
                                        {sectionsSaving ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Save Sections
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Chat Section */}
            <AdminQuotationChat
                quotationId={params.id}
                chatDisabled={quotation.chatDisabled}
                chatDisabledReason={quotation.chatDisabledReason}
            />
        </div>
    );
}
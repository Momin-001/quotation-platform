"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import { format } from "date-fns";
import { FileText, ArrowLeft } from "lucide-react";
import {
    calculateQuotationOfferTotals,
    formatCurrency,
    formatEnquiryNumber,
    formatDate,
    getStatusLabel,
    getQuotationStatusColor,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";
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
import { useTranslations } from "next-intl";

function OfferTotalsSummary({ item, label, color, quotationTaxPercentage }) {
    const t = useTranslations("User.quotationsDetail");
    if (!item?.product) return null;
    const { offerNet, tax, offerTotal, taxPercentage } = calculateQuotationOfferTotals(
        item,
        quotationTaxPercentage
    );

    const colorClass = color === "green" ? "text-green-700" : "text-blue-700";

    return (
        <div className="mt-6 pt-4 space-y-2 text-sm border-t border-gray-300">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:items-baseline">
                <span className="text-gray-600">{t("totalNet")}</span>
                <span className="font-medium tabular-nums">{formatCurrency(offerNet)}</span>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:items-baseline">
                <span className="text-gray-600 wrap-break-word">
                    {t("vatOn", { percentage: taxPercentage })}
                </span>
                <span className="font-medium tabular-nums">{formatCurrency(tax)}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-baseline border-t border-gray-300 pt-3">
                <span className="text-base sm:text-lg font-semibold text-gray-900">
                    {t("totalLabel", { label })}
                </span>
                <span className={`text-xl sm:text-2xl font-bold tabular-nums ${colorClass}`}>
                    {formatCurrency(offerTotal)}
                </span>
            </div>
        </div>
    );
}

export default function QuotationDetailPage() {
    const t = useTranslations("User.quotationsDetail");
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
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
            URL.revokeObjectURL(url);
            toast.success(t("pdfDownloaded"));
        } catch (err) {
            toast.error(err.message || t("pdfFailed"));
        } finally {
            setPdfLoading(false);
        }
    };

    const confirmMessages = {
        accept: {
            title: t("confirmAcceptTitle"),
            description: t("confirmAcceptDescription"),
        },
        reject: {
            title: t("confirmRejectTitle"),
            description: t("confirmRejectDescription"),
        },
        request_revision: {
            title: t("confirmRevisionTitle"),
            description: t("confirmRevisionDescription"),
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
                <p>{t("notFound")}</p>
            </div>
        );
    }

    const { mainProduct, alternativeProduct } = quotation;
    const quotationTax = quotation.taxPercentage ?? "19";
    const validUntil = format(
        new Date(new Date(quotation.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000),
        "MMM dd, yyyy"
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb
                title={t("title")}
                breadcrumbs={[
                    { label: t("breadcrumbHome"), href: "/" },
                    { label: t("breadcrumbQuotations"), href: "/user/my-quotations" },
                    { label: quotation.quotationNumber },
                ]}
            />

            <main className="container mx-auto px-4 lg:px-6 py-6 sm:py-8 space-y-6">
                <Button
                    onClick={() => router.push("/user/my-quotations")}
                    variant="ghost"
                    className="h-auto p-0 text-sm font-medium text-primary hover:text-primary/80 -ml-1"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 shrink-0" />
                    {t("backToQuotations")}
                </Button>

                {/* Header */}
                <div className="rounded-xl border border-border/60 bg-white shadow-sm p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-1">
                            <p className="text-sm font-medium text-primary break-all">
                                {formatEnquiryNumber(quotation.enquiry?.id || "", quotation.createdAt)}
                            </p>
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight wrap-break-word">
                                {t("quotation")} {quotation.quotationNumber}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {t("created")}: {formatDate(quotation.createdAt)}
                            </p>
                        </div>
                        <span
                            className={cn(
                                "self-start shrink-0 text-xs font-medium px-2.5 py-1 rounded-md",
                                getQuotationStatusColor(quotation.status)
                            )}
                        >
                            {getStatusLabel(quotation.status)}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60">
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                {t("project")}
                            </p>
                            <p className="font-medium text-foreground mt-0.5 wrap-break-word">
                                {mainProduct?.product?.productName || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                {t("validUntil")}
                            </p>
                            <p className="font-medium text-foreground mt-0.5">{validUntil}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden">
                    {/* Main Product Section */}
                    <div className="p-4 sm:p-6 border-b border-border/60">
                        <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-4">
                            {t("mainProduct")}
                        </h3>
                        {mainProduct.product && (
                            <>
                                <ProductItemDisplay
                                    product={mainProduct.product}
                                    quantity={
                                        mainProduct.product?.isCustom
                                            ? mainProduct.product?.customTotalCabinets
                                            : mainProduct.quantity
                                    }
                                    unitPrice={mainProduct.unitPrice}
                                    description={mainProduct.description}
                                    discountPercentage={mainProduct.discountPercentage}
                                    badge={t("badgeMain")}
                                    badgeColor="bg-blue-600"
                                    quotationTaxPercentage={quotationTax}
                                />

                                {/* Main Product Additional Items (included in total) */}
                                {mainProduct.additionalItems && mainProduct.additionalItems.length > 0 && (
                                    <div className="mt-4 ml-0 sm:ml-4 lg:ml-8 border-l-2 sm:border-l-3 border-purple-300 pl-3 sm:pl-4 space-y-2">
                                        <h5 className="text-sm font-semibold text-purple-600">
                                            {t("additionalProducts")}
                                        </h5>
                                        {mainProduct.additionalItems.map((add, addIndex) => (
                                            <div key={addIndex} className="bg-purple-50/50 rounded-lg px-3 py-2">
                                                <ProductItemDisplay
                                                    product={add.product}
                                                    quantity={
                                                        add.product?.isCustom
                                                            ? add.product?.customTotalCabinets
                                                            : add.quantity
                                                    }
                                                    unitPrice={add.unitPrice}
                                                    description={add.description}
                                                    discountPercentage={add.discountPercentage}
                                                    badge={t("badgeAdditional")}
                                                    badgeColor="bg-purple-500"
                                                    quotationTaxPercentage={quotationTax}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Main Product Optional Items (included in offer net + VAT) */}
                                {mainProduct.optionalItems && mainProduct.optionalItems.length > 0 && (
                                    <div className="mt-4 ml-0 sm:ml-4 lg:ml-8 border-l-2 sm:border-l-3 border-blue-300 pl-3 sm:pl-4 space-y-2">
                                        <h5 className="text-sm font-semibold text-blue-600">
                                            {t("optionalProducts")}
                                        </h5>
                                        {mainProduct.optionalItems.map((opt, optIndex) => (
                                            <div key={optIndex} className="bg-blue-50/50 rounded-lg px-3 py-2">
                                                <ProductItemDisplay
                                                    product={opt.product}
                                                    quantity={
                                                        opt.product?.isCustom
                                                            ? opt.product?.customTotalCabinets
                                                            : opt.quantity
                                                    }
                                                    unitPrice={opt.unitPrice}
                                                    description={opt.description}
                                                    discountPercentage={opt.discountPercentage}
                                                    badge={t("badgeOptional")}
                                                    badgeColor="bg-blue-500"
                                                    quotationTaxPercentage={quotationTax}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Custom LED Wall Summary (LEDitor enquiries) */}
                                {mainProduct.product?.isCustom && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h5 className="text-sm font-semibold text-blue-700 mb-2">
                                            {t("customLedWallSummary")}
                                        </h5>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                                            {mainProduct.product.customTotalCabinets && (
                                                <p><span className="text-gray-500">{t("cabinets")}</span> {mainProduct.product.customTotalCabinets}</p>
                                            )}
                                            {mainProduct.product.customScreenWidth && mainProduct.product.customScreenHeight && (
                                                <p><span className="text-gray-500">{t("dimensions")}</span> {mainProduct.product.customScreenWidth}m × {mainProduct.product.customScreenHeight}m</p>
                                            )}
                                            {mainProduct.product.customDisplayArea && (
                                                <p><span className="text-gray-500">{t("displayArea")}</span> {mainProduct.product.customDisplayArea} m²</p>
                                            )}
                                            {mainProduct.product.customTotalResolutionH && mainProduct.product.customTotalResolutionV && (
                                                <p><span className="text-gray-500">{t("resolution")}</span> {mainProduct.product.customTotalResolutionH}×{mainProduct.product.customTotalResolutionV} px</p>
                                            )}
                                            {mainProduct.product.customWeight && (
                                                <p><span className="text-gray-500">{t("totalWeight")}</span> {mainProduct.product.customWeight} kg</p>
                                            )}
                                            {mainProduct.product.customPowerConsumptionMax && (
                                                <p><span className="text-gray-500">{t("powerMax")}</span> {mainProduct.product.customPowerConsumptionMax} kW</p>
                                            )}
                                            {mainProduct.product.customPowerConsumptionTyp && (
                                                <p><span className="text-gray-500">{t("powerTypical")}</span> {mainProduct.product.customPowerConsumptionTyp} kW</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Main Product Totals Summary */}
                                <OfferTotalsSummary
                                    item={mainProduct}
                                    label={t("mainProduct")}
                                    color="blue"
                                    quotationTaxPercentage={quotationTax}
                                />
                            </>
                        )}
                    </div>

                    {/* Alternative Product Section */}
                    {alternativeProduct?.product && (
                        <div className="p-4 sm:p-6 border-b border-border/60 bg-green-50/30">
                            <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-4">
                                {t("alternativeProduct")}
                            </h3>
                            <ProductItemDisplay
                                product={alternativeProduct.product}
                                quantity={
                                    alternativeProduct.product?.isCustom
                                        ? alternativeProduct.product?.customTotalCabinets
                                        : alternativeProduct.quantity
                                }
                                unitPrice={alternativeProduct.unitPrice}
                                description={alternativeProduct.description}
                                discountPercentage={alternativeProduct.discountPercentage}
                                badge={t("badgeAlternative")}
                                badgeColor="bg-green-600"
                                quotationTaxPercentage={quotationTax}
                            />

                            {/* Alternative Product Additional Items (included in total) */}
                            {alternativeProduct.additionalItems && alternativeProduct.additionalItems.length > 0 && (
                                <div className="mt-4 ml-0 sm:ml-4 lg:ml-8 border-l-2 sm:border-l-3 border-purple-300 pl-3 sm:pl-4 space-y-2">
                                    <h5 className="text-sm font-semibold text-purple-600">Additional Products</h5>
                                    {alternativeProduct.additionalItems.map((add, addIndex) => (
                                        <div key={addIndex} className="bg-purple-50 rounded-lg px-3 py-2">
                                            <ProductItemDisplay
                                                product={add.product}
                                                quantity={
                                                    add.product?.isCustom
                                                        ? add.product?.customTotalCabinets
                                                        : add.quantity
                                                }
                                                unitPrice={add.unitPrice}
                                                description={add.description}
                                                discountPercentage={add.discountPercentage}
                                                badge="Additional"
                                                badgeColor="bg-purple-500"
                                                quotationTaxPercentage={quotationTax}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Alternative Product Optional Items (included in offer net + VAT) */}
                            {alternativeProduct.optionalItems && alternativeProduct.optionalItems.length > 0 && (
                                <div className="mt-4 ml-0 sm:ml-4 lg:ml-8 border-l-2 sm:border-l-3 border-green-300 pl-3 sm:pl-4 space-y-2">
                                        <h5 className="text-sm font-semibold text-green-600">
                                            {t("optionalProducts")}
                                        </h5>
                                    {alternativeProduct.optionalItems.map((opt, optIndex) => (
                                        <div key={optIndex} className="bg-green-50 rounded-lg px-3 py-2">
                                            <ProductItemDisplay
                                                product={opt.product}
                                                quantity={
                                                    opt.product?.isCustom
                                                        ? opt.product?.customTotalCabinets
                                                        : opt.quantity
                                                }
                                                unitPrice={opt.unitPrice}
                                                description={opt.description}
                                                discountPercentage={opt.discountPercentage}
                                                badge="Optional"
                                                badgeColor="bg-green-500"
                                                quotationTaxPercentage={quotationTax}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Alternative Product Totals Summary */}
                            <OfferTotalsSummary
                                item={alternativeProduct}
                                label={t("alternativeProduct")}
                                color="green"
                                quotationTaxPercentage={quotationTax}
                            />
                        </div>
                    )}

                </div>

                {/* Actions */}
                <div className="rounded-xl border border-border/60 bg-white shadow-sm p-4 sm:p-6 space-y-4">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                        {t("actions")}
                    </h3>

                    {quotation.buttonsDisabled && (
                        <div className="rounded-lg bg-muted/50 border border-border/60 px-4 py-3 space-y-1">
                            <p className="text-sm text-foreground">
                                <span className="text-muted-foreground">
                                    {t("status")}:{" "}
                                </span>
                                <span
                                    className={cn(
                                        "inline-flex text-xs font-medium px-2 py-0.5 rounded-md align-middle",
                                        getQuotationStatusColor(quotation.status)
                                    )}
                                >
                                    {getStatusLabel(quotation.status)}
                                </span>
                            </p>
                            {quotation.buttonsDisabledReason && (
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {quotation.buttonsDisabledReason}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        {!quotation.buttonsDisabled && (
                            <>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="w-full sm:w-auto"
                                    onClick={() => openConfirmDialog("accept")}
                                    disabled={actionLoading !== null || pdfLoading}
                                >
                                    {actionLoading === "accept" ? (
                                        <Spinner className="h-4 w-4 mr-2" />
                                    ) : null}
                                    {t("accept")}
                                </Button>
                                <Button
                                    onClick={() => openConfirmDialog("reject")}
                                    disabled={actionLoading !== null || pdfLoading}
                                    variant="destructive"
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    {actionLoading === "reject" ? (
                                        <Spinner className="h-4 w-4 mr-2" />
                                    ) : null}
                                    {t("reject")}
                                </Button>
                                <Button
                                    onClick={() => openConfirmDialog("request_revision")}
                                    disabled={actionLoading !== null || pdfLoading}
                                    className="w-full sm:w-auto bg-[#FFE62E] text-black hover:bg-[#FFE62E]/90"
                                    size="lg"
                                >
                                    {actionLoading === "request_revision" ? (
                                        <Spinner className="h-4 w-4 mr-2" />
                                    ) : null}
                                    {t("requestRevision")}
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={handleDownloadPDF}
                            variant="default"
                            size="lg"
                            className="w-full sm:w-auto"
                            disabled={pdfLoading}
                        >
                            {pdfLoading ? (
                                <Spinner className="h-4 w-4 mr-2" />
                            ) : (
                                <FileText className="h-4 w-4 mr-2" />
                            )}
                            {t("downloadPdf")}
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
                        <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <AlertDialogCancel className="w-full sm:w-auto">{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                className={cn(
                                    "w-full sm:w-auto",
                                    pendingAction === "reject"
                                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        : undefined
                                )}
                                onClick={() => pendingAction && handleAction(pendingAction)}
                            >
                                {t("confirm")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div className="rounded-xl border border-border/60 bg-white shadow-sm p-4 sm:p-6">
                    <UserQuotationChat
                        quotationId={params.id}
                        currentUserName={user?.fullName}
                        chatDisabled={quotation.chatDisabled}
                        chatDisabledReason={quotation.chatDisabledReason}
                        currentUserId={user?.id}
                    />
                </div>
            </main>
        </div>
    );
}
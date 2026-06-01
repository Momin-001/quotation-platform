"use client";

import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Spinner } from "@/components/ui/spinner";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import {
    formatEnquiryNumber,
    formatDate,
    getStatusLabel,
    getQuotationStatusColor,
} from "@/lib/helpers";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ChevronRight, FileText, Inbox } from "lucide-react";

export default function MyQuotationsPage() {
    const t = useTranslations("User.quotations");
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
            <div className="min-h-[50vh] flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner className="h-6 w-6" />
                    <span className="text-sm">{t("loading")}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb
                title={t("title")}
                breadcrumbs={[
                    { label: t("breadcrumbHome"), href: "/" },
                    { label: t("title") },
                ]}
            />
            <main className="container mx-auto px-4 lg:px-6 py-6 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <p className="text-lg sm:text-xl font-semibold text-primary mt-2">
                        {t("activeQuotations")}
                        <span className="text-primary ml-1.5">({pendingCount})</span>
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                        {t("description")}
                    </p>
                </div>

                {quotations.length === 0 ? (
                    <div className="text-center py-14 px-6 rounded-xl border border-dashed border-border/60 bg-white/60">
                        <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            {t("empty")}
                        </p>
                        <Link
                            href="/user/my-enquiries"
                            className="inline-block mt-4 text-sm font-medium text-primary hover:text-primary/80"
                        >
                            {t("viewEnquiries")}
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {quotations.map((quotation) => (
                            <li key={quotation.id}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(`/user/my-quotations/${quotation.id}`)
                                    }
                                    className="w-full rounded-xl border border-border/60 bg-white px-4 sm:px-5 py-4 shadow-sm text-left hover:border-primary/40 hover:shadow-md hover:-translate-y-px transition-all group"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-base sm:text-lg font-semibold text-foreground leading-snug truncate">
                                                    {t("quotation")} {quotation.quotationNumber}
                                                </h2>
                                                {quotation.enquiryId && (
                                                    <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-0.5">
                                                        {formatEnquiryNumber(
                                                            quotation.enquiryId,
                                                            quotation.createdAt
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span
                                                    className={cn(
                                                        "text-xs font-medium px-2.5 py-1 rounded-md",
                                                        getQuotationStatusColor(quotation.status)
                                                    )}
                                                >
                                                    {getStatusLabel(quotation.status)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(quotation.createdAt)}
                                                </span>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary hidden sm:block" />
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}

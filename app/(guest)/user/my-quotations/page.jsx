"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import {
    formatEnquiryNumber,
    formatDate,
    getStatusLabel,
    getQuotationStatusColor,
} from "@/lib/helpers";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { ChevronRight, FileText, Inbox } from "lucide-react";
import Link from "next/link";

export default function MyQuotationsPage() {
    const { language } = useLanguage();
    const isEn = language === "en";
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
                    <span className="text-sm">
                        {isEn ? "Loading quotations…" : "Angebote werden geladen…"}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb
                title={isEn ? "My quotations" : "Meine Angebote"}
                breadcrumbs={[
                    { label: isEn ? "Home" : "Startseite", href: "/" },
                    { label: isEn ? "My quotations" : "Meine Angebote" },
                ]}
            />
            <main className="container mx-auto px-4 lg:px-6 py-6 sm:py-8">
                <div className="mb-6 sm:mb-8">
                <p className="text-lg sm:text-xl font-semibold text-primary mt-2">
                        {isEn ? "Active quotations" : "Aktive Angebote"}
                        <span className="text-primary ml-1.5">({pendingCount})</span>
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                        {isEn
                            ? "Review offers from our team, download PDFs, and accept or request changes."
                            : "Prüfen Sie Angebote, laden Sie PDFs herunter und nehmen Sie Angebote an oder fordern Sie Änderungen an."}
                    </p>

                </div>

                {quotations.length === 0 ? (
                    <div className="text-center py-14 px-6 rounded-xl border border-dashed border-border/60 bg-white/60">
                        <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            {isEn
                                ? "No quotations yet. They will appear here once your enquiry is processed."
                                : "Noch keine Angebote. Sie erscheinen hier, sobald Ihre Anfrage bearbeitet wurde."}
                        </p>
                        <Link
                            href="/user/my-enquiries"
                            className="inline-block mt-4 text-sm font-medium text-primary hover:text-primary/80"
                        >
                            {isEn ? "View my enquiries" : "Meine Anfragen ansehen"}
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
                                                    {isEn ? "Quotation" : "Angebot"}{" "}
                                                    {quotation.quotationNumber}
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

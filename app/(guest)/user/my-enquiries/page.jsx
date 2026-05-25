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
import {
    formatEnquiryNumber,
    formatDate,
    getStatusLabel,
    getEnquiryStatusColor,
} from "@/lib/helpers";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { ChevronRight, FileText, Inbox } from "lucide-react";
import Link from "next/link";

const enquiryAccordionPanel =
    "rounded-xl border border-border/60 overflow-hidden bg-white shadow-sm";
const enquiryAccordionTrigger =
    "hover:no-underline hover:bg-muted/20 px-4 sm:px-5 py-4 text-foreground data-[state=open]:bg-muted/10";
const enquiryAccordionContent = "px-4 sm:px-5 pb-4 pt-0 border-t border-border/40 bg-muted/10";

export default function MyEnquiriesPage() {
    const { language } = useLanguage();
    const isEn = language === "en";
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

    const activeEnquiries = enquiries.filter(
        (enquiry) => enquiry.status === "pending" || enquiry.status === "in_progress"
    );

    const getEnquiryTitle = (enquiry) => {
        const first = enquiry.items?.[0];
        if (first?.isCustom) {
            return isEn ? "Custom LED solution" : "Individuelle LED-Lösung";
        }
        return (
            first?.product?.productName ||
            (isEn ? "Product enquiry" : "Produktanfrage")
        );
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner className="h-6 w-6" />
                    <span className="text-sm">
                        {isEn ? "Loading enquiries…" : "Anfragen werden geladen…"}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb
                title={isEn ? "My enquiries" : "Meine Anfragen"}
                breadcrumbs={[
                    { label: isEn ? "Home" : "Startseite", href: "/" },
                    { label: isEn ? "My enquiries" : "Meine Anfragen" },
                ]}
            />
            <main className="container mx-auto px-4 lg:px-6 py-6 sm:py-8">
                <div className="mb-6 sm:mb-8">
                <p className="text-lg sm:text-xl font-semibold text-primary mt-2">
                        {isEn ? "Active enquiries" : "Aktive Anfragen"}
                        <span className="text-primary ml-1.5">({activeEnquiries.length})</span>
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                        {isEn
                            ? "Track active enquiries and open quotations linked to each request."
                            : "Verfolgen Sie aktive Anfragen und zugehörige Angebote."}
                    </p>

                </div>

                {activeEnquiries.length === 0 ? (
                    <div className="text-center py-14 px-6 rounded-xl border border-dashed border-border/60 bg-white/60">
                        <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            {isEn
                                ? "You have no active enquiries. Submit a request from the cart or Leditor."
                                : "Keine aktiven Anfragen. Senden Sie eine Anfrage über den Warenkorb oder Leditor."}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <Link
                                href="/products"
                                className="text-sm font-medium text-primary hover:text-primary/80"
                            >
                                {isEn ? "Browse products" : "Produkte ansehen"}
                            </Link>
                            <span className="text-muted-foreground">·</span>
                            <Link
                                href="/leditor"
                                className="text-sm font-medium text-primary hover:text-primary/80"
                            >
                                Leditor
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeEnquiries.map((enquiry) => (
                            <Accordion
                                key={enquiry.id}
                                type="single"
                                collapsible
                                className={enquiryAccordionPanel}
                            >
                                <AccordionItem value={enquiry.id} className="border-0">
                                    <AccordionTrigger className={enquiryAccordionTrigger}>
                                        <div className="flex flex-1 items-start justify-between gap-4 min-w-0 text-left">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h2 className="text-base sm:text-lg font-semibold text-foreground leading-snug truncate">
                                                        {getEnquiryTitle(enquiry)}
                                                    </h2>
                                                    {enquiry.items?.some((item) => item.isCustom) && (
                                                        <span className="inline-flex text-[10px] sm:text-xs font-semibold uppercase tracking-wide bg-secondary text-primary-foreground px-2 py-0.5 rounded-md shrink-0">
                                                            {isEn ? "Custom" : "Individuell"}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                                                    {formatEnquiryNumber(
                                                        enquiry.id,
                                                        enquiry.createdAt
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <span
                                                    className={cn(
                                                        "text-xs font-medium px-2.5 py-1 rounded-md",
                                                        getEnquiryStatusColor(enquiry.status)
                                                    )}
                                                >
                                                    {getStatusLabel(enquiry.status)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(enquiry.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className={enquiryAccordionContent}>
                                        {enquiry.quotations && enquiry.quotations.length > 0 ? (
                                            <ul className="space-y-2 pt-3">
                                                {enquiry.quotations.map((quotation) => (
                                                    <li key={quotation.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/user/my-quotations/${quotation.id}`
                                                                )
                                                            }
                                                            className="w-full flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-white px-4 py-3 text-left shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                    <FileText className="h-4 w-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {isEn
                                                                            ? "Quotation"
                                                                            : "Angebot"}
                                                                    </p>
                                                                    <p className="text-sm font-semibold text-foreground truncate">
                                                                        {quotation.quotationNumber}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-6">
                                                {isEn
                                                    ? "No quotations yet for this enquiry."
                                                    : "Noch keine Angebote zu dieser Anfrage."}
                                            </p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

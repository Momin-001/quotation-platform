import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BreadCrumb from "@/components/user/BreadCrumb";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    formatEnquiryNumber,
    formatDate,
    getStatusLabel,
    getEnquiryStatusColor,
} from "@/lib/helpers/helpers";
import { guestPageAlternates, validateLocale } from "@/lib/i18n/metadata";
import { getCurrentUser } from "@/lib/helpers/auth-helpers";
import { fetchUserEnquiries } from "@/features/enquiries/user-enquiries";
import { cn } from "@/lib/utils";
import { ChevronRight, FileText, Inbox } from "lucide-react";

const enquiryAccordionPanel =
    "rounded-xl border border-border/60 overflow-hidden bg-white shadow-sm";
const enquiryAccordionTrigger =
    "hover:no-underline hover:bg-muted/20 px-4 sm:px-5 py-4 text-foreground data-[state=open]:bg-muted/10";
const enquiryAccordionContent = "px-4 sm:px-5 pb-4 pt-0 border-t border-border/40 bg-muted/10";

function getEnquiryTitle(enquiry, t) {
    const first = enquiry.items?.[0];
    if (first?.isCustom) {
        return t("customLedSolution");
    }
    return first?.product?.productName || t("productEnquiry");
}

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageAlternates("/user/my-enquiries", validateLocale(locale));
}

export default async function MyEnquiriesPage() {
    const t = await getTranslations("User.enquiries");
    const { user } = await getCurrentUser();

    let enquiries = [];
    if (user) {
        try {
            enquiries = await fetchUserEnquiries(user.id);
        } catch {
            enquiries = [];
        }
    }

    const activeEnquiries = enquiries
        .filter(
            (enquiry) => enquiry.status === "pending" || enquiry.status === "in_progress"
        )
        .map((enquiry) => ({
            ...enquiry,
            title: getEnquiryTitle(enquiry, t),
            hasCustomItems: enquiry.items?.some((item) => item.isCustom) ?? false,
        }));

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
                        {t("activeEnquiries")}
                        <span className="text-primary ml-1.5">({activeEnquiries.length})</span>
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                        {t("description")}
                    </p>
                </div>

                {activeEnquiries.length === 0 ? (
                    <div className="text-center py-14 px-6 rounded-xl border border-dashed border-border/60 bg-white/60">
                        <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            {t("empty")}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <Link
                                href="/products"
                                className="text-sm font-medium text-primary hover:text-primary/80"
                            >
                                {t("browseProducts")}
                            </Link>
                            <span className="text-muted-foreground">·</span>
                            <Link
                                href="/leditor"
                                className="text-sm font-medium text-primary hover:text-primary/80"
                            >
                                {t("leditor")}
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
                                <AccordionItem value={String(enquiry.id)} className="border-0">
                                    <AccordionTrigger className={enquiryAccordionTrigger}>
                                        <div className="flex flex-1 items-start justify-between gap-4 min-w-0 text-left">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h2 className="text-base sm:text-lg font-semibold text-foreground leading-snug truncate">
                                                        {enquiry.title}
                                                    </h2>
                                                    {enquiry.hasCustomItems && (
                                                        <span className="inline-flex text-[10px] sm:text-xs font-semibold uppercase tracking-wide bg-secondary text-primary-foreground px-2 py-0.5 rounded-md shrink-0">
                                                            {t("custom")}
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
                                        {enquiry.quotations?.length > 0 ? (
                                            <ul className="space-y-2 pt-3">
                                                {enquiry.quotations.map((quotation) => (
                                                    <li key={quotation.id}>
                                                        <Link
                                                            href={`/user/my-quotations/${quotation.id}`}
                                                            className="w-full flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-white px-4 py-3 text-left shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                    <FileText className="h-4 w-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {t("quotation")}
                                                                    </p>
                                                                    <p className="text-sm font-semibold text-foreground truncate">
                                                                        {quotation.quotationNumber}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-6">
                                                {t("noQuotationsYet")}
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

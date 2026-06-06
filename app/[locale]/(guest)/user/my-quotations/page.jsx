import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BreadCrumb from "@/components/user/BreadCrumb";
import {
    formatEnquiryNumber,
    formatDate,
    getStatusLabel,
    getQuotationStatusColor,
} from "@/lib/helpers/helpers";
import { getCurrentUser } from "@/lib/helpers/auth-helpers";
import { fetchUserQuotations } from "@/features/quotations/user-quotations";
import { cn } from "@/lib/utils";
import { ChevronRight, FileText, Inbox } from "lucide-react";

export default async function MyQuotationsPage() {
    const t = await getTranslations("User.quotations");
    const { user } = await getCurrentUser();

    let quotations = [];
    let pendingCount = 0;

    if (user) {
        try {
            const data = await fetchUserQuotations(user.id);
            quotations = data.quotations;
            pendingCount = data.pendingCount;
        } catch {
            quotations = [];
            pendingCount = 0;
        }
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
                                <Link
                                    href={`/user/my-quotations/${quotation.id}`}
                                    className="w-full rounded-xl border border-border/60 bg-white px-4 sm:px-5 py-4 shadow-sm text-left hover:border-primary/40 hover:shadow-md hover:-translate-y-px transition-all group block"
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
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}

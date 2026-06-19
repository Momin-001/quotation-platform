import { getTranslations } from "next-intl/server";
import { Plus, X } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import BreadCrumb from "@/components/user/BreadCrumb";
import { fetchGuestFaqsListing } from "@/features/faqs/guest-faqs-list";
import { cmsField } from "@/lib/i18n/cms";
import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("/faqs", validateLocale(locale));
}

export default async function FAQsPage({ params }) {
    const { locale } = await params;
    const resolvedLocale = validateLocale(locale);
    const t = await getTranslations("FaqsPage");
    const tCommon = await getTranslations("Common");

    let faqs = [];
    try {
        faqs = await fetchGuestFaqsListing();
    } catch (error) {
        console.error("FAQs page fetch error:", error);
    }

    const faqItems = faqs.map((faq) => ({
        id: faq.id,
        title: cmsField(faq, "title", resolvedLocale),
        description: cmsField(faq, "description", resolvedLocale),
    }));

    return (
        <div className="flex flex-col min-h-screen">
            <BreadCrumb
                title={t("breadcrumb")}
                breadcrumbs={[
                    { label: tCommon("home"), href: "/" },
                    { label: t("breadcrumb") },
                ]}
            />
            <main className="flex-1 flex flex-col bg-linear-to-br from-white to-blue-50">
                <section className="flex-1 w-full py-16 md:py-20 lg:py-24">
                    <div className="container mx-auto px-4 lg:px-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="space-y-3 mb-10 md:mb-12 text-center">
                                <p className="text-sm font-medium text-primary uppercase tracking-wide">
                                    {t("overline")}
                                </p>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
                                    {t("title")}
                                </h2>
                            </div>

                            {faqItems.length > 0 ? (
                                <Accordion
                                    type="single"
                                    collapsible
                                    defaultValue="0"
                                    className="space-y-3"
                                >
                                    {faqItems.map((faq, index) => (
                                        <AccordionItem
                                            key={faq.id}
                                            value={index.toString()}
                                            className="group bg-white rounded-lg border overflow-hidden transition-all duration-300 shadow-sm border-gray-200 data-[state=open]:shadow-md data-[state=open]:border-primary/40"
                                        >
                                            <AccordionTrigger className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition-colors [&>svg]:hidden">
                                                <h3 className="text-[15px] sm:text-base pr-4 leading-snug font-normal text-foreground/80 group-data-[state=open]:font-semibold group-data-[state=open]:text-foreground">
                                                    {faq.title}
                                                </h3>
                                                <div className="shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors bg-gray-200 text-foreground/60 group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground">
                                                    <Plus className="h-3.5 w-3.5 group-data-[state=open]:hidden" />
                                                    <X className="h-3.5 w-3.5 hidden group-data-[state=open]:block" />
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-5 pb-5 pt-0">
                                                <p className="text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
                                                    {faq.description}
                                                </p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p className="text-sm">{t("empty")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

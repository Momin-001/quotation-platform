import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Plus, X, ArrowRight } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cmsField } from "@/lib/i18n/cms";

export default async function FAQSection({
    homepageData,
    faqsData = [],
    locale,
    showAll = false,
}) {
    const t = await getTranslations("Home.faq");
    const faqs = Array.isArray(faqsData) ? faqsData : [];

    const faqItems = faqs.map((faq) => ({
        id: faq.id,
        title: cmsField(faq, "title", locale),
        description: cmsField(faq, "description", locale),
    }));

    return (
        <section className="w-full bg-linear-to-br from-white to-blue-50 py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    <div className="space-y-3 lg:sticky lg:top-32">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold  text-foreground leading-tight tracking-tight">
                            {cmsField(homepageData, "faqTitle", locale)}
                        </h2>
                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
                            {cmsField(homepageData, "faqSubtitle", locale)}
                        </p>
                    </div>

                    <div>
                        {faqItems.length > 0 ? (
                            <>
                                <Accordion
                                    type="single"
                                    collapsible
                                    defaultValue="0"
                                    className="space-y-3"
                                >
                                    {faqItems.map((faq, index) => (
                                        <AccordionItem
                                            key={faq.id ?? index}
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
                                {!showAll && (
                                    <div className="pt-5 text-center">
                                        <Link href="/faqs">
                                            <Button variant="link" className="text-primary hover:text-primary/80">
                                                {t("viewAll")}
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-sm">{t("empty")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

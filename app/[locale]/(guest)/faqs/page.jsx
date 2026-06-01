"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Spinner } from "@/components/ui/spinner";
import BreadCrumb from "@/components/user/BreadCrumb";
import { cmsField } from "@/lib/i18n/cms";
import { useLocale } from "next-intl";
import { toast } from "sonner";

export default function FAQsPage() {
    const locale = useLocale();
    const t = useTranslations("FaqsPage");
    const tCommon = useTranslations("Common");
    const [openValue, setOpenValue] = useState("0");
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const res = await fetch("/api/faqs");
                const response = await res.json();
                if (!response.success) {
                    throw new Error(response.message || t("fetchFailed"));
                }
                setFaqs(response.data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFAQs();
    }, [t]);

    const faqItems = faqs.map((faq) => ({
        title: cmsField(faq, "title", locale),
        description: cmsField(faq, "description", locale),
    }));

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title={t("breadcrumb")}
                breadcrumbs={[
                    { label: tCommon("home"), href: "/" },
                    { label: t("breadcrumb") },
                ]}
            />
            <main className="flex-1">
                <section className="w-full bg-linear-to-br from-white to-blue-100 py-16 lg:py-24">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="space-y-4 mb-12 text-center">
                                <p className="text-md font-medium text-blue-600 uppercase tracking-wide">
                                    {t("overline")}
                                </p>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                    {t("title")}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="flex items-center gap-2">
                                            <Spinner className="h-5 w-5" />
                                            <span>{t("loading")}</span>
                                        </div>
                                    </div>
                                ) : faqItems.length > 0 ? (
                                    <Accordion
                                        type="single"
                                        collapsible
                                        defaultValue="0"
                                        value={openValue}
                                        onValueChange={setOpenValue}
                                        className="space-y-4"
                                    >
                                        {faqItems.map((faq, index) => {
                                            const isOpen = openValue === index.toString();
                                            return (
                                                <AccordionItem
                                                    key={index}
                                                    value={index.toString()}
                                                    className={`bg-white rounded-sm border border-gray-300 overflow-hidden transition-all duration-300 ${
                                                        isOpen ? "shadow-lg border-primary" : "shadow-sm"
                                                    }`}
                                                >
                                                    <AccordionTrigger
                                                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors [&>svg]:hidden"
                                                    >
                                                        <h3
                                                            className={`text-[21px] pr-4 ${isOpen ? "font-semibold" : "font-normal"}`}
                                                        >
                                                            {faq.title}
                                                        </h3>
                                                        <div
                                                            className={`shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${
                                                                isOpen
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-gray-300 text-primary-foreground"
                                                            }`}
                                                        >
                                                            {isOpen ? (
                                                                <X className="h-4 w-4" />
                                                            ) : (
                                                                <Plus className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-6 pt-0">
                                                        <p className="leading-relaxed font-normal text-[19px]">
                                                            {faq.description}
                                                        </p>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        {t("empty")}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

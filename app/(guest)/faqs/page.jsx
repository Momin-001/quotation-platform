"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Plus, X } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Spinner } from "@/components/ui/spinner";
import BreadCrumb from "@/components/BreadCrumb";
import { toast } from "sonner";

export default function FAQsPage() {
    const { language } = useLanguage();
    const [openValue, setOpenValue] = useState("0");
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all FAQs
    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const res = await fetch("/api/faqs");
                const response = await res.json();
                if (!response.success) {
                    throw new Error(response.message || "Failed to fetch FAQs");
                }
                setFaqs(response.data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFAQs();
    }, []);

    // Map FAQs to the format needed
    const faqItems = faqs.map((faq) => ({
        title: language === "en" ? faq.titleEn : faq.titleDe,
        description: language === "en" ? faq.descriptionEn : faq.descriptionDe,
    }));

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb title="FAQs" 
            breadcrumbs={[
                { label: "Home", href: "/" }, 
                { label: "FAQs" }
                ]} />
            <main className="flex-1">
                <section className="w-full bg-linear-to-br from-white to-blue-100 py-16 lg:py-24">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="space-y-4 mb-12 text-center">
                                <p className="text-md font-medium text-blue-600 uppercase tracking-wide font-open-sans">
                                    {language === "en" ? "FAQ" : "Häufig gestellte Fragen"}
                                </p>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 font-archivo leading-tight">
                                    {language === "en" ? "Frequently Asked Questions" : "Häufig gestellte Fragen"}
                                </h2>
                            </div>

                            {/* FAQ Accordion */}
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="flex items-center gap-2">
                                            <Spinner className="h-5 w-5" />
                                            <span>Loading FAQs...</span>
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
                                                    className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
                                                        isOpen ? "shadow-lg border-primary" : "shadow-sm"
                                                    }`}
                                                >
                                                    <AccordionTrigger
                                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors [&>svg]:hidden"
                                                    >
                                                        <h3 className="text-lg font-semibold text-gray-900 font-archivo pr-4">
                                                            {faq.title}
                                                        </h3>
                                                        <div
                                                            className={`shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${
                                                                isOpen
                                                                    ? "bg-primary text-white"
                                                                    : "bg-gray-200 text-gray-600"
                                                            }`}
                                                        >
                                                            {isOpen ? (
                                                                <X className="h-4 w-4" />
                                                            ) : (
                                                                <Plus className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="p-6 pt-0">
                                                        <p className="text-gray-700 leading-relaxed font-open-sans">
                                                            {faq.description}
                                                        </p>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        No FAQs available.
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

"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Plus, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FAQSection({ homepageData, faqsData = null, showAll = false }) {
    const { language } = useLanguage();
    const [openValue, setOpenValue] = useState("0"); // First FAQ open by default
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get text based on current language with fallback
    const getText = (field) => {
        if (!homepageData) return "";
        const key = language === "en" ? `${field}En` : `${field}De`;
        return homepageData[key] || homepageData[`${field}En`] || "";
    };

    // Fetch FAQs if not provided as prop
    useEffect(() => {
        if (faqsData) {
            setFaqs(faqsData);
            setLoading(false);
        } else {
            const fetchFAQs = async () => {
                try {
                    const limit = showAll ? "" : "?limit=6";
                    const res = await fetch(`/api/faqs${limit}`);
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
        }
    }, [faqsData, showAll]);

    // Map FAQs to the format needed
    const faqItems = faqs.map((faq) => ({
        title: language === "en" ? faq.titleEn : faq.titleDe,
        description: language === "en" ? faq.descriptionEn : faq.descriptionDe,
    }));

    return (
        <section className="w-full bg-linear-to-br from-white to-blue-100 py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Section - Heading */}
                    <div className="space-y-4">
                        <p className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-archivo">
                            {getText("faqTitle")}
                        </p>
                        <h2 className="text-lg md:text-xl max-w-3xl mx-auto font-open-sans">
                            {getText("faqSubtitle")}
                        </h2>
                    </div>

                    {/* Right Section - FAQ Accordion */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex items-center gap-2">
                                    <Spinner className="h-5 w-5" />
                                    <span>Loading FAQs...</span>
                                </div>
                            </div>
                        ) : faqItems.length > 0 ? (
                            <>
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
                                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors [&>svg]:hidden"
                                                >
                                                    <h3 className={`text-lg font-open-sans pr-4 ${isOpen ? "font-semibold" : ""}`}>
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
                                                <AccordionContent className="p-6 pt-0">
                                                    <p className="text-gray-700 leading-relaxed font-open-sans">
                                                        {faq.description}
                                                    </p>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                                {!showAll && (
                                    <div className="pt-4 text-center">
                                        <Link href="/faqs">
                                            <Button variant="link" className="text-blue-600 hover:text-blue-700">
                                                View All FAQs
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No FAQs available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}


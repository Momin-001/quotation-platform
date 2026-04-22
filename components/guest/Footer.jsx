"use client";

import { Facebook, Linkedin, Send, Twitter, Youtube, Instagram, ArrowUp, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { getPdfPreviewUrl } from "@/lib/cloudinaryPdfUrls";
import { useFooter } from "@/context/FooterContext";

export default function Footer({ footerData }) {
    const { language } = useLanguage();
    const footerCtx = useFooter();
    const effectiveFooterData = footerCtx?.footerData || footerData;

    // Get text based on current language with fallback
    const getText = (field) => {
        if (!effectiveFooterData) return "";
        const key = language === "en" ? `${field}En` : `${field}De`;
        return effectiveFooterData[key] || effectiveFooterData[`${field}En`] || "";
    };

    // Get quick links as array
    const getQuickLinks = () => {
        if (!effectiveFooterData) return [];
        const links = [];
        for (let i = 1; i <= 5; i++) {
            const linkText = getText(`quickLink${i}`);
            if (linkText) {
                links.push(linkText);
            }
        }
        return links;
    };

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const hasCmsQuickLinks = getQuickLinks().length > 0;
    const privacyPdfPreviewUrl =
        footerCtx?.privacyPolicyPdfUrl ||
        (effectiveFooterData?.privacyPolicyPdfUrl ? getPdfPreviewUrl(effectiveFooterData.privacyPolicyPdfUrl) : null);
    const privacyLabel = hasCmsQuickLinks
        ? getText("quickLink5") || "Privacy Policy"
        : "Privacy Policy";

    return (
        <footer className="bg-[#0f2e4a] text-primary-foreground pt-16 pb-8 font-open-sans">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand & Description */}
                    <div className="">
                        <Image src="/logo.svg" alt="Logo" width={60} height={60}/>
                        <p className="text-lg font-normal leading-relaxed max-w-md">
                            {getText("description") || "PROLEDALL is a platform that allows you to get quotes for your LED products. We are a team of experts who are dedicated to providing the best possible service to our clients."}
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <div className="bg-primary-foreground p-2 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer transition-colors"><Facebook size={16} color="#1A73E8" /></div>
                            <div className="bg-primary-foreground p-2 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer transition-colors"><Twitter size={16} color="#1A73E8" /></div>
                            <div className="bg-primary-foreground p-2 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer transition-colors"><Linkedin size={16} color="#1A73E8" /></div>
                            <div className="bg-primary-foreground p-2 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer transition-colors"><Instagram size={16} color="#1A73E8"  /></div>
                        </div>
                    </div>

                    {/* Our Address */}
                    <div>
                        <h3 className="font-bold text-2xl mb-6">
                            {getText("ourAddressTitle") || "Our Address"}
                        </h3>
                        <ul className="space-y-4 text-lg font-normal text-gray-200">
                            <li className="flex items-center gap-2">
                                <span><Phone size={16} /></span> +49 000 000 0000
                            </li>
                            <li className="flex items-center gap-2">
                                <span><Mail size={16} /></span> support@website.com
                            </li>
                            <li className="flex items-start gap-2">
                                <span><MapPin size={16} /></span>
                                <span>885 road, 1122 street.<br />Berlin, Germany</span>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-2xl mb-6">
                            {getText("quickLinksTitle") || "Quick Links"}
                        </h3>
                        <ul className="space-y-2 text-lg font-normal text-gray-200">
                            <li>
                                <Link href="/products" className="hover:text-secondary">
                                    {hasCmsQuickLinks ? getText("quickLink1") || "Products" : "Products"}
                                </Link>
                            </li>
                            <li>
                                <Link href="/imprint" className="hover:text-secondary">
                                    {hasCmsQuickLinks ? getText("quickLink2") || "Imprint" : "Imprint"}
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-and-conditions" className="hover:text-secondary">
                                    {hasCmsQuickLinks
                                        ? getText("quickLink3") || "Terms and Conditions"
                                        : "Terms and Conditions"}
                                </Link>
                            </li>
                            <li>
                                <Link href="/become-partner" className="hover:text-secondary">
                                    {hasCmsQuickLinks ? getText("quickLink4") || "Become a Partner" : "Become a Partner"}
                                </Link>
                            </li>
                            <li>
                                {privacyPdfPreviewUrl ? (
                                    <a
                                        href={privacyPdfPreviewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-secondary"
                                    >
                                        {privacyLabel}
                                    </a>
                                ) : (
                                    <span className="opacity-70 cursor-not-allowed">{privacyLabel}</span>
                                )}
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-bold text-2xl mb-6">
                            {getText("newsletterTitle") || "Newsletter"}
                        </h3>
                        <div className="flex flex-col gap-4">
                            <Input
                                placeholder={getText("emailPlaceholder") || "Your Email Address"}
                                className="h-16"
                            />
                            <Button variant="secondary" size="lg" className="w-fit">
                                {getText("subscribeButton") || "Subscribe"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-8 flex items-center justify-between">
                    <p></p>
                    <p className="text-lg font-normal font-open-sans">
                        {getText("copyrightText") || "© Copyright Quotation Platform. All Right Reserved"}
                    </p>
                    <div 
                        className="bg-secondary p-2 rounded-full cursor-pointer hover:opacity-90"
                        onClick={handleScrollToTop}
                    >
                        <ArrowUp size={20} />
                    </div>
                </div>
            </div>
        </footer>
    );
}

"use client";

import { Link } from "@/i18n/navigation";
import { Facebook, Linkedin, Send, Twitter, Youtube, Instagram, ArrowUp, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { getPdfPreviewUrl } from "@/lib/cloudinaryPdfUrls";
import { useFooter } from "@/context/FooterContext";
import { cmsField } from "@/lib/i18n/cms";

export default function Footer({ footerData }) {
    const locale = useLocale();
    const t = useTranslations("Home.footer");
    const footerCtx = useFooter();
    const effectiveFooterData = footerCtx?.footerData || footerData;

    const getText = (field) => cmsField(effectiveFooterData, field, locale);

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
        <footer className="bg-[#0f2e4a] text-primary-foreground pt-14 md:pt-16 lg:pt-20 pb-8">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10 lg:mb-14">
                    <div className="space-y-4">
                        <Image src="/logo-name-white.png" alt="Logo" width={150} height={150} />
                        <p className="text-sm sm:text-[15px] font-normal leading-relaxed text-gray-300 max-w-sm">
                            {getText("description") || "PROLEDALL is a platform that allows you to get quotes for your LED products. We are a team of experts who are dedicated to providing the best possible service to our clients."}
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <div className="bg-white/90 hover:bg-white p-2 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer transition-colors">
                                <Facebook size={14} color="#1A73E8" />
                            </div>
                            <div className="bg-white/90 hover:bg-white p-2 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer transition-colors">
                                <Twitter size={14} color="#1A73E8" />
                            </div>
                            <div className="bg-white/90 hover:bg-white p-2 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer transition-colors">
                                <Linkedin size={14} color="#1A73E8" />
                            </div>
                            <div className="bg-white/90 hover:bg-white p-2 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer transition-colors">
                                <Instagram size={14} color="#1A73E8" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold  text-lg mb-5">
                            {getText("ourAddressTitle") || "Our Address"}
                        </h3>
                        <ul className="space-y-3 text-sm sm:text-[15px] text-gray-300">
                            <li className="flex items-center gap-2.5">
                                <Phone size={14} className="shrink-0 text-gray-400" />
                                <span>+49 1520 2071165</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail size={14} className="shrink-0 text-gray-400" />
                                <span>info@proledall.eu</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <MapPin size={14} className="shrink-0 text-gray-400 mt-0.5" />
                                <span>Local Court Ludwigshafen, <br /> HRB 6882</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold  text-lg mb-5">
                            {getText("quickLinksTitle") || "Quick Links"}
                        </h3>
                        <ul className="space-y-2.5 text-sm sm:text-[15px] text-gray-300">
                            <li>
                                <Link href="/products" className="hover:text-secondary transition-colors">
                                    {hasCmsQuickLinks ? getText("quickLink1") || "Products" : "Products"}
                                </Link>
                            </li>
                            <li>
                                <Link href="/imprint" className="hover:text-secondary transition-colors">
                                    {hasCmsQuickLinks ? getText("quickLink2") || "Imprint" : "Imprint"}
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-and-conditions" className="hover:text-secondary transition-colors">
                                    {hasCmsQuickLinks
                                        ? getText("quickLink3") || "Terms and Conditions"
                                        : "Terms and Conditions"}
                                </Link>
                            </li>
                            <li>
                                <Link href="/become-partner" className="hover:text-secondary transition-colors">
                                    {hasCmsQuickLinks ? getText("quickLink4") || "Become a Partner" : "Become a Partner"}
                                </Link>
                            </li>
                            <li>
                                {privacyPdfPreviewUrl ? (
                                    <a
                                        href={privacyPdfPreviewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-secondary transition-colors"
                                    >
                                        {privacyLabel}
                                    </a>
                                ) : (
                                    <span className="opacity-60 cursor-not-allowed">{privacyLabel}</span>
                                )}
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold  text-lg mb-5">
                            {getText("newsletterTitle") || "Newsletter"}
                        </h3>
                        <div className="flex flex-col gap-3">
                            <Input
                                placeholder={t("emailPlaceholder")}
                                className="h-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm"
                            />
                            <Button variant="secondary" size="default" className="w-fit">
                                {t("subscribe")}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 flex items-center justify-between">
                    <p></p>
                    <p className="text-xs sm:text-sm text-gray-400">
                        {getText("copyrightText") || "© Copyright Quotation Platform. All Right Reserved"}
                    </p>
                    <div
                        className="bg-secondary hover:bg-secondary/90 p-2 rounded-full cursor-pointer transition-colors"
                        onClick={handleScrollToTop}
                    >
                        <ArrowUp size={16} />
                    </div>
                </div>
            </div>
        </footer>
    );
}

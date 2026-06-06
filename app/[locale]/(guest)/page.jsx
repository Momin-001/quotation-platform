import HeroSection from "@/components/guest/Homepage/HeroSection";
import ValueBlocksSection from "@/components/guest/Homepage/ValueBlocksSection";
import HowItWorksSection from "@/components/guest/Homepage/HowItWorksSection";
import PreSelectedFiltersSection from "@/components/guest/Homepage/PreSelectedFiltersSection";
import FAQSection from "@/components/guest/Homepage/FAQSection";
import PartnersSection from "@/components/guest/Homepage/PartnersSection";
import MarketingPartnersSection from "@/components/guest/Homepage/MarketingPartnersSection";
import BlogsSection from "@/components/guest/Blogs/BlogsSection";
import { getGuestHomeData } from "@/features/cms/guest-cms-data";
import SchemaScript from "@/components/guest/SchemaScript";
import { cmsField } from "@/lib/i18n/cms";
import { BASE_URL } from "@/lib/constants";
import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("", validateLocale(locale));
}

const siteUrl = BASE_URL || "https://www.proledall.eu";

function withLocalePrefix(locale, path) {
    if (locale === "en") return path === "/" ? "/en" : `/en${path}`;
    return path;
}

export default async function Home({ params }) {
    const { locale } = await params;
    const { homepageData, technologyPartners, marketingPartners, faqs, blogs } = await getGuestHomeData();

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "ProLEDALL",
        url: siteUrl,
        logo: `${siteUrl}/logo-name.png`,
        description:
            "ProLEDALL is Europe's B2B matchmaker for certified LED display solutions — connecting buyers with verified manufacturers for transparent, comparable LED video wall projects.",
        telephone: "+49 1520 2071165",
        email: "info@proledall.eu",
        address: {
            "@type": "PostalAddress",
            addressLocality: "Ludwigshafen",
            addressRegion: "Rhineland-Palatinate",
            addressCountry: "DE",
        },
        areaServed: { "@type": "Place", name: "Europe" },
        legalName: "ProLEDALL",
        taxID: "HRB 6882",
        sameAs: ["https://www.linkedin.com/company/proledall"],
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "ProLEDALL",
        url: siteUrl,
        description: "B2B marketplace for certified LED display solutions across Europe.",
        inLanguage: locale,
        potentialAction: {
            "@type": "SearchAction",
            target: `${siteUrl}${withLocalePrefix(locale, "/products")}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
        },
    };

    const faqItems = Array.isArray(faqs) ? faqs.slice(0, 6) : [];
    const faqPageSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems
            .map((faq) => ({
                question: cmsField(faq, "title", locale)?.trim?.() || "",
                answer: cmsField(faq, "description", locale)?.trim?.() || "",
            }))
            .filter((row) => row.question && row.answer)
            .map((row) => ({
                "@type": "Question",
                name: row.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: row.answer,
                },
            })),
    };

    return (
      <div className="min-h-screen">
        <SchemaScript data={organizationSchema} />
        <SchemaScript data={websiteSchema} />
        <SchemaScript data={faqPageSchema} />
        <HeroSection homepageData={homepageData} locale={locale} />
        <ValueBlocksSection homepageData={homepageData} locale={locale} />
        <HowItWorksSection homepageData={homepageData} locale={locale} />
        <PartnersSection homepageData={homepageData} partners={technologyPartners} locale={locale} />
        <PreSelectedFiltersSection homepageData={homepageData} />
        {marketingPartners.length > 0 && (
          <MarketingPartnersSection homepageData={homepageData} partners={marketingPartners} locale={locale} />
        )}
        <BlogsSection homepageData={homepageData} blogs={blogs} />
        <FAQSection homepageData={homepageData} faqsData={faqs} locale={locale} />
      </div>
    );
  }
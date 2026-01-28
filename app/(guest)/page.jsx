import HeroSection from "@/components/guest/HeroSection";
import ValueBlocksSection from "@/components/guest/ValueBlocksSection";
import HowItWorksSection from "@/components/guest/HowItWorksSection";
import FAQSection from "@/components/guest/FAQSection";
import PartnersSection from "@/components/guest/PartnersSection";
import { BASE_URL } from "@/lib/constants";

const defaultHomepageData = {
    // Hero Section
    heroSmallLabelEn: "Welcome",
    heroSmallLabelDe: "Willkommen",
    heroTitleEn: "LED Display Solutions",
    heroTitleDe: "LED-Display-Lösungen",
    heroDescriptionEn: "Professional LED display solutions for your business",
    heroDescriptionDe: "Professionelle LED-Display-Lösungen für Ihr Unternehmen",
    heroShortDescriptionEn: "High quality, reliable, and efficient",
    heroShortDescriptionDe: "Hochwertig, zuverlässig und effizient",
    heroInputPlaceholderEn: "Search products...",
    heroInputPlaceholderDe: "Produkte suchen...",
    heroPrimaryButtonEn: "Get Started",
    heroPrimaryButtonDe: "Loslegen",
    heroSecondaryButtonEn: "Learn More",
    heroSecondaryButtonDe: "Mehr erfahren",
    heroHotlineCtaEn: "Call us for support",
    heroHotlineCtaDe: "Rufen Sie uns für Support an",
    heroRequestButtonEn: "Request Quote",
    heroRequestButtonDe: "Angebot anfordern",
    // Value Blocks
    valueBlocksTitleEn: "Why Choose Us",
    valueBlocksTitleDe: "Warum uns wählen",
    valueBlocksSubtitleEn: "We provide the best LED solutions",
    valueBlocksSubtitleDe: "Wir bieten die besten LED-Lösungen",
    valueBlock1TitleEn: "Quality Products",
    valueBlock1TitleDe: "Qualitätsprodukte",
    valueBlock1DescriptionEn: "Premium quality LED displays",
    valueBlock1DescriptionDe: "Premium-Qualität LED-Displays",
    valueBlock2TitleEn: "Expert Support",
    valueBlock2TitleDe: "Experten-Support",
    valueBlock2DescriptionEn: "24/7 customer support",
    valueBlock2DescriptionDe: "24/7 Kundensupport",
    valueBlock3TitleEn: "Fast Delivery",
    valueBlock3TitleDe: "Schnelle Lieferung",
    valueBlock3DescriptionEn: "Quick and reliable shipping",
    valueBlock3DescriptionDe: "Schneller und zuverlässiger Versand",
    valueBlock4TitleEn: "Best Prices",
    valueBlock4TitleDe: "Beste Preise",
    valueBlock4DescriptionEn: "Competitive pricing",
    valueBlock4DescriptionDe: "Wettbewerbsfähige Preise",
    // How It Works
    howItWorksTitleEn: "How It Works",
    howItWorksTitleDe: "Wie es funktioniert",
    howItWorksSubtitleEn: "Simple steps to get your LED solution",
    howItWorksSubtitleDe: "Einfache Schritte zu Ihrer LED-Lösung",
    step1TitleEn: "Search Products",
    step1TitleDe: "Produkte suchen",
    step1Description1En: "Browse our catalog",
    step1Description1De: "Durchsuchen Sie unseren Katalog",
    step1Description2En: "Find the perfect solution",
    step1Description2De: "Finden Sie die perfekte Lösung",
    step2TitleEn: "Compare Options",
    step2TitleDe: "Optionen vergleichen",
    step2Description1En: "Compare specifications",
    step2Description1De: "Spezifikationen vergleichen",
    step2Description2En: "Choose the best fit",
    step2Description2De: "Wählen Sie die beste Passform",
    step3TitleEn: "Request Quote",
    step3TitleDe: "Angebot anfordern",
    step3Description1En: "Fill out the form",
    step3Description1De: "Formular ausfüllen",
    step3Description2En: "Get personalized pricing",
    step3Description2De: "Erhalten Sie personalisierte Preise",
    step4TitleEn: "Review & Confirm",
    step4TitleDe: "Überprüfen & Bestätigen",
    step4Description1En: "Review your quote",
    step4Description1De: "Überprüfen Sie Ihr Angebot",
    step4Description2En: "Confirm your order",
    step4Description2De: "Bestätigen Sie Ihre Bestellung",
    step5TitleEn: "Get Delivered",
    step5TitleDe: "Geliefert bekommen",
    step5Description1En: "Fast shipping",
    step5Description1De: "Schneller Versand",
    step5Description2En: "Professional installation support",
    step5Description2De: "Professionelle Installationsunterstützung",
    ctaCardButton1En: "Get Started",
    ctaCardButton1De: "Loslegen",
    ctaCardButton2En: "Contact Us",
    ctaCardButton2De: "Kontaktieren Sie uns",
    // FAQ
    faqTitleEn: "FAQ",
    faqTitleDe: "Häufig gestellte Fragen",
    faqSubtitleEn: "Frequently Asked Questions",
    faqSubtitleDe: "Häufig gestellte Fragen",
    faq1TitleEn: "What products do you offer?",
    faq1TitleDe: "Welche Produkte bieten Sie an?",
    faq1DescriptionEn: "We offer a wide range of LED display solutions.",
    faq1DescriptionDe: "Wir bieten eine breite Palette von LED-Display-Lösungen.",
    faq2TitleEn: "How long is the warranty?",
    faq2TitleDe: "Wie lange ist die Garantie?",
    faq2DescriptionEn: "Our products come with comprehensive warranty coverage.",
    faq2DescriptionDe: "Unsere Produkte werden mit umfassender Garantieabdeckung geliefert.",
    faq3TitleEn: "Do you provide installation?",
    faq3TitleDe: "Bieten Sie Installation an?",
    faq3DescriptionEn: "Yes, we provide professional installation services.",
    faq3DescriptionDe: "Ja, wir bieten professionelle Installationsdienste an.",
    faq4TitleEn: "What is the delivery time?",
    faq4TitleDe: "Wie ist die Lieferzeit?",
    faq4DescriptionEn: "Delivery times vary based on product and location.",
    faq4DescriptionDe: "Die Lieferzeiten variieren je nach Produkt und Standort.",
    faq5TitleEn: "Can I customize my order?",
    faq5TitleDe: "Kann ich meine Bestellung anpassen?",
    faq5DescriptionEn: "Yes, we offer customization options for most products.",
    faq5DescriptionDe: "Ja, wir bieten Anpassungsoptionen für die meisten Produkte.",
    faq6TitleEn: "How do I get support?",
    faq6TitleDe: "Wie erhalte ich Support?",
    faq6DescriptionEn: "Contact our support team via phone or email.",
    faq6DescriptionDe: "Kontaktieren Sie unser Support-Team per Telefon oder E-Mail.",
    // Partners
    partnersTitleEn: "Our Partners",
    partnersTitleDe: "Unsere Partner",
    partnersSubtitleEn: "Trusted by leading brands",
    partnersSubtitleDe: "Vertraut von führenden Marken",
};

async function getHomeData() {
    const [homepageRes, partnersRes, faqsRes] = await Promise.all([
      fetch(`${BASE_URL}/api/homepage`, { cache: "no-store" }),
      fetch(`${BASE_URL}/api/partners`, { cache: "no-store" }),
      fetch(`${BASE_URL}/api/faqs?limit=6`, { cache: "no-store" }),
    ]);
  
    const homepageJson = await homepageRes.json();
    const partnersJson = await partnersRes.json();
    const faqsJson = await faqsRes.json();
  
    return {
      homepageData: homepageJson?.data
        ? { ...defaultHomepageData, ...homepageJson.data }
        : defaultHomepageData,
      partners: partnersJson?.data || [],
      faqs: faqsJson?.data || [],
    };
  }
  
  export default async function Home() {
    const { homepageData, partners, faqs } = await getHomeData();
  
    return (
      <div className="min-h-screen">
        <HeroSection homepageData={homepageData} />
        <ValueBlocksSection homepageData={homepageData} />
        <HowItWorksSection homepageData={homepageData} />
        <PartnersSection homepageData={homepageData} partners={partners} />
        <FAQSection homepageData={homepageData} faqsData={faqs} />
      </div>
    );
  }
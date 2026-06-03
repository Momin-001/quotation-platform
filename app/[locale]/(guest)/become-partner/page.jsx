import BecomePartnerHeroSection from "@/components/guest/BecomePartner/BecomePartnerHeroSection";
import BecomePartnerValueBlocksSection from "@/components/guest/BecomePartner/BecomePartnerValueBlocksSection";
import BecomePartnerOpportunitiesSection from "@/components/guest/BecomePartner/BecomePartnerOpportunitiesSection";
import BecomePartnerHowToSection from "@/components/guest/BecomePartner/BecomePartnerHowToSection";
import { guestPageAlternates, validateLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageAlternates("/become-partner", validateLocale(locale));
}

export default function BecomePartnerPage() {
    return (
        <div className="min-h-screen">
            <BecomePartnerHeroSection />
            <BecomePartnerValueBlocksSection />
            <BecomePartnerOpportunitiesSection />
            <BecomePartnerHowToSection />
        </div>
    );
}

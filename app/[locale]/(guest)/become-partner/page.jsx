import BecomePartnerHeroSection from "@/components/guest/BecomePartner/BecomePartnerHeroSection";
import BecomePartnerNetworkBar from "@/components/guest/BecomePartner/BecomePartnerNetworkBar";
import BecomePartnerValueBlocksSection from "@/components/guest/BecomePartner/BecomePartnerValueBlocksSection";
import BecomePartnerOpportunitiesSection from "@/components/guest/BecomePartner/BecomePartnerOpportunitiesSection";
import BecomePartnerInquirySection from "@/components/guest/BecomePartner/BecomePartnerInquirySection";
import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("/become-partner", validateLocale(locale));
}

export default function BecomePartnerPage() {
    return (
        <div className="min-h-screen">
            <BecomePartnerHeroSection />
            <BecomePartnerNetworkBar />
            <BecomePartnerValueBlocksSection />
            <BecomePartnerOpportunitiesSection />
            <BecomePartnerInquirySection />
        </div>
    );
}

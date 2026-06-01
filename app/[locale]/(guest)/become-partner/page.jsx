import BecomePartnerHeroSection from "@/components/guest/BecomePartner/BecomePartnerHeroSection";
import BecomePartnerValueBlocksSection from "@/components/guest/BecomePartner/BecomePartnerValueBlocksSection";
import BecomePartnerOpportunitiesSection from "@/components/guest/BecomePartner/BecomePartnerOpportunitiesSection";
import BecomePartnerHowToSection from "@/components/guest/BecomePartner/BecomePartnerHowToSection";

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

import BecomePartnerHeroSection from "@/components/guest/BecomePartner/BecomePartnerHeroSection";
import BecomePartnerNetworkBar from "@/components/guest/BecomePartner/BecomePartnerNetworkBar";
import BecomePartnerValueBlocksSection from "@/components/guest/BecomePartner/BecomePartnerValueBlocksSection";
import BecomePartnerOpportunitiesSection from "@/components/guest/BecomePartner/BecomePartnerOpportunitiesSection";
import BecomePartnerInquirySection from "@/components/guest/BecomePartner/BecomePartnerInquirySection";
import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";
import BreadCrumb from "@/components/guest/BreadCrumb";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("/become-partner", validateLocale(locale));
}

export default function BecomePartnerPage() {
    return (
        <div className="min-h-screen">
            <BreadCrumb
                title="Become a Partner"
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Become a Partner", href: "/become-partner" },
                ]}
            />
            <BecomePartnerHeroSection />
            <BecomePartnerNetworkBar />
            <BecomePartnerValueBlocksSection />
            <BecomePartnerOpportunitiesSection />
            <BecomePartnerInquirySection />
        </div>
    );
}

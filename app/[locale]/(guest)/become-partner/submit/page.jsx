import BecomePartnerSubmitForm from "@/components/guest/BecomePartner/Form/BecomePartnerSubmitForm";
import { guestPageAlternates, validateLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageAlternates("/become-partner/submit", validateLocale(locale));
}

export default function BecomePartnerSubmitPage() {
    return <BecomePartnerSubmitForm />;
}

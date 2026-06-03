import ContactForm from "@/components/guest/ContactForm";
import { guestPageAlternates, validateLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageAlternates("/contact", validateLocale(locale));
}

export default function ContactPage() {
    return <ContactForm />;
}

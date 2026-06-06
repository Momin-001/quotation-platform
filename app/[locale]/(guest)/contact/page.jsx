import ContactForm from "@/components/guest/ContactUs/Form/ContactForm";
import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("/contact", validateLocale(locale));
}

export default function ContactPage() {
    return <ContactForm />;
}

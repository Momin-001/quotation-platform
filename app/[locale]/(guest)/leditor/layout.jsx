import { guestPageAlternates, validateLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageAlternates("/leditor", validateLocale(locale));
}

export default function LeditorLayout({ children }) {
    return children;
}

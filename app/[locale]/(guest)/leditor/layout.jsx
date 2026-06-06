import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("/leditor", validateLocale(locale));
}

export default function LeditorLayout({ children }) {
    return children;
}

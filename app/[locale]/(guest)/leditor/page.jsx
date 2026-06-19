import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";
import LeditorClient from "./LeditorClient";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("/leditor", validateLocale(locale));
}

export default function LeditorPage() {
    return <LeditorClient />;
}

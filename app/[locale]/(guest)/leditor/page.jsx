import { Suspense } from "react";
import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";
import { Spinner } from "@/components/ui/spinner";
import LeditorClient from "./LeditorClient";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("/leditor", validateLocale(locale));
}

export default function LeditorPage() {
    // LeditorClient reads ?productId= via useSearchParams, which needs a Suspense boundary.
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner className="h-8 w-8" />
                </div>
            }
        >
            <LeditorClient />
        </Suspense>
    );
}

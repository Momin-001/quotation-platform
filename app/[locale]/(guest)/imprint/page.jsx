import { getMessages, getTranslations } from "next-intl/server";
import { LegalPageLayout, renderLegalSections } from "@/components/guest/LegalPages/LegalPageLayout";
import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("/imprint", validateLocale(locale));
}

export default async function ImprintPage() {
    const messages = await getMessages();
    const tCommon = await getTranslations("Common");
    const copy = messages.LegalPages?.imprint;

    return (
        <LegalPageLayout
            breadcrumbTitle={copy.title}
            breadcrumbs={[
                { label: tCommon("home"), href: "/" },
                { label: copy.breadcrumb },
            ]}
            documentTitle={copy.title}
            intro={copy.intro}
        >
            {renderLegalSections(copy.sections)}
        </LegalPageLayout>
    );
}

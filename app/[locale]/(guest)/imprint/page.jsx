"use client";

import { useMessages, useTranslations } from "next-intl";
import {
    LegalPageLayout,
    renderLegalSections,
} from "@/components/guest/LegalPageLayout";

export default function ImprintPage() {
    const { LegalPages } = useMessages();
    const tCommon = useTranslations("Common");
    const copy = LegalPages.imprint;

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

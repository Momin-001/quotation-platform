"use client";

import { useMessages, useTranslations } from "next-intl";
import {
    LegalPageLayout,
    renderLegalSections,
    slugifySectionId,
} from "@/components/guest/LegalPageLayout";

export default function TermsAndConditionsPage() {
    const { LegalPages } = useMessages();
    const tCommon = useTranslations("Common");
    const copy = LegalPages.terms;

    const tocSections = copy.sections.map((section, index) => ({
        ...section,
        id: slugifySectionId(section.title, index),
        tocLabel: section.title.match(/~\s*\d+/)?.[0] || `~ ${index + 1}`,
    }));

    return (
        <LegalPageLayout
            breadcrumbTitle={copy.title}
            breadcrumbs={[
                { label: tCommon("home"), href: "/" },
                { label: copy.breadcrumb },
            ]}
            documentTitle={copy.heading}
            documentSubtitle={copy.subheading}
            showToc
            sections={tocSections}
        >
            {renderLegalSections(tocSections)}
        </LegalPageLayout>
    );
}

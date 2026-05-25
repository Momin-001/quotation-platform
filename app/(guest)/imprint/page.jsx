"use client";

import { useLanguage } from "@/context/LanguageContext";
import {
    LegalPageLayout,
    renderLegalSections,
} from "@/components/guest/LegalPageLayout";

const CONTENT = {
    en: {
        title: "Imprint",
        breadcrumb: "Imprint",
        intro: "Legal notice (Imprint) for this website.",
        sections: [
            {
                title: "Provider of this website",
                lines: ["ProLEDALL"],
            },
            {
                title: "Owner",
                lines: [
                    "Dipl. Ing. Mohammed Abahssain",
                    "Krügerstraße 3 | 67065 Ludwigshafen, Germany",
                ],
            },
            {
                title: "Contact",
                lines: ["Email: info@proledall.eu", "Phone: +49 1520 2071165"],
            },
            {
                title: "VAT identification number according to ~ 27 a of the German VAT Act",
                lines: ["DE298057613"],
            },
            {
                title: "Person responsible for editorial content according to ~ 18 para. 2 MStV",
                lines: [
                    "Dipl. Ing. Mohammed Abahssain",
                    "Krügerstraße 3 | 67065 Ludwigshafen, Germany",
                ],
            },
            {
                title: "Note on contract design & project implementation",
                paragraphs: [
                    "ProLEDALL is a platform for the planning, consultation, and conceptual design of professional LED display solutions. The operational execution of projects (engineering, delivery, installation, and warranty) is carried out by qualified implementation partners from our network.",
                ],
            },
            {
                title: "Main implementation partner",
                lines: [
                    "LEDALL GmbH",
                    "Local Court Ludwigshafen, HRB 6882",
                    "Managing Directors: Dipl. Ing. M. Abahssain, Uwe Kaiser",
                    "VAT ID No.: DE360079437",
                ],
            },
            {
                title: "Online dispute resolution (ODR)",
                paragraphs: [
                    "The European Commission provides a platform for online dispute resolution (ODR):",
                ],
                link: {
                    href: "https://ec.europa.eu/consumers/odr/",
                    label: "https://ec.europa.eu/consumers/odr/",
                },
                afterLink: [
                    "You can find our email address above in the legal notice.",
                    "We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.",
                ],
            },
        ],
    },
    de: {
        title: "Impressum",
        breadcrumb: "Impressum",
        intro: "Rechtliche Anbieterkennzeichnung (Impressum) für diese Website.",
        sections: [
            {
                title: "Anbieter dieser Website",
                lines: ["ProLEDALL"],
            },
            {
                title: "Inhaber",
                lines: [
                    "Dipl. Ing. Mohammed Abahssain",
                    "Krügerstraße 3 | 67065 Ludwigshafen Deutschland",
                ],
            },
            {
                title: "Kontakt",
                lines: ["E-Mail: info@proledall.eu", "Telefon: +4915202071165"],
            },
            {
                title: "Umsatzsteuer-Identifikationsnummer gemäß ~ 27 a Umsatzsteuergesetz",
                lines: ["DE298057613"],
            },
            {
                title: "Redaktionell verantwortlich gemäß ~ 18 Abs. 2 MStV",
                lines: [
                    "Dipl. Ing. Mohammed Abahssain",
                    "Krügerstraße 3 | 67065 Ludwigshafen Deutschland",
                ],
            },
            {
                title: "Hinweis zur vertraglichen Gestaltung & Projektrealisierung",
                paragraphs: [
                    "ProLEDALL ist eine Plattform für die Planung, Beratung und Konzeption professioneller LED-Display-Lösungen. Die operative Durchführung der Projekte (Engineering, Lieferung, Montage und Gewährleistung) erfolgt durch qualifizierte Realisierungspartner aus unserem Netzwerk.",
                ],
            },
            {
                title: "Haupt-Realisierungspartner",
                lines: [
                    "LEDALL GmbH",
                    "Amtsgericht Ludwigshafen, HRB 6882",
                    "Geschäftsführer: Dipl. Ing. M. Abahssain, Uwe Kaiser",
                    "USt-IdNr.: DE360079437",
                ],
            },
            {
                title: "Online-Streitbeilegung (OS)",
                paragraphs: [
                    "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:",
                ],
                link: {
                    href: "https://ec.europa.eu/consumers/odr/",
                    label: "https://ec.europa.eu/consumers/odr/",
                },
                afterLink: [
                    "Unsere E-Mail-Adresse finden Sie oben im Impressum.",
                    "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
                ],
            },
        ],
    },
};

export default function ImprintPage() {
    const { language } = useLanguage();
    const isEn = language === "en";
    const copy = CONTENT[isEn ? "en" : "de"];

    return (
        <LegalPageLayout
            breadcrumbTitle={copy.title}
            breadcrumbs={[
                { label: isEn ? "Home" : "Startseite", href: "/" },
                { label: copy.breadcrumb },
            ]}
            documentTitle={copy.title}
            intro={copy.intro}
            isEn={isEn}
        >
            {renderLegalSections(copy.sections, isEn)}
        </LegalPageLayout>
    );
}

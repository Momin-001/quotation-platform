"use client";

import BreadCrumb from "@/components/user/BreadCrumb";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const CONTENT = {
    en: {
        title: "Imprint",
        breadcrumb: "Imprint",
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
                title: "VAT identification number according to § 27 a of the German VAT Act",
                lines: ["DE298057613"],
            },
            {
                title: "Person responsible for editorial content according to § 18 para. 2 MStV",
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
                title: "Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz",
                lines: ["DE298057613"],
            },
            {
                title: "Redaktionell verantwortlich gemäß § 18 Abs. 2 MStV",
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
                paragraphs: ["Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:"],
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
    const langKey = language === "en" ? "en" : "de";
    const copy = CONTENT[langKey];

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title={copy.title}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: copy.breadcrumb },
                ]}
            />

            <main className="container mx-auto px-4 py-10 max-w-4xl">
                <div className="bg-white border rounded-lg p-6 md:p-10 space-y-8">
                    <header className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold">{copy.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {language === "en"
                                ? "Legal notice (Imprint) for this website."
                                : "Rechtliche Anbieterkennzeichnung (Impressum) für diese Website."}
                        </p>
                    </header>

                    <div className="space-y-7">
                        {copy.sections.map((section) => (
                            <section key={section.title} className="space-y-2">
                                <h2 className="text-lg font-semibold">{section.title}</h2>

                                {section.paragraphs?.length ? (
                                    <div className="space-y-3 text-sm md:text-base leading-relaxed">
                                        {section.paragraphs.map((p, idx) => (
                                            <p key={idx}>{p}</p>
                                        ))}
                                    </div>
                                ) : null}

                                {section.lines?.length ? (
                                    <div className="space-y-1 text-sm md:text-base">
                                        {section.lines.map((line) => (
                                            <p key={line}>{line}</p>
                                        ))}
                                    </div>
                                ) : null}

                                {section.link ? (
                                    <div className="space-y-2 text-sm md:text-base">
                                        <Link
                                            href={section.link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline break-all"
                                        >
                                            {section.link.label}
                                        </Link>
                                        {section.afterLink?.map((p, idx) => (
                                            <p key={idx} className="leading-relaxed">
                                                {p}
                                            </p>
                                        ))}
                                    </div>
                                ) : null}
                            </section>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}


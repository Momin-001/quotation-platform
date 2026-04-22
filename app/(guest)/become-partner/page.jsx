"use client";

import BreadCrumb from "@/components/user/BreadCrumb";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const COPY = {
    en: {
        title: "Become a Partner",
        heading: "ProLEDALL Partner Program – Become a partner For LED video walls & displays",
        ctaTitle: "Send Partner Request Now",
        ctaSubtitle: "(Join the growing ProLEDALL partner network across Europe.)",
        ctaButton: "Go to Application Form",
        blocks: [
            {
                heading: "Setting standards together in the LED display market",
                paragraphs: [
                    "Maximize the success of your projects with ProLEDALL — through German engineering, curated LED systems, and comprehensive project protection for demanding display and digital signage projects.",
                    "Whether you operate as an integrator, planner, or distributor, we provide the technical reliability and the right LED solutions for successful projects. ProLEDALL is not just a supplier, but your external specialist department for planning, evaluation, and quality assurance.",
                ],
            },
            {
                heading: "The ProLEDALL advantage — your competitive edge",
                paragraphs: [
                    "In the complex LED display market, technical risks and unreliable supply chains are the biggest challenges. We close this gap with a clear focus on B2B needs:",
                ],
            },
        ],
        bullets: [
            {
                title: "Curated LED display portfolio",
                text: "Instead of confusing mass-market products, you gain access to technically evaluated OEM systems from qualified manufacturers.",
            },
            {
                title: "Engineering Made in Germany",
                text: "We proactively support you in technical planning — from component level to system integration:",
                sub: [
                    "Optoelectronic design: Coordination of all relevant components for maximum efficiency and image quality",
                    "Construction & integration: Support in mechanical design, system architecture, and installation concepts",
                    "Compliance & reliability: Ensuring standards compliance and long-term operational safety",
                ],
            },
            {
                title: "Real project protection & lead sharing",
                sub: [
                    "Exclusivity: Register your projects with us exclusively to protect against price dumping and secure special conditions",
                    "Growth: We actively generate inquiries for LED displays and video walls and pass these qualified leads directly to our certified regional partners",
                ],
            },
            {
                title: "Support, training & demo systems",
                sub: [
                    "Know-how: Benefit from technical training in digital signage and video walls",
                    "Hardware: Receive attractive conditions for demo and test systems to effectively convince your clients on-site.",
                ],
            },
        ],
    },
    de: {
        title: "Partner werden",
        heading: "ProLEDALL Partnerprogramm – Werden Sie Partner für LED-Videowände & Displays",
        ctaTitle: "Partneranfrage jetzt senden",
        ctaSubtitle: "(Werden Sie Teil des wachsenden ProLEDALL Partnernetzwerks in Europa.)",
        ctaButton: "Zum Bewerbungsformular",
        blocks: [
            {
                heading: "Gemeinsam Standards im LED-Display-Markt setzen",
                paragraphs: [
                    "Maximieren Sie den Erfolg Ihrer Projekte mit ProLEDALL — durch deutsches Engineering, kuratierte LED-Systeme und umfassenden Projektschutz für anspruchsvolle Display- und Digital-Signage-Projekte.",
                    "Ob als Integrator, Planer oder Distributor: Wir liefern technische Sicherheit und die passenden LED-Lösungen für erfolgreiche Projekte. ProLEDALL ist nicht nur Lieferant, sondern Ihre externe Fachabteilung für Planung, Evaluation und Qualitätssicherung.",
                ],
            },
            {
                heading: "Der ProLEDALL Vorteil — Ihr Wettbewerbsvorsprung",
                paragraphs: [
                    "Im komplexen LED-Display-Markt sind technische Risiken und unzuverlässige Lieferketten die größten Herausforderungen. Wir schließen diese Lücke mit einem klaren Fokus auf B2B-Anforderungen:",
                ],
            },
        ],
        bullets: [
            {
                title: "Kuratiertes LED-Display-Portfolio",
                text: "Statt unübersichtlicher Massenmarkt-Produkte erhalten Sie Zugang zu technisch geprüften OEM-Systemen qualifizierter Hersteller.",
            },
            {
                title: "Engineering Made in Germany",
                text: "Wir unterstützen Sie proaktiv in der technischen Planung — von der Komponentenebene bis zur Systemintegration:",
                sub: [
                    "Optoelektronisches Design: Abstimmung aller relevanten Komponenten für maximale Effizienz und Bildqualität",
                    "Konstruktion & Integration: Unterstützung bei Mechanik, Systemarchitektur und Installationskonzepten",
                    "Compliance & Zuverlässigkeit: Sicherstellung von Normenkonformität und langfristiger Betriebssicherheit",
                ],
            },
            {
                title: "Echter Projektschutz & Lead-Weitergabe",
                sub: [
                    "Exklusivität: Registrieren Sie Ihre Projekte exklusiv bei uns, um Preisdumping zu verhindern und Sonderkonditionen zu sichern",
                    "Wachstum: Wir generieren aktiv Anfragen für LED-Displays und Videowände und leiten qualifizierte Leads direkt an unsere zertifizierten Regionalpartner weiter",
                ],
            },
            {
                title: "Support, Training & Demo-Systeme",
                sub: [
                    "Know-how: Profitieren Sie von technischen Trainings zu Digital Signage und Videowänden",
                    "Hardware: Erhalten Sie attraktive Konditionen für Demo- und Testsysteme, um Ihre Kunden vor Ort effektiv zu überzeugen.",
                ],
            },
        ],
    },
};

export default function BecomePartnerInfoPage() {
    const { language } = useLanguage();
    const copy = language === "en" ? COPY.en : COPY.de;

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title={copy.title}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: copy.title },
                ]}
            />

            <main className="container mx-auto px-4 py-10 max-w-5xl">
                <div className="bg-white border rounded-lg p-6 md:p-10 space-y-8">
                    <header className="space-y-3">
                        <h1 className="text-2xl md:text-3xl font-bold">{copy.heading}</h1>
                    </header>

                    <div className="rounded-lg overflow-hidden border">
                        <Image
                            src="/become-partner.png"
                            alt={copy.title}
                            width={1600}
                            height={800}
                            className="w-full h-auto"
                            priority
                        />
                    </div>

                    {copy.blocks.map((block) => (
                        <section key={block.heading} className="space-y-3">
                            <h2 className="text-lg md:text-xl font-semibold">{block.heading}</h2>
                            <div className="space-y-3 text-sm md:text-base leading-relaxed">
                                {block.paragraphs.map((p) => (
                                    <p key={p}>{p}</p>
                                ))}
                            </div>
                        </section>
                    ))}

                    <section className="space-y-4">
                        {copy.bullets.map((b) => (
                            <div key={b.title} className="space-y-2">
                                <h3 className="text-base font-semibold">{b.title}</h3>
                                {b.text ? <p className="text-sm md:text-base leading-relaxed">{b.text}</p> : null}
                                {b.sub?.length ? (
                                    <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                                        {b.sub.map((s) => (
                                            <li key={s}>{s}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        ))}
                    </section>

                    <section className="rounded-lg border bg-muted/30 p-6 md:p-8 space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold">{copy.ctaTitle}</h2>
                            <p className="text-sm text-muted-foreground">{copy.ctaSubtitle}</p>
                        </div>
                        <Button asChild size="lg" className="w-full sm:w-auto">
                            <Link href="/become-partner/submit">{copy.ctaButton}</Link>
                        </Button>
                    </section>
                </div>
            </main>
        </div>
    );
}


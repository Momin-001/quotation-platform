"use client";

import { useLanguage } from "@/context/LanguageContext";
import {
    LegalPageLayout,
    renderLegalSections,
    slugifySectionId,
} from "@/components/guest/LegalPageLayout";

const CONTENT = {
    en: {
        title: "Terms and Conditions",
        breadcrumb: "Terms and Conditions",
        heading:
            "General Terms and Conditions of Business, Consulting and Placement (GTC)",
        subheading:
            "ProLEDALL platform – Owner: Dipl.-Ing. Mohammed Abahssain, 67065 Ludwigshafen am Rhein",
        sections: [
            {
                title: "~ 1  Scope of application, exclusion of third-party terms and conditions",
                paragraphs: [
                    "All our offers, consulting services, analyses, and the use of the ProLEDALL platform are based on these terms and conditions. ProLEDALL functions as a specialized expert platform for the manufacturer-neutral selection, evaluation, and presentation of LED display systems, as well as an interface for OEM communication. These terms and conditions apply only to businesses as defined in Section 14 of the German Civil Code (BGB), legal entities under public law, or special funds under public law (hereinafter referred to as \"Customer\").",
                    "The platform's purpose: ProLEDALL offers customers technical expertise in the form of product testing, specification analysis, and SaaS-supported system selection. ProLEDALL handles communication with OEMs, selects high-quality products according to OEM specifications, and prepares them for professional users.",
                    "Network and Implementation: ProLEDALL prepares proposals in close cooperation with specialized implementation partners (especially LEDALL GmbH). ProLEDALL handles the technical planning and engineering. Depending on the selected scope of services, the contractual arrangements for the purchase of hardware and any installation services are made directly with the implementation partner named in the proposal.",
                ],
            },
            {
                title: "~ 2  Contract conclusion, scope of services of the platform, mediation",
                paragraphs: [
                    "Combined offers: ProLEDALL creates project offers that can include both specialist planning/consulting (ProLEDALL) and the delivery and, if applicable, installation of the hardware (implementation partner). Upon acceptance of such an offer by the customer, separate contractual relationships are established – unless explicitly agreed otherwise.",
                    "a) A consulting and engineering contract with ProLEDALL",
                    "b) A purchase and/or works contract with the implementation partner named in the offer",
                    "Implementation flexibility: The customer can choose whether to obtain the complete package (hardware & installation) through the proposed implementation partner or to purchase only the hardware through them and have the installation carried out by their own personnel or a third party. In the latter case, the contractual relationship with the implementation partner is limited to the purchase of the components; ProLEDALL's liability for installation errors by third parties is excluded.",
                    "Our offers are non-binding unless expressly designated as binding. Contracts and agreements only become binding upon our written order confirmation (or that of the partner) or upon performance of the service.",
                    "OEM Communication: Insofar as ProLEDALL handles communication with OEMs on behalf of the customer, ProLEDALL acts as a technical consultant. This does not create a direct purchase agreement between the customer and the OEM, unless expressly stipulated otherwise.",
                    "Notwithstanding the above, ProLEDALL may, in individual cases, act as the seller or general contractor. In such cases, this will be expressly stated in the respective offer, and supplementary contractual terms will apply.",
                ],
            },
            {
                title: "~ 3  Compensation model, SaaS services and billing",
                paragraphs: [
                    "Free of charge for customers: The use of the ProLEDALL platform, access to specialist articles, blog content and basic support in product selection (AI-supported selection) are generally free of charge for the customer, unless a paid individual consultation has been expressly agreed upon.",
                    "Refinancing via implementation partners: ProLEDALL (Ledall Media Engineering) refinances the operation of the platform, the ongoing evaluation of OEM products, and the further development of the AI selection tools through SaaS (Software-as-a-Service) service fees and marketing contributions from participating implementation partners. No commission is payable to the customer.",
                    "Separate consulting agreements: Only in cases where the client explicitly requests independent engineering services or specialist planning beyond the standard scope (e.g., detailed tender preparation without any intention of implementation) will a separate fee agreement be made directly between ProLEDALL and the client. In this case, Ledall Media Engineering will issue the invoice according to the agreed fee.",
                    "Billing for operational services: All invoices for the delivery of LED systems, hardware, software licenses from the partner, and installation services are issued exclusively by the respective implementation partner. ProLEDALL does not act as a collection agency for the partner.",
                    "Advertising services: ProLEDALL reserves the right to rent advertising space on the platform to partners or third parties (e.g., SaaS providers or manufacturers). This will be clearly marked as \"Advertisement\" or \"Sponsored Content\" in accordance with legal regulations.",
                ],
            },
            {
                title: "~ 4  Intellectual property, usage rights and content",
                paragraphs: [
                    "Copyright protection: All content provided on the ProLEDALL platform, in particular blog articles, technical contributions, OEM evaluations, product tests, graphics, databases, and the logic of the AI-supported filtering and selection tools, is protected by copyright. All rights are held exclusively by ProLEDALL (Ledall Media Engineering) or its owner, Dipl.-Ing. Mohammed Abahssain.",
                    "Customer Use: The customer is entitled to use the information provided on the platform for their own internal use within the scope of project planning. Any further use, in particular reproduction, distribution, making publicly available, or commercial exploitation (e.g., as a consulting service to third parties), is prohibited without the express written consent of ProLEDALL.",
                    "Protection of Engineering Services: If ProLEDALL provides the client with technical drawings, engineering concepts, or specific specialist plans as part of its consulting services, all intellectual property rights remain with ProLEDALL. The client may only use these documents for the specific project for which they were created. Disclosure to third parties (especially competitors for comparison purposes) is strictly prohibited.",
                    "Prohibition of Data Mining / Scraping: The automated extraction of data, OEM ratings or price calculations from the platform (e.g. by bots, scrapers or AI crawlers) is prohibited unless expressly authorized for specific interfaces (APIs).",
                    "Trademark rights: The name \"ProLEDALL\" and the associated logos are protected trademarks. Use by the customer or implementation partner is only permitted within the scope of the contractual agreements.",
                ],
            },
            {
                title: "~ 5  Liability and warranty",
                paragraphs: [
                    "Liability for consulting and planning: ProLEDALL is liable for the professional preparation of plans and engineering services in accordance with recognized engineering standards. No liability is assumed for the accuracy of technical data and specifications provided by OEMs (manufacturers), provided that ProLEDALL has checked this data for plausibility with due commercial diligence.",
                    "Exclusion of liability for defects in hardware: Since ProLEDALL is not the seller of the LED systems or other hardware, any warranty or liability for defects on the delivered products is excluded by ProLEDALL. Claims due to product defects, delivery delays, or faulty installation must be made exclusively against the respective implementation partner.",
                    "Platform Content and Analysis Tools: The technical articles, blog content, and technical filter and analysis tools provided on the platform serve as general support for system selection. These tools are constantly being developed; no guarantee is given for the complete accuracy, timeliness, or continuous availability of the database results displayed. The final technical review of the specifications is the responsibility of the customer within the scope of the specific project planning.",
                    "Limitation of Liability: ProLEDALL is liable – regardless of the legal basis – only in cases of intent or gross negligence, as well as in cases of breach of essential contractual obligations (cardinal obligations). In cases of simple negligence, liability is limited to the foreseeable damages typical for this type of contract. Liability for indirect damages, lost profits, or consequential damages is excluded.",
                    "Statute of limitations: Claims by the customer arising from errors in advice or planning become time-barred within 12 months after completion of the respective advisory service, unless longer periods are mandatory under the law.",
                ],
            },
            {
                title: "~ 6  Customer's duty to cooperate",
                paragraphs: [
                    "Professional advice and planning by ProLEDALL requires that the customer provides all necessary information, documents (e.g. building plans, load registers, electricity connection data) and permits in a timely and complete manner.",
                    "Delays caused by late submission or incorrect information provided by the customer are not the responsibility of ProLEDALL.",
                    "The client designates a technically competent contact person for each project who has decision-making authority.",
                ],
            },
            {
                title: "~ 7  Secrecy and confidentiality",
                paragraphs: [
                    "Both parties undertake to treat as strictly confidential all information received in the course of the cooperation which is marked as confidential or which is recognizable as a trade secret by its nature.",
                    "This applies in particular to technical specifications of the OEMs, pricing models of the implementation partners, and internal project details of the customer.",
                    "This obligation remains in place for a period of three years even after the termination of the cooperation.",
                ],
            },
            {
                title: "~ 8  Reference advertising",
                paragraphs: [
                    "ProLEDALL is entitled to name the customer and the completed project anonymously or – after consultation – by name as a reference on the platform, in blog posts or on social networks after successful completion.",
                    "The customer may object in writing at any time if they assert a legitimate interest (e.g. confidentiality in military or security projects).",
                ],
            },
            {
                title: "~ 9  Customer protection",
                paragraphs: [
                    "The customer undertakes not to enter into any direct or indirect business relationships with manufacturers (OEMs), suppliers or implementation partners that have become known to him in the course of using the platform or through services of ProLEDALL, during the term of the business relationship and for a period of 24 months after its termination, provided that this business relationship is attributable to a mediation, recommendation or other involvement of ProLEDALL.",
                    "In the event of a breach, ProLEDALL is entitled to demand a reasonable contractual penalty. The right to claim further damages remains reserved.",
                ],
            },
            {
                title: "~ 10  Platform development and changes",
                paragraphs: [
                    "ProLEDALL reserves the right to modify, further develop, or restrict the content, functions, structure, and technical components of the platform at any time, provided this is reasonable for the user. There is no entitlement to the continuous availability of specific functions or content.",
                ],
            },
            {
                title: "~ 11  Changes to the Terms and Conditions",
                paragraphs: [
                    "ProLEDALL reserves the right to amend these Terms and Conditions at any time with effect for the future, in particular in the case of:",
                    "a) Changes to the business model",
                    "b) Expansion of platform functions",
                    "c) Legal requirements",
                    "The latest version is published on the platform.",
                ],
            },
            {
                title: "~ 12  Place of performance, jurisdiction, applicable law",
                paragraphs: [
                    "The place of performance for all claims arising from the business relationship between the customer and us is Ludwigshafen am Rhein.",
                    "The exclusive place of jurisdiction for all claims arising from the business relationship is Ludwigshafen am Rhein. However, we are also entitled to sue the customer at their general place of jurisdiction.",
                    "German law applies exclusively, excluding the UN Convention on Contracts for the International Sale of Goods (CISG).",
                    "Severability clause: Should any provision of these terms and conditions be or become invalid, the validity of the remaining provisions shall not be affected.",
                ],
            },
        ],
    },
    de: {
        title: "AGB",
        breadcrumb: "AGB",
        heading:
            "Allgemeine Geschäfts-, Beratungs- und Vermittlungsbedingungen (AGB)",
        subheading:
            "der Plattform ProLEDALL – Inhaber: Dipl.-Ing. Mohammed Abahssain 67065 Ludwigshafen am Rhein",
        sections: [
            {
                title: "~ 1  Anwendungsbereich, Ausschluss fremder Geschäftsbedingungen",
                paragraphs: [
                    "Alle unsere Angebote, Beratungsleistungen, Analysen sowie die Nutzung der Plattform ProLEDALL basieren auf diesen Bedingungen. ProLEDALL fungiert als spezialisierte Experten-Plattform für die herstellerneutrale Selektion, Evaluation und Präsentation von LED-Display-Systemen sowie als Schnittstelle zur OEM-Kommunikation. Diese Bedingungen gelten nur gegenüber Unternehmern im Sinne des ~ 14 BGB, einer juristischen Person des öffentlichen Rechts oder einem öffentlich-rechtlichen Sondervermögen (nachfolgend „Kunde“ genannt).",
                    "Gegenstand der Plattform: ProLEDALL bietet dem Kunden technisches Know-how in Form von Produkttests, Spezifikations-Auswertungen und einer SaaS-gestützten Systemauswahl. ProLEDALL übernimmt die Kommunikation mit OEMs, selektiert Qualitätsprodukte nach OEM-Spezifikationen und bereitet diese für professionelle Anwender auf.",
                    "Netzwerk und Realisierung: Angebote werden von ProLEDALL in enger Kooperation mit spezialisierten Realisierungspartnern (insbesondere der LEDALL GmbH) erstellt. ProLEDALL übernimmt hierbei die technische Fachplanung und das Engineering. Die vertragliche Umsetzung hinsichtlich des Kaufs der Hardware sowie etwaiger Installationsleistungen erfolgt – je nach gewähltem Leistungsumfang – direkt mit dem im Angebot benannten Realisierungspartner.",
                ],
            },
            {
                title: "~ 2  Vertragsschluss, Leistungsumfang der Plattform, Vermittlung",
                paragraphs: [
                    "Kombinierte Angebote: ProLEDALL erstellt Projektangebote, die sowohl die Fachplanung/Beratung (ProLEDALL) als auch die Lieferung und ggf. Montage der Hardware (Realisierungspartner) umfassen können. Mit der Annahme eines solchen Angebots durch den Kunden entstehen – sofern nicht explizit anders vereinbart – getrennte Vertragsverhältnisse:",
                    "a) Ein Beratungs- und Engineeringvertrag mit ProLEDALL",
                    "b) Ein Kauf- und/oder Werkvertrag mit dem im Angebot benannten Realisierungspartner",
                    "Flexibilität der Realisierung: Der Kunde kann wählen, ob er das Gesamtpaket (Hardware & Montage) über den vorgeschlagenen Realisierungspartner bezieht oder lediglich die Hardware über diesen erwirbt und die Installation durch eigenes Personal oder Dritte durchführen lässt. In letzterem Fall beschränkt sich die vertragliche Beziehung zum Realisierungspartner auf den Kauf der Komponenten; die Haftung von ProLEDALL für Montagefehler Dritter ist ausgeschlossen.",
                    "Unsere Angebote sind freibleibend, es sei denn, sie sind ausdrücklich als verbindlich gekennzeichnet. Abschlüsse und Vereinbarungen werden erst durch unsere schriftliche Auftragsbestätigung (oder die des Partners) oder durch Ausführung der Leistung verbindlich.",
                    "OEM-Kommunikation: Soweit ProLEDALL im Namen des Kunden die Kommunikation mit OEMs übernimmt, handelt ProLEDALL als technischer Berater. Ein direkter Kaufvertrag zwischen dem Kunden und dem OEM kommt dadurch nicht zustande, es sei denn, dies ist ausdrücklich so vorgesehen.",
                    "Abweichend hiervon kann ProLEDALL in Einzelfällen selbst als Verkäufer oder Generalunternehmer auftreten. In diesem Fall wird dies im jeweiligen Angebot ausdrücklich ausgewiesen, und es gelten ergänzende vertragliche Bedingungen.",
                ],
            },
            {
                title: "~ 3  Vergütungsmodell, SaaS-Services und Abrechnung",
                paragraphs: [
                    "Kostenfreiheit für Kunden: Die Nutzung der Plattform ProLEDALL, der Zugriff auf Fachartikel, Blog-Inhalte sowie die grundlegende Unterstützung bei der Produktauswahl (KI-gestützte Selektion) sind für den Kunden grundsätzlich kostenfrei, sofern nicht ausdrücklich eine kostenpflichtige Individualberatung vereinbart wurde.",
                    "Refinanzierung über Realisierungspartner: ProLEDALL (Ledall Media Engineering) refinanziert den Betrieb der Plattform, die ständige Evaluation von OEM-Produkten sowie die Weiterentwicklung der KI-Selektionstools durch SaaS-Servicegebühren (Software-as-a-Service) und Marketing-Beiträge der teilnehmenden Realisierungspartner. Ein Provisionsanspruch gegenüber dem Kunden besteht nicht.",
                    "Gesonderte Beratungsvereinbarungen: Nur in Fällen, in denen der Kunde explizit eine über den Standardumfang hinausgehende, unabhängige Ingenieursleistung oder Fachplanung (z. B. detaillierte Ausschreibungserstellung ohne Realisierungsabsicht) wünscht, wird eine separate Vergütungsvereinbarung direkt zwischen ProLEDALL und dem Kunden getroffen. In diesem Fall erfolgt die Rechnungsstellung durch Ledall Media Engineering gemäß vereinbartem Honorar.",
                    "Abrechnung der operativen Leistungen: Sämtliche Rechnungen für die Lieferung von LED-Systemen, Hardware, Software-Lizenzen des Partners sowie Montageleistungen werden ausschließlich durch den jeweiligen Realisierungspartner erstellt. ProLEDALL tritt hierbei nicht als Inkassostelle für den Partner auf.",
                    "Werbeleistungen: ProLEDALL behält sich vor, Werbeflächen auf der Plattform an Partner oder Dritte (z. B. SaaS-Anbieter oder Hersteller) zu vermieten. Die Kennzeichnung erfolgt gemäß den gesetzlichen Bestimmungen als „Anzeige“ oder „Sponsored Content“.",
                ],
            },
            {
                title: "~ 4  Geistiges Eigentum, Nutzungsrechte und Inhalte",
                paragraphs: [
                    "Urheberrechtsschutz: Sämtliche auf der Plattform ProLEDALL bereitgestellten Inhalte, insbesondere Blog-Artikel, Fachbeiträge, OEM-Evaluierungen, Produkttests, Grafiken, Datenbanken sowie die Logik der KI-gestützten Filter- und Selektionstools, sind urheberrechtlich geschützt. Alle Rechte liegen ausschließlich bei ProLEDALL (Ledall Media Engineering) bzw. dem Inhaber Dipl.-Ing. Mohammed Abahssain.",
                    "Nutzung durch den Kunden: Der Kunde ist berechtigt, die auf der Plattform zur Verfügung gestellten Informationen für den eigenen internen Gebrauch im Rahmen der Projektplanung zu nutzen. Eine darüber hinausgehende Nutzung, insbesondere die Vervielfältigung, Verbreitung, öffentliche Zugänglichmachung oder die gewerbliche Weiterverwertung (z. B. als eigene Beratungsleistung gegenüber Dritten), ist ohne ausdrückliche schriftliche Zustimmung von ProLEDALL untersagt.",
                    "Schutz von Ingenieurleistungen: Sofern ProLEDALL dem Kunden im Rahmen der Beratung technische Zeichnungen, Engineering-Konzepte oder spezifische Fachplanungen aushändigt, verbleiben sämtliche Schutzrechte bei ProLEDALL. Der Kunde darf diese Unterlagen nur für das konkrete Projekt verwenden, für das sie erstellt wurden. Eine Weitergabe an Dritte (insbesondere an Wettbewerber zu Vergleichszwecken) ist strikt untersagt.",
                    "Verbot von Data Mining / Scraping: Das automatisierte Auslesen von Daten, OEM-Bewertungen oder Preiskalkulationen von der Plattform (z. B. durch Bots, Scraper oder KI-Crawler) ist untersagt, sofern dies nicht ausdrücklich für bestimmte Schnittstellen (API) genehmigt wurde.",
                    "Markenrechte: Die Bezeichnung „ProLEDALL“ sowie die zugehörigen Logos sind markenrechtlich geschützte Zeichen. Eine Nutzung durch den Kunden oder Realisierungspartner ist nur im Rahmen der vertraglichen Vereinbarungen gestattet.",
                ],
            },
            {
                title: "~ 5  Haftung und Gewährleistung",
                paragraphs: [
                    "Haftung für Beratung und Planung: ProLEDALL haftet für die fachgerechte Erstellung von Planungen und Engineering-Leistungen nach den anerkannten Regeln der Technik. Eine Haftung für die Richtigkeit der von OEMs (Herstellern) zur Verfügung gestellten technischen Daten und Spezifikationen wird nicht übernommen, sofern ProLEDALL diese Daten mit kaufmännischer Sorgfalt auf Plausibilität geprüft hat.",
                    "Ausschluss der Sachmängelhaftung für Hardware: Da ProLEDALL nicht Verkäufer der LED-Systeme oder sonstiger Hardware ist, ist jegliche Gewährleistung oder Sachmängelhaftung durch ProLEDALL für die gelieferten Produkte ausgeschlossen. Ansprüche wegen Produktmängeln, Lieferverzögerungen oder fehlerhafter Montage sind ausschließlich gegenüber dem jeweiligen Realisierungspartner geltend zu machen.",
                    "Inhalte der Plattform und Analyse-Tools: Die auf der Plattform bereitgestellten Fachartikel, Blog-Inhalte sowie technischen Filter- und Analyse-Tools dienen der allgemeinen Unterstützung bei der Systemauswahl. Diese Tools befinden sich in ständiger Weiterentwicklung; für die vollständige Richtigkeit, Aktualität oder ständige Verfügbarkeit der dort angezeigten Datenbank-Ergebnisse wird keine Gewähr übernommen. Die finale technische Prüfung der Spezifikationen obliegt dem Kunden im Rahmen der konkreten Projektierung.",
                    "Haftungsbeschränkung: ProLEDALL haftet – gleich aus welchem Rechtsgrund – nur bei Vorsatz oder grober Fahrlässigkeit sowie bei der Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). Bei einfacher Fahrlässigkeit ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Die Haftung für mittelbare Schäden, entgangenen Gewinn oder Mangelfolgeschäden ist ausgeschlossen.",
                    "Verjährung: Ansprüche des Kunden aus Beratungs- oder Planungsfehlern verjähren innerhalb von 12 Monaten nach Abschluss der jeweiligen Beratungsleistung, sofern nicht gesetzlich zwingend längere Fristen vorgeschrieben sind.",
                ],
            },
            {
                title: "~ 6  Mitwirkungspflichten des Kunden",
                paragraphs: [
                    "Die fachgerechte Beratung und Planung durch ProLEDALL setzt voraus, dass der Kunde alle erforderlichen Informationen, Unterlagen (z. B. Baupläne, Lastenverzeichnisse, Stromanschlussdaten) und Genehmigungen rechtzeitig und vollständig zur Verfügung stellt.",
                    "Verzögerungen, die durch verspätete Beibringung oder fehlerhafte Angaben des Kunden entstehen, gehen nicht zu Lasten von ProLEDALL.",
                    "Der Kunde benennt für jedes Projekt einen fachlich kompetenten Ansprechpartner, der entscheidungsbefugt ist.",
                ],
            },
            {
                title: "~ 7  Geheimhaltung und Vertraulichkeit",
                paragraphs: [
                    "Beide Parteien verpflichten sich, alle im Rahmen der Zusammenarbeit erhaltenen Informationen, die als vertraulich gekennzeichnet oder ihrer Natur nach als Geschäftsgeheimnis erkennbar sind, streng vertraulich zu behandeln.",
                    "Dies gilt insbesondere für technische Spezifikationen der OEMs, Preismodelle der Realisierungspartner sowie interne Projektinterna des Kunden.",
                    "Diese Verpflichtung bleibt auch nach Beendigung der Zusammenarbeit für einen Zeitraum von drei Jahren bestehen.",
                ],
            },
            {
                title: "~ 8  Referenzwerbung",
                paragraphs: [
                    "ProLEDALL ist berechtigt, den Kunden sowie das realisierte Projekt nach erfolgreichem Abschluss anonymisiert oder – nach Rücksprache – namentlich als Referenz auf der Plattform, in Blog-Beiträgen oder in sozialen Netzwerken zu nennen.",
                    "Der Kunde kann dieser Nutzung jederzeit schriftlich widersprechen, sofern er ein berechtigtes Interesse (z. B. Geheimhaltung bei Militär- oder Sicherheits-Projekten) geltend macht.",
                ],
            },
            {
                title: "~ 9  Kundenschutz",
                paragraphs: [
                    "Der Kunde verpflichtet sich, während der Dauer der Geschäftsbeziehung sowie für einen Zeitraum von 24 Monaten nach deren Beendigung keine direkten oder indirekten Geschäftsbeziehungen mit Herstellern (OEM), Lieferanten oder Realisierungspartnern einzugehen, die ihm im Rahmen der Nutzung der Plattform oder durch Leistungen von ProLEDALL bekannt geworden sind, sofern diese Geschäftsbeziehung auf eine Vermittlung, Empfehlung oder sonstige Mitwirkung von ProLEDALL zurückzuführen ist.",
                    "Im Falle eines Verstoßes ist ProLEDALL berechtigt, eine angemessene Vertragsstrafe zu verlangen. Die Geltendmachung eines darüberhinausgehenden Schadens bleibt vorbehalten.",
                ],
            },
            {
                title: "~ 10  Plattformentwicklung und Änderungen",
                paragraphs: [
                    "ProLEDALL behält sich vor, Inhalte, Funktionen, Strukturen sowie technische Komponenten der Plattform jederzeit zu ändern, weiterzuentwickeln oder einzuschränken, soweit dies für den Nutzer zumutbar ist. Ein Anspruch auf die dauerhafte Verfügbarkeit bestimmter Funktionen oder Inhalte besteht nicht.",
                ],
            },
            {
                title: "~ 11  Änderung der AGB",
                paragraphs: [
                    "ProLEDALL behält sich vor, diese AGB jederzeit mit Wirkung für die Zukunft anzupassen, insbesondere bei:",
                    "a) Änderungen des Geschäftsmodells",
                    "b) Erweiterung der Plattformfunktionen",
                    "c) gesetzlichen Anforderungen",
                    "Die jeweils aktuelle Version wird auf der Plattform veröffentlicht.",
                ],
            },
            {
                title: "~ 12  Erfüllungsort, Gerichtsstand, Anwendbares Recht",
                paragraphs: [
                    "Erfüllungsort für alle Ansprüche aus der Geschäftsbeziehung zwischen dem Kunden und uns ist Ludwigshafen am Rhein.",
                    "Ausschließlicher Gerichtsstand für alle Ansprüche aus der Geschäftsbeziehung ist Ludwigshafen am Rhein. Wir sind jedoch auch berechtigt, den Kunden an seinem allgemeinen Gerichtsstand zu verklagen.",
                    "Es gilt ausschließlich deutsches Recht unter Ausschluss des UN-Kaufrechts (CISG).",
                    "Salvatorische Klausel: Sollte eine Bestimmung dieser Bedingungen unwirksam sein oder werden, so wird die Gültigkeit der übrigen Bestimmungen hiervon nicht berührt.",
                ],
            },
        ],
    },
};

export default function TermsAndConditionsPage() {
    const { language } = useLanguage();
    const isEn = language === "en";
    const copy = CONTENT[isEn ? "en" : "de"];

    const tocSections = copy.sections.map((section, index) => ({
        ...section,
        id: slugifySectionId(section.title, index),
        tocLabel: section.title.match(/~\s*\d+/)?.[0] || `~ ${index + 1}`,
    }));

    return (
        <LegalPageLayout
            breadcrumbTitle={copy.title}
            breadcrumbs={[
                { label: isEn ? "Home" : "Startseite", href: "/" },
                { label: copy.breadcrumb },
            ]}
            documentTitle={copy.heading}
            documentSubtitle={copy.subheading}
            showToc
            sections={tocSections}
            isEn={isEn}
        >
            {renderLegalSections(tocSections, isEn)}
        </LegalPageLayout>
    );
}

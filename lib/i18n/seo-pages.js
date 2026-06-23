/** Per-page SEO copy and settings — source of truth for guest hreflang metadata. */
export const SEO_PAGES = {
    "": {
        de: {
            title: "LED Videowand kaufen | Professionelle LED Displays | ProLEDALL",
            description:
                "Ihr Premium B2B Anbieter für LED Displays & Videowände in Europa. EMV-konform, maßgeschneidert & langlebig. Jetzt unverbindlich Kosten anfragen!",
        },
        en: {
            title: "LED Display Supplier Europe | B2B Marketplace | ProLEDALL",
            description:
                "Europe's B2B matchmaker for certified LED video walls. Compare suppliers, get transparent quotes and scale LED projects. Free & non-binding.",
        },
    },
    "/products": {
        de: {
            title: "LED-Videowand Lösungen | Indoor & Outdoor Screens | ProLEDALL",
            description:
                "Premium LED-Anzeigetafeln, Fine-Pitch-Videowände und maßgeschneiderte Systeme für Retail, Stadien & Konferenzräume. Jetzt Katalog ansehen!",
        },
        en: {
            title: "Buy & Compare LED Video Walls | ProLEDALL",
            description:
                "Buy certified LED video walls and displays: Indoor, Outdoor, Fine Pitch & Mobile. 1:1 technical comparison from verified manufacturers. Request a product now.",
        },
    },
    "/leditor": {
        de: {
            title: "LEditor Signage Software | Displays steuern | ProLEDALL",
            description:
                "Smarte Digital-Signage-Software für einfache Inhaltplanung, Layout-Kontrolle & Remote-Updates Ihrer LED-Wände. Jetzt Software herunterladen!",
        },
        en: {
            title: "LED Screen Configurator | Get a Quote in 5 Min. | ProLEDALL",
            description:
                "Configure your LED video wall online: set dimensions, mounting, IP rating and controller — receive multiple manufacturer quotes within 48 hours. Start free.",
        },
    },
    "/become-partner": {
        de: {
            title: "B2B-Partner werden | LED Display Netzwerk | ProLEDALL",
            description:
                "Werden Sie Teil unseres europäischen Netzwerks für LED-Systeme. Sichern Sie sich Großhandelspreise, Support & Premium-Hardware. Jetzt bewerben!",
        },
        en: {
            title: "Become a LED Display Partner | Integrators & Dealers | ProLEDALL",
            description:
                "Scale LED display projects together: qualified leads, technical support, demo systems and exclusive project protection for integrators and dealers across Europe.",
        },
    },
    "/contact": {
        de: {
            title: "LED Display Anfrage | Kostenlose Beratung | ProLEDALL",
            description:
                "LED-Videowand-Projekt anfragen: Unser Expertenteam meldet sich innerhalb von 24 Stunden. Kostenlose Erstberatung für Integratoren, Planer und Unternehmen in Europa.",
        },
        en: {
            title: "LED Display Enquiry | Free Consultation | ProLEDALL",
            description:
                "Submit your LED video wall project: our expert team responds within 24 hours. Free initial consultation for integrators, planners and businesses across Europe.",
        },
    },
    "/faqs": {
        de: {
            title: "LED Display FAQ | Häufige Fragen | ProLEDALL",
            description:
                "Antworten auf häufige Fragen zu LED-Videowänden, Angeboten, Lieferzeiten und dem ProLEDALL B2B-Marktplatz. Alles, was Integratoren und Käufer wissen müssen.",
        },
        en: {
            title: "LED Display FAQ | Frequently Asked Questions | ProLEDALL",
            description:
                "Answers to common questions about LED video walls, quotes, lead times and the ProLEDALL B2B marketplace. Everything integrators and buyers need to know.",
        },
    },
    "/blogs": {
        de: {
            title: "LED Display Blog | Expertenratgeber und Brancheneinblicke",
            description:
                "LED Display Blog: Bleiben Sie mit den neuesten Nachrichten und Einblicken aus der LED-Display-Branche auf dem Laufenden. Erhalten Sie Expertentipps und erfahren Sie mehr über die aktuellsten Trends.",
            robots: { index: false },
        },
        en: {
            title: "LED Display Blog | Expert Guides & Industry Insights",
            description:
                "LED Display Blog: Stay updated with the latest news and insights from the LED display industry. Get expert tips and learn about the latest trends.",
            robots: { index: false },
        },
    },
    "/controllers": {
        de: {
            title: "LED Videowand Controller & Bildprozessoren | ProLEDALL",
            description:
                "High-End LED-Controller für nahtlose, hochauflösende Bildverarbeitung. Zuverlässige Hardware für Kontrollräume & Retail. Hardware entdecken!",
            robots: { index: false },
        },
        en: {
            title: "LED Display Controllers | Colorlight, Novastar, Brompton, LINSN",
            description:
                "Compare professional LED controller systems including Colorlight, Novastar, Brompton, and LINSN. Full specs and compatibility data for LED video wall projects.",
            robots: { index: false },
        },
    },
    "/imprint": {
        de: {
            title: "Impressum | ProLEDALL",
            robots: { index: false },
        },
        en: {
            title: "Imprint | ProLEDALL",
            robots: { index: false },
        },
    },
    "/terms-and-conditions": {
        de: {
            title: "AGB | ProLEDALL",
            robots: { index: false },
        },
        en: {
            title: "Terms and Conditions | ProLEDALL",
            robots: { index: false },
        },
    },
};

/**
 * Maps a normalized pathname (no locale prefix, "" = home) to a stable pageKey
 * used as the primary key of the `page_seo` table and the admin SEO editor.
 */
export const PAGE_KEY_BY_PATH = {
    "": "home",
    "/products": "products",
    "/leditor": "leditor",
    "/become-partner": "become-partner",
    "/contact": "contact",
    "/faqs": "faqs",
    "/blogs": "blogs",
    "/controllers": "controllers",
    "/imprint": "imprint",
    "/terms-and-conditions": "terms-and-conditions",
};

/** Reverse lookup: pageKey -> normalized pathname. */
export const PATH_BY_PAGE_KEY = Object.fromEntries(
    Object.entries(PAGE_KEY_BY_PATH).map(([path, key]) => [key, path])
);

/** Human-friendly labels for the admin SEO editor, in display order. */
export const PAGE_SEO_ORDER = [
    { key: "home", label: "Homepage" },
    { key: "products", label: "Product Catalog" },
    { key: "controllers", label: "Controllers" },
    { key: "leditor", label: "LEditor" },
    { key: "become-partner", label: "Become Partner" },
    { key: "contact", label: "Contact" },
    { key: "faqs", label: "FAQs" },
    { key: "blogs", label: "Blogs" },
    { key: "imprint", label: "Imprint" },
    { key: "terms-and-conditions", label: "Terms & Conditions" },
];

/**
 * Default page_seo row values derived from SEO_PAGES, used to seed the table
 * and as the GET fallback when the DB is empty.
 */
export function defaultPageSeoRow(pageKey) {
    const path = PATH_BY_PAGE_KEY[pageKey] ?? "";
    const page = SEO_PAGES[path] ?? {};
    const de = page.de ?? {};
    const en = page.en ?? {};
    const noindex = de.robots?.index === false || en.robots?.index === false;
    return {
        pageKey,
        titleDe: de.title ?? "",
        titleEn: en.title ?? "",
        descriptionDe: de.description ?? "",
        descriptionEn: en.description ?? "",
        noindex,
    };
}

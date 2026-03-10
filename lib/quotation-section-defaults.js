/**
 * Default HTML content for the three editable quotation PDF sections.
 * Used to seed the quotation_section_defaults row and to copy into new quotations.
 */
import { db } from "@/lib/db";
import { quotationSectionDefaults } from "@/db/schema";

export const DEFAULT_OFFER_HTML = `<div class="para">Sehr geehrte Damen und Herrn,</div>
<div class="para">nachfolgend finden Sie unser Budgetangebot.</div>
<div class="para">Unser Ziel ist es, das optimale Produktpaket für die Anwendung zu bestimmen und Ihr geplantes Projekt bis zu einer erfolgreichen Installation zu begleiten. Es wurde auf Basis der, in der Ausschreibung beschriebenen Anforderungen erstellt.</div>
<div class="para">Sämtliche Komponenten entsprechen dem aktuellen Stand der Technik und sind konform mit den gültigen EU-Richtlinien zu EMV, Sicherheit und der RoHs Direktive.</div>
<div class="para">Wir würden uns freuen, das Projekt mit Ihnen gemeinsam zu realisieren und sichern Ihnen unser vollstes Engagement zu</div>
<div class="para" style="margin-top: 20px;">Mit freundlichen Grüßen</div>
<div class="para">Dipl. Ing. M. Abahssain</div>`;

export const DEFAULT_CONDITIONS_HTML = `<div class="para"><strong><u>Gewährleistung:</u></strong> Die Gewährleistungszeit beträgt 2 Jahre, im Falle eines Wartungsvertrages mit jährlicher Wartung und Erweiterung des Ersatzteilpakets auf 5%, verlängert sich die Gewährleistungszeit auf 5 Jahre. Es gilt: deutsches Recht.</div>
<div class="para"><strong><u>Garantierte Ersatzteilverfügbarkeit:</u></strong> 5 Jahre</div>
<div class="para"><strong><u>Liefertermin:</u></strong> Lieferung, Inbetriebnahme und Abnahme bis spätestens 12 Wochen nach erfolgter Anzahlung</div>
<div class="para"><strong><u>Zahlungsbedingungen:</u></strong> 50% bei der Auftragserteilung; 40% bei Lieferung; 10% nach Inbetriebnahme und Abnahme</div>
<div class="para"><strong><u>Preisstellung:</u></strong> Alle Preise sind Netto-Preise exklusive der gesetzlichen MwSt.</div>`;

export const DEFAULT_OPTIONS_HTML = `<div class="para"><strong>Optional :</strong> Wartung u. Servicevertrag (jährlich)</div>
<div class="para">im Falle eines Wartungsvertrages mit jährlicher Wartung und Erweiterung des Ersatzteilpakets auf 5%, verlängert sich die Gewährleistungszeit auf 5 Jahre</div>`;

/**
 * Get the global default section HTML values.
 * If no row exists yet, creates one with the hardcoded defaults.
 * @returns {{ sectionOfferHtml: string, sectionConditionsHtml: string, sectionOptionsHtml: string }}
 */
export async function getOrCreateSectionDefaults() {
    const rows = await db.select().from(quotationSectionDefaults).limit(1);
    if (rows.length > 0) {
        return {
            sectionOfferHtml: rows[0].sectionOfferHtml || DEFAULT_OFFER_HTML,
            sectionConditionsHtml: rows[0].sectionConditionsHtml || DEFAULT_CONDITIONS_HTML,
            sectionOptionsHtml: rows[0].sectionOptionsHtml || DEFAULT_OPTIONS_HTML,
        };
    }
    const [created] = await db
        .insert(quotationSectionDefaults)
        .values({
            sectionOfferHtml: DEFAULT_OFFER_HTML,
            sectionConditionsHtml: DEFAULT_CONDITIONS_HTML,
            sectionOptionsHtml: DEFAULT_OPTIONS_HTML,
        })
        .returning();
    return {
        sectionOfferHtml: created.sectionOfferHtml,
        sectionConditionsHtml: created.sectionConditionsHtml,
        sectionOptionsHtml: created.sectionOptionsHtml,
    };
}

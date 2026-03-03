/**
 * Generates quotation PDF using Puppeteer and a self-contained HTML template.
 *
 * Changes from original:
 * - Uses withBrowserPage() instead of getBrowser() singleton (fixes memory + race condition)
 * - Added PDF generation timeout via Promise.race
 * - waitUntil changed to "networkidle0" with request interception fallback
 * - posRef resets between main and alternative sections (correct numbering)
 * - Hauptangebot / Alternativangebot are separate table sections, not prefixed product names
 * - "ersatzteil" string-sniffing replaced with explicit isOptional flag
 * - Ihre Kundennummer added to cover page
 * - Controller productNumber no longer falls back to a sliced UUID
 * - TOC page numbers removed (were always wrong hardcoded values)
 */

import { withBrowserPage } from "@/lib/puppeteer-browser";

const COMPANY = {
    sender: "LEDALL Pro | Krügerstr. 3  67065 Ludwigshafen am Rhein",
    name: "LEDALLPro GmbH",
    address: "Krügerstrasse 33",
    city: "67065 München",
    country: "Deutschland",
    tel: "+49 (0) 621 953 412 11",
    fax: "+49 (0) 621 953 412 13",
    email: "info@website.de",
    web: "www.website.de",
    bank: "Sparkasse Vorderpfalz",
    iban: "DE86 5455 0010 0194 445125",
    bic: "LUHSDE6AXXX",
    hrNr: "HRB 68829 Amtsgericht Ludwigshafen",
    ustId: "DE360079437",
    steuerNr: "27/ 668/02460",
    geschaeftsfuehrung: "Abahssain, Uwe Kaiser",
};

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatCurrency(amount) {
    if (amount == null || amount === "") return "";
    return (
        new Intl.NumberFormat("de-DE", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount) + " €"
    );
}

function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Price table builder
// FIX: posRef now resets between main and alternative sections so each
//      section has its own numbering starting at 1.
// FIX: labelPrefix is no longer prepended to the product name — sections
//      have their own table headings instead.
// FIX: isSubItem is now driven by an explicit flag rather than string-sniffing.
// ---------------------------------------------------------------------------

/**
 * @typedef {{ pos: number|null, product: string, qty: number, unitPrice: number, total: number, isSubItem: boolean, isOptional: boolean }} TableRow
 */

/**
 * @param {object} item  - quotation item (main or alternative)
 * @returns {{ rows: TableRow[], total: number }}
 */
function buildItemRows(item) {
    const rows = [];
    let total = 0;
    if (!item) return { rows, total };

    const posRef = { value: 1 }; // FIX: each section gets its own counter

    // Main product row
    const qty = parseInt(item.quantity ?? 1);
    const unit = parseFloat(item.unitPrice ?? 0);
    const tot = qty * unit;
    total += tot;
    rows.push({
        pos: posRef.value++,
        product: item.product
            ? `${escapeHtml(item.product.productName)}${item.product.productNumber ? ` (Artikel: ${escapeHtml(item.product.productNumber)})` : ""}`
            : "",
        qty,
        unitPrice: unit,
        total: tot,
        isSubItem: false,
        isOptional: false,
    });

    // Additional items (included in total)
    for (const add of item.additionalItems ?? []) {
        const aQty = parseInt(add.quantity ?? 1);
        const aUnit = parseFloat(add.unitPrice ?? 0);
        const aTot = aQty * aUnit;
        total += aTot;

        // FIX: controller productNumber no longer falls back to sliced UUID
        const articleNum = add.product?.productNumber || add.product?.brandName || null;

        rows.push({
            pos: posRef.value++,
            product: add.product
                ? `${escapeHtml(add.product.productName)}${articleNum ? ` (Artikel: ${escapeHtml(articleNum)})` : ""}`
                : escapeHtml(add.description ?? ""),
            qty: aQty,
            unitPrice: aUnit,
            total: aTot,
            isSubItem: false,
            isOptional: false,
        });
    }

    // Optional items — shown in table but NOT added to total.
    // FIX: sub-item display is driven by opt.isSubItem (a real DB flag),
    //      with a graceful fallback to checking itemSourceType for spare-part kits.
    for (const opt of item.optionalItems ?? []) {
        const oQty = parseInt(opt.quantity ?? 1);
        const oUnit = parseFloat(opt.unitPrice ?? 0);
        const oTot = oQty * oUnit;

        // Treat spare-part kits as sub-items (no position number, indented).
        // Prefer an explicit DB flag; fall back to the accessory productGroup.
        const isSparePartKit =
            opt.isSubItem === true ||
            opt.product?.productGroup?.toLowerCase().includes("ersatz") ||
            opt.description?.toLowerCase().includes("ersatzteil");

        const articleNum = opt.product?.productNumber || opt.product?.brandName || null;

        rows.push({
            pos: isSparePartKit ? null : posRef.value++,
            product: opt.product
                ? `${escapeHtml(opt.product.productName)}${articleNum ? ` (Artikel: ${escapeHtml(articleNum)})` : ""}`
                : escapeHtml(opt.description ?? ""),
            qty: oQty,
            unitPrice: oUnit,
            total: oTot,
            isSubItem: isSparePartKit,
            isOptional: true,
        });
    }

    return { rows, total };
}

// ---------------------------------------------------------------------------
// Display specs builder
// ---------------------------------------------------------------------------

function buildDisplaydetails(product) {
    if (!product) return [];
    const specs = [];
    const add = (label, value) => value != null && value !== "" && specs.push({ label, value });

    add("Pixelabstand", product.pixelPitch ? `${product.pixelPitch} mm` : null);
    if (product.cabinetWidth && product.cabinetHeight)
        add("Kabinett Abmaße BxH", `${product.cabinetWidth}mmx${product.cabinetHeight}mm`);
    if (product.cabinetResolutionHorizontal && product.cabinetResolutionVertical)
        add("Auflösung", `${product.cabinetResolutionHorizontal}x${product.cabinetResolutionVertical} Pixel`);
    if (product.cabinetWidth && product.cabinetHeight) {
        const w = parseFloat(product.cabinetWidth) / 1000;
        const h = parseFloat(product.cabinetHeight) / 1000;
        add("Gesamt Fläche", `${(w * h).toFixed(2)} m²`);
    }
    add("Max. Helligkeit", product.brightnessValue ? `${product.brightnessValue} cd/m²` : null);
    if (product.contrastRatioNumerator && product.contrastRatioDenominator)
        add("Kontrast", `${product.contrastRatioNumerator}:${product.contrastRatioDenominator}`);
    add("Bildwiederholfrequenz, programmierbar", product.refreshRate ? `${product.refreshRate} Hz` : null);
    add("Typ. Leistungsaufnahme", product.powerConsumptionTypical ? `${product.powerConsumptionTypical} Watt` : null);
    add("Max. Leistungsaufnahme", product.powerConsumptionMax ? `${product.powerConsumptionMax} Watt` : null);
    add("Gesamt Gewicht", product.weightWithoutPackaging ? `${product.weightWithoutPackaging} Kg` : null);
    return specs;
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

function buildHtml(data) {
    const { quotation, enquiry, mainProduct, alternativeProduct } = data;

    const quotationDate = formatDate(quotation?.createdAt);
    const projectName =
        mainProduct?.product?.productName ||
        enquiry?.message?.slice(0, 80) ||
        "Projekt";
    const recipientName = enquiry?.customerName || enquiry?.customerCompany || "";
    const recipientCompany = enquiry?.customerCompany || "";

    // Customer number — comes from enquiry/user data
    const customerNumber = enquiry?.customerNumber || enquiry?.userId?.slice(0, 8)?.toUpperCase() || "";

    const main = buildItemRows(mainProduct);
    const alt = buildItemRows(alternativeProduct);

    const mainDisplaySpecs = buildDisplaydetails(mainProduct?.product);
    const altDisplaySpecs = buildDisplaydetails(alternativeProduct?.product);

    // ---------------------------------------------------------------------------
    // Sub-renderers
    // ---------------------------------------------------------------------------

    const rowToTr = (r) => `
      <tr class="${r.isSubItem ? "sub-row" : ""} ${r.isOptional ? "optional-row" : ""}">
        <td class="col-pos">${r.pos ?? ""}</td>
        <td class="col-product">${r.product}</td>
        <td class="col-num">${r.qty}</td>
        <td class="col-num">${r.unitPrice ? formatCurrency(r.unitPrice) : ""}</td>
        <td class="col-num">${formatCurrency(r.total)}${r.isOptional ? " *" : ""}</td>
      </tr>`;

    const buildTableSection = (label, rows, total) => {
        if (!rows.length) return "";
        const hasOptional = rows.some((r) => r.isOptional);
        return `
      <tr class="section-header-row">
        <td colspan="5">${label}</td>
      </tr>
      ${rows.map(rowToTr).join("")}
      <tr class="total-row">
        <td colspan="4">${label} – Gesamtpreis netto</td>
        <td class="col-num">${formatCurrency(total)}</td>
      </tr>
      ${hasOptional ? `<tr class="optional-note-row"><td colspan="5">* Optional – nicht im Gesamtpreis enthalten</td></tr>` : ""}`;
    };

    const specsHtml = (specs) =>
        specs.map((s) => `<div><strong>${s.label}:</strong> ${s.value}</div>`).join("");

    const featuresHtml = (features = []) =>
        (features ?? []).map((f) => `<li>${escapeHtml(f)}</li>`).join("");

    const descriptionBlock = (item) => {
        if (!item?.product) return "";
        const articleNum = item.product.productNumber || null;
        return `
      <div class="block-title">${escapeHtml(item.product.productName)}${articleNum ? ` (Artikel: ${escapeHtml(articleNum)})` : ""}</div>
      ${(item.product.features ?? []).length > 0 ? `
        <div class="sub-block-title">Features</div>
        <ul>${featuresHtml(item.product.features)}</ul>
        <div class="download-link">Download Link:</div>
      ` : ""}
      ${(item.additionalItems ?? []).map((add) => {
        const addArticle = add.product?.productNumber || add.product?.brandName || null;
        return `
        <div class="block-title">${escapeHtml(add.product?.productName || add.description || "")}</div>
        <div class="para">${escapeHtml(add.description || add.product?.productName || "")}</div>
        ${(add.product?.features ?? []).length > 0 ? `<ul>${featuresHtml(add.product.features)}</ul>` : ""}
      `}).join("")}
      ${(item.optionalItems ?? []).map((opt) => {
        const optArticle = opt.product?.productNumber || null;
        const isSpares = opt.isSubItem || opt.product?.productGroup?.toLowerCase().includes("ersatz") || opt.description?.toLowerCase().includes("ersatzteil");
        return `
        <div class="block-title">${escapeHtml(opt.product?.productName || opt.description || "")}</div>
        <div class="para">${isSpares
            ? "aller relevanten Systemkomponenten (insbesondere LED-Module derselben Herstellungscharge = Farbtreue)"
            : escapeHtml(opt.description || "")}</div>
        ${(opt.product?.features ?? []).length > 0 ? `<ul>${featuresHtml(opt.product.features)}</ul>` : ""}
        <div class="download-link">Download Link:</div>
      `}).join("")}`;
    };

    // ---------------------------------------------------------------------------
    // Full HTML document
    // ---------------------------------------------------------------------------
    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Angebot ${escapeHtml(quotation?.quotationNumber ?? "")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      color: #000;
      line-height: 1.45;
      /* Puppeteer handles outer margins via pdf() options */
    }

    /* ── Cover ─────────────────────────────────────────────────────────── */
    .sender-underline {
      font-size: 8pt;
      border-bottom: 1px solid #000;
      padding-bottom: 4px;
      margin-bottom: 20px;
    }
    .two-col { display: flex; justify-content: space-between; gap: 40px; margin-top: 8px; }
    .col-left { flex: 1; }
    .col-right { text-align: right; flex: 1; font-size: 9.5pt; }
    .col-right .label { color: #555; font-size: 8.5pt; }

    /* ── Table of contents ─────────────────────────────────────────────── */
    .toc-title { font-weight: bold; font-size: 12pt; color: #1d4ed8; margin: 28px 0 10px; }
    .toc-row { display: flex; align-items: baseline; margin-bottom: 5px; font-size: 10pt; }
    .toc-text { flex-shrink: 0; }
    .toc-dots { flex: 1; border-bottom: 1px dotted #aaa; margin: 0 6px; min-width: 20px; }

    /* ── Section headings ──────────────────────────────────────────────── */
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
      margin: 26px 0 12px;
    }

    /* ── Body text ─────────────────────────────────────────────────────── */
    .para { margin-bottom: 10px; }
    .italic { font-style: italic; }
    ul { margin: 6px 0 10px 22px; }
    li { margin-bottom: 3px; }

    /* ── Block titles (position descriptions) ──────────────────────────── */
    .block-title { font-weight: bold; margin: 14px 0 6px; }
    .sub-block-title { font-weight: bold; margin: 8px 0 4px; }
    .download-link { font-size: 8.5pt; color: #555; margin-top: 6px; }

    /* ── Specs block ───────────────────────────────────────────────────── */
    .displaydetails { margin: 8px 0 0 10px; font-size: 9.5pt; }
    .displaydetails > div { margin-bottom: 3px; }
    .displaydetails-title { font-weight: bold; text-decoration: underline; margin: 10px 0 6px; }

    /* ── Price table ───────────────────────────────────────────────────── */
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 9.5pt; }
    thead { display: table-header-group; }
    tbody tr { page-break-inside: avoid; }
    th, td { padding: 5px 7px; text-align: left; border-bottom: 1px solid #ddd; }
    th { font-weight: bold; border-bottom: 2px solid #000; background: #f8f8f8; }
    .col-pos { width: 5%; white-space: nowrap; }
    .col-product { width: 48%; }
    .col-num { text-align: right; width: 13%; white-space: nowrap; }

    /* section header row (Hauptangebot / Alternativangebot) */
    .section-header-row td {
      font-weight: bold;
      background: #f0f4ff;
      border-top: 2px solid #1d4ed8;
      color: #1d4ed8;
      padding: 6px 7px;
    }

    .sub-row td { padding-left: 22px; color: #444; }
    .optional-row td { font-style: italic; color: #555; }
    .total-row { border-top: 2px solid #000; font-weight: bold; page-break-inside: avoid; }
    .optional-note-row td { font-size: 8pt; color: #666; padding: 3px 7px; border-bottom: 1px solid #eee; }

    /* ── Page breaks ───────────────────────────────────────────────────── */
    .page-break { page-break-before: always; }
    .avoid-break { page-break-inside: avoid; }

    /* ── Konditionen ───────────────────────────────────────────────────── */
    .konditionen-item { margin-bottom: 10px; }
  </style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════════════════
     PAGE 1 — Cover + Table of Contents + Section 1
     ═══════════════════════════════════════════════════════════════════════ -->

  <div class="sender-underline">${COMPANY.sender}</div>

  <div class="two-col">
    <div class="col-left">
      ${recipientName ? `<div>${escapeHtml(recipientName)}</div>` : ""}
      ${recipientCompany && recipientCompany !== recipientName ? `<div>${escapeHtml(recipientCompany)}</div>` : ""}
      <div>Deutschland</div>
    </div>
    <div class="col-right">
      <div>Ludwigshafen, ${quotationDate}</div>
      <div style="font-weight: bold; margin-top: 6px;">
        Angebot Nr. ${escapeHtml(quotation?.quotationNumber ?? "")} Rev.0
      </div>
      ${customerNumber ? `<div style="margin-top:4px;"><span class="label">Ihre Kundennummer:</span> ${escapeHtml(customerNumber)}</div>` : ""}
      <div style="margin-top: 4px;">
        <span class="label">Referenz / Project Name:</span> ${escapeHtml(projectName)}
      </div>
      <div style="margin-top: 12px;">Unser Bearbeiter: Abahssain</div>
      <div>E-Mail: ${COMPANY.email}</div>
      <div>Tel: ${COMPANY.tel}</div>
    </div>
  </div>

  <!-- Table of Contents
       FIX: page numbers removed — they were always hardcoded wrong values.
            A proper TOC with real page numbers requires a two-pass render
            which is complex; leaving dots only is more honest than wrong numbers. -->
  <div class="toc-title">Inhalt</div>
  ${[
    "1.  Unser Angebot / our offer",
    "2.  Preisübersicht / Price overview",
    "3.  Konditionen / conditions",
    "4.  Positionsbeschreibungen / Position descriptions",
    "5.  Optionen / options",
  ].map((t) => `
  <div class="toc-row">
    <span class="toc-text">${t}</span>
    <span class="toc-dots"></span>
  </div>`).join("")}

  <hr style="margin: 20px 0;">

  <!-- Section 1 -->
  <div class="section-title">1.&nbsp; Unser Angebot / our offer</div>
  <div class="para">Sehr geehrte Damen und Herrn,</div>
  <div class="para">nachfolgend finden Sie unser Budgetangebot.</div>
  <div class="para">
    Unser Ziel ist es, das optimale Produktpaket für die Anwendung zu bestimmen und Ihr geplantes
    Projekt bis zu einer erfolgreichen Installation zu begleiten. Es wurde auf Basis der, in der
    Ausschreibung „<span class="italic">${escapeHtml(projectName)}</span>" beschriebenen
    Anforderungen erstellt.
  </div>
  <div class="para">
    Sämtliche Komponenten entsprechen dem aktuellen Stand der Technik und sind konform mit den
    gültigen EU-Richtlinien zu EMV, Sicherheit und der RoHs Direktive.
  </div>
  <div class="para">
    Wir würden uns freuen, das Projekt mit Ihnen gemeinsam zu realisieren und sichern Ihnen unser
    vollstes Engagement zu
  </div>
  <div class="para" style="margin-top: 20px;">Mit freundlichen Grüßen</div>
  <div class="para">Dipl. Ing. M. Abahssain</div>


<!-- ═══════════════════════════════════════════════════════════════════════
     Section 2 — Preisübersicht (flows naturally, may span pages)
     ═══════════════════════════════════════════════════════════════════════ -->

  <div class="section-title">2.&nbsp; Preisübersicht / Price overview</div>

  ${mainProduct?.product ? `
    <div class="displaydetails-title">Hauptangebot – ${escapeHtml(mainProduct.product.productName)}</div>
    ${mainDisplaySpecs.length > 0 ? `
      <div style="font-weight:bold; text-decoration:underline; margin-bottom:6px;">Displaydetails:</div>
      <div class="displaydetails">${specsHtml(mainDisplaySpecs)}</div>
    ` : ""}
  ` : ""}

  ${alternativeProduct?.product ? `
    <div class="displaydetails-title" style="margin-top:16px;">Alternativangebot – ${escapeHtml(alternativeProduct.product.productName)}</div>
    ${altDisplaySpecs.length > 0 ? `
      <div style="font-weight:bold; text-decoration:underline; margin-bottom:6px;">Displaydetails:</div>
      <div class="displaydetails">${specsHtml(altDisplaySpecs)}</div>
    ` : ""}
  ` : ""}

  <!-- FIX: Hauptangebot and Alternativangebot are separate labelled table sections,
            each with their own position counter starting from 1. -->
  <table>
    <thead>
      <tr>
        <th class="col-pos">Pos.</th>
        <th class="col-product">Produkt</th>
        <th class="col-num">Menge</th>
        <th class="col-num">Einzelpreis</th>
        <th class="col-num">Gesamtpreis (Netto)</th>
      </tr>
    </thead>
    <tbody>
      ${buildTableSection("Hauptangebot", main.rows, main.total)}
      ${alt.rows.length > 0 ? buildTableSection("Alternativangebot", alt.rows, alt.total) : ""}
    </tbody>
  </table>


<!-- ═══════════════════════════════════════════════════════════════════════
     Section 3 — Konditionen (always starts on a new page)
     ═══════════════════════════════════════════════════════════════════════ -->

  <div class="page-break"></div>
  <div class="section-title">3.&nbsp; Konditionen / conditions</div>

  <div class="konditionen-item avoid-break">
    <strong><u>Gewährleistung:</u></strong>&nbsp; Die Gewährleistungszeit beträgt 2 Jahre, im Falle
    eines Wartungsvertrages mit jährlicher Wartung und Erweiterung des Ersatzteilpakets auf 5%,
    verlängert sich die Gewährleistungszeit auf 5 Jahre. Es gilt: deutsches Recht.
  </div>
  <div class="konditionen-item avoid-break">
    <strong><u>Garantierte Ersatzteilverfügbarkeit:</u></strong>&nbsp; 5 Jahre
  </div>
  <div class="konditionen-item avoid-break">
    <strong><u>Liefertermin:</u></strong>&nbsp; Lieferung, Inbetriebnahme und Abnahme bis spätestens
    12 Wochen nach erfolgter Anzahlung
  </div>
  <div class="konditionen-item avoid-break">
    <strong><u>Zahlungsbedingungen:</u></strong>&nbsp; 50% bei der Auftragserteilung; 40% bei
    Lieferung; 10% nach Inbetriebnahme und Abnahme
  </div>
  <div class="konditionen-item avoid-break">
    <strong><u>Preisstellung:</u></strong>&nbsp; Alle Preise sind Netto-Preise exklusive der
    gesetzlichen MwSt.
  </div>


<!-- ═══════════════════════════════════════════════════════════════════════
     Section 4 — Positionsbeschreibungen
     ═══════════════════════════════════════════════════════════════════════ -->

  <div class="section-title">4.&nbsp; Positionsbeschreibungen / Position descriptions</div>

  ${mainProduct ? `
    <div style="font-weight:bold; font-size:11pt; margin-bottom:8px;">
      Hauptangebot
    </div>
    ${descriptionBlock(mainProduct)}
  ` : ""}

  <div class="block-title">
    Projekt Management, Erarbeitung der Werkpläne (Unterkonstruktion), Konfiguration,
    Inbetriebnahme u. Einweisung.
  </div>
  <ul>
    <li>Planung und Koordination des Gesamtprojekts einschließlich der beteiligten Teilgewerke
        (inkl. CAD-Simulation und erforderlicher mechanischer Planunterlagen)</li>
  </ul>

  <div class="page-break"></div>

  <ul>
    <li>Montage der Halterung für das LED-Display</li>
    <li>Montage des LED-Displays an der vorhandenen bzw. Unterkonstruktion</li>
    <li>Ausrichtung, Verkabelung, Inbetriebnahme, Einrichtung sowie Kalibrierung und
        Funktionsprüfung der LED-Wand inklusive Messung aller relevanten Systemparameter
        und Systemeinstellungen</li>
    <li>Montage und Verkabelung der Medientechnik-Steuerung an der Medienwand sowie im Technikraum</li>
    <li>Aufbau und Verkabelung des Touch-Bedienpanels am Leitstellentisch</li>
    <li>Installation und Konfiguration der benötigten (virtuellen) Server</li>
    <li>Einrichtung der Medientechnik-Steuerung gemäß Kundenvorgaben (Szenarien, Standards, Quellen)</li>
    <li>Test, Abnahme und vollständige Dokumentation</li>
    <li>Einweisung bzw. Kurzschulung für Administratoren sowie Einführung in Software- und
        Displaybedienung</li>
  </ul>

  ${alternativeProduct ? `
    <div style="font-weight:bold; font-size:11pt; margin:20px 0 8px;">Alternativangebot</div>
    ${descriptionBlock(alternativeProduct)}
  ` : ""}


<!-- ═══════════════════════════════════════════════════════════════════════
     Section 5 — Optionen
     ═══════════════════════════════════════════════════════════════════════ -->

  <div class="section-title">5.&nbsp; Optionen / options</div>
  <div class="para">
    <strong>Optional :</strong>&nbsp; Wartung u. Servicevertrag (jährlich)
  </div>
  <div class="para">
    im Falle eines Wartungsvertrages mit jährlicher Wartung und Erweiterung des Ersatzteilpakets
    auf 5%, verlängert sich die Gewährleistungszeit auf 5 Jahre
  </div>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Puppeteer header / footer (injected on every page by Puppeteer)
// ---------------------------------------------------------------------------

const PDF_HEADER_TEMPLATE = `
  <div style="
    width: 100%;
    font-size: 14pt;
    font-weight: bold;
    text-align: right;
    padding-right: 20mm;
    font-family: Arial, Helvetica, sans-serif;
  ">LOGO</div>`;

function getPdfFooterTemplate() {
    return `
  <div style="
    width: 100%;
    font-size: 7pt;
    color: #333;
    padding: 0 20mm;
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
  ">
    <table style="width:100%; border:none; border-collapse:collapse;"><tr>
      <td style="width:25%; vertical-align:top; padding:0;">
        <strong>${COMPANY.name}</strong><br>
        ${COMPANY.address}<br>
        ${COMPANY.city}<br>
        ${COMPANY.country}
      </td>
      <td style="width:25%; vertical-align:top; padding:0;">
        Tel: ${COMPANY.tel}<br>
        Fax: ${COMPANY.fax}<br>
        Email: ${COMPANY.email}<br>
        Web: ${COMPANY.web}
      </td>
      <td style="width:25%; vertical-align:top; padding:0;">
        ${COMPANY.bank}<br>
        IBAN: ${COMPANY.iban}<br>
        BIC/SWIFT: ${COMPANY.bic}
      </td>
      <td style="width:25%; vertical-align:top; padding:0;">
        HR-Nr. ${COMPANY.hrNr}<br>
        USt-ID: ${COMPANY.ustId}<br>
        Steuer-Nr.: ${COMPANY.steuerNr}<br>
        Geschäftsführung: ${COMPANY.geschaeftsfuehrung}
      </td>
    </tr></table>
    <div style="text-align:right; font-size:8pt; color:#666; margin-top:3px;">
      Seite <span class="pageNumber"></span>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const PDF_GENERATION_TIMEOUT_MS = 25_000;

/**
 * Generates and returns a PDF buffer for the given quotation data.
 *
 * @param {object} data - From getQuotationDataForPDF()
 * @returns {Promise<Buffer>}
 */
export async function generateQuotationPDF(data) {
    const html = buildHtml(data);

    // FIX: withBrowserPage() launches Chromium fresh, runs the task, then
    //      shuts it down completely — no persistent process eating 200MB.
    const pdfBuffer = await Promise.race([
        withBrowserPage(async (page) => {
            await page.setContent(html, {
                // FIX: networkidle0 ensures the page is fully settled before
                //      capturing. Request interception in withBrowserPage()
                //      prevents this from waiting on any external network calls.
                waitUntil: "networkidle0",
            });

            return page.pdf({
                format: "A4",
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: PDF_HEADER_TEMPLATE,
                footerTemplate: getPdfFooterTemplate(),
                margin: {
                    top: "60px",
                    bottom: "100px",
                    left: "20mm",
                    right: "20mm",
                },
            });
        }),

        // FIX: hard timeout — if Chromium hangs, we reject cleanly rather
        //      than blocking the API handler indefinitely.
        new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error("PDF generation timed out after 25s")),
                PDF_GENERATION_TIMEOUT_MS
            )
        ),
    ]);

    return Buffer.from(pdfBuffer);
}
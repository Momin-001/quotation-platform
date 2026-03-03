/**
 * Generates quotation PDF using Puppeteer and HTML template.
 * Document is in German, 4 pages, 5 TOC headings (Heading 6 removed).
 */
import { getBrowser } from "@/lib/puppeteer-browser";

// Static company info (German)
const COMPANY = {
    sender: "LEDALL Pro | Krügerstr. 3 67065 Ludwigshafen am Rhein",
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
    steuerNr: "27/668/02460",
    geschaeftsfuehrung: "Abahssain, Uwe Kaiser",
};

function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("de-DE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount) + " €";
}

function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Builds price table rows and subtotal for one item (main or alternative).
 * @returns {{ rows: Array, total: number }}
 */
function buildItemRows(item, posRef, labelPrefix = "") {
    const rows = [];
    let total = 0;
    if (!item) return { rows, total };
    const prefix = labelPrefix ? `${escapeHtml(labelPrefix)}: ` : "";

    // Product row
    const qty = parseInt(item.quantity || 1);
    const unit = parseFloat(item.unitPrice || 0);
    const tot = qty * unit;
    total += tot;
    rows.push({
        pos: posRef.value++,
        product: item.product
            ? prefix + `${escapeHtml(item.product.productName)} (Artikel: ${escapeHtml(item.product.productNumber || "")})`
            : "",
        qty,
        unitPrice: unit,
        total: tot,
        isSubItem: false,
    });

    // Additional items
    for (const add of item.additionalItems || []) {
        const aQty = parseInt(add.quantity || 1);
        const aUnit = parseFloat(add.unitPrice || 0);
        const aTot = aQty * aUnit;
        total += aTot;
        rows.push({
            pos: posRef.value++,
            product: add.product
                ? `${escapeHtml(add.product.productName)} (Artikel: ${escapeHtml(add.product.productNumber || "")})`
                : escapeHtml(add.description || ""),
            qty: aQty,
            unitPrice: aUnit,
            total: aTot,
            isSubItem: false,
        });
    }

    // Optional items (shown in table but not included in total, same as quotation)
    for (const opt of item.optionalItems || []) {
        const oQty = parseInt(opt.quantity || 1);
        const oUnit = parseFloat(opt.unitPrice || 0);
        const oTot = oQty * oUnit;
        rows.push({
            pos: opt.description?.toLowerCase().includes("ersatzteil") ? null : posRef.value++,
            product: opt.product
                ? `${escapeHtml(opt.product.productName)} (Artikel: ${escapeHtml(opt.product.productNumber || "")})`
                : escapeHtml(opt.description || ""),
            qty: oQty,
            unitPrice: oUnit,
            total: oTot,
            isSubItem: opt.description?.toLowerCase().includes("ersatzteil"),
        });
    }
    return { rows, total };
}

/**
 * Builds the full price table: main rows + main total, then alternative rows + alternative total.
 * Returns { mainRows, mainTotal, alternativeRows, alternativeTotal }
 */
function buildPriceTableRows(data) {
    const posRef = { value: 1 };
    const main = data.mainProduct
        ? buildItemRows(data.mainProduct, posRef, "Hauptangebot")
        : { rows: [], total: 0 };
    const alt = data.alternativeProduct
        ? buildItemRows(data.alternativeProduct, posRef, "Alternativangebot")
        : { rows: [], total: 0 };
    return {
        mainRows: main.rows,
        mainTotal: main.total,
        alternativeRows: alt.rows,
        alternativeTotal: alt.total,
    };
}

/**
 * Builds Displaydetails spec list from product.
 */
function buildDisplaydetails(product) {
    if (!product) return [];
    const specs = [];
    if (product.pixelPitch)
        specs.push({ label: "Pixelabstand", value: `${product.pixelPitch} mm` });
    if (product.cabinetWidth && product.cabinetHeight)
        specs.push({
            label: "Kabinett Abmaße BxH",
            value: `${product.cabinetWidth}mmx${product.cabinetHeight}mm`,
        });
    if (product.cabinetResolutionHorizontal && product.cabinetResolutionVertical)
        specs.push({
            label: "Auflösung",
            value: `${product.cabinetResolutionHorizontal}x${product.cabinetResolutionVertical} Pixel`,
        });
    // Gesamt Fläche - calculated if we have cabinet dimensions
    if (product.cabinetWidth && product.cabinetHeight) {
        const w = parseFloat(product.cabinetWidth) / 1000 || 0;
        const h = parseFloat(product.cabinetHeight) / 1000 || 0;
        const area = (w * h).toFixed(2);
        specs.push({ label: "Gesamt Fläche", value: `${area} m²` });
    }
    if (product.brightnessValue)
        specs.push({
            label: "Max. Helligkeit",
            value: `${product.brightnessValue} cd/m²`,
        });
    if (product.contrastRatioNumerator && product.contrastRatioDenominator)
        specs.push({
            label: "Kontrast",
            value: `${product.contrastRatioNumerator}:${product.contrastRatioDenominator}`,
        });
    if (product.refreshRate)
        specs.push({
            label: "Bildwiederholfrequenz, programmierbar",
            value: `${product.refreshRate} Hz`,
        });
    if (product.powerConsumptionTypical)
        specs.push({
            label: "Typ. Leistungsaufnahme",
            value: `${product.powerConsumptionTypical} Watt`,
        });
    if (product.powerConsumptionMax)
        specs.push({
            label: "Max. Leistungsaufnahme",
            value: `${product.powerConsumptionMax} Watt`,
        });
    if (product.weightWithoutPackaging)
        specs.push({
            label: "Gesamt Gewicht",
            value: `${product.weightWithoutPackaging} Kg`,
        });
    return specs;
}

function buildHtml(data) {
    const { quotation, enquiry, mainProduct, alternativeProduct } = data;
    const projectName =
        mainProduct?.product?.productName ||
        enquiry?.message?.slice(0, 80) ||
        "Projekt";
    const quotationDate = formatDate(quotation?.createdAt);
    const recipientName = enquiry?.customerName || enquiry?.customerCompany || "Kunde";
    const recipientCompany = enquiry?.customerCompany || "";
    const refProject = mainProduct?.product?.productName || enquiry?.message?.slice(0, 60) || "—";

    const { mainRows, mainTotal, alternativeRows, alternativeTotal } = buildPriceTableRows(data);
    const mainDisplaySpecs = buildDisplaydetails(mainProduct?.product);
    const altDisplaySpecs = buildDisplaydetails(alternativeProduct?.product);

    // Header/footer are injected by Puppeteer on every page (see generateQuotationPDF)

    const rowToTr = (r) => `
      <tr class="${r.isSubItem ? "sub-row" : ""}">
        <td class="col-pos">${r.pos ?? ""}</td>
        <td class="col-product">${r.product}</td>
        <td class="col-num">${r.qty}</td>
        <td class="col-num">${r.unitPrice ? formatCurrency(r.unitPrice) : ""}</td>
        <td class="col-num">${formatCurrency(r.total)}</td>
      </tr>`;
    const mainTableBody =
        mainRows.map(rowToTr).join("") +
        (mainRows.length > 0
            ? `
      <tr class="total-row">
        <td colspan="4" class="col-product">Hauptangebot – Gesamtpreis netto</td>
        <td class="col-num">${formatCurrency(mainTotal)}</td>
      </tr>`
            : "");
    const altTableBody =
        alternativeRows.map(rowToTr).join("") +
        (alternativeRows.length > 0
            ? `
      <tr class="total-row">
        <td colspan="4" class="col-product">Alternativangebot – Gesamtpreis netto</td>
        <td class="col-num">${formatCurrency(alternativeTotal)}</td>
      </tr>`
            : "");
    const priceTableRowsHtml = mainTableBody + (altTableBody ? altTableBody : "");

    const mainDisplaySpecsHtml = mainDisplaySpecs
        .map((s) => `<div><strong>${s.label}:</strong> ${s.value}</div>`)
        .join("");
    const altDisplaySpecsHtml = altDisplaySpecs
        .map((s) => `<div><strong>${s.label}:</strong> ${s.value}</div>`)
        .join("");

    const featuresHtml = (features = []) =>
        features
            .map((f) => `<li>${escapeHtml(f)}</li>`)
            .join("");

    return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Angebot ${escapeHtml(quotation?.quotationNumber || "")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #000; line-height: 1.4; padding: 0 20px; }
    .cover-section { margin-bottom: 20px; }
    .cover-logo { font-size: 18pt; font-weight: bold; margin-bottom: 8px; }
    .sender-underline { border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 16px; }
    .two-col { display: flex; justify-content: space-between; margin-top: 20px; gap: 40px; }
    .col-left { flex: 1; }
    .col-right { text-align: right; flex: 1; }
    .toc-title { font-weight: bold; font-size: 12pt; color: #2563eb; margin-top: 30px; margin-bottom: 12px; }
    .toc-row { display: flex; align-items: baseline; margin-bottom: 6px; }
    .toc-text { flex-shrink: 0; }
    .toc-dots { flex: 1; border-bottom: 1px dotted #999; margin: 0 8px; min-width: 20px; }
    .toc-page { flex-shrink: 0; width: 24px; text-align: right; }
    .section-title { font-size: 14pt; font-weight: bold; margin-bottom: 12px; }
    .section-title-underline { border-bottom: 1px solid #000; margin-bottom: 12px; }
    .para { margin-bottom: 12px; }
    .italic { font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    thead { display: table-header-group; }
    tbody tr { page-break-inside: avoid; }
    th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #ccc; }
    th { font-weight: bold; border-bottom: 2px solid #000; }
    .col-pos { width: 5%; }
    .col-product { width: 45%; }
    .col-num { text-align: right; width: 14%; }
    .sub-row td { padding-left: 24px; }
    .total-row { border-top: 2px solid #000; font-weight: bold; page-break-inside: avoid; }
    .displaydetails { margin: 12px 0 0 12px; }
    .displaydetails > div { margin-bottom: 4px; }
    .displaydetails-title { font-weight: bold; text-decoration: underline; margin-bottom: 8px; }
    .section-konditionen { margin-top: 28px; }
    .section-positions { margin-top: 24px; }
    .section-optionen { margin-top: 24px; }
    ul { margin: 8px 0 8px 24px; }
    li { margin-bottom: 4px; }
    .block-title { font-weight: bold; margin: 16px 0 8px; }
    .download-link { margin-top: 8px; font-size: 9pt; }
  </style>
</head>
<body>
  <div class="content-flow">
  <!-- Cover + Section 1 -->
  <div class="cover-section">
      <div class="cover-logo">LOGO</div>
      <div class="sender-underline">${COMPANY.sender}</div>
    </div>
    <div class="two-col">
      <div class="col-left">
        <div>${escapeHtml(recipientName)}</div>
        ${recipientCompany ? `<div>${escapeHtml(recipientCompany)}</div>` : ""}
        <div>Deutschland</div>
      </div>
      <div class="col-right">
        <div>Ludwigshafen, ${quotationDate}</div>
        <div style="font-weight: bold; margin-top: 4px;">Angebot Nr. ${escapeHtml(quotation?.quotationNumber || "")} Rev.0</div>
        <div style="margin-top: 4px;">Referenz/ Project Name: ${escapeHtml(refProject)}</div>
        <div style="margin-top: 12px;">Unser Bearbeiter: Abahssain</div>
        <div>E-Mail: ${COMPANY.email}</div>
        <div>Tel: ${COMPANY.tel}</div>
      </div>
    </div>
    <div class="toc-title">Inhalt</div>
    <div class="toc-row"><span class="toc-text">1. Unser Angebot / our offer</span><span class="toc-dots"></span><span class="toc-page">1</span></div>
    <div class="toc-row"><span class="toc-text">2. Preisübersicht / Price overview</span><span class="toc-dots"></span><span class="toc-page">2</span></div>
    <div class="toc-row"><span class="toc-text">3. Konditionen / conditions</span><span class="toc-dots"></span><span class="toc-page">2</span></div>
    <div class="toc-row"><span class="toc-text">4. Positionsbeschreibungen / Position descriptions</span><span class="toc-dots"></span><span class="toc-page">3</span></div>
    <div class="toc-row"><span class="toc-text">5. Optionen / options</span><span class="toc-dots"></span><span class="toc-page">4</span></div>
    <hr style="margin-top: 24px;">
    <div class="section-title">1. Unser Angebot / our offer</div>
    <div class="para">Sehr geehrte Damen und Herrn,</div>
    <div class="para">nachfolgend finden Sie unser Budgetangebot.</div>
    <div class="para">Unser Ziel ist es, das optimale Produktpaket für die Anwendung zu bestimmen und Ihr geplantes Projekt bis zu einer erfolgreichen Installation zu begleiten. Es wurde auf Basis der, in der Ausschreibung „<span class="italic">${escapeHtml(projectName)}</span>" beschriebenen Anforderungen erstellt.</div>
    <div class="para">Sämtliche Komponenten entsprechen dem aktuellen Stand der Technik und sind konform mit den gültigen EU-Richtlinien zu EMV, Sicherheit und der RoHs Direktive.</div>
    <div class="para">Wir würden uns freuen, das Projekt mit Ihnen gemeinsam zu realisieren und sichern Ihnen unser vollstes Engagement zu</div>
    <div class="para" style="margin-top: 20px;">Mit freundlichen Grüßen</div>
    <div class="para">Dipl. Ing. M. Abahssain</div>

  <!-- Section 2: Preisübersicht (table can flow to next page) -->
  <div class="section-title section-title-underline" style="margin-top: 28px;">2. Preisübersicht / Price overview</div>
    ${mainProduct?.product ? `
    <div class="block-title">Hauptangebot</div>
    <div class="para">${escapeHtml(mainProduct.product.productName)} FlipChip COB Video Display</div>
    ${mainDisplaySpecs.length > 0 ? `
    <div class="displaydetails-title">Displaydetails:</div>
    <div class="displaydetails">${mainDisplaySpecsHtml}</div>
    ` : ""}
    ` : ""}
    ${alternativeProduct?.product ? `
    <div class="block-title" style="margin-top: 20px;">Alternativangebot</div>
    <div class="para">${escapeHtml(alternativeProduct.product.productName)} FlipChip COB Video Display</div>
    ${altDisplaySpecs.length > 0 ? `
    <div class="displaydetails-title">Displaydetails:</div>
    <div class="displaydetails">${altDisplaySpecsHtml}</div>
    ` : ""}
    ` : ""}
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
        ${priceTableRowsHtml}
      </tbody>
    </table>

  <!-- Section 3: Konditionen (always starts on next page) -->
  <div class="section-konditionen" style="page-break-before: always;">
    <div class="section-title section-title-underline">3. Konditionen / conditions</div>
    <div class="para"><strong><u>Gewährleistung:</u></strong> Die Gewährleistungszeit beträgt 2 Jahre, im Falle eines Wartungsvertrages mit jährlicher Wartung und Erweiterung des Ersatzteilpakets auf 5%, verlängert sich die Gewährleistungszeit auf 5 Jahre. Es gilt: deutsches Recht.</div>
    <div class="para"><strong><u>Garantierte Ersatzteilverfügbarkeit:</u></strong> 5 Jahre</div>
    <div class="para"><strong><u>Liefertermin:</u></strong> Lieferung, Inbetriebnahme und Abnahme bis spätestens 12 Wochen nach erfolgter Anzahlung</div>
    <div class="para"><strong><u>Zahlungsbedingungen:</u></strong> 50% bei der Auftragserteilung; 40% bei Lieferung; 10% nach Inbetriebnahme und Abnahme</div>
    <div class="para"><strong><u>Preisstellung:</u></strong> Alle Preise sind Netto-Preise exklusive der gesetzlichen MwSt.</div>
  </div>

  <!-- Section 4: Positionsbeschreibungen -->
  <div class="section-positions">
    <div class="section-title section-title-underline">4. Positionsbeschreibungen / Position descriptions</div>
    ${mainProduct?.product ? `
    <div class="block-title">Hauptangebot: ${escapeHtml(mainProduct.product.productName)}</div>
    ${(mainProduct.product.features || []).length > 0 ? `
    <div class="block-title">Features</div>
    <ul>${featuresHtml(mainProduct.product.features)}</ul>
    <div class="download-link">Download Link:</div>
    ` : ""}
    ` : ""}
    ${(mainProduct?.additionalItems || []).map((add) => `
    <div class="block-title">${escapeHtml(add.product?.productName || add.description || "")}</div>
    <div class="para">${escapeHtml(add.description || add.product?.productName || "")}</div>
    `).join("")}
    ${(mainProduct?.optionalItems || []).map((opt) => `
    <div class="block-title">${escapeHtml(opt.product?.productName || opt.description || "")}</div>
    <div class="para">${opt.product?.productName ? "aller relevanten Systemkomponenten (insbesondere LED-Module derselben Herstellungscharge = Farbtreue)" : escapeHtml(opt.description || "")}</div>
    ${(opt.product?.features || []).length > 0 ? `<ul>${featuresHtml(opt.product.features)}</ul>` : ""}
    <div class="download-link">Download Link:</div>
    `).join("")}
    ${alternativeProduct?.product ? `
    <div class="block-title" style="margin-top: 20px;">Alternativangebot: ${escapeHtml(alternativeProduct.product.productName)}</div>
    ${(alternativeProduct.product.features || []).length > 0 ? `
    <div class="block-title">Features</div>
    <ul>${featuresHtml(alternativeProduct.product.features)}</ul>
    <div class="download-link">Download Link:</div>
    ` : ""}
    ${(alternativeProduct?.additionalItems || []).map((add) => `
    <div class="block-title">${escapeHtml(add.product?.productName || add.description || "")}</div>
    <div class="para">${escapeHtml(add.description || add.product?.productName || "")}</div>
    `).join("")}
    ${(alternativeProduct?.optionalItems || []).map((opt) => `
    <div class="block-title">${escapeHtml(opt.product?.productName || opt.description || "")}</div>
    <div class="para">${opt.product?.productName ? "aller relevanten Systemkomponenten (insbesondere LED-Module derselben Herstellungscharge = Farbtreue)" : escapeHtml(opt.description || "")}</div>
    ${(opt.product?.features || []).length > 0 ? `<ul>${featuresHtml(opt.product.features)}</ul>` : ""}
    <div class="download-link">Download Link:</div>
    `).join("")}
    ` : ""}
    <div class="block-title">Projekt Management, Erarbeitung der Werkpläne (Unterkonstruktion), Konfiguration, Inbetriebnahme u. Einweisung.</div>
    <ul>
      <li>Planung und Koordination des Gesamtprojekts einschließlich der beteiligten Teilgewerke (inkl. CAD-Simulation und erforderlicher mechanischer Planunterlagen)</li>
    </ul>
    <div style="page-break-before: always;"></div>
    <ul>
      <li>Montage der Halterung für das LED-Display</li>
      <li>Montage des LED-Displays an der vorhandenen bzw. Unterkonstruktion</li>
      <li>Ausrichtung, Verkabelung, Inbetriebnahme, Einrichtung sowie Kalibrierung und Funktionsprüfung der LED-Wand inklusive Messung aller relevanten Systemparameter und Systemeinstellungen</li>
      <li>Montage und Verkabelung der Medientechnik-Steuerung an der Medienwand sowie im Technikraum</li>
      <li>Aufbau und Verkabelung des Touch-Bedienpanels am Leitstellentisch</li>
      <li>Installation und Konfiguration der benötigten (virtuellen) Server</li>
    </ul>
    <ul>
      <li>Einrichtung der Medientechnik-Steuerung gemäß Kundenvorgaben (Szenarien, Standards, Quellen)</li>
      <li>Test, Abnahme und vollständige Dokumentation</li>
      <li>Einweisung bzw. Kurzschulung für Administratoren sowie Einführung in Software- und Displaybedienung</li>
    </ul>
  </div>

  <!-- Section 5: Optionen (no Heading 6) -->
  <div class="section-optionen">
    <div class="section-title section-title-underline">5. Optionen / options</div>
    <div class="para"><strong>Optional :</strong> Wartung u. Servicevertrag (jährlich)</div>
    <div class="para">im Falle eines Wartungsvertrages mit jährlicher Wartung und Erweiterung des Ersatzteilpakets auf 5%, verlängert sich die Gewährleistungszeit auf 5 Jahre</div>
  </div>
  </div>
</body>
</html>`;
}

const PDF_HEADER_TEMPLATE = `
  <div style="width: 100%; font-size: 12pt; font-weight: bold; text-align: right; padding-right: 15mm;">
    LOGO
  </div>`;

function getPdfFooterTemplate() {
    return `
  <div style="width: 100%; font-size: 7pt; color: #333; padding-left: 20mm; padding-right: 20mm; box-sizing: border-box;">
    <table style="width: 100%; border: none;"><tr>
      <td style="width: 25%; vertical-align: top;"><strong>${COMPANY.name}</strong><br>${COMPANY.address}<br>${COMPANY.city}<br>${COMPANY.country}</td>
      <td style="width: 25%; vertical-align: top;">Tel: ${COMPANY.tel}<br>Fax: ${COMPANY.fax}<br>Email: ${COMPANY.email}<br>Web: ${COMPANY.web}</td>
      <td style="width: 25%; vertical-align: top;">${COMPANY.bank}<br>IBAN: ${COMPANY.iban}<br>BIC/SWIFT: ${COMPANY.bic}</td>
      <td style="width: 25%; vertical-align: top;">HR-Nr. ${COMPANY.hrNr}<br>USt-ID: ${COMPANY.ustId}<br>Steuer-Nr.: ${COMPANY.steuerNr}<br>Geschäftsführung: ${COMPANY.geschaeftsfuehrung}</td>
    </tr></table>
    <div style="text-align: right; font-size: 9pt; color: #666; margin-top: 4px;">Seite <span class="pageNumber"></span></div>
  </div>`;
}

/**
 * @param {object} data - From getQuotationDataForPDF
 * @returns {Promise<Buffer>}
 */
export async function generateQuotationPDF(data) {
    const html = buildHtml(data);
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
        await page.setContent(html, {
            waitUntil: "domcontentloaded",
        });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: PDF_HEADER_TEMPLATE,
            footerTemplate: getPdfFooterTemplate(),
            margin: {
                top: "70px",
                bottom: "95px",
                left: "20mm",
                right: "20mm",
            },
        });
        return Buffer.from(pdfBuffer);
    } finally {
        await page.close();
    }
}

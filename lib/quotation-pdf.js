/**
 * Generates quotation PDF using Puppeteer and HTML template.
 * Document is in German, 4 pages, 5 TOC headings (Heading 6 removed).
 */
import { getBrowser } from "@/lib/puppeteer-browser";
import {
  DEFAULT_OFFER_HTML,
  DEFAULT_CONDITIONS_HTML,
  DEFAULT_OPTIONS_HTML,
} from "@/lib/quotation-section-defaults";
import fs from "fs";
import path from "path";

const logoPath = path.join(process.cwd(), "public/logo-name.png");
const logoBase64 = fs.readFileSync(logoPath, "base64");
const logoSrc = `data:image/png;base64,${logoBase64}`;

// const logoWithNamePath = path.join(process.cwd(), "public/logo-name.png");
// const logoWithNameBase64 = fs.readFileSync(logoWithNamePath, "base64");
// const logoWithNameSrc = `data:image/png;base64,${logoWithNameBase64}`;
// Static company info (German)
const COMPANY = {
  sender: "ProLEDALL | Krügerstrasse 3 67065 Ludwigshafen an Rhein",
  name: "ProLEDALL",
  inhaber: "Dipl. Ing. M. Abahssain",
  /** Single-line street, PLZ, city, country for PDF footer */
  addressLine: "Krügerstrasse 3 67065 Ludwigshafen an Rhein Deutschland",
  address: "Krügerstrasse 3",
  city: "67065 Ludwigshafen an Rhein",
  country: "Deutschland",
  tel: "+4962154560605",
  fax: "+4962195341212",
  email: "info@proledall.eu",
  web: "www.proledall.eu",
  bank: "Commerzbank",
  iban: "DE14 5454 0033 0831 0617 00",
  bic: "COBADEFFXXX",
  ustId: "DE298 057 613",
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

function lineTotal(unitPrice, qty, taxPct, discountPct) {
  const base = parseFloat(unitPrice || 0) * parseInt(qty || 1);
  const discount = base * (parseFloat(discountPct || 0) / 100);
  const netAfterDiscount = base - discount;
  const tax = netAfterDiscount * (parseFloat(taxPct || 0) / 100);
  return { base, tax, discount, total: netAfterDiscount + tax };
}

/**
 * Builds price table rows and economics for one item (main or alternative).
 * Returns { rows, subtotal, discountTotal, taxTotal, grandTotal }.
 * Optional items are shown in the table but excluded from the totals.
 */
function buildItemRows(item, posRef, labelPrefix = "") {
  const rows = [];
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;
  let grandTotal = 0;
  if (!item) return { rows, subtotal, discountTotal, taxTotal, grandTotal };
  const prefix = labelPrefix ? `${escapeHtml(labelPrefix)}: ` : "";

  const qty = parseInt(item.quantity || 1);
  const unit = parseFloat(item.unitPrice || 0);
  const taxPct = parseFloat(item.taxPercentage || 0);
  const discPct = parseFloat(item.discountPercentage || 0);
  const lt = lineTotal(unit, qty, taxPct, discPct);
  subtotal += lt.base;
  discountTotal += lt.discount;
  taxTotal += lt.tax;
  grandTotal += lt.total;

  const isCustomProduct = !!item.product?.isCustom;
  let productLabel = item.product
    ? prefix + `${escapeHtml(item.product.productName)} (Artikel: ${escapeHtml(item.product.productNumber || "")})`
    : "";
  if (isCustomProduct) productLabel += " – Preis pro Kabinett";

  rows.push({
    pos: posRef.value++,
    product: productLabel,
    qty,
    unitPrice: unit,
    taxPct,
    discPct,
    total: lt.total,
    isSubItem: false,
  });

  for (const add of item.additionalItems || []) {
    const aQty = parseInt(add.quantity || 1);
    const aUnit = parseFloat(add.unitPrice || 0);
    const aTaxPct = parseFloat(add.taxPercentage || 0);
    const aDiscPct = parseFloat(add.discountPercentage || 0);
    const aLt = lineTotal(aUnit, aQty, aTaxPct, aDiscPct);
    subtotal += aLt.base;
    discountTotal += aLt.discount;
    taxTotal += aLt.tax;
    grandTotal += aLt.total;
    rows.push({
      pos: posRef.value++,
      product: add.product
        ? `${escapeHtml(add.product.productName)} (Artikel: ${escapeHtml(add.product.productNumber || "")})`
        : escapeHtml(add.description || ""),
      qty: aQty,
      unitPrice: aUnit,
      taxPct: aTaxPct,
      discPct: aDiscPct,
      total: aLt.total,
      isSubItem: false,
    });
  }

  for (const opt of item.optionalItems || []) {
    const oQty = parseInt(opt.quantity || 1);
    const oUnit = parseFloat(opt.unitPrice || 0);
    const oTaxPct = parseFloat(opt.taxPercentage || 0);
    const oDiscPct = parseFloat(opt.discountPercentage || 0);
    const oLt = lineTotal(oUnit, oQty, oTaxPct, oDiscPct);
    rows.push({
      pos: opt.description?.toLowerCase().includes("ersatzteil") ? null : posRef.value++,
      product: opt.product
        ? `${escapeHtml(opt.product.productName)} (Artikel: ${escapeHtml(opt.product.productNumber || "")})`
        : escapeHtml(opt.description || ""),
      qty: oQty,
      unitPrice: oUnit,
      taxPct: oTaxPct,
      discPct: oDiscPct,
      total: oLt.total,
      isSubItem: opt.description?.toLowerCase().includes("ersatzteil"),
    });
  }
  return { rows, subtotal, discountTotal, taxTotal, grandTotal };
}

/**
 * Builds the full price table: main rows + summary, then alternative rows + summary.
 */
function buildPriceTableRows(data) {
  const posRef = { value: 1 };
  const main = data.mainProduct
    ? buildItemRows(data.mainProduct, posRef, "Hauptangebot")
    : { rows: [], subtotal: 0, discountTotal: 0, taxTotal: 0, grandTotal: 0 };
  const alt = data.alternativeProduct
    ? buildItemRows(data.alternativeProduct, posRef, "Alternativangebot")
    : { rows: [], subtotal: 0, discountTotal: 0, taxTotal: 0, grandTotal: 0 };
  return { main, alt };
}

const toNumberOrNull = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

/** Ordered list of display-detail definitions: label + getValue(product).
 *  When `p.isCustom` is true (Leditor custom solution), custom fields override
 *  the single-product details for size, resolution, area, power and weight.
 */
const DISPLAY_DETAIL_SPECS = [
  {
    label: "Pixelabstand",
    getValue: (p) => (p?.pixelPitch ? `${p.pixelPitch} mm` : null),
  },
  {
    label: "Kabinett Abmaße BxH",
    getValue: (p) => {
      if (p?.isCustom) {
        const wM = toNumberOrNull(p.customScreenWidth);
        const hM = toNumberOrNull(p.customScreenHeight);
        if (wM == null || hM == null) return null;
        const wMm = wM * 1000;
        const hMm = hM * 1000;
        return `${wMm}mmx${hMm}mm`;
      }
      return p?.cabinetWidth && p?.cabinetHeight
        ? `${p.cabinetWidth}mmx${p.cabinetHeight}mm`
        : null;
    },
  },
  {
    label: "Auflösung",
    getValue: (p) => {
      if (p?.isCustom) {
        const h = toNumberOrNull(p.customTotalResolutionH);
        const v = toNumberOrNull(p.customTotalResolutionV);
        if (h == null || v == null) return null;
        return `${h}x${v} Pixel`;
      }
      return p?.cabinetResolutionHorizontal && p?.cabinetResolutionVertical
        ? `${p.cabinetResolutionHorizontal}x${p.cabinetResolutionVertical} Pixel`
        : null;
    },
  },
  {
    label: "Gesamt Fläche",
    getValue: (p) => {
      if (p?.isCustom) {
        const wM = toNumberOrNull(p.customScreenWidth);
        const hM = toNumberOrNull(p.customScreenHeight);
        if (wM == null || hM == null) return null;
        return `${(wM * hM).toFixed(2)} m²`;
      }
      if (!p?.cabinetWidth || !p?.cabinetHeight) return null;
      const w = parseFloat(p.cabinetWidth) / 1000 || 0;
      const h = parseFloat(p.cabinetHeight) / 1000 || 0;
      return `${(w * h).toFixed(2)} m²`;
    },
  },
  {
    label: "Max. Helligkeit",
    getValue: (p) => (p?.brightnessValue ? `${p.brightnessValue} cd/m²` : null),
  },
  {
    label: "Kontrast",
    getValue: (p) =>
      p?.contrastRatioNumerator && p?.contrastRatioDenominator
        ? `${p.contrastRatioNumerator}:${p.contrastRatioDenominator}`
        : null,
  },
  {
    label: "Bildwiederholfrequenz, programmierbar",
    getValue: (p) => (p?.refreshRate ? `${p.refreshRate} Hz` : null),
  },
  {
    label: "Typ. Leistungsaufnahme",
    getValue: (p) => {
      if (p?.isCustom) {
        const typ = toNumberOrNull(p.customPowerConsumptionTyp);
        return typ != null ? `${typ} kW` : null;
      }
      return p?.powerConsumptionTypical
        ? `${p.powerConsumptionTypical} kW`
        : null;
    },
  },
  {
    label: "Max. Leistungsaufnahme",
    getValue: (p) => {
      if (p?.isCustom) {
        const max = toNumberOrNull(p.customPowerConsumptionMax);
        return max != null ? `${max} kW` : null;
      }
      return p?.powerConsumptionMax ? `${p.powerConsumptionMax} kW` : null;
    },
  },
  {
    label: "Gesamt Gewicht",
    getValue: (p) => {
      if (p?.isCustom) {
        const w = toNumberOrNull(p.customWeight);
        return w != null ? `${w} Kg` : null;
      }
      return p?.weightWithoutPackaging
        ? `${p.weightWithoutPackaging} Kg`
        : null;
    },
  },
];

/**
 * Builds Displaydetails spec list from product (for backward compatibility if needed).
 */
// function buildDisplaydetails(product) {
//   if (!product) return [];
//   return DISPLAY_DETAIL_SPECS.map(({ label, getValue }) => ({
//     label,
//     value: getValue(product),
//   })).filter((s) => s.value != null);
// }

/**
 * Builds rows for the 3-column Displaydetails table: attribute name | main value | alternative value.
 * First row: empty | Hauptangebot | Alternativangebot. Then one row per attribute that exists in either product.
 */
function buildDisplaydetailsTableRows(mainProduct, alternativeProduct) {
  const mainProductData = mainProduct?.product ?? null;
  const altProductData = alternativeProduct?.product ?? null;
  const hasMain = !!mainProductData;
  const hasAlt = !!altProductData;
  if (!hasMain && !hasAlt) return { rows: [], hasMain: false, hasAlt: false };

  const rows = [];
  // Header row: first cell empty, second = Hauptangebot, third = Alternativangebot
  rows.push({
    label: "",
    mainValue: "Hauptangebot",
    altValue: "Alternativangebot",
  });
  for (const { label, getValue } of DISPLAY_DETAIL_SPECS) {
    const mainVal = getValue(mainProductData);
    const altVal = getValue(altProductData);
    if (mainVal != null || altVal != null) {
      rows.push({
        label,
        mainValue: mainVal ?? "—",
        altValue: altVal ?? "—",
      });
    }
  }
  return { rows, hasMain, hasAlt };
}

function buildHtml(data) {
  const { quotation, enquiry, mainProduct, alternativeProduct } = data;
  const quotationDate = formatDate(quotation?.createdAt);

  const offerHtml = quotation?.sectionOfferHtml || DEFAULT_OFFER_HTML;
  const conditionsHtml = quotation?.sectionConditionsHtml || DEFAULT_CONDITIONS_HTML;
  const optionsHtml = quotation?.sectionOptionsHtml || DEFAULT_OPTIONS_HTML;
  const recipientName = enquiry?.customerName || "Kunde";
  const recipientCompany = enquiry?.customerCompany || "";
  const recipientAddress = enquiry?.customerAddress || "";
  const recipientCommercialRegisterNumber = enquiry?.customerCommercialRegisterNumber || "";
  const recipientEmail = enquiry?.customerEmail || "";
  const recipientPhone = enquiry?.customerPhone || "";
  const refProject = mainProduct?.product?.productName || enquiry?.message?.slice(0, 60) || "—";

  const { main, alt } = buildPriceTableRows(data);
  const displayDetailsTable = buildDisplaydetailsTableRows(mainProduct, alternativeProduct);

  const formatPct = (v) => {
    const n = parseFloat(v || 0);
    return n ? `${n}%` : "–";
  };

  const rowToTr = (r) => `
      <tr class="${r.isSubItem ? "sub-row" : ""}">
        <td class="col-pos">${r.pos ?? ""}</td>
        <td class="col-product">${r.product}</td>
        <td class="col-num">${r.qty}</td>
        <td class="col-num">${r.unitPrice ? formatCurrency(r.unitPrice) : ""}</td>
        <td class="col-num-sm">${formatPct(r.discPct)}</td>
        <td class="col-num-sm">${formatPct(r.taxPct)}</td>
        <td class="col-num">${formatCurrency(r.total)}</td>
      </tr>`;

  function buildOfferSummaryRows(label, offerData) {
    if (offerData.rows.length === 0) return "";
    const hasDiscount = offerData.discountTotal > 0;
    const hasTax = offerData.taxTotal > 0;
    let html = offerData.rows.map(rowToTr).join("");
    // html += `
    //   <tr class="total-row">
    //     <td colspan="4" class="col-product">${escapeHtml(label)} – Zwischensumme (Netto)</td>
    //     <td class="col-num-sm"></td><td class="col-num-sm"></td>
    //     <td class="col-num">${formatCurrency(offerData.subtotal)}</td>
    //   </tr>`;
    // if (hasDiscount) {
    //   html += `
    //   <tr class="summary-row">
    //     <td colspan="4" class="col-product">Rabatt</td>
    //     <td class="col-num-sm"></td><td class="col-num-sm"></td>
    //     <td class="col-num">- ${formatCurrency(offerData.discountTotal)}</td>
    //   </tr>`;
    // }
    // if (hasTax) {
    //   html += `
    //   <tr class="summary-row">
    //     <td colspan="4" class="col-product">MwSt</td>
    //     <td class="col-num-sm"></td><td class="col-num-sm"></td>
    //     <td class="col-num">+ ${formatCurrency(offerData.taxTotal)}</td>
    //   </tr>`;
    // }
    html += `
      <tr class="total-row" style="font-weight:bold;">
        <td colspan="4" class="col-product">${escapeHtml(label)} – Gesamtpreis (Brutto)</td>
        <td class="col-num-sm"></td><td class="col-num-sm"></td>
        <td class="col-num">${formatCurrency(offerData.grandTotal)}</td>
      </tr>`;
    return html;
  }

  const priceTableRowsHtml =
    buildOfferSummaryRows("Hauptangebot", main) +
    buildOfferSummaryRows("Alternativangebot", alt);

  const displayDetailsTableHtml =
    displayDetailsTable.rows.length > 1
      ? `
    <div class="displaydetails-title">Displaydetails:</div>
    <table class="displaydetails-table">
      <tbody>
        ${displayDetailsTable.rows
        .map(
          (row) => `
        <tr>
          <td class="displaydetails-col-label">${escapeHtml(row.label)}</td>
          <td class="displaydetails-col-value">${escapeHtml(row.mainValue)}</td>
          <td class="displaydetails-col-value">${escapeHtml(row.altValue)}</td>
        </tr>`
        )
        .join("")}
      </tbody>
    </table>`
      : "";

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
  const datasheetUrl = (productId) => productId && baseUrl ? `${baseUrl}/api/products/${productId}/datasheet` : null;
  const datasheetLink = (productId) => {
    const url = datasheetUrl(productId);
    if (!url) return "";
    return `<a href="${url}" style="color:#2563eb;">Download Link</a>`;
  };

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
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@200;400;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Roboto', sans-serif; font-weight: 200; font-size: 10pt; color: #000; line-height: 1.4; padding: 0 20px; padding-bottom: 20px; }
    .content-flow { min-height: 0; }
    .cover-section { margin-bottom: 20px; }
    .cover-logo { font-size: 18pt; margin-bottom: 8px; }
    .sender-underline { font-size: 8px; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 16px; }
    .two-col { display: flex; justify-content: space-between; margin-top: 20px; gap: 40px; }
    .col-left { flex: 1; }
    .col-right { text-align: right; flex: 1; }
    .toc-title { font-size: 12pt; color: #2563eb; margin-top: 30px; margin-bottom: 12px; }
    .toc-row { display: flex; align-items: baseline; margin-bottom: 6px; }
    .toc-text { flex-shrink: 0; }
    .toc-dots { flex: 1; border-bottom: 1px dotted #999; margin: 0 8px; min-width: 20px; }
    .toc-page { flex-shrink: 0; width: 24px; text-align: right; font-weight: 200; }
    .section-title { font-size: 14pt; margin-bottom: 12px; page-break-after: avoid; }
    .section-title-underline { border-bottom: 1px solid #000; margin-bottom: 12px; }
    .para { margin-bottom: 12px; }
    .italic { font-style: italic; }
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
    u { text-decoration: underline; }
    p { margin-bottom: 0; min-height: 1em; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    thead { display: table-header-group; }
    tbody tr { page-break-inside: avoid; }
    th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #ccc; }
    th { border-bottom: 2px solid #000; }
    .col-pos { width: 5%; }
    .col-product { width: 35%; }
    .col-num { text-align: right; width: 14%; }
    .col-num-sm { text-align: right; width: 8%; font-size: 9pt; }
    .sub-row td { padding-left: 24px; }
    .total-row { border-top: 2px solid #000; page-break-inside: avoid; }
    .summary-row td { border-bottom: none; }
    .displaydetails-title { text-decoration: underline; margin-bottom: 4px; margin-top: 12px; }
    .displaydetails-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; line-height: 1.2; }
    .displaydetails-table td { padding: 1px 8px 2px; border-bottom: none; vertical-align: top; }
    .displaydetails-col-label { width: 38%; text-align: left; }
    .displaydetails-col-value { width: 31%; text-align: left; }
    .displaydetails-table tbody tr:first-child td { padding: 3px 8px 5px; border-bottom: 2px solid #000; }
    .section-new-page { page-break-before: always; }
    .section-konditionen { margin-top: 12px; page-break-before: always; }
    .section-positions { margin-top: 12px; page-break-before: always; }
    .section-optionen { margin-top: 12px; page-break-before: always; }
    ul { margin: 8px 0 8px 24px; }
    li { margin-bottom: 4px; }
    .block-title { margin: 16px 0 8px; page-break-after: avoid; }
  </style>
</head>
<body>
  <div class="content-flow">
  <!-- Cover + Section 1 -->
  <div class="cover-section">
      <div class="sender-underline">${COMPANY.sender}</div>
    </div>
    <div class="two-col">
      <div class="col-left">
        ${recipientCompany ? `<div>${escapeHtml(recipientCompany)}</div>` : ""}
        <div>${escapeHtml(recipientName)}</div>
        <div>${escapeHtml(recipientAddress)}</div>
        <div>${escapeHtml(recipientCommercialRegisterNumber)}</div>
        <div style="margin-top: 10px;">${escapeHtml(recipientEmail)}</div>
        <div>${escapeHtml(recipientPhone)}</div>
      </div>
      <div class="col-right">
        <div>Ludwigshafen, ${quotationDate}</div>
        <div style="margin-top: 4px;">Angebot Nr. ${escapeHtml(quotation?.quotationNumber || "")} Rev.0</div>
        <div style="margin-top: 4px;">Referenz/ Project Name: ${escapeHtml(refProject)}</div>
        <div style="margin-top: 12px;">Unser Bearbeiter: Abahssain</div>
        <div>E-Mail: ${COMPANY.email}</div>
        <div>Tel: ${COMPANY.tel}</div>
      </div>
    </div>
    <div class="toc-title">Inhalt</div>
    <div class="toc-row"><span class="toc-text">1. Unser Angebot / our offer</span><span class="toc-dots"></span><span class="toc-page">1</span></div>
    <div class="toc-row"><span class="toc-text">2. Preisübersicht / Price overview</span><span class="toc-dots"></span><span class="toc-page">2</span></div>
    <div class="toc-row"><span class="toc-text">3. Konditionen / conditions</span><span class="toc-dots"></span><span class="toc-page">3</span></div>
    <div class="toc-row"><span class="toc-text">4. Positionsbeschreibungen / Position descriptions</span><span class="toc-dots"></span><span class="toc-page">4</span></div>
    <div class="toc-row"><span class="toc-text">5. Optionen / options</span><span class="toc-dots"></span><span class="toc-page">5</span></div>
    <div style="margin-top: 24px;"></div>
    <div class="section-title">1. Unser Angebot / our offer</div>
    ${offerHtml}

  <!-- Section 2: Preisübersicht (starts on new page, table can flow to next page) -->
  <div class="section-new-page">
  <div class="section-title section-title-underline">2. Preisübersicht / Price overview</div>
    ${displayDetailsTableHtml}
    <table>
      <thead>
        <tr>
          <th class="col-pos">Pos.</th>
          <th class="col-product">Produkt</th>
          <th class="col-num">Menge</th>
          <th class="col-num">Einzelpreis</th>
          <th class="col-num-sm">Rabatt</th>
          <th class="col-num-sm">MwSt</th>
          <th class="col-num">Gesamtpreis</th>
        </tr>
      </thead>
      <tbody>
        ${priceTableRowsHtml}
      </tbody>
    </table>
  </div>

  <!-- Section 3: Konditionen (always starts on next page) -->
  <div class="section-konditionen">
    <div class="section-title section-title-underline">3. Konditionen / conditions</div>
    ${conditionsHtml}
  </div>

  <!-- Section 4: Positionsbeschreibungen -->
  <div class="section-positions">
    <div class="section-title section-title-underline">4. Positionsbeschreibungen / Position descriptions</div>
    ${mainProduct?.product ? `
    <div class="block-title">Hauptangebot: ${escapeHtml(mainProduct.product.productName)}</div>
    ${mainProduct.description ? `<div class="para">${escapeHtml(mainProduct.description)}</div>` : ""}
    ${(mainProduct.product.features || []).length > 0 ? `
    <div class="block-title">Features</div>
    <ul>${featuresHtml(mainProduct.product.features)}</ul>
    ` : ""}
    ${datasheetLink(mainProduct.product.id)}
    ` : ""}
    ${(mainProduct?.additionalItems || []).map((add) => `
    <div class="block-title">${escapeHtml(add.product?.productName || add.description || "")}</div>
    <div class="para">${escapeHtml(add.description || add.product?.productName || "")}</div>
    `).join("")}
    ${(mainProduct?.optionalItems || []).map((opt) => `
    <div class="block-title">${escapeHtml(opt.product?.productName || opt.description || "")}</div>
    <div class="para">${opt.product?.productName ? "aller relevanten Systemkomponenten (insbesondere LED-Module derselben Herstellungscharge = Farbtreue)" : escapeHtml(opt.description || "")}</div>
    ${(opt.product?.features || []).length > 0 ? `<ul>${featuresHtml(opt.product.features)}</ul>` : ""}
    ${opt.product?.sourceType === "product" || (!opt.product?.sourceType && opt.product?.id) ? datasheetLink(opt.product.id) : ""}
    `).join("")}
    ${alternativeProduct?.product ? `
    <div class="block-title" style="margin-top: 20px;">Alternativangebot: ${escapeHtml(alternativeProduct.product.productName)}</div>
    ${alternativeProduct.description ? `<div class="para">${escapeHtml(alternativeProduct.description)}</div>` : ""}
    ${(alternativeProduct.product.features || []).length > 0 ? `
    <div class="block-title">Features</div>
    <ul>${featuresHtml(alternativeProduct.product.features)}</ul>
    ` : ""}
    ${datasheetLink(alternativeProduct.product.id)}
    ${(alternativeProduct?.additionalItems || []).map((add) => `
    <div class="block-title">${escapeHtml(add.product?.productName || add.description || "")}</div>
    <div class="para">${escapeHtml(add.description || add.product?.productName || "")}</div>
    `).join("")}
    ${(alternativeProduct?.optionalItems || []).map((opt) => `
    <div class="block-title">${escapeHtml(opt.product?.productName || opt.description || "")}</div>
    <div class="para">${opt.product?.productName ? "aller relevanten Systemkomponenten (insbesondere LED-Module derselben Herstellungscharge = Farbtreue)" : escapeHtml(opt.description || "")}</div>
    ${(opt.product?.features || []).length > 0 ? `<ul>${featuresHtml(opt.product.features)}</ul>` : ""}
    ${opt.product?.sourceType === "product" || (!opt.product?.sourceType && opt.product?.id) ? datasheetLink(opt.product.id) : ""}
    `).join("")}
    ` : ""}
  </div>

  <!-- Section 5: Optionen (no Heading 6) -->
  <div class="section-optionen">
    <div class="section-title section-title-underline">5. Optionen / options</div>
    ${optionsHtml}
  </div>
  </div>
</body>
</html>`;
}

const PDF_HEADER_TEMPLATE = `
  <div style="width: 100%; text-align: right; padding-right: 24mm;">
    <img src="${logoSrc}" style="height:50px;" />
  </div>`;

function getPdfFooterTemplate() {
  return `
  <div style="width: 100%; font-size: 7pt; color: #000; padding-left: 20mm; padding-right: 20mm; box-sizing: border-box;">
    <div style="text-align: center; line-height: 1.35;">
      <div>${COMPANY.name} Inhaber: ${COMPANY.inhaber} | ${COMPANY.addressLine} | USt-ID: ${COMPANY.ustId} |</div>
      <div>Tel: ${COMPANY.tel} Fax: ${COMPANY.fax} Email: ${COMPANY.email} Web:${COMPANY.web} |</div>
      <div>${COMPANY.bank} IBAN: ${COMPANY.iban} BIC/SWIFT: ${COMPANY.bic}</div>
    </div>
    <div style="text-align: right; font-size: 9pt; color: #000; margin-top: 4px;">Seite <span class="pageNumber"></span></div>
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
      waitUntil: "networkidle0",
    });
    await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: PDF_HEADER_TEMPLATE,
      footerTemplate: getPdfFooterTemplate(),
      margin: {
        top: "80px",
        bottom: "100px",
        left: "20mm",
        right: "20mm",
      },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

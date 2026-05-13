/**
 * Product datasheet PDF. Matches detail page: one row per field (label | value | unit),
 * same section headings and styling. Logo top-left, footer with proledall disclaimer.
 * Only displays the specified fields. Certificate images shown.
 */
import { getBrowser } from "@/lib/puppeteer-browser";

function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatEnum(value) {
    if (!value) return "N/A";
    return value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function toAbsoluteUrl(url, baseUrl) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = (baseUrl || "").replace(/\/$/, "");
    return base ? `${base}${url.startsWith("/") ? url : `/${url}`}` : url;
}

/** One row: label (left), value (right), unit (right, separate column) - like detail page SpecRow */
function specRow(label, value, unit = "") {
    const displayValue = value != null && value !== "" ? String(value) : "N/A";
    return `
    <div class="spec-row">
      <span class="spec-label">${escapeHtml(label)}</span>
      <div class="spec-value-wrap">
        <span class="spec-value">${escapeHtml(displayValue)}</span>
        <span class="spec-unit">${unit ? escapeHtml(unit) : ""}</span>
      </div>
    </div>`;
}

/** Section with heading (no dropdown icon) and content - same look as detail page */
function section(title, contentHtml) {
    return `
  <div class="accordion-section">
    <div class="accordion-header">
      <span class="accordion-title">${escapeHtml(title)}</span>
    </div>
    <div class="accordion-content">
      <div class="spec-rows">${contentHtml}</div>
    </div>
  </div>`;
}

function buildHtml(product, { baseUrl = "" } = {}) {
    const p = product || {};
    const mainImageSrc = p.mainImageDataUrl || ((p.images && p.images[0]) ? toAbsoluteUrl(p.images[0], baseUrl) : "");
    const areaOfUse = p.categoryName || p.areaOfUse || "";
    const descriptionText = p.productDescription || "";
    const descriptionHtml = descriptionText
        ? `<p class="product-description">${escapeHtml(descriptionText)}</p>`
        : "";
    const featuresHtml = (p.features && p.features.length)
        ? `<ul class="features-list">${p.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>`
        : "";
    const productIcons = p.productIcons || [];
    const iconsHtml = productIcons.length
        ? `<div class="product-icons-section">
      <div class="product-icons-grid">
        ${productIcons
            .map((icon) => {
                const rawSrc = icon.imageDataUrl || (icon.imageUrl ? toAbsoluteUrl(icon.imageUrl, baseUrl) : "");
                const imgSrc = rawSrc.startsWith("data:") ? rawSrc : escapeHtml(rawSrc);
                const inner = rawSrc
                    ? `<img src="${imgSrc}" alt="${escapeHtml(icon.name || "")}" class="product-icon-img" />`
                    : `<span class="product-icon-fallback">${escapeHtml(icon.name || "—")}</span>`;
                return `
        <div class="product-icon-card">
          <div class="product-icon-frame">${inner}</div>
          <div class="product-icon-divider" aria-hidden="true"></div>
          <p class="product-icon-label">${escapeHtml(icon.name || "")}</p>
        </div>`;
            })
            .join("")}
      </div>
    </div>`
        : "";
    const monitoringFunction = p.monitoringFunctionEn || p.monitoringFunctionDe || "";
    const supportDuringWarranty = p.supportDuringWarrantyEn || p.supportDuringWarrantyDe || "";
    const supportAfterWarranty = p.supportAfterWarrantyEn || p.supportAfterWarrantyDe || "";

    const scanRateStr = p.scanRateDenominator
        ? `1/${p.scanRateDenominator}${p.scanRateNumerator && p.scanRateNumerator !== 1 ? ` (${p.scanRateNumerator}/${p.scanRateDenominator})` : ""}`
        : "";

    // Only the listed fields, grouped like detail page. One row per field: label | value | unit.
    const basicInfo = [
        specRow("Product Name", p.productName),
        specRow("Product Number", p.productNumber),
        specRow("Area of use", areaOfUse),
        specRow("Application", Array.isArray(p.application) ? p.application.join(", ") : p.application),
    ].join("");

    const physicalSpecs = [
        specRow("Pixel Pitch", p.pixelPitch, "mm"),
        specRow("Cabinet Width", p.cabinetWidth, "mm"),
        specRow("Cabinet Height", p.cabinetHeight, "mm"),
        specRow("Cabinet Resolution (Horizontal)", p.cabinetResolutionHorizontal, "px"),
        specRow("Cabinet Resolution (Vertical)", p.cabinetResolutionVertical, "px"),
        specRow("Pixel Density", p.pixelDensity != null ? p.pixelDensity.toLocaleString() : null, "px/m²"),
    ].join("");

    const ledSpecs = [
        specRow("LED Technology", formatEnum(p.ledTechnology)),
        specRow("Chip Bonding", formatEnum(p.chipBonding)),
        specRow("LED Lifespan", p.ledLifespan != null ? p.ledLifespan.toLocaleString() : null, "hours"),
    ].join("");

    const displayPerf = [
        specRow("Brightness Value", p.brightnessValue),
        specRow("Contrast Ratio", (p.contrastRatioNumerator != null && p.contrastRatioDenominator != null) ? `${p.contrastRatioNumerator}:${p.contrastRatioDenominator}` : null),
        specRow("View Angle (Horizontal)", p.viewingAngleHorizontal),
        specRow("View Angle (Vertical)", p.viewingAngleVertical),
        specRow("Number of Colors", p.numberOfColours != null ? p.numberOfColours.toLocaleString() : null),
        specRow("Brightness Value", p.brightnessValue),
    ].join("");

    const electricalSpecs = [
        specRow("Input Voltage Range", p.inputVoltage),
        specRow("Power Consumption (Max)", p.powerConsumptionMax, "W"),
        specRow("Power Consumption (Typical)", p.powerConsumptionTypical, "W"),
        specRow("Refresh Rate", p.refreshRate, "Hz"),
        specRow("Scan Rate", scanRateStr),
        specRow("Power Redundancy", formatEnum(p.powerRedundancy)),
        specRow("Memory on Module", formatEnum(p.memoryOnModule)),
        specRow("Smart Module", formatEnum(p.smartModule)),
    ].join("");

    const controlSpecs = [
        specRow("Control System", p.controlSystem === "other" && p.controlSystemOther ? p.controlSystemOther : formatEnum(p.controlSystem)),
    ].join("");

    const operatingSpecs = [
        specRow("Operating Temperature", p.operatingTemperature),
        specRow("Operating Humidity", p.operatingHumidity),
        specRow("Cooling", formatEnum(p.cooling)),
        specRow("IP Rating", p.ipRating),
        specRow("Monitoring Function", monitoringFunction),
    ].join("");

    const certs = p.productCertificates || [];
    const certImagesHtml = certs.length
        ? certs.map((c) => {
            const imgSrc = c.imageDataUrl || (c.imageUrl ? toAbsoluteUrl(c.imageUrl, baseUrl) : "");
            return imgSrc
                ? `<img src="${imgSrc.startsWith("data:") ? imgSrc : escapeHtml(imgSrc)}" alt="${escapeHtml(c.name)}" class="cert-img" />`
                : `<span class="cert-name">${escapeHtml(c.name)}</span>`;
        }).join("")
        : "";
    const certificationsContent = [
        certs.length ? `<div class="cert-images-wrap">${certImagesHtml}</div>` : "",
        specRow("Additional Certification", p.additionalCertification),
        specRow("EMC", p.emc),
        specRow("Safety", p.safety),
        specRow("Support", formatEnum(p.support)),
    ].join("");

    const warrantyContent = [
        specRow("Warranty period Months", p.warrantyPeriod, "months"),
        specRow("Support During Warranty", supportDuringWarranty),
        specRow("Support After Warranty", supportAfterWarranty),
    ].join("");

    const leftSections = [
        section("Basic Information", basicInfo),
        section("Physical Specifications", physicalSpecs),
        section("LED Specifications", ledSpecs),
        section("Display Performance", displayPerf),
    ].join("");

    const rightSections = [
        section("Electrical Specifications", electricalSpecs),
        section("Control System", controlSpecs),
        section("Operating Conditions", operatingSpecs),
        section("Certifications & Standards", certificationsContent),
        section("Warranty & Support", warrantyContent),
    ].join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(p.productName || "Product")} - Datasheet</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Roboto', sans-serif; font-weight: 300; font-size: 10pt; line-height: 1.4;}
    .page-wrap { padding: 20px; max-width: 320mm; margin: 0 auto; }

    .top-section { display: flex; gap: 24px; margin-bottom: 20px; align-items: flex-start; }
    .top-left { flex: 0 0 40%; min-width: 0; }
    .top-right { flex: 1; min-width: 0; }
    .product-image-wrap { width: 100%; aspect-ratio: 1; overflow: hidden; border-radius: 8px; }
    .product-image-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .product-image-placeholder { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 12pt; border-radius: 8px; background: #f3f4f6; }
    .product-name { font-size: 18pt; font-weight: 700; margin-bottom: 4px; }
    .product-number { font-size: 11pt; margin-bottom: 10px; }
    .product-description { font-size: 10pt; font-weight: 400; line-height: 1.45; margin-bottom: 12px; color: #111827; white-space: pre-wrap; }
    .section-heading { font-size: 12pt; font-weight: 700; margin-bottom: 6px; color: #111827; }
    .features-list { list-style: none; margin: 0; padding-left: 0; }
    .features-list li { position: relative; padding-left: 14px; margin-bottom: 2px; font-size: 10pt; }
    .features-list li::before { content: "•"; position: absolute; left: 0; color: #374151; }

    .product-icons-section { margin-top: 14px; margin-bottom: 0; page-break-inside: avoid; }
    .product-icons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
      gap: 10px;
      max-width: 100%;
    }
    /* Narrower column (beside hero image) — same vertical order as product detail page */
    .top-right .product-icons-grid {
      grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
      gap: 8px;
    }
    .product-icon-card { display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .product-icon-frame {
      display: flex; align-items: center; justify-content: center;
      min-height: 64px; padding: 8px; border: 1px solid #1f2937; border-radius: 8px; background: #fff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    }
    .product-icon-img { width: 48px; height: 48px; object-fit: contain; display: block; }
    .product-icon-fallback { font-size: 8pt; text-align: center; color: #6b7280; }
    .product-icon-divider { width: 100%; border-top: 1px solid #1f2937; margin-top: 6px; flex-shrink: 0; }
    .product-icon-label { padding: 6px 4px 0; font-size: 8.5pt; font-weight: 600; text-align: center; line-height: 1.25; color: #111827; margin: 0; }

    .specs-columns { display: flex; gap: 20px; margin-top: 20px; }
    .spec-col { flex: 1; min-width: 0; }
    .accordion-section { margin-bottom: 14px; border-radius: 8px; overflow: hidden;}
    .accordion-header { padding: 10px 14px; font-weight: 600; font-size: 11pt; }
    .accordion-content { padding: 12px 14px; }
    .spec-rows { display: flex; flex-direction: column; gap: 0; }
    .spec-row { display: flex; justify-between; align-items: baseline; gap: 12px; padding: 4px 0; }
    .spec-label { font-size: 10pt; flex-shrink: 0; }
    .spec-value-wrap { display: flex; align-items: baseline; justify-content: flex-end; gap: 8px; min-width: 0; flex: 1; }
    .spec-value { font-size: 10pt; font-weight: 500; text-align: right; }
    .spec-unit { font-size: 10pt; width: 32px; flex-shrink: 0; text-align: right; }

    .cert-images-wrap { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 8px; }
    .cert-img { height: 36px; width: auto; max-width: 88px; object-fit: contain; }
    .cert-name { font-size: 10pt; }
  </style>
</head>
<body>
  <div class="page-wrap">
    <div class="top-section">
      <div class="top-left">
        <div class="product-image-wrap">
          ${mainImageSrc ? `<img src="${mainImageSrc.startsWith("data:") ? mainImageSrc : escapeHtml(mainImageSrc)}" alt="${escapeHtml(p.productName || "")}" />` : '<div class="product-image-placeholder">No Image</div>'}
        </div>
      </div>
      <div class="top-right">
        <h1 class="product-name">${escapeHtml(p.productName || "Product")}</h1>
        <p class="product-number">${escapeHtml(p.productNumber || "")}</p>
        ${descriptionHtml}
        ${featuresHtml ? `<h2 class="section-heading">Features</h2>${featuresHtml}` : ""}
        ${iconsHtml}
      </div>
    </div>
    <div class="specs-columns">
      <div class="spec-col">${leftSections}</div>
      <div class="spec-col">${rightSections}</div>
    </div>
  </div>
</body>
</html>`;
}

function getHeaderTemplate(logoDataUrl) {
    if (logoDataUrl) {
        return `<div style="width: 100%; box-sizing: border-box; padding: 6px 16px 14px 16px;">
      <img src="${logoDataUrl}" alt="Logo" style="height: 48px; width: auto; max-width: 100%; display: block;" />
    </div>`;
    }
    return `<div style="width: 100%; font-size: 11pt; font-weight: bold; padding: 8px 16px 12px 16px;">LOGO</div>`;
}

function getFooterTemplate() {
    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `<div style="width: 100%; box-sizing: border-box; padding: 6px 16px 4px 16px; font-size: 8pt; color: #374151; line-height: 1.35;">
    <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
      <tr>
        <td style="vertical-align: middle; padding-right: 14px; word-wrap: break-word;">Proledall. All rights reserved. Delivery options, technical specifications, etc. Subject to change without notice. Errors and omissions excepted.</td>
        <td style="vertical-align: middle; text-align: right; white-space: nowrap; width: 8%; font-weight: 500;">${date}</td>
      </tr>
    </table>
  </div>`;
}

export async function generateProductDatasheetPDF(product, options = {}) {
    const html = buildHtml(product, options);
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
        await page.setContent(html, { waitUntil: "domcontentloaded" });
        await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());

        const marginTop = 78;
        const marginBottom = 52;
        const a4HeightPx = 1123;
        // Small buffer prevents tiny overflow that can create an empty 2nd page
        const printableHeight = a4HeightPx - marginTop - marginBottom - 2;

        const contentHeight = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        });

        const scale = contentHeight > 0 ? Math.min(1, printableHeight / contentHeight) : 1;

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: getHeaderTemplate(options.logoDataUrl),
            footerTemplate: getFooterTemplate(),
            margin: { top: `${marginTop}px`, right: "16px", bottom: `${marginBottom}px`, left: "16px" },
            scale,
            // Always return a single-page PDF (fit-to-page achieved via scale above)
            pageRanges: "1",
        });
        return Buffer.from(pdfBuffer);
    } finally {
        await page.close();
    }
}

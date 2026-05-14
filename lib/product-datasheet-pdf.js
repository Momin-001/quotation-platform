/**
 * Product datasheet PDF. Mirrors the guest product detail accordions: same section titles,
 * row order, labels, and units as `app/(guest)/products/[id]/page.jsx` SpecRows (English).
 * Logo in header, footer disclaimer. Certificate images in Certifications & Standards.
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

/** One row: label (left), value (right), unit (right, separate column) */
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

/** Section with heading and content */
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

function buildHtml(product, { baseUrl = "", logoDataUrl = "" } = {}) {
    const p = product || {};
    const mainImageSrc = p.mainImageDataUrl || ((p.images && p.images[0]) ? toAbsoluteUrl(p.images[0], baseUrl) : "");
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

    const greyscaleDisplay =
        p.greyscaleProcessing === "other" && p.greyscaleProcessingOther
            ? p.greyscaleProcessingOther
            : p.greyscaleProcessing;

    const controlSystemDisplay =
        p.controlSystem === "other" && p.controlSystemOther ? p.controlSystemOther : formatEnum(p.controlSystem);

    const numberOfColoursDisplay = p.numberOfColours ? `${p.numberOfColours} billion` : null;

    const contrastDisplay = p.contrastRatioNumerator
        ? `${p.contrastRatioNumerator}:${p.contrastRatioDenominator || 1}`
        : null;

    const basicInfo = [
        specRow("Product Type", p.productType),
        specRow("Design", p.design),
        specRow("Special Types", p.specialTypes),
        specRow("Application", Array.isArray(p.application) ? p.application.join(", ") : p.application),
        specRow("Category", p.areaOfUse || p.categoryName),
        specRow("Service", p.support),
    ].join("");

    const physicalSpecs = [
        specRow("Pixel Pitch", p.pixelPitch, "mm"),
        specRow("Pixel Technology", p.pixelTechnology),
        specRow("Cabinet Width", p.cabinetWidth, "mm"),
        specRow("Cabinet Height", p.cabinetHeight, "mm"),
        specRow("Cabinet Resolution (Horizontal)", p.cabinetResolutionHorizontal, "px"),
        specRow("Cabinet Resolution (Vertical)", p.cabinetResolutionVertical, "px"),
        specRow("Pixel Density", p.pixelDensity != null && p.pixelDensity !== "" ? String(p.pixelDensity) : null, "px/m²"),
        specRow("Weight Without Packaging", p.weightWithoutPackaging, "kg"),
        specRow("IP Rating", p.ipRating),
    ].join("");

    const electricalSpecs = [
        specRow("Input Voltage", p.inputVoltage, "V(AC)"),
        specRow("Power Consumption (Max)", p.powerConsumptionMax, "W"),
        specRow("Power Consumption (Typical)", p.powerConsumptionTypical, "W"),
        specRow("Driving Method", formatEnum(p.drivingMethod)),
        specRow("Current Gain Control", p.currentGainControl),
        specRow("Power Redundancy", formatEnum(p.powerRedundancy)),
        specRow("Memory on Module", formatEnum(p.memoryOnModule)),
        specRow("Smart Module", formatEnum(p.smartModule)),
        specRow("MTBF Power Supply", p.mtbfPowerSupply, "hours"),
        specRow("Control System", controlSystemDisplay),
        specRow("Receiving Card", p.receivingCard),
    ].join("");

    const operatingSpecs = [
        specRow("Operating Temperature", p.operatingTemperature, "°C"),
        specRow("Operating Humidity", p.operatingHumidity, "%"),
        specRow("Cooling", formatEnum(p.cooling)),
        specRow("Heat Dissipation", p.heatDissipation, "W"),
        specRow("Monitoring Function", monitoringFunction),
    ].join("");

    const ledSpecs = [
        specRow("LED Technology", formatEnum(p.ledTechnology)),
        specRow("Pixel Configuration", p.pixelConfiguration),
        specRow("LED Lifespan", p.ledLifespan != null && p.ledLifespan !== "" ? String(p.ledLifespan) : null, "hours"),
        specRow("Chip Bonding", formatEnum(p.chipBonding)),
        specRow("LED Chip Manufacturer", p.ledChipManufacturer),
        specRow("LED Modules per Cabinet", p.ledModulesPerCabinet),
    ].join("");

    const displayPerf = [
        specRow("Refresh Rate", p.refreshRate, "Hz"),
        specRow("Brightness Value", p.brightnessValue, "cd/m²"),
        specRow("Scan Rate", scanRateStr),
        specRow("Video Rate", p.videoRate),
        specRow("Colour Depth", p.colourDepth, "bit"),
        specRow("Greyscale Processing", greyscaleDisplay),
        specRow("Number of Colours", numberOfColoursDisplay),
        specRow("Viewing Angle (Horizontal)", p.viewingAngleHorizontal),
        specRow("Viewing Angle (Vertical)", p.viewingAngleVertical),
        specRow("Contrast Ratio", contrastDisplay),
    ].join("");

    const calibrationContent = [
        specRow("Calibration Method", formatEnum(p.calibrationMethod)),
        specRow("White Point Calibration", p.whitePointCalibration),
        specRow("DCI-P3 Coverage", p.dciP3Coverage, "%"),
    ].join("");

    const certs = p.productCertificates || [];
    const hasCertificationsSection =
        certs.length > 0 ||
        (p.additionalCertification != null && String(p.additionalCertification).trim() !== "") ||
        (p.emc != null && String(p.emc).trim() !== "") ||
        (p.safety != null && String(p.safety).trim() !== "");

    const certImagesHtml = certs.length
        ? certs
              .map((c) => {
                  const imgSrc = c.imageDataUrl || (c.imageUrl ? toAbsoluteUrl(c.imageUrl, baseUrl) : "");
                  return imgSrc
                      ? `<img src="${imgSrc.startsWith("data:") ? imgSrc : escapeHtml(imgSrc)}" alt="${escapeHtml(c.name)}" class="cert-img" />`
                      : `<span class="cert-name">${escapeHtml(c.name)}</span>`;
              })
              .join("")
        : "";

    const certificationsContent = [
        certs.length ? `<div class="cert-images-wrap">${certImagesHtml}</div>` : "",
        specRow("Additional Certification", p.additionalCertification),
        specRow("EMC", p.emc),
        specRow("Safety", p.safety),
    ].join("");

    const warrantyContent = [
        specRow("Warranty Period", p.warrantyPeriod, "months"),
        specRow("Support During Warranty", supportDuringWarranty),
        specRow("Support After Warranty", supportAfterWarranty),
    ].join("");

    const leftSections = [
        section("Basic Information", basicInfo),
        section("Physical Specifications", physicalSpecs),
        section("Electrical Specifications", electricalSpecs),
        section("Operating Conditions", operatingSpecs),
    ].join("");

    const rightParts = [
        section("LED Specifications", ledSpecs),
        section("Display Performance", displayPerf),
        section("Calibration", calibrationContent),
    ];
    if (hasCertificationsSection) {
        rightParts.push(section("Certifications & Standards", certificationsContent));
    }
    rightParts.push(section("Warranty & Support", warrantyContent));
    const rightSections = rightParts.join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(p.productName || "Product")} - Datasheet</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Roboto', sans-serif;
      font-weight: 400;
      font-size: 9pt;
      line-height: 1.5;
      color: #111827;
      /* Reserve space for Puppeteer header/footer */
      padding-top: 0;
    }

    .page-wrap {
      width: 100%;
      padding: 12px 50px 12px 50px;
    }

    /* ── In-page logo header ── */
    .logo-header {
      padding: 10px 0 12px 0;
      margin-bottom: 4px;
    }
    .logo-img {
      height: 48px;
      width: auto;
      max-width: 200px;
      display: block;
      object-fit: contain;
    }
    .logo-placeholder {
      height: 48px;
      display: flex;
      align-items: center;
      font-size: 13pt;
      font-weight: 700;
      color: #111827;
    }

    /* ── Top hero section ── */
    .top-section {
      display: flex;
      gap: 18px;
      margin-bottom: 14px;
      align-items: flex-start;
    }
    .top-left { flex: 0 0 38%; min-width: 0; }
    .top-right { flex: 1; min-width: 0; }

    .product-image-wrap {
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: 8px;
    }
    .product-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .product-image-placeholder {
      width: 100%;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10pt;
      font-weight: 500;
      border-radius: 8px;
      background: #f3f4f6;
    }

    .product-name {
      font-size: 18pt;
      font-weight: 700;
      margin-bottom: 3px;
      line-height: 1.2;
      color: #111827;
    }
    .product-number {
      font-size: 10pt;
      font-weight: 500;
      margin-bottom: 7px;
      color: #374151;
    }
    .product-description {
      font-size: 9pt;
      font-weight: 400;
      line-height: 1.5;
      margin-bottom: 8px;
      color: #111827;
      white-space: pre-wrap;
    }
    .section-heading {
      font-size: 10pt;
      font-weight: 700;
      margin-bottom: 5px;
      color: #111827;
    }
    .features-list { list-style: none; margin: 0; padding-left: 0; }
    .features-list li {
      position: relative;
      padding-left: 12px;
      margin-bottom: 2px;
      font-size: 9pt;
      line-height: 1.45;
    }
    .features-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #374151;
      font-weight: 700;
    }

    /* ── Product icons ── */
    .product-icons-section { margin-top: 10px; page-break-inside: avoid; }
    .product-icons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
      gap: 6px;
      max-width: 100%;
    }
    .top-right .product-icons-grid {
      grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
      gap: 5px;
    }
    .product-icon-card { display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .product-icon-frame {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 5px;
      border: 1px solid #1f2937;
      border-radius: 6px;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    }
    .product-icon-img { width: 38px; height: 38px; object-fit: contain; display: block; }
    .product-icon-fallback { font-size: 8pt; text-align: center; color: #6b7280; line-height: 1.3; }
    .product-icon-divider { width: 100%; border-top: 1px solid #1f2937; margin-top: 4px; flex-shrink: 0; }
    .product-icon-label {
      padding: 4px 2px 0;
      font-size: 8pt;
      font-weight: 600;
      text-align: center;
      line-height: 1.2;
      color: #111827;
      margin: 0;
    }

    /* ── Two-column spec layout ── */
    .specs-columns {
      display: flex;
      gap: 50px;
      margin-top: 20px;
      align-items: flex-start;
    }
    .spec-col { flex: 1; min-width: 0; }

    /* ── Accordion sections ── */
    .accordion-section {
      margin-bottom: 8px;
      border-radius: 6px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .accordion-header {
      padding: 6px 10px;
      font-weight: 700;
      font-size: 9.5pt;
      letter-spacing: 0.01em;
      background: #f3f4f6;
    }
    .accordion-content { padding: 6px 10px 8px; }

    /* ── Spec rows ── */
    .spec-rows { display: flex; flex-direction: column; gap: 0; }
    .spec-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
      padding: 2.5px 0;
    }
    .spec-row:last-child {}

    .spec-label {
      font-size: 8.5pt;
      flex-shrink: 0;
      font-weight: 500;
      color: #374151;
      max-width: 52%;
    }
    .spec-value-wrap {
      display: flex;
      align-items: baseline;
      justify-content: flex-end;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }
    .spec-value {
      font-size: 8.5pt;
      font-weight: 600;
      text-align: right;
      color: #111827;
      word-break: break-word;
    }
    .spec-unit {
      font-size: 8pt;
      font-weight: 500;
      /* Fixed width keeps units aligned regardless of value length */
      width: 38px;
      flex-shrink: 0;
      text-align: right;
      color: #374151;
    }

    /* ── Certifications ── */
    .cert-images-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      margin-bottom: 6px;
    }
    .cert-img { height: 36px; width: auto; max-width: 80px; object-fit: contain; }
    .cert-name { font-size: 9pt; font-weight: 500; }
  </style>
</head>
<body>
  <div class="page-wrap">
    <div class="logo-header">
      ${logoDataUrl
        ? `<img src="${logoDataUrl.startsWith("data:") ? logoDataUrl : escapeHtml(logoDataUrl)}" alt="Logo" class="logo-img" />`
        : '<div class="logo-placeholder">LOGO</div>'}
    </div>
    <div class="top-section">
      <div class="top-left">
        <div class="product-image-wrap">
          ${mainImageSrc
            ? `<img src="${mainImageSrc.startsWith("data:") ? mainImageSrc : escapeHtml(mainImageSrc)}" alt="${escapeHtml(p.productName || "")}" />`
            : '<div class="product-image-placeholder">No Image</div>'}
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

function getFooterTemplate() {
    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `
    <div style="width:100%;box-sizing:border-box;padding:6px 18px 4px 18px;font-size:7pt;color:#1f2937;line-height:1.4;">
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <tr>
          <td style="vertical-align:middle;padding-right:12px;word-wrap:break-word;">
            Proledall. All rights reserved. Delivery options, technical specifications, etc. Subject to change without notice. Errors and omissions excepted.
          </td>
          <td style="vertical-align:middle;text-align:right;white-space:nowrap;width:10%;font-weight:600;">${date}</td>
        </tr>
      </table>
    </div>`;
}

export async function generateProductDatasheetPDF(product, options = {}) {
    const html = buildHtml(product, { baseUrl: options.baseUrl || "", logoDataUrl: options.logoDataUrl || "" });
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        await page.setContent(html, { waitUntil: "networkidle0" });
        await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());

        // Logo is rendered inside the HTML — no Puppeteer header needed.
        // Only the footer disclaimer uses displayHeaderFooter.
        const FOOTER_PX = 40;
        const H_MARGIN_PX = 18;
        const V_MARGIN_PX = 0;
        // A4 at 96dpi: 794 × 1123px
        const A4_HEIGHT_PX = 1123;
        const A4_WIDTH_PX = 794;

        const printableHeight = A4_HEIGHT_PX - V_MARGIN_PX - FOOTER_PX - 4; // 4px buffer
        const printableWidth = A4_WIDTH_PX - H_MARGIN_PX * 2;

        const { scrollWidth, scrollHeight } = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            scrollHeight: document.documentElement.scrollHeight,
        }));

        const scaleByWidth = scrollWidth > 0 ? Math.min(1, printableWidth / scrollWidth) : 1;
        const effectiveHeight = scrollHeight * scaleByWidth;
        const scaleByHeight = effectiveHeight > printableHeight
            ? printableHeight / effectiveHeight
            : 1;

        const scale = Math.max(0.5, scaleByWidth * scaleByHeight);
        const fitsOnePage = scrollHeight * scale <= printableHeight + 4;

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            displayHeaderFooter: true,
            // Empty header — logo lives in the page content
            headerTemplate: `<span></span>`,
            footerTemplate: getFooterTemplate(),
            margin: {
                top: `${V_MARGIN_PX}px`,
                right: `${H_MARGIN_PX}px`,
                bottom: `${FOOTER_PX}px`,
                left: `${H_MARGIN_PX}px`,
            },
            scale,
            ...(fitsOnePage ? { pageRanges: "1" } : {}),
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await page.close();
    }
}
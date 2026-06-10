/**
 * Quotation PDF using @react-pdf/renderer.
 * Mirrors the 5-section German quotation format from the Puppeteer version.
 * Includes a lightweight HTML-to-react-pdf parser for the editable sections.
 */
import React from "react";
import {
    Document,
    Page,
    View,
    Text,
    Image,
    Link,
    StyleSheet,
    Font,
    renderToBuffer,
} from "@react-pdf/renderer";
import {
    DEFAULT_OFFER_HTML,
    DEFAULT_CONDITIONS_HTML,
    DEFAULT_OPTIONS_HTML,
} from "@/features/quotations/quotation-section-defaults";
import {
    formatCurrency,
    calculateLineNetAfterDiscount,
    calculateOfferTotalWithQuotationTax,
    collectOfferLinesFromQuotationItem,
} from "@/lib/helpers/helpers";
import fs from "fs";
import path from "path";

Font.registerHyphenationCallback((word) => [word]);

let logoSrc = null;
try {
    const logoPath = path.join(process.cwd(), "public/logo-name.png");
    const logoBase64 = fs.readFileSync(logoPath, "base64");
    logoSrc = `data:image/png;base64,${logoBase64}`;
} catch {
    // logo missing
}

const COMPANY = {
    sender: "ProLEDALL | Krügerstrasse 3 67065 Ludwigshafen an Rhein",
    name: "ProLEDALL",
    inhaber: "Dipl. Ing. M. Abahssain",
    addressLine: "Krügerstrasse 3 67065 Ludwigshafen an Rhein Deutschland",
    tel: "+4962154560605",
    fax: "+4962195341212",
    email: "info@proledall.eu",
    web: "www.proledall.eu",
    bank: "Commerzbank",
    iban: "DE14 5454 0033 0831 0617 00",
    bic: "COBADEFFXXX",
    ustId: "DE298 057 613",
};

const A4 = [595.28, 841.89];

const s = StyleSheet.create({
    /** Full sheet: column layout so header + body + footer always paint in-flow (no `fixed`). */
    pageSheet: {
        fontFamily: "Helvetica",
        fontSize: 10,
        lineHeight: 1.4,
        color: "#000",
        paddingTop: 10,
        paddingBottom: 10,
        paddingHorizontal: 56,
        flexDirection: "column",
    },
    pageColumn: {
        flex: 1,
        flexDirection: "column",
        minHeight: 0,
    },
    /** Logo row — top of every page */
    headerRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        minHeight: 42,
        marginBottom: 6,
    },
    headerLogo: { height: 36 },
    /** Main content grows; keeps footer at bottom on short pages */
    pageBody: {
        flexGrow: 1,
        flexShrink: 1,
    },
    /** Footer — always last in column so it is never clipped */
    footerOuter: {
        borderTopWidth: 0.5,
        borderTopColor: "#999",
        paddingTop: 5,
        marginTop: 8,
    },
    footerCenter: { alignItems: "center", marginBottom: 2 },
    footerLine: { fontSize: 7, textAlign: "center", lineHeight: 1.35, color: "#000" },
    footerPageRow: { flexDirection: "row", justifyContent: "flex-end" },
    footerPage: { fontSize: 9, color: "#000" },

    // Cover
    senderUnderline: {
        fontSize: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        paddingBottom: 4,
        marginBottom: 16,
    },
    twoCols: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, gap: 40 },
    colLeft: { flex: 1 },
    colRight: { flex: 1, alignItems: "flex-end" },
    colRightText: { textAlign: "right" },

    // TOC
    tocTitle: { fontSize: 12, color: "#2563eb", marginTop: 30, marginBottom: 12 },
    tocRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 6 },
    tocText: { fontSize: 10 },
    tocDots: { flex: 1, borderBottomWidth: 1, borderBottomColor: "#999", borderBottomStyle: "dotted", marginHorizontal: 8, marginBottom: 2 },
    tocPage: { width: 24, textAlign: "right", fontSize: 10 },

    // Section headings
    sectionTitle: { fontSize: 14, marginBottom: 12 },
    sectionTitleUnderline: { fontSize: 14, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#000", paddingBottom: 4 },

    // Content
    para: { marginBottom: 10, fontSize: 10, lineHeight: 1.4 },
    paraSpaced: { marginBottom: 10, marginTop: 20, fontSize: 10, lineHeight: 1.4 },
    bold: { fontFamily: "Helvetica-Bold" },
    italic: { fontStyle: "italic" },
    underline: { textDecoration: "underline" },

    // Price table
    table: { marginTop: 12, borderBottomWidth: 0 },
    tableHeaderRow: {
        flexDirection: "row",
        borderBottomWidth: 2,
        borderBottomColor: "#000",
        paddingBottom: 4,
        paddingTop: 4,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingVertical: 5,
        minHeight: 20,
    },
    tableRowSub: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingVertical: 5,
        paddingLeft: 16,
        minHeight: 20,
    },
    summaryRow: {
        flexDirection: "row",
        paddingVertical: 5,
        minHeight: 20,
    },
    totalRow: {
        flexDirection: "row",
        borderTopWidth: 2,
        borderTopColor: "#000",
        paddingVertical: 5,
        minHeight: 20,
    },
    thPos: { width: "5%", fontSize: 9, fontFamily: "Helvetica-Bold" },
    thProduct: { width: "35%", fontSize: 9, fontFamily: "Helvetica-Bold" },
    thNum: { width: "14%", fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "right" },
    thNumSm: { width: "8%", fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "right" },
    tdPos: { width: "5%", fontSize: 9 },
    tdProduct: { width: "35%", fontSize: 9 },
    tdNum: { width: "14%", fontSize: 9, textAlign: "right" },
    tdNumSm: { width: "8%", fontSize: 9, textAlign: "right" },
    tdProductBold: { width: "76%", fontSize: 9, fontFamily: "Helvetica-Bold" },
    tdNumBold: { width: "14%", fontSize: 9, textAlign: "right", fontFamily: "Helvetica-Bold" },

    // Display details
    ddTitle: { textDecoration: "underline", marginBottom: 4, marginTop: 12, fontSize: 10 },
    ddTable: { marginBottom: 12 },
    ddHeaderRow: {
        flexDirection: "row",
        borderBottomWidth: 2,
        borderBottomColor: "#000",
        paddingVertical: 3,
    },
    ddRow: { flexDirection: "row", paddingVertical: 2 },
    ddLabel: { width: "38%", fontSize: 9 },
    ddValue: { width: "31%", fontSize: 9 },
    ddHeaderLabel: { width: "38%", fontSize: 9 },
    ddHeaderValue: { width: "31%", fontSize: 9, fontFamily: "Helvetica-Bold" },

    // Block title (for position descriptions)
    blockTitle: { marginTop: 16, marginBottom: 8, fontSize: 10, fontFamily: "Helvetica-Bold" },
    blockTitleAlt: { marginTop: 20, marginBottom: 8, fontSize: 10, fontFamily: "Helvetica-Bold" },

    // Lists
    ul: { marginVertical: 8, paddingLeft: 16 },
    li: { flexDirection: "row", marginBottom: 3 },
    liBullet: { width: 12, fontSize: 10 },
    liText: { flex: 1, fontSize: 10 },

    linkText: { color: "#2563eb", fontSize: 10 },
});

// ─── Lightweight HTML-to-ReactPDF parser ────────────────────────────────────
// Handles the subset used in quotation sections: div, p, span, strong/b, em/i, u, ul, ol, li, br, a

function stripTags(html) {
    return (html || "").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
}

function parseInlineStyles(styleStr) {
    if (!styleStr) return {};
    const pdfStyle = {};
    const pairs = styleStr.split(";").filter(Boolean);
    for (const pair of pairs) {
        const [key, val] = pair.split(":").map((s) => s.trim());
        if (!key || !val) continue;
        if (key === "margin-top") pdfStyle.marginTop = parseInt(val, 10) || 0;
        if (key === "margin-bottom") pdfStyle.marginBottom = parseInt(val, 10) || 0;
        if (key === "font-weight" && (val === "bold" || parseInt(val, 10) >= 700)) pdfStyle.fontFamily = "Helvetica-Bold";
        if (key === "font-style" && val === "italic") pdfStyle.fontStyle = "italic";
        if (key === "text-decoration" && val.includes("underline")) pdfStyle.textDecoration = "underline";
    }
    return pdfStyle;
}

function tokenize(html) {
    const tokens = [];
    const re = /(<[^>]+>)/g;
    let lastIndex = 0;
    let match;
    while ((match = re.exec(html)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({ type: "text", value: html.slice(lastIndex, match.index) });
        }
        tokens.push({ type: "tag", value: match[1] });
        lastIndex = re.lastIndex;
    }
    if (lastIndex < html.length) {
        tokens.push({ type: "text", value: html.slice(lastIndex) });
    }
    return tokens;
}

function decodeEntities(str) {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");
}

function HtmlContent({ html }) {
    if (!html) return null;
    const blocks = parseHtmlToBlocks(html);
    return <>{blocks.map((block, i) => renderBlock(block, i))}</>;
}

function parseHtmlToBlocks(html) {
    const cleaned = html.replace(/\n/g, "").replace(/\r/g, "");
    const tokens = tokenize(cleaned);
    const blocks = [];
    let currentBlock = null;
    let inlineStack = [];
    let listItems = [];
    let inList = false;

    const flushBlock = () => {
        if (currentBlock) {
            blocks.push(currentBlock);
            currentBlock = null;
        }
    };

    const flushList = () => {
        if (listItems.length > 0) {
            blocks.push({ type: "list", items: [...listItems] });
            listItems = [];
        }
        inList = false;
    };

    for (const token of tokens) {
        if (token.type === "tag") {
            const tagLower = token.value.toLowerCase();
            const tagNameMatch = tagLower.match(/^<\/?([a-z0-9]+)/);
            const tagName = tagNameMatch ? tagNameMatch[1] : "";
            const isClosing = tagLower.startsWith("</");

            if (tagName === "ul" || tagName === "ol") {
                if (isClosing) {
                    flushList();
                } else {
                    flushBlock();
                    inList = true;
                }
                continue;
            }

            if (tagName === "li") {
                if (isClosing) {
                    if (currentBlock) {
                        listItems.push(currentBlock);
                        currentBlock = null;
                    }
                } else {
                    currentBlock = { type: "li", segments: [] };
                }
                continue;
            }

            if ((tagName === "div" || tagName === "p") && !isClosing) {
                if (inList) continue;
                flushBlock();
                const styleMatch = token.value.match(/style="([^"]*)"/i);
                const classMatch = token.value.match(/class="([^"]*)"/i);
                const inlineStyle = parseInlineStyles(styleMatch?.[1]);
                const classes = (classMatch?.[1] || "").split(/\s+/);
                currentBlock = { type: "para", segments: [], style: inlineStyle, classes };
                inlineStack = [];
                continue;
            }

            if ((tagName === "div" || tagName === "p") && isClosing) {
                if (inList) continue;
                flushBlock();
                continue;
            }

            if (tagName === "br") {
                if (currentBlock) {
                    currentBlock.segments.push({ text: "\n", styles: [] });
                }
                continue;
            }

            if (tagName === "strong" || tagName === "b") {
                if (!isClosing) inlineStack.push("bold");
                else inlineStack = inlineStack.filter((x) => x !== "bold");
                continue;
            }
            if (tagName === "em" || tagName === "i") {
                if (!isClosing) inlineStack.push("italic");
                else inlineStack = inlineStack.filter((x) => x !== "italic");
                continue;
            }
            if (tagName === "u") {
                if (!isClosing) inlineStack.push("underline");
                else inlineStack = inlineStack.filter((x) => x !== "underline");
                continue;
            }
            if (tagName === "a" && !isClosing) {
                const hrefMatch = token.value.match(/href="([^"]*)"/i);
                if (hrefMatch) inlineStack.push(`link:${hrefMatch[1]}`);
                continue;
            }
            if (tagName === "a" && isClosing) {
                inlineStack = inlineStack.filter((x) => !x.startsWith("link:"));
                continue;
            }
        } else {
            const text = decodeEntities(token.value);
            if (!text.trim() && !text.includes(" ")) continue;
            if (!currentBlock) {
                currentBlock = { type: "para", segments: [], style: {}, classes: [] };
            }
            currentBlock.segments.push({ text, styles: [...inlineStack] });
        }
    }
    flushBlock();
    flushList();
    return blocks;
}

function renderBlock(block, key) {
    if (block.type === "list") {
        return (
            <View key={key} style={s.ul}>
                {block.items.map((item, i) => (
                    <View key={i} style={s.li}>
                        <Text style={s.liBullet}>•</Text>
                        <Text style={s.liText}>
                            {(item.segments || []).map((seg, j) => renderSegment(seg, j))}
                        </Text>
                    </View>
                ))}
            </View>
        );
    }

    const paraStyle = [s.para];
    if (block.style?.marginTop) paraStyle.push({ marginTop: block.style.marginTop });
    if (block.style?.marginBottom) paraStyle.push({ marginBottom: block.style.marginBottom });

    const hasContent = block.segments && block.segments.length > 0;

    return (
        <View key={key} style={paraStyle}>
            <Text style={{ fontSize: 10, lineHeight: 1.4 }}>
                {hasContent
                    ? block.segments.map((seg, i) => renderSegment(seg, i))
                    : " "
                }
            </Text>
        </View>
    );
}

function renderSegment(seg, key) {
    const textStyle = {};
    let linkUrl = null;
    for (const st of seg.styles) {
        if (st === "bold") textStyle.fontFamily = "Helvetica-Bold";
        if (st === "italic") textStyle.fontStyle = "italic";
        if (st === "underline") textStyle.textDecoration = "underline";
        if (st.startsWith("link:")) {
            linkUrl = st.slice(5);
            textStyle.color = "#2563eb";
        }
    }
    if (linkUrl) {
        return (
            <Link key={key} src={linkUrl}>
                <Text style={textStyle}>{seg.text}</Text>
            </Link>
        );
    }
    return <Text key={key} style={textStyle}>{seg.text}</Text>;
}

// ─── Data helpers (quotation line items, display details, pricing) ───────────

function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function lineNetForRow(unitPrice, qty, discountPct) {
    return calculateLineNetAfterDiscount(unitPrice, qty, discountPct);
}

function buildItemRows(item, posRef, labelPrefix, quotationTaxPct) {
    const empty = { rows: [], offerNet: 0, offerTax: 0, offerGross: 0 };
    if (!item) return empty;

    const lines = collectOfferLinesFromQuotationItem(item);
    const { offerNet, tax, offerTotal } = calculateOfferTotalWithQuotationTax({
        lines,
        quotationTaxPercentage: quotationTaxPct,
    });

    const rows = [];
    const prefix = labelPrefix ? `${labelPrefix}: ` : "";

    const mainQtyRaw = item.product?.isCustom
        ? item.product?.customTotalCabinets ?? item.quantity
        : item.quantity;
    const qty = parseInt(mainQtyRaw ?? 1, 10);
    const unit = parseFloat(item.unitPrice || 0);
    const discPct = parseFloat(item.discountPercentage || 0);
    const mainNet = lineNetForRow(unit, qty, discPct);

    const isCustom = !!item.product?.isCustom;
    let productLabel = item.product
        ? `${prefix}${item.product.productName} (Artikel: ${item.product.productNumber || ""})`
        : "";
    if (isCustom) productLabel += " – Preis pro Kabinett";

    rows.push({ pos: posRef.value++, product: productLabel, qty, unitPrice: unit, discPct, lineNet: mainNet, isSubItem: false });

    for (const add of item.additionalItems || []) {
        const aQty = parseInt(add.quantity || 1, 10);
        const aUnit = parseFloat(add.unitPrice || 0);
        const aDiscPct = parseFloat(add.discountPercentage || 0);
        const aNet = lineNetForRow(aUnit, aQty, aDiscPct);
        rows.push({
            pos: posRef.value++,
            product: add.product ? `${add.product.productName} (Artikel: ${add.product.productNumber || ""})` : (add.description || ""),
            qty: aQty, unitPrice: aUnit, discPct: aDiscPct, lineNet: aNet, isSubItem: false,
        });
    }

    for (const opt of item.optionalItems || []) {
        const oQty = parseInt(opt.quantity || 1, 10);
        const oUnit = parseFloat(opt.unitPrice || 0);
        const oDiscPct = parseFloat(opt.discountPercentage || 0);
        const oNet = lineNetForRow(oUnit, oQty, oDiscPct);
        const isSub = opt.description?.toLowerCase().includes("ersatzteil");
        rows.push({
            pos: isSub ? null : posRef.value++,
            product: opt.product ? `${opt.product.productName} (Artikel: ${opt.product.productNumber || ""})` : (opt.description || ""),
            qty: oQty, unitPrice: oUnit, discPct: oDiscPct, lineNet: oNet, isSubItem: isSub,
        });
    }

    return { rows, offerNet, offerTax: tax, offerGross: offerTotal };
}

function buildPriceTableRows(data) {
    const quotationTax = parseFloat(data.quotation?.taxPercentage ?? 19);
    const posRef = { value: 1 };
    const main = data.mainProduct
        ? buildItemRows(data.mainProduct, posRef, "Hauptangebot", quotationTax)
        : { rows: [], offerNet: 0, offerTax: 0, offerGross: 0 };
    const alt = data.alternativeProduct
        ? buildItemRows(data.alternativeProduct, posRef, "Alternativangebot", quotationTax)
        : { rows: [], offerNet: 0, offerTax: 0, offerGross: 0 };
    return { main, alt };
}

const toNumberOrNull = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
};

const DISPLAY_DETAIL_SPECS = [
    { label: "Pixelabstand", getValue: (p) => (p?.pixelPitch ? `${p.pixelPitch} mm` : null) },
    {
        label: "Kabinett Abmaße BxH",
        getValue: (p) => {
            if (p?.isCustom) {
                const wM = toNumberOrNull(p.customScreenWidth);
                const hM = toNumberOrNull(p.customScreenHeight);
                if (wM == null || hM == null) return null;
                return `${wM * 1000}mmx${hM * 1000}mm`;
            }
            return p?.cabinetWidth && p?.cabinetHeight ? `${p.cabinetWidth}mmx${p.cabinetHeight}mm` : null;
        },
    },
    {
        label: "Auflösung",
        getValue: (p) => {
            if (p?.isCustom) {
                const h = toNumberOrNull(p.customTotalResolutionH);
                const v = toNumberOrNull(p.customTotalResolutionV);
                return h != null && v != null ? `${h}x${v} Pixel` : null;
            }
            return p?.cabinetResolutionHorizontal && p?.cabinetResolutionVertical
                ? `${p.cabinetResolutionHorizontal}x${p.cabinetResolutionVertical} Pixel` : null;
        },
    },
    {
        label: "Gesamt Fläche",
        getValue: (p) => {
            if (p?.isCustom) {
                const wM = toNumberOrNull(p.customScreenWidth);
                const hM = toNumberOrNull(p.customScreenHeight);
                return wM != null && hM != null ? `${(wM * hM).toFixed(2)} m²` : null;
            }
            if (!p?.cabinetWidth || !p?.cabinetHeight) return null;
            return `${((parseFloat(p.cabinetWidth) / 1000) * (parseFloat(p.cabinetHeight) / 1000)).toFixed(2)} m²`;
        },
    },
    { label: "Max. Helligkeit", getValue: (p) => (p?.brightnessValue ? `${p.brightnessValue} cd/m²` : null) },
    {
        label: "Kontrast",
        getValue: (p) => p?.contrastRatioNumerator && p?.contrastRatioDenominator ? `${p.contrastRatioNumerator}:${p.contrastRatioDenominator}` : null,
    },
    { label: "Bildwiederholfrequenz, programmierbar", getValue: (p) => (p?.refreshRate ? `${p.refreshRate} Hz` : null) },
    {
        label: "Typ. Leistungsaufnahme",
        getValue: (p) => {
            if (p?.isCustom) { const t = toNumberOrNull(p.customPowerConsumptionTyp); return t != null ? `${t} kW` : null; }
            return p?.powerConsumptionTypical ? `${p.powerConsumptionTypical} kW` : null;
        },
    },
    {
        label: "Max. Leistungsaufnahme",
        getValue: (p) => {
            if (p?.isCustom) { const m = toNumberOrNull(p.customPowerConsumptionMax); return m != null ? `${m} kW` : null; }
            return p?.powerConsumptionMax ? `${p.powerConsumptionMax} kW` : null;
        },
    },
    {
        label: "Gesamt Gewicht",
        getValue: (p) => {
            if (p?.isCustom) { const w = toNumberOrNull(p.customWeight); return w != null ? `${w} Kg` : null; }
            return p?.weightWithoutPackaging ? `${p.weightWithoutPackaging} Kg` : null;
        },
    },
];

function buildDisplayDetailsRows(mainProduct, alternativeProduct) {
    const mainP = mainProduct?.product ?? null;
    const altP = alternativeProduct?.product ?? null;
    if (!mainP && !altP) return { rows: [], hasMain: false, hasAlt: false };
    const rows = [{ label: "", mainValue: "Hauptangebot", altValue: "Alternativangebot" }];
    for (const { label, getValue } of DISPLAY_DETAIL_SPECS) {
        const mv = getValue(mainP);
        const av = getValue(altP);
        if (mv != null || av != null) rows.push({ label, mainValue: mv ?? "—", altValue: av ?? "—" });
    }
    return { rows, hasMain: !!mainP, hasAlt: !!altP };
}

// ─── PDF Components ─────────────────────────────────────────────────────────

const footerLine1 = `${COMPANY.name} Inhaber: ${COMPANY.inhaber} | ${COMPANY.addressLine} | USt-ID: ${COMPANY.ustId} |`;
const footerLine2 = `Tel: ${COMPANY.tel} Fax: ${COMPANY.fax} Email: ${COMPANY.email} Web:${COMPANY.web} |`;
const footerLine3 = `${COMPANY.bank} IBAN: ${COMPANY.iban} BIC/SWIFT: ${COMPANY.bic}`;

/** One quotation page: in-flow header + body + footer (no `fixed` — reliable with renderToBuffer). */
function QuotationPage({ pageIndex, children }) {
    return (
        <Page size={A4} style={s.pageSheet}>
            <View style={s.pageColumn}>
                <View style={s.headerRow}>
                    {logoSrc ? (
                        <Image src={logoSrc} style={s.headerLogo} />
                    ) : (
                        <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold" }}>LOGO</Text>
                    )}
                </View>
                <View style={s.pageBody}>{children}</View>
                <View style={s.footerOuter}>
                    <View style={s.footerCenter}>
                        <Text style={s.footerLine}>{footerLine1}</Text>
                        <Text style={s.footerLine}>{footerLine2}</Text>
                        <Text style={s.footerLine}>{footerLine3}</Text>
                    </View>
                    <View style={s.footerPageRow}>
                        <Text style={s.footerPage}>
                            Seite {pageIndex}
                        </Text>
                    </View>
                </View>
            </View>
        </Page>
    );
}

const TocRow = ({ text, page }) => (
    <View style={s.tocRow}>
        <Text style={s.tocText}>{text}</Text>
        <View style={s.tocDots} />
        <Text style={s.tocPage}>{page}</Text>
    </View>
);

const PriceRow = ({ row }) => (
    <View style={row.isSubItem ? s.tableRowSub : s.tableRow} wrap={false}>
        <Text style={s.tdPos}>{row.pos ?? ""}</Text>
        <Text style={s.tdProduct}>{row.product}</Text>
        <Text style={s.tdNum}>{row.qty}</Text>
        <Text style={s.tdNum}>{row.unitPrice ? formatCurrency(row.unitPrice) : ""}</Text>
        <Text style={s.tdNumSm}>{row.discPct ? `${row.discPct}%` : "–"}</Text>
        <Text style={s.tdNum}>{formatCurrency(row.lineNet)}</Text>
    </View>
);

const OfferSummary = ({ label, offerData, taxPct }) => {
    if (offerData.rows.length === 0) return null;
    return (
        <>
            {offerData.rows.map((row, i) => (
                <PriceRow key={`r-${i}`} row={row} />
            ))}
            <View style={s.summaryRow} wrap={false}>
                <Text style={s.tdProductBold}>{label} – Gesamt Netto:</Text>
                <Text style={s.tdNumBold}>{formatCurrency(offerData.offerNet)}</Text>
            </View>
            <View style={s.summaryRow} wrap={false}>
                <Text style={s.tdProductBold}>zzgl. ({Number.isFinite(taxPct) ? taxPct : 19}%) USt. auf</Text>
                <Text style={s.tdNumBold}>+ {formatCurrency(offerData.offerTax)}</Text>
            </View>
            <View style={s.totalRow} wrap={false}>
                <Text style={s.tdProductBold}>{label} – Gesamtbetrag</Text>
                <Text style={s.tdNumBold}>{formatCurrency(offerData.offerGross)}</Text>
            </View>
        </>
    );
};

const DisplayDetailsTable = ({ rows, hasAlt }) => {
    if (!rows || rows.length <= 1) return null;
    return (
        <>
            <Text style={s.ddTitle}>Displaydetails:</Text>
            <View style={s.ddTable}>
                {rows.map((row, i) => {
                    const isHeader = i === 0;
                    const rowStyle = isHeader ? s.ddHeaderRow : s.ddRow;
                    const labelStyle = isHeader ? s.ddHeaderLabel : s.ddLabel;
                    const valueStyle = isHeader ? s.ddHeaderValue : s.ddValue;
                    return (
                        <View key={i} style={rowStyle}>
                            <Text style={labelStyle}>{row.label}</Text>
                            <Text style={valueStyle}>{row.mainValue}</Text>
                            {hasAlt ? <Text style={valueStyle}>{row.altValue}</Text> : null}
                        </View>
                    );
                })}
            </View>
        </>
    );
};

const PositionBlock = ({ item, label, datasheetBaseUrl }) => {
    if (!item?.product) return null;
    const p = item.product;
    const features = p.features || [];
    const dsUrl = p.id && datasheetBaseUrl ? `${datasheetBaseUrl}/api/products/${p.id}/datasheet` : null;

    return (
        <>
            <Text style={s.blockTitle}>{label}: {p.productName}</Text>
            {item.description ? <Text style={s.para}>{item.description}</Text> : null}
            {features.length > 0 ? (
                <>
                    <Text style={[s.blockTitle, { marginTop: 4 }]}>Features</Text>
                    <View style={s.ul}>
                        {features.map((f, i) => (
                            <View key={i} style={s.li}>
                                <Text style={s.liBullet}>•</Text>
                                <Text style={s.liText}>{f}</Text>
                            </View>
                        ))}
                    </View>
                </>
            ) : null}
            {dsUrl ? <Link src={dsUrl}><Text style={s.linkText}>Download Link</Text></Link> : null}

            {(item.additionalItems || []).map((add, i) => (
                <View key={`add-${i}`}>
                    <Text style={s.blockTitle}>{add.product?.productName || add.description || ""}</Text>
                    <Text style={s.para}>{add.description || add.product?.productName || ""}</Text>
                </View>
            ))}

            {(item.optionalItems || []).map((opt, i) => {
                const optFeatures = opt.product?.features || [];
                const optDsUrl = (opt.product?.sourceType === "product" || (!opt.product?.sourceType && opt.product?.id))
                    ? (opt.product.id && datasheetBaseUrl ? `${datasheetBaseUrl}/api/products/${opt.product.id}/datasheet` : null)
                    : null;
                return (
                    <View key={`opt-${i}`}>
                        <Text style={s.blockTitle}>{opt.product?.productName || opt.description || ""}</Text>
                        <Text style={s.para}>
                            {opt.product?.productName
                                ? "aller relevanten Systemkomponenten (insbesondere LED-Module derselben Herstellungscharge = Farbtreue)"
                                : (opt.description || "")}
                        </Text>
                        {optFeatures.length > 0 ? (
                            <View style={s.ul}>
                                {optFeatures.map((f, fi) => (
                                    <View key={fi} style={s.li}>
                                        <Text style={s.liBullet}>•</Text>
                                        <Text style={s.liText}>{f}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : null}
                        {optDsUrl ? <Link src={optDsUrl}><Text style={s.linkText}>Download Link</Text></Link> : null}
                    </View>
                );
            })}
        </>
    );
};

// ─── Main Document ──────────────────────────────────────────────────────────

const QuotationDocument = ({ data }) => {
    const { quotation, enquiry, mainProduct, alternativeProduct } = data;
    const quotationDate = formatDate(quotation?.createdAt);
    const offerHtml = quotation?.sectionOfferHtml || DEFAULT_OFFER_HTML;
    const conditionsHtml = quotation?.sectionConditionsHtml || DEFAULT_CONDITIONS_HTML;
    const optionsHtml = quotation?.sectionOptionsHtml || DEFAULT_OPTIONS_HTML;

    const recipientName = enquiry?.customerName || "Kunde";
    const recipientCompany = enquiry?.customerCompany || "";
    const recipientAddress = enquiry?.customerAddress || "";
    const recipientRegNum = enquiry?.customerCommercialRegisterNumber || "";
    const recipientEmail = enquiry?.customerEmail || "";
    const recipientPhone = enquiry?.customerPhone || "";
    const refProject = mainProduct?.product?.productName || enquiry?.message?.slice(0, 60) || "—";

    const { main, alt } = buildPriceTableRows(data);
    const displayDetails = buildDisplayDetailsRows(mainProduct, alternativeProduct);
    const taxPct = parseFloat(quotation?.taxPercentage ?? 19);

    const datasheetBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    return (
        <Document title={`Angebot ${quotation?.quotationNumber || ""}`}>
            {/* Page 1: Cover + Section 1 */}
            <QuotationPage pageIndex={1}>
                <Text style={s.senderUnderline}>{COMPANY.sender}</Text>

                <View style={s.twoCols}>
                    <View style={s.colLeft}>
                        {recipientCompany ? <Text>{recipientCompany}</Text> : null}
                        <Text>{recipientName}</Text>
                        <Text>{recipientAddress}</Text>
                        {recipientRegNum ? <Text>{recipientRegNum}</Text> : null}
                        <Text style={{ marginTop: 10 }}>{recipientEmail}</Text>
                        <Text>{recipientPhone}</Text>
                    </View>
                    <View style={s.colRight}>
                        <Text style={s.colRightText}>Ludwigshafen, {quotationDate}</Text>
                        <Text style={[s.colRightText, { marginTop: 4 }]}>Angebot Nr. {quotation?.quotationNumber || ""} Rev.0</Text>
                        <Text style={[s.colRightText, { marginTop: 4 }]}>Referenz/ Project Name: {refProject}</Text>
                        <Text style={[s.colRightText, { marginTop: 12 }]}>Unser Bearbeiter: Abahssain</Text>
                        <Text style={s.colRightText}>E-Mail: {COMPANY.email}</Text>
                        <Text style={s.colRightText}>Tel: {COMPANY.tel}</Text>
                    </View>
                </View>

                <Text style={s.tocTitle}>Inhalt</Text>
                <TocRow text="1. Unser Angebot / our offer" page="1" />
                <TocRow text="2. Preisübersicht / Price overview" page="2" />
                <TocRow text="3. Konditionen / conditions" page="3" />
                <TocRow text="4. Positionsbeschreibungen / Position descriptions" page="4" />
                <TocRow text="5. Optionen / options" page="5" />

                <View style={{ marginTop: 24 }} />
                <Text style={s.sectionTitle}>1. Unser Angebot / our offer</Text>
                <HtmlContent html={offerHtml} />
            </QuotationPage>

            {/* Page 2: Preisübersicht */}
            <QuotationPage pageIndex={2}>
                <Text style={s.sectionTitleUnderline}>2. Preisübersicht / Price overview</Text>

                <DisplayDetailsTable rows={displayDetails.rows} hasAlt={displayDetails.hasAlt} />

                {/* Price table */}
                <View style={s.table}>
                    <View style={s.tableHeaderRow}>
                        <Text style={s.thPos}>Pos.</Text>
                        <Text style={s.thProduct}>Produkt</Text>
                        <Text style={s.thNum}>Menge</Text>
                        <Text style={s.thNum}>Einzelpreis</Text>
                        <Text style={s.thNumSm}>Rabatt</Text>
                        <Text style={s.thNum}>Gesamtpreis (Netto)</Text>
                    </View>
                    <OfferSummary label="Hauptangebot" offerData={main} taxPct={taxPct} />
                    <OfferSummary label="Alternativangebot" offerData={alt} taxPct={taxPct} />
                </View>
            </QuotationPage>

            {/* Page 3: Konditionen */}
            <QuotationPage pageIndex={3}>
                <Text style={s.sectionTitleUnderline}>3. Konditionen / conditions</Text>
                <HtmlContent html={conditionsHtml} />
            </QuotationPage>

            {/* Page 4: Positionsbeschreibungen */}
            <QuotationPage pageIndex={4}>
                <Text style={s.sectionTitleUnderline}>4. Positionsbeschreibungen / Position descriptions</Text>
                <PositionBlock item={mainProduct} label="Hauptangebot" datasheetBaseUrl={datasheetBaseUrl} />
                <PositionBlock item={alternativeProduct} label="Alternativangebot" datasheetBaseUrl={datasheetBaseUrl} />
            </QuotationPage>

            {/* Page 5: Optionen */}
            <QuotationPage pageIndex={5}>
                <Text style={s.sectionTitleUnderline}>5. Optionen / options</Text>
                <HtmlContent html={optionsHtml} />
            </QuotationPage>
        </Document>
    );
};

export async function generateQuotationReactPDF(data) {
    const buffer = await renderToBuffer(<QuotationDocument data={data} />);
    return Buffer.from(buffer);
}

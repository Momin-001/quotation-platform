import React from "react";
import { Document, Page, View, Text, Image, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";

Font.registerHyphenationCallback((word) => [word]);

// Theme colors mirrored from the web app (app/globals.css) so the PDF matches the detail page.
const PAGE_BG = "#F9FAFB";       // gray-50 page background
const CARD_BG = "#FFFFFF";       // white cards
const BORDER = "#E5E7EB";        // border / border-border/60
const PRIMARY = "#1A73E8";       // --primary (brand blue)
const PRIMARY_TINT = "#E8F1FD";  // bg-primary/10 (accordion header)
const SECONDARY = "#019C94";     // --secondary (teal, area-of-use badge)
const CHIP_BG = "#F1F2F4";       // bg-muted/40 (stock / lead-time chips)
const TEXT = "#2C2C2C";          // --foreground
const TEXT_MED = "#374151";
const TEXT_LIGHT = "#737373";    // --muted-foreground
const AMBER_BG = "#FEF3C7";      // amber-100 (Refurbished badge bg)
const AMBER_TEXT = "#92400E";    // amber-800 (Refurbished badge text)

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 8,
        lineHeight: 1.35,
        color: TEXT,
        backgroundColor: PAGE_BG,
        paddingTop: 54,
        paddingBottom: 34,
        paddingHorizontal: 24,
    },
    header: { position: "absolute", top: 8, left: 24, right: 24, height: 40, flexDirection: "row", alignItems: "center" },
    headerLogo: { height: 34 },
    headerFallback: { fontSize: 14, fontFamily: "Helvetica-Bold" },
    footer: { position: "absolute", bottom: 8, left: 24, right: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 3, borderTopWidth: 0.4, borderTopColor: BORDER },
    footerText: { fontSize: 6, color: TEXT_LIGHT, maxWidth: "86%" },
    footerDate: { fontSize: 6, fontFamily: "Helvetica-Bold", color: TEXT_LIGHT },

    topSection: { flexDirection: "row", marginBottom: 8 },
    topLeft: { width: "40%", marginRight: 12 },
    topRight: { width: "60%" },

    // Image sits in a white card (mirrors the refurbished detail-page image card)
    imageCard: { position: "relative", backgroundColor: CARD_BG, borderWidth: 0.5, borderColor: BORDER, borderRadius: 6, padding: 6 },
    productImage: { width: "100%", maxHeight: 228, objectFit: "contain", borderRadius: 4 },
    noImage: { width: "100%", height: 120, backgroundColor: "#F3F4F6", borderRadius: 4, alignItems: "center", justifyContent: "center" },
    noImageText: { fontSize: 9, color: TEXT_LIGHT },
    qualityBadge: { position: "absolute", top: 12, left: 12, backgroundColor: PRIMARY, color: "#ffffff", fontSize: 6.5, fontFamily: "Helvetica-Bold", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, textTransform: "uppercase" },

    // White info card around the hero details
    infoCard: { backgroundColor: CARD_BG, borderWidth: 0.5, borderColor: BORDER, borderRadius: 6, padding: 10 },
    productName: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 1, lineHeight: 1.15, color: TEXT },
    productNumber: { fontSize: 9, color: TEXT_LIGHT, marginBottom: 5 },
    badgeRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 5, gap: 4 },
    areaBadge: { backgroundColor: SECONDARY, color: "#ffffff", fontSize: 6.5, fontFamily: "Helvetica-Bold", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, textTransform: "uppercase" },
    refurbBadge: { backgroundColor: AMBER_BG, color: AMBER_TEXT, fontSize: 6.5, fontFamily: "Helvetica-Bold", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, textTransform: "uppercase" },
    price: { fontSize: 14, fontFamily: "Helvetica-Bold", color: TEXT, marginBottom: 5 },
    description: { fontSize: 7.5, lineHeight: 1.4, marginBottom: 5, color: TEXT_MED },
    featuresHeading: { fontSize: 8.5, fontFamily: "Helvetica-Bold", marginBottom: 2, color: TEXT, textTransform: "uppercase" },
    featureRow: { flexDirection: "row", marginBottom: 1, paddingLeft: 1 },
    featureBullet: { fontSize: 8, marginRight: 4, color: PRIMARY },
    featureText: { fontSize: 7.5, flex: 1, lineHeight: 1.3, color: TEXT_MED },

    chipRow: { flexDirection: "row", marginTop: 4, gap: 6 },
    chip: { backgroundColor: CHIP_BG, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
    chipLabel: { fontSize: 6, color: TEXT_LIGHT, marginBottom: 1 },
    chipValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: TEXT },

    // Single "Specifications" accordion card with two sub-grids inside
    accordion: { backgroundColor: CARD_BG, borderWidth: 0.5, borderColor: BORDER, borderRadius: 6, overflow: "hidden" },
    accordionHeader: { backgroundColor: PRIMARY_TINT, paddingHorizontal: 10, paddingVertical: 5 },
    accordionTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: TEXT },
    accordionContent: { paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", gap: 14 },
    gridCol: { flex: 1 },

    specGroup: { marginBottom: 8 },
    specGroupTitle: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: PRIMARY, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3, paddingBottom: 2, borderBottomWidth: 0.5, borderBottomColor: BORDER },

    specRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 1.5 },
    specLabelCol: { width: "46%", flexShrink: 0, paddingRight: 4 },
    specLabel: { fontSize: 7.5, color: TEXT_LIGHT, lineHeight: 1.35 },
    specValueOuter: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-end" },
    specValue: { flex: 1, minWidth: 0, fontSize: 7.5, fontFamily: "Helvetica-Bold", textAlign: "right", color: TEXT, lineHeight: 1.35 },
    specUnit: { fontSize: 7, width: 28, flexShrink: 0, marginLeft: 3, paddingTop: 0.5, textAlign: "right", color: TEXT_LIGHT },

    accessoriesText: { fontSize: 7.5, lineHeight: 1.35, color: TEXT_MED },
});

const SpecRow = ({ label, value, unit }) => {
    const display = value != null && value !== "" ? String(value) : "N/A";
    return (
        <View style={styles.specRow}>
            <View style={styles.specLabelCol}>
                <Text style={styles.specLabel}>{label}</Text>
            </View>
            <View style={styles.specValueOuter}>
                <Text style={styles.specValue}>{display}</Text>
                <Text style={styles.specUnit}>{unit || ""}</Text>
            </View>
        </View>
    );
};

const SpecGroup = ({ title, children }) => (
    <View style={styles.specGroup}>
        <Text style={styles.specGroupTitle}>{title}</Text>
        {children}
    </View>
);

const RefurbishedDatasheet = ({ product, logoDataUrl }) => {
    const p = product || {};
    const mainImg = p.mainImageDataUrl || p.images?.[0] || null;
    const areaOfUse = p.areaOfUse || "";
    const features = p.features || [];

    const ledTech = p.ledTechnology === "Other" && p.ledTechnologyOther ? p.ledTechnologyOther : p.ledTechnology;
    const controlSystem = p.controlSystem === "Other" && p.controlSystemOther ? p.controlSystemOther : p.controlSystem;
    const price =
        p.sellingPrice != null && p.sellingPrice !== "" ? `$ ${Number(p.sellingPrice).toLocaleString()}` : null;

    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap={false}>
                <View style={styles.header} fixed>
                    {logoDataUrl ? <Image src={logoDataUrl} style={styles.headerLogo} /> : <Text style={styles.headerFallback}>LOGO</Text>}
                </View>

                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        Proledall. All rights reserved. Refurbished (used) product. Delivery options, technical specifications, etc. subject to change without notice.
                    </Text>
                    <Text style={styles.footerDate}>{date}</Text>
                </View>

                {/* Hero: image card + white info card */}
                <View style={styles.topSection}>
                    <View style={styles.topLeft}>
                        <View style={styles.imageCard}>
                            {mainImg ? (
                                <Image src={mainImg} style={styles.productImage} />
                            ) : (
                                <View style={styles.noImage}>
                                    <Text style={styles.noImageText}>No Image</Text>
                                </View>
                            )}
                            {p.levelOfQuality ? <Text style={styles.qualityBadge}>{p.levelOfQuality}</Text> : null}
                        </View>
                    </View>

                    <View style={styles.topRight}>
                        <View style={styles.infoCard}>
                            <Text style={styles.productName}>{p.serie || "Product"}</Text>
                            <Text style={styles.productNumber}>{p.productNumber || ""}</Text>

                            <View style={styles.badgeRow}>
                                {areaOfUse ? <Text style={styles.areaBadge}>{areaOfUse}</Text> : null}
                                <Text style={styles.refurbBadge}>Refurbished</Text>
                            </View>

                            {price ? <Text style={styles.price}>{price}</Text> : null}

                            {p.productDescription ? <Text style={styles.description}>{p.productDescription}</Text> : null}

                            {features.length > 0 ? (
                                <View>
                                    <Text style={styles.featuresHeading}>Features</Text>
                                    {features.map((f, i) => (
                                        <View key={`f-${i}`} style={styles.featureRow}>
                                            <Text style={styles.featureBullet}>•</Text>
                                            <Text style={styles.featureText}>{f}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : null}
                        </View>
                    </View>
                </View>

                {/* Single Specifications accordion with two sub-grids */}
                <View style={styles.accordion} wrap={false}>
                    <View style={styles.accordionHeader}>
                        <Text style={styles.accordionTitle}>Specifications</Text>
                    </View>
                    <View style={styles.accordionContent}>
                        {/* Left grid */}
                        <View style={styles.gridCol}>
                            <SpecGroup title="Basic Information">
                                <SpecRow label="OEM / Brand" value={p.oemBrand} />
                                <SpecRow label="Product Type" value={p.productType} />
                                <SpecRow label="Area of Use" value={areaOfUse} />
                                <SpecRow label="Design" value={p.design} />
                                <SpecRow label="Special Types" value={p.specialTypes} />
                                <SpecRow label="Year of Construction" value={p.yearOfConstruction} />
                                <SpecRow label="Operating Hours" value={p.operatingHours} unit="h" />
                                <SpecRow label="Service" value={p.service} />
                            </SpecGroup>

                            <SpecGroup title="Physical Specifications">
                                <SpecRow label="Pixel Pitch" value={p.pixelPitch} unit="mm" />
                                <SpecRow label="Cabinet Width" value={p.cabinetWidth} unit="mm" />
                                <SpecRow label="Cabinet Height" value={p.cabinetHeight} unit="mm" />
                                <SpecRow label="Cabinet Resolution (H)" value={p.cabinetResolutionHorizontal} unit="px" />
                                <SpecRow label="Cabinet Resolution (V)" value={p.cabinetResolutionVertical} unit="px" />
                                <SpecRow label="Weight (No Pkg.)" value={p.weightWithoutPackaging} unit="kg" />
                                <SpecRow label="IP Rating" value={p.ipRating} />
                            </SpecGroup>

                            <SpecGroup title="LED Specifications">
                                <SpecRow label="LED Technology" value={ledTech} />
                                <SpecRow label="LED / Chip Manuf." value={p.ledChipManufacturer} />
                                <SpecRow label="Chip Bonding" value={p.chipBonding} />
                                <SpecRow label="Brightness" value={p.brightnessValue} unit="nit" />
                                <SpecRow label="LED Driver" value={p.ledDriver} />
                            </SpecGroup>
                        </View>

                        {/* Right grid */}
                        <View style={styles.gridCol}>
                            <SpecGroup title="Electrical & Performance">
                                <SpecRow label="Input Voltage" value={p.inputVoltage} unit="V(AC)" />
                                <SpecRow label="Power Max" value={p.powerConsumptionMax} unit="W/m²" />
                                <SpecRow label="Power Typical" value={p.powerConsumptionTypical} unit="W/m²" />
                                <SpecRow label="Refresh Rate" value={p.refreshRate} unit="Hz" />
                                <SpecRow label="Scan Rate" value={p.scanRate} />
                                <SpecRow label="Control System" value={controlSystem} />
                                <SpecRow label="Controller" value={p.controller} />
                            </SpecGroup>

                            <SpecGroup title="Mounting & Logistics">
                                <SpecRow label="Hanging-Brackets" value={p.hangingBrackets} />
                                <SpecRow label="Stacking System" value={p.stackingSystem} />
                                <SpecRow label="Flight Cases" value={p.flightCases} />
                                <SpecRow label="Stock Location" value={p.stockLocation} />
                                <SpecRow label="Stock" value={p.stockPieces} unit="pcs" />
                                <SpecRow label="Leadtime" value={p.leadtimeDays} unit="days" />
                            </SpecGroup>

                            {p.accessories ? (
                                <SpecGroup title="Accessories">
                                    <Text style={styles.accessoriesText}>{p.accessories}</Text>
                                </SpecGroup>
                            ) : null}
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export async function generateRefurbishedDatasheetReactPDF(product, options = {}) {
    const buffer = await renderToBuffer(<RefurbishedDatasheet product={product} logoDataUrl={options.logoDataUrl} />);
    return Buffer.from(buffer);
}

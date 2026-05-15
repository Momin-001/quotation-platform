import React from "react";
import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
    Font,
    renderToBuffer,
} from "@react-pdf/renderer";

Font.registerHyphenationCallback((word) => [word]);

const BLUE_BG = "#dbeafe";
const GRAY_BG = "#f3f4f6";
const TEXT = "#111827";
const TEXT_MED = "#1f2937";
const TEXT_LIGHT = "#374151";

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 8,
        lineHeight: 1.35,
        color: TEXT,
        paddingTop: 54,
        paddingBottom: 34,
        paddingHorizontal: 24,
    },
    header: {
        position: "absolute",
        top: 8,
        left: 24,
        right: 24,
        height: 40,
        flexDirection: "row",
        alignItems: "center",
    },
    headerLogo: { height: 34 },
    headerFallback: { fontSize: 14, fontFamily: "Helvetica-Bold" },
    footer: {
        position: "absolute",
        bottom: 8,
        left: 24,
        right: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingTop: 3,
        borderTopWidth: 0.4,
        borderTopColor: TEXT_LIGHT,
    },
    footerText: { fontSize: 6, color: TEXT_LIGHT, maxWidth: "86%" },
    footerDate: { fontSize: 6, fontFamily: "Helvetica-Bold", color: TEXT_LIGHT },

    topSection: { flexDirection: "row", marginBottom: 8 },
    topLeft: { width: "40%", marginRight: 12 },
    topRight: { width: "60%" },
    productImage: { width: "100%", maxHeight: 240, objectFit: "contain", borderRadius: 4 },
    noImage: {
        width: "100%",
        height: 100,
        backgroundColor: GRAY_BG,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    noImageText: { fontSize: 9, color: TEXT_LIGHT },

    productName: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 1, lineHeight: 1.15 },
    productNumber: { fontSize: 9, fontFamily: "Helvetica-Bold", color: TEXT_MED, marginBottom: 4 },
    areaOfUseBadge: {
        alignSelf: "flex-start",
        backgroundColor: TEXT_MED,
        color: "#ffffff",
        fontSize: 7,
        fontFamily: "Helvetica-Bold",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
        marginBottom: 4,
    },
    description: { fontSize: 7.5, lineHeight: 1.4, marginBottom: 5, color: TEXT },
    featuresHeading: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 2, color: TEXT },
    featureRow: { flexDirection: "row", marginBottom: 1, paddingLeft: 1 },
    featureBullet: { fontSize: 8, marginRight: 4, color: TEXT_LIGHT },
    featureText: { fontSize: 7.5, flex: 1, lineHeight: 1.3 },

    iconsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
    iconCard: { width: 52, alignItems: "center", marginRight: 4, marginBottom: 4 },
    iconFrame: {
        width: 46,
        height: 36,
        borderWidth: 0.5,
        borderColor: TEXT_MED,
        borderRadius: 4,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
    },
    iconImg: { width: 28, height: 28, objectFit: "contain" },
    iconFallback: { fontSize: 5, textAlign: "center", color: TEXT_LIGHT },
    iconDivider: { width: "100%", borderTopWidth: 0.5, borderTopColor: TEXT_MED, marginTop: 2 },
    iconLabel: {
        fontSize: 5.5,
        fontFamily: "Helvetica-Bold",
        textAlign: "center",
        marginTop: 1,
        lineHeight: 1.15,
        color: TEXT,
    },

    specsColumns: { flexDirection: "row", marginTop: 6, gap: 10 },
    specCol: { flex: 1 },
    specColLeft: { flex: 1, marginRight: 10 },

    section: { marginBottom: 5, borderRadius: 4, overflow: "hidden" },
    sectionHeader: { backgroundColor: BLUE_BG, paddingHorizontal: 8, paddingVertical: 3 },
    sectionTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: TEXT },
    sectionContent: { backgroundColor: GRAY_BG, paddingHorizontal: 8, paddingVertical: 3 },

    specRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 1.5,
    },
    /** Fixed share so long values never draw over the label (value column wraps). */
    specLabelCol: {
        width: "42%",
        flexShrink: 0,
        paddingRight: 4,
    },
    specLabel: { fontSize: 7.5, color: TEXT_MED, lineHeight: 1.35 },
    specValueOuter: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-end",
    },
    specValue: {
        flex: 1,
        minWidth: 0,
        fontSize: 7.5,
        fontFamily: "Helvetica-Bold",
        textAlign: "right",
        color: TEXT,
        lineHeight: 1.35,
    },
    specUnit: {
        fontSize: 7,
        width: 30,
        flexShrink: 0,
        marginLeft: 3,
        paddingTop: 0.5,
        textAlign: "right",
        color: TEXT_LIGHT,
    },

    certWrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 3 },
    certImg: { height: 20, marginRight: 4, marginBottom: 2, objectFit: "contain" },
    certName: { fontSize: 7, marginRight: 6, marginBottom: 2 },
});

function formatEnum(value) {
    if (!value) return "N/A";
    return value
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

const SpecRow = ({ label, value, unit }) => {
    const display = value != null && value !== "" ? String(value) : "N/A";
    const hasUnit = unit != null && String(unit).trim() !== "";
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

const Section = ({ title, children }) => (
    <View style={styles.section} wrap={false}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>{children}</View>
    </View>
);

const ProductDatasheet = ({ product, logoDataUrl }) => {
    const p = product || {};
    const mainImg = p.mainImageDataUrl || p.images?.[0] || null;
    const areaOfUse = p.areaOfUse || p.categoryName || "";
    const features = p.features || [];
    const icons = p.productIcons || [];
    const certs = p.productCertificates || [];

    const monitoringFn = p.monitoringFunctionEn || p.monitoringFunctionDe || "";
    const supportDuring = p.supportDuringWarrantyEn || p.supportDuringWarrantyDe || "";
    const supportAfter = p.supportAfterWarrantyEn || p.supportAfterWarrantyDe || "";

    const scanRate = p.scanRateDenominator
        ? `1/${p.scanRateDenominator}${p.scanRateNumerator && p.scanRateNumerator !== 1 ? ` (${p.scanRateNumerator}/${p.scanRateDenominator})` : ""}`
        : null;

    const greyscale =
        p.greyscaleProcessing === "other" && p.greyscaleProcessingOther
            ? p.greyscaleProcessingOther
            : p.greyscaleProcessing;

    const controlSystem =
        p.controlSystem === "other" && p.controlSystemOther ? p.controlSystemOther : formatEnum(p.controlSystem);

    const numColours = p.numberOfColours ? `${p.numberOfColours} billion` : null;
    const contrast = p.contrastRatioNumerator
        ? `${p.contrastRatioNumerator}:${p.contrastRatioDenominator || 1}`
        : null;

    const hasCerts =
        certs.length > 0 ||
        (p.additionalCertification && String(p.additionalCertification).trim()) ||
        (p.emc && String(p.emc).trim()) ||
        (p.safety && String(p.safety).trim());

    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap={false}>
                {/* Fixed Header */}
                <View style={styles.header} fixed>
                    {logoDataUrl ? (
                        <Image src={logoDataUrl} style={styles.headerLogo} />
                    ) : (
                        <Text style={styles.headerFallback}>LOGO</Text>
                    )}
                </View>

                {/* Fixed Footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        Proledall. All rights reserved. Delivery options, technical specifications, etc. Subject to
                        change without notice. Errors and omissions excepted.
                    </Text>
                    <Text style={styles.footerDate}>{date}</Text>
                </View>

                {/* Hero Section */}
                <View style={styles.topSection}>
                    <View style={styles.topLeft}>
                        {mainImg ? (
                            <Image src={mainImg} style={styles.productImage} />
                        ) : (
                            <View style={styles.noImage}>
                                <Text style={styles.noImageText}>No Image</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.topRight}>
                        <Text style={styles.productName}>{p.productName || "Product"}</Text>
                        <Text style={styles.productNumber}>{p.productNumber || ""}</Text>

                        {areaOfUse ? <Text style={styles.areaOfUseBadge}>{areaOfUse.toUpperCase()}</Text> : null}

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

                        {icons.length > 0 ? (
                            <View style={styles.iconsGrid}>
                                {icons.map((icon, i) => {
                                    const src = icon.imageDataUrl || icon.imageUrl || null;
                                    return (
                                        <View key={`ic-${i}`} style={styles.iconCard}>
                                            <View style={styles.iconFrame}>
                                                {src ? (
                                                    <Image src={src} style={styles.iconImg} />
                                                ) : (
                                                    <Text style={styles.iconFallback}>{icon.name || "—"}</Text>
                                                )}
                                            </View>
                                            <View style={styles.iconDivider} />
                                            <Text style={styles.iconLabel}>{icon.name || ""}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Specification Columns */}
                <View style={styles.specsColumns}>
                    {/* Left Column */}
                    <View style={styles.specColLeft}>
                        <Section title="Basic Information">
                            <SpecRow label="Product Type" value={p.productType} />
                            <SpecRow label="Design" value={p.design} />
                            <SpecRow label="Special Types" value={p.specialTypes} />
                            <SpecRow
                                label="Application"
                                value={Array.isArray(p.application) ? p.application.join(", ") : p.application}
                            />
                            <SpecRow label="Category" value={areaOfUse} />
                            <SpecRow label="Service" value={p.support} />
                        </Section>

                        <Section title="Physical Specifications">
                            <SpecRow label="Pixel Pitch" value={p.pixelPitch} unit="mm" />
                            <SpecRow label="Pixel Technology" value={p.pixelTechnology} />
                            <SpecRow label="Cabinet Width" value={p.cabinetWidth} unit="mm" />
                            <SpecRow label="Cabinet Height" value={p.cabinetHeight} unit="mm" />
                            <SpecRow label="Cabinet Resolution (H)" value={p.cabinetResolutionHorizontal} unit="px" />
                            <SpecRow label="Cabinet Resolution (V)" value={p.cabinetResolutionVertical} unit="px" />
                            <SpecRow
                                label="Pixel Density"
                                value={p.pixelDensity != null ? String(p.pixelDensity) : null}
                                unit="px/m²"
                            />
                            <SpecRow label="Weight (No Pkg.)" value={p.weightWithoutPackaging} unit="kg" />
                            <SpecRow label="IP Rating" value={p.ipRating} />
                        </Section>

                        <Section title="Electrical Specifications">
                            <SpecRow label="Input Voltage" value={p.inputVoltage} unit="V(AC)" />
                            <SpecRow label="Power Max" value={p.powerConsumptionMax} unit="W" />
                            <SpecRow label="Power Typical" value={p.powerConsumptionTypical} unit="W" />
                            <SpecRow label="Driving Method" value={formatEnum(p.drivingMethod)} />
                            <SpecRow label="Current Gain Ctrl." value={p.currentGainControl} />
                            <SpecRow label="Power Redundancy" value={formatEnum(p.powerRedundancy)} />
                            <SpecRow label="Memory on Module" value={formatEnum(p.memoryOnModule)} />
                            <SpecRow label="Smart Module" value={formatEnum(p.smartModule)} />
                            <SpecRow label="MTBF Power Supply" value={p.mtbfPowerSupply} unit="hours" />
                            <SpecRow label="Control System" value={controlSystem} />
                            <SpecRow label="Receiving Card" value={p.receivingCard} />
                        </Section>

                        <Section title="Operating Conditions">
                            <SpecRow label="Operating Temp." value={p.operatingTemperature} unit="°C" />
                            <SpecRow label="Operating Humidity" value={p.operatingHumidity} unit="%" />
                            <SpecRow label="Cooling" value={formatEnum(p.cooling)} />
                            <SpecRow label="Heat Dissipation" value={p.heatDissipation} unit="W" />
                            <SpecRow label="Monitoring Func." value={monitoringFn} />
                        </Section>
                    </View>

                    {/* Right Column */}
                    <View style={styles.specCol}>
                        <Section title="LED Specifications">
                            <SpecRow label="LED Technology" value={formatEnum(p.ledTechnology)} />
                            <SpecRow label="Pixel Configuration" value={p.pixelConfiguration} />
                            <SpecRow
                                label="LED Lifespan"
                                value={p.ledLifespan != null ? String(p.ledLifespan) : null}
                                unit="hours"
                            />
                            <SpecRow label="Chip Bonding" value={formatEnum(p.chipBonding)} />
                            <SpecRow label="LED Chip Manuf." value={p.ledChipManufacturer} />
                            <SpecRow label="LED Modules/Cab." value={p.ledModulesPerCabinet} />
                        </Section>

                        <Section title="Display Performance">
                            <SpecRow label="Refresh Rate" value={p.refreshRate} unit="Hz" />
                            <SpecRow label="Brightness" value={p.brightnessValue} unit="cd/m²" />
                            <SpecRow label="Scan Rate" value={scanRate} />
                            <SpecRow label="Video Rate" value={p.videoRate} />
                            <SpecRow label="Colour Depth" value={p.colourDepth} unit="bit" />
                            <SpecRow label="Greyscale Proc." value={greyscale} />
                            <SpecRow label="Number of Colours" value={numColours} />
                            <SpecRow label="View Angle (H)" value={p.viewingAngleHorizontal} />
                            <SpecRow label="View Angle (V)" value={p.viewingAngleVertical} />
                            <SpecRow label="Contrast Ratio" value={contrast} />
                        </Section>

                        <Section title="Calibration">
                            <SpecRow label="Calibration Method" value={formatEnum(p.calibrationMethod)} />
                            <SpecRow label="White Point Cal." value={p.whitePointCalibration} />
                            <SpecRow label="DCI-P3 Coverage" value={p.dciP3Coverage} />
                        </Section>

                        {hasCerts ? (
                            <Section title="Certifications & Standards">
                                {certs.length > 0 ? (
                                    <View style={styles.certWrap}>
                                        {certs.map((c, i) => {
                                            const src = c.imageDataUrl || c.imageUrl || null;
                                            return src ? (
                                                <Image key={`cert-${i}`} src={src} style={styles.certImg} />
                                            ) : (
                                                <Text key={`cert-${i}`} style={styles.certName}>
                                                    {c.name}
                                                </Text>
                                            );
                                        })}
                                    </View>
                                ) : null}
                                <SpecRow label="Additional Cert." value={p.additionalCertification} />
                                <SpecRow label="EMC" value={p.emc} />
                                <SpecRow label="Safety" value={p.safety} />
                            </Section>
                        ) : null}

                        <Section title="Warranty & Support">
                            <SpecRow label="Warranty Period" value={p.warrantyPeriod} unit="months" />
                            <SpecRow label="Support During Warranty" value={supportDuring} />
                            <SpecRow label="Support After Warranty" value={supportAfter} />
                        </Section>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export async function generateProductDatasheetReactPDF(product, options = {}) {
    const buffer = await renderToBuffer(
        <ProductDatasheet product={product} logoDataUrl={options.logoDataUrl} />
    );
    return Buffer.from(buffer);
}

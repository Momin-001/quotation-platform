/**
 * Shared watermark layer for generated PDFs (quotation + product datasheet).
 *
 * The mark is drawn as the LAST child of a Page so it sits above the opaque
 * cards and table fills those documents use; drawn underneath it would be
 * hidden wherever a white card covers the page. Opacity is kept low enough
 * that body text stays readable.
 */
import React from "react";
import { View, Image, StyleSheet } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";

/** Brand mark, read once at module load. Null when the asset is missing. */
let defaultWatermarkSrc = null;
try {
    const watermarkPath = path.join(process.cwd(), "public", "logo.png");
    defaultWatermarkSrc = `data:image/png;base64,${fs.readFileSync(watermarkPath, "base64")}`;
} catch {
    // logo.png missing or unreadable — PDFs simply render without a watermark
}

export { defaultWatermarkSrc };

const styles = StyleSheet.create({
    layer: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    image: { objectFit: "contain" },
});

/**
 * @param src      data URL to draw; falls back to the bundled brand mark
 * @param opacity  0-1; low values keep underlying text legible
 * @param width    percentage of page width the mark spans
 * @param fixed    repeat on every page the parent Page spills onto
 */
export function Watermark({ src, opacity = 0.07, width = "62%", fixed = true }) {
    const resolved = src || defaultWatermarkSrc;
    if (!resolved) return null;

    return (
        <View style={styles.layer} fixed={fixed}>
            <Image src={resolved} style={[styles.image, { width, opacity }]} />
        </View>
    );
}

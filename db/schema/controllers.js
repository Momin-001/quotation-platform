import { pgTable, uuid, text, timestamp, integer, boolean, pgEnum, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { quotationOptionalItems, quotationAdditionalItems } from "./quotations";
import { productImages } from "./productImages";


export const BrandSystemEnum = pgEnum("brand_system", ["Colorlight", "Novastar", "Brompton", "LINSN", "Other"]);

export const controllers = pgTable("controllers", {
    id: uuid("id").defaultRandom().primaryKey(),
    interfaceName: text("interface_name"),
    brandName: BrandSystemEnum("brand_name"),
    controllerNumber: text("controller_number").unique(),
    brandNameOther: text("brand_name_other"),
    // Capacity
    pixelCapacity: integer("pixel_capacity"),
    maxWidthHeight: integer("max_width_height"), // px
    // Input Ports
    dp12: integer("dp_1_2").default(0),
    hdmi20: integer("hdmi_2_0").default(0),
    hdmi13: integer("hdmi_1_3").default(0),
    dviSingleLink: integer("dvi_single_link").default(0),
    sdi12g: integer("sdi_12g").default(0),
    sdi3g: integer("sdi_3g").default(0),
    opticalFiberIn10g: integer("optical_fiber_in_10g").default(0),
    usb30MediaPlayback: integer("usb_3_0_media_playback").default(0),
    // Output Ports
    gigabitEthernetRj45: integer("gigabit_ethernet_rj45").default(0),
    opticalFiberOut10g: integer("optical_fiber_out_10g").default(0),
    output5g: text("output_5g"), // "Yes" / "No"
    // Monitoring Ports
    hdmi13Monitoring: integer("hdmi_1_3_monitoring").default(0),
    connector3dMiniDin4: integer("connector_3d_mini_din_4").default(0),
    // Loop Ports
    hdmi20Loop: integer("hdmi_2_0_loop").default(0),
    sdi12gLoop: integer("sdi_12g_loop").default(0),
    sdi3gLoop: integer("sdi_3g_loop").default(0),
    dviLoop: integer("dvi_loop").default(0),
    // Audio & Control Ports
    audioInput35mm: integer("audio_input_3_5mm").default(0),
    audioOutput35mm: integer("audio_output_3_5mm").default(0),
    ethernetControlPort: integer("ethernet_control_port").default(0),
    usbTypeBPcControl: integer("usb_type_b_pc_control").default(0),
    usbTypeACascading: integer("usb_type_a_cascading").default(0),
    genlockInLoop: integer("genlock_in_loop").default(0),
    rs232: integer("rs_232").default(0),
    // Features
    maximumLayers: text("maximum_layers"),
    layerScaling: text("layer_scaling"), // "Yes" / "No"
    hdrSupport: text("hdr_support"), // e.g. "HDR10 / HLG"
    colorDepthBit: integer("color_depth_bit"),
    lowLatency: text("low_latency"), // "Yes" / "No"
    fibreConverterMode: text("fibre_converter_mode"), // "Yes" / "No"
    vCanSupport: text("v_can_support"), // "Yes" / "No"
    backupMode: text("backup_mode"), // e.g. "Device & Port"
    genlockSync: text("genlock_sync"), // "Yes" / "No"
    multiViewerMvr: text("multi_viewer_mvr"), // "Yes" / "No"
    usbPlayback: text("usb_playback"), // "Yes" / "No"
    support3d: text("support_3d"), // "Yes" / "No"
    downloadUrl: text("download_url"),
    pricePerControllerUsd: decimal("price_per_controller_usd", { precision: 12, scale: 2 }),
    stockPieces: integer("stock_pieces"),
    leadtimeDays: integer("leadtime_days"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const controllersRelations = relations(controllers, ({ many }) => ({
    quotationOptionalItems: many(quotationOptionalItems),
    quotationAdditionalItems: many(quotationAdditionalItems),
    images: many(productImages),
}));

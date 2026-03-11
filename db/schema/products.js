import { pgTable, uuid, text, timestamp, integer, decimal, pgEnum, boolean, jsonb } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { productImages } from "./productImages";
import { productCertificates } from "./productCertificates";
import { productProductIcons } from "./productProductIcons";
import { productFeatures } from "./productFeatures";
import { relations } from "drizzle-orm";
import { enquiryItems } from "./enquiries";
import { quotationItems, quotationOptionalItems } from "./quotations";

// ENUM definitions
export const productTypeEnum = pgEnum("product_type", ["AIO Systems", "LED Display Single Cabinet"]);
export const designEnum = pgEnum("design", ["Fix", "Mobil"]);
export const specialTypesEnum = pgEnum("special_types", ["Transparent", "Curved", "Floor", "Other"]);
export const applicationEnum = pgEnum("application", [
    "DOOH",
    "Indoor Signage",
    "Home Theater",
    "Stadium Scoreboard",
    "Video Cube",
    "Conference",
    "Stadium Ribbons",
    "Corporate Design",
    "Staging",
    "Virtual Production"
]);
export const pixelConfigurationEnum = pgEnum("pixel_configuration", ["1R1G1B", "2R1G1B"]);
export const pixelTechnologyEnum = pgEnum("pixel_technology", ["Real", "Virtual (Quadruple)", "Virtual (Triple)"]);
export const ledTechnologyEnum = pgEnum("led_technology", ["SMD", "SMD+GOB", "IMD", "COB", "DIP", "LOB", "Other"]);
export const chipBondingEnum = pgEnum("chip_bonding", ["Gold Wire", "Copper Wire", "Flip-Chip"]);
export const colourDepthEnum = pgEnum("colour_depth", ["8", "10", "12"]);
export const currentGainControlEnum = pgEnum("current_gain_control", ["4", "8"]);
export const videoRateEnum = pgEnum("video_rate", ["50/60", "120", "240"]);
export const calibrationMethodEnum = pgEnum("calibration_method", [
    "No Calibration",
    "Multiple Layers Chroma",
    "Multiple Layers Brightness",
    "Brightness",
    "Chroma",
    "Other"
]);
export const drivingMethodEnum = pgEnum("driving_method", ["Common Anode", "Common Cathode"]);
export const controlSystemEnum = pgEnum("control_system", ["Colorlight", "Novastar", "Brompton", "LINSN", "Other"]);
export const greyscaleProcessingEnum = pgEnum("greyscale_processing", ["<16", "16", "18+", "22+", "Other"]);
export const coolingEnum = pgEnum("cooling", ["Convection", "Fan"]);
export const yesNoEnum = pgEnum("yes_no", ["Yes", "No"]);
export const supportEnum = pgEnum("support", ["Frontendside", "Backside", "Frontside and Backside"]);

export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    productDescription: text("product_description"),
    // String fields (Point 1)
    productName: text("product_name").notNull(),
    productNumber: text("product_number").notNull(),

    viewingAngleHorizontal: text("viewing_angle_horizontal"),
    viewingAngleVertical: text("viewing_angle_vertical"),
    brightnessControl: text("brightness_control"),
    dciP3Coverage: text("dci_p3_coverage"),
    operatingTemperature: text("operating_temperature"),
    operatingHumidity: text("operating_humidity"),
    ipRating: text("ip_rating"),
    ledModulesPerCabinet: text("led_modules_per_cabinet"),
    ledChipManufacturer: text("led_chip_manufacturer"),
    whitePointCalibration: text("white_point_calibration"),
    inputVoltage: text("input_voltage"),
    receivingCard: text("receiving_card"),
    heatDissipation: text("heat_dissipation"),
    monitoringFunctionEn: text("monitoring_function_en"),
    additionalCertification: text("additional_certification"),
    emc: text("emc"),
    safety: text("safety"),
    supportDuringWarrantyEn: text("support_during_warranty_en"),
    supportAfterWarrantyEn: text("support_after_warranty_en"),
    
    // Dropdown Fields (ENUMs - Point 2)
    productType: productTypeEnum("product_type"),
    design: designEnum("design"),
    specialTypes: specialTypesEnum("special_types"),
    specialTypesOther: text("special_types_other"),
    application: text("application").array(),
    pixelPitch: decimal("pixel_pitch", { precision: 10, scale: 2 }),
    pixelConfiguration: pixelConfigurationEnum("pixel_configuration"),
    pixelTechnology: pixelTechnologyEnum("pixel_technology"),
    ledTechnology: ledTechnologyEnum("led_technology"),
    ledTechnologyOther: text("led_technology_other"),
    chipBonding: chipBondingEnum("chip_bonding"),
    colourDepth: colourDepthEnum("colour_depth"),
    currentGainControl: currentGainControlEnum("current_gain_control"),
    videoRate: videoRateEnum("video_rate"),
    brightnessValue: text("brightness_value"),
    calibrationMethod: calibrationMethodEnum("calibration_method"),
    calibrationMethodOther: text("calibration_method_other"),
    drivingMethod: drivingMethodEnum("driving_method"),
    controlSystem: controlSystemEnum("control_system"),
    controlSystemOther: text("control_system_other"),
    cooling: coolingEnum("cooling"),
    powerRedundancy: yesNoEnum("power_redundancy"),
    memoryOnModule: yesNoEnum("memory_on_module"),
    smartModule: yesNoEnum("smart_module"),
    support: supportEnum("support"),
    
    // Foreign Key
    areaOfUseId: uuid("area_of_use_id").references(() => categories.id, { onDelete: "cascade" }),
    
    // Decimal fields
    cabinetWidth: decimal("cabinet_width", { precision: 10, scale: 2 }),
    cabinetHeight: decimal("cabinet_height", { precision: 10, scale: 2 }),
    weightWithoutPackaging: decimal("weight_without_packaging", { precision: 10, scale: 2 }),
    
    // Integer fields (Point 3)
    refreshRate: integer("refresh_rate"),
    scanRateNumerator: integer("scan_rate_numerator").default(1),
    scanRateDenominator: integer("scan_rate_denominator"),
    contrastRatioNumerator: integer("contrast_ratio_numerator"),
    contrastRatioDenominator: integer("contrast_ratio_denominator"),
    cabinetResolutionHorizontal: integer("cabinet_resolution_horizontal"),
    cabinetResolutionVertical: integer("cabinet_resolution_vertical"),
    pixelDensity: integer("pixel_density"),
    ledLifespan: integer("led_lifespan"),
    greyscaleProcessing: greyscaleProcessingEnum("greyscale_processing"),
    greyscaleProcessingOther: text("greyscale_processing_other"),
    numberOfColours: integer("number_of_colours"),
    mtbfPowerSupply: integer("mtbf_power_supply"),
    
    // Power & Performance
    powerConsumptionMax: integer("power_consumption_max"),
    powerConsumptionTypical: integer("power_consumption_typical"),
    warrantyPeriod: integer("warranty_period"),
    
    // OEM, components, pricing & stock
    oemBrand: text("oem_brand"),
    ledDriver: text("led_driver"),
    powerSupply: text("power_supply"),
    pricePerCabinetUsd: decimal("price_per_cabinet_usd", { precision: 12, scale: 2 }),
    pricePerMetreSquareUsd: decimal("price_per_metre_square_usd", { precision: 12, scale: 2 }),
    profitMargin: decimal("profit_margin", { precision: 12, scale: 2 }),
    stockPieces: integer("stock_pieces"),
    leadtimeDays: integer("leadtime_days"),
    notes: text("notes"),
    
    // PDF document uploads
    installationManualUrl: text("installation_manual_url"),
    installationManualPublicId: text("installation_manual_public_id"),
    maintenanceGuideUrl: text("maintenance_guide_url"),
    maintenanceGuidePublicId: text("maintenance_guide_public_id"),
    certificatesPdfUrl: text("certificates_pdf_url"),
    certificatesPdfPublicId: text("certificates_pdf_public_id"),

    // Active status – products imported via Excel are inactive until admin adds images
    isActive: boolean("is_active").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
    areaOfUse: one(categories, {
        fields: [products.areaOfUseId],
        references: [categories.id],
    }),
    images: many(productImages),
    productCertificates: many(productCertificates),
    productProductIcons: many(productProductIcons),
    features: many(productFeatures),
    enquiryItems: many(enquiryItems),
    quotationItems: many(quotationItems),
    quotationOptionalItems: many(quotationOptionalItems),
}));
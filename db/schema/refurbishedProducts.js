import { pgTable, uuid, text, timestamp, integer, decimal, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories } from "./categories";
import { refurbishedProductImages } from "./refurbishedProductImages";
import { refurbishedProductFeatures } from "./refurbishedProductFeatures";
import { enquiryItems } from "./enquiries";
import { quotationItems } from "./quotations";
// Reuse shared enums (leaf module — avoids circular-import issues with products/enquiries/quotations)
import { designEnum, chipBondingEnum, controlSystemEnum } from "./enums";

// ENUM definitions (distinct Postgres type names so they don't clash with product enums)
export const refurbProductTypeEnum = pgEnum("refurb_product_type", ["Complete System", "LED Display Single Cabinet"]);
export const refurbSpecialTypesEnum = pgEnum("refurb_special_types", ["Standard", "Transparent", "Curved", "Floor", "LED pendant"]);
export const refurbLedTechnologyEnum = pgEnum("refurb_led_technology", ["SMD", "SMD+GOB", "IMD", "COB", "DIP", "LOB", "MIP", "Other"]);
export const refurbServiceEnum = pgEnum("refurb_service", ["Frontside and Backside", "Frontside", "Backside"]);
export const refurbLevelOfQualityEnum = pgEnum("refurb_level_of_quality", ["Okay", "Good", "Excellent"]);
export const yesNoEnum = pgEnum("yes_no", ["Yes", "No"]);

export const refurbishedProducts = pgTable("refurbished_products", {
    id: uuid("id").defaultRandom().primaryKey(),

    // Identity / descriptive
    serie: text("serie").notNull(),
    productNumber: text("product_number").notNull(),
    slug: text("slug").notNull().unique(),
    productDescription: text("product_description"),
    oemBrand: text("oem_brand"),

    // SEO meta tags (bilingual, optional — fall back to serie/description)
    metaTitleEn: text("meta_title_en"),
    metaTitleDe: text("meta_title_de"),
    metaDescriptionEn: text("meta_description_en"),
    metaDescriptionDe: text("meta_description_de"),

    // Dropdown fields
    productType: refurbProductTypeEnum("product_type"),
    // Area of use — reuse categories so related NEW products can be matched by area of use
    areaOfUseId: uuid("area_of_use_id").references(() => categories.id, { onDelete: "cascade" }),
    design: designEnum("design"),
    specialTypes: refurbSpecialTypesEnum("special_types"),

    // Construction / usage
    yearOfConstruction: integer("year_of_construction"),
    operatingHours: text("operating_hours"),

    // Physical specs
    pixelPitch: decimal("pixel_pitch", { precision: 10, scale: 2 }),
    cabinetWidth: decimal("cabinet_width", { precision: 10, scale: 2 }),
    cabinetHeight: decimal("cabinet_height", { precision: 10, scale: 2 }),
    cabinetResolutionHorizontal: integer("cabinet_resolution_horizontal"),
    cabinetResolutionVertical: integer("cabinet_resolution_vertical"),
    weightWithoutPackaging: decimal("weight_without_packaging", { precision: 10, scale: 2 }),

    // LED specs
    ledTechnology: refurbLedTechnologyEnum("led_technology"),
    ledTechnologyOther: text("led_technology_other"),
    ledChipManufacturer: text("led_chip_manufacturer"),
    chipBonding: chipBondingEnum("chip_bonding"),
    brightnessValue: text("brightness_value"),
    ledDriver: text("led_driver"),

    // Electrical / performance
    inputVoltage: text("input_voltage"),
    powerConsumptionMax: integer("power_consumption_max"),
    powerConsumptionTypical: integer("power_consumption_typical"),
    refreshRate: integer("refresh_rate"),
    scanRate: text("scan_rate"),

    // Control
    controlSystem: controlSystemEnum("control_system"),
    controlSystemOther: text("control_system_other"),
    controller: text("controller"),

    // Service / mounting
    ipRating: text("ip_rating"),
    service: refurbServiceEnum("service"),
    hangingBrackets: yesNoEnum("hanging_brackets"),
    stackingSystem: yesNoEnum("stacking_system"),
    flightCases: yesNoEnum("flight_cases"),
    accessories: text("accessories"),

    // Pricing & stock
    pricePerCabinetUsd: decimal("price_per_cabinet_usd", { precision: 12, scale: 2 }), // admin-only
    pricePerMetreSquareUsd: decimal("price_per_metre_square_usd", { precision: 12, scale: 2 }), // admin-only
    sellingPrice: decimal("selling_price", { precision: 12, scale: 2 }), // customer-facing
    stockLocation: text("stock_location"),
    stockPieces: integer("stock_pieces"),
    leadtimeDays: integer("leadtime_days"),
    notes: text("notes"), // admin-only
    levelOfQuality: refurbLevelOfQualityEnum("level_of_quality"),

    // Active status — inactive until admin adds at least one image
    isActive: boolean("is_active").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const refurbishedProductsRelations = relations(refurbishedProducts, ({ one, many }) => ({
    areaOfUse: one(categories, {
        fields: [refurbishedProducts.areaOfUseId],
        references: [categories.id],
    }),
    images: many(refurbishedProductImages),
    features: many(refurbishedProductFeatures),
    enquiryItems: many(enquiryItems),
    quotationItems: many(quotationItems),
}));

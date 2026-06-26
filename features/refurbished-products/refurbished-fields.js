// Maps the JSON `fields` payload from the admin form into refurbished_products DB columns.
// Enum columns are nullable, so empty/missing values must become null (never "").

const text = (v) => (v !== undefined && v !== null && v.toString().trim() !== "" ? v.toString().trim() : null);
const num = (v) => (v !== undefined && v !== null && v.toString().trim() !== "" ? String(v) : null); // decimal columns accept strings
const int = (v) => (v !== undefined && v !== null && v.toString().trim() !== "" ? parseInt(v) : null);

export function mapRefurbishedFields(body) {
    return {
        // Identity / descriptive
        serie: text(body.serie) || "",
        productDescription: text(body.productDescription),
        oemBrand: text(body.oemBrand),

        // SEO meta tags
        metaTitleEn: text(body.metaTitleEn),
        metaTitleDe: text(body.metaTitleDe),
        metaDescriptionEn: text(body.metaDescriptionEn),
        metaDescriptionDe: text(body.metaDescriptionDe),

        // Dropdowns (nullable enums)
        productType: text(body.productType),
        areaOfUseId: text(body.areaOfUseId),
        design: text(body.design),
        specialTypes: text(body.specialTypes),

        // Construction / usage
        yearOfConstruction: int(body.yearOfConstruction),
        operatingHours: text(body.operatingHours),

        // Physical specs
        pixelPitch: num(body.pixelPitch),
        cabinetWidth: num(body.cabinetWidth),
        cabinetHeight: num(body.cabinetHeight),
        cabinetResolutionHorizontal: int(body.cabinetResolutionHorizontal),
        cabinetResolutionVertical: int(body.cabinetResolutionVertical),
        weightWithoutPackaging: num(body.weightWithoutPackaging),

        // LED specs
        ledTechnology: text(body.ledTechnology),
        ledTechnologyOther: text(body.ledTechnologyOther),
        ledChipManufacturer: text(body.ledChipManufacturer),
        chipBonding: text(body.chipBonding),
        brightnessValue: text(body.brightnessValue),
        ledDriver: text(body.ledDriver),

        // Electrical / performance
        inputVoltage: text(body.inputVoltage),
        powerConsumptionMax: int(body.powerConsumptionMax),
        powerConsumptionTypical: int(body.powerConsumptionTypical),
        refreshRate: int(body.refreshRate),
        scanRate: text(body.scanRate),

        // Control
        controlSystem: text(body.controlSystem),
        controlSystemOther: text(body.controlSystemOther),
        controller: text(body.controller),

        // Service / mounting
        ipRating: text(body.ipRating),
        service: text(body.service),
        hangingBrackets: text(body.hangingBrackets),
        stackingSystem: text(body.stackingSystem),
        flightCases: text(body.flightCases),
        accessories: text(body.accessories),

        // Pricing & stock
        pricePerCabinetUsd: num(body.pricePerCabinetUsd),
        pricePerMetreSquareUsd: num(body.pricePerMetreSquareUsd),
        sellingPrice: num(body.sellingPrice),
        stockLocation: text(body.stockLocation),
        stockPieces: int(body.stockPieces),
        leadtimeDays: int(body.leadtimeDays),
        notes: text(body.notes),
        levelOfQuality: text(body.levelOfQuality),
    };
}

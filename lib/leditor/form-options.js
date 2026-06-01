/**
 * Canonical English values sent to the enquiries API.
 * UI labels come from messages (Leditor.opt* keys).
 */
export const INSTALLATION_SERVICE_OPTIONS = [
    { value: "Schedule a free consultation appointment", labelKey: "optConsultation" },
    { value: "Preparation of tender documents", labelKey: "optTenderDocs" },
];

export const SERVICE_ACCESS_OPTIONS = [
    { value: "Front service", labelKey: "optFrontService" },
    { value: "Rear service", labelKey: "optRearService" },
    { value: "Not sure", labelKey: "optNotSure" },
];

export const MOUNTING_METHOD_OPTIONS = [
    { value: "Wall Mount", labelKey: "optWallMount" },
    { value: "Hanging / Rigging", labelKey: "optHangingRigging" },
    { value: "Ground Support", labelKey: "optGroundSupport" },
    { value: "Freestanding Structure", labelKey: "optFreestanding" },
];

export const POWER_REDUNDANCY_OPTIONS = [
    { value: "Required", labelKey: "optPowerRequired" },
    { value: "Not Required", labelKey: "optPowerNotRequired" },
];

export const OPERATING_HOURS_OPTIONS = [
    { value: "24/7 Operation", labelKey: "optOperating247" },
];

export const CONTROLLER_CONFIG_OPTIONS = [
    { value: "Synchronous", labelKey: "optSynchronous" },
    { value: "Asynchronous", labelKey: "optAsynchronous" },
];

export const NETWORK_CONNECTION_OPTIONS = [
    { value: "LAN", labelKey: "optLan" },
    { value: "WLAN (Wi-Fi)", labelKey: "optWlan" },
    { value: "3G Mobile", labelKey: "optMobile3g" },
];

export const SIGNAL_SOURCE_OPTIONS = [
    { value: "HDMI", labelKey: "optHdmi" },
    { value: "DVI", labelKey: "optDvi" },
    { value: "12G-SDI", labelKey: "optSdi12g" },
    { value: "3G-DP", labelKey: "optDp3g" },
    { value: "10G Fiber", labelKey: "optFiber10g" },
];

export const ADDITIONAL_SERVICES_OPTIONS = [
    { value: "Approval process", labelKey: "optApprovalProcess" },
    { value: "Leasing", labelKey: "optLeasing" },
    { value: "Installation", labelKey: "optInstallation" },
    { value: "Extended warranty", labelKey: "optExtendedWarranty" },
];

export function mapLeditorOptions(t, optionDefs) {
    return optionDefs.map(({ value, labelKey }) => ({
        value,
        label: t(labelKey),
    }));
}

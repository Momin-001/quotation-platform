const UMLAUT_MAP = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    ß: "ss",
    Ä: "ae",
    Ö: "oe",
    Ü: "ue",
};

/** Convert a product name into a URL-friendly slug. Safe for client and server use. */
export function slugify(text) {
    if (!text || typeof text !== "string") return "";

    let value = text.trim();
    for (const [char, replacement] of Object.entries(UMLAUT_MAP)) {
        value = value.split(char).join(replacement);
    }

    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

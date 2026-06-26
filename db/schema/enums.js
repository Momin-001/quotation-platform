import { pgEnum } from "drizzle-orm/pg-core";

// Shared pg enums used by both `products` and `refurbished_products`.
// Kept in this dependency-free leaf module so reusing them never triggers a
// circular-import TDZ between the products / enquiries / quotations / refurbished schemas.
export const designEnum = pgEnum("design", ["Fix", "Mobil"]);
export const chipBondingEnum = pgEnum("chip_bonding", ["Gold Wire", "Copper Wire", "Flip-Chip"]);
export const controlSystemEnum = pgEnum("control_system", ["Colorlight", "Novastar", "Brompton", "LINSN", "Other"]);

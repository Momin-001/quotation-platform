import { db } from "@/lib/db";
import { navbar } from "@/db/schema";
import { defaultNavbarData } from "@/lib/data/default_cms_data";

export async function seedNavbar() {
    try {
        await db.delete(navbar);

        await db.insert(navbar).values({
            ...defaultNavbarData,
            updatedAt: new Date(),
        });

        console.log("Navbar seeded successfully ✅");
    } catch (error) {
        console.error("Error seeding navbar:", error);
    }
}

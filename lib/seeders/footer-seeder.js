import { db } from "@/lib/db";
import { footer } from "@/db/schema";
import { defaultFooterData } from "@/lib/data/default_cms_data";

export async function seedFooter() {
  try {
    await db.delete(footer);
    await db.insert(footer).values({
        ...defaultFooterData,
        updatedAt: new Date(),
    });

    console.log("Footer seeded successfully ✅");
  } catch (error) {
    console.error("Error seeding footer:", error);
  }
}
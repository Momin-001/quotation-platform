import { db } from "@/lib/db";
import { homepage } from "@/db/schema";
import { defaultHomepageData } from "@/lib/data/default_cms_data";

export async function seedHomepage() {
  try {
    await db.delete(homepage);

    await db.insert(homepage).values({
        ...defaultHomepageData,
        updatedAt: new Date(),
    });

    console.log("Homepage seeded successfully ✅");
  } catch (error) {
    console.error("Error seeding homepage:", error);
  }
}
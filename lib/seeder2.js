import { db } from "@/lib/db";
import { footer } from "@/db/schema";

export async function seedFooter() {
  try {
    // Optional: clear existing footer (since it's usually single row)
    await db.delete(footer);

    await db.insert(footer).values({
      // DESCRIPTION
      descriptionEn:
        "PROLEDALL is a platform that allows you to get quotes for your LED products. We are a team of experts who are dedicated to providing the best possible service to our clients.",
      descriptionDe:
        "PROLEDALL ist eine Plattform, auf der Sie Angebote für Ihre LED-Produkte einholen können. Unser Expertenteam ist bestrebt, unseren Kunden den bestmöglichen Service zu bieten.",

      // OUR ADDRESS
      ourAddressTitleEn: "Our Address",
      ourAddressTitleDe: "Unsere Adresse",

      // QUICK LINKS
      quickLinksTitleEn: "Quick Links",
      quickLinksTitleDe: "Quicklinks",

      quickLink1En: "Products",
      quickLink1De: "Produkte",

      quickLink2En: "Imprint",
      quickLink2De: "Impressum",

      quickLink3En: "Terms and Conditions",
      quickLink3De: "AGB",

      quickLink4En: "Become a Partner",
      quickLink4De: "Werden Sie Partner",

      quickLink5En: "Privacy Policy",
      quickLink5De: "Datenschutzerklärung",

      // (Optional PDF fields - leave null for now)
      privacyPolicyPdfUrl: null,
      privacyPolicyPdfPublicId: null,

      // NEWSLETTER
      newsletterTitleEn: "Newsletter",
      newsletterTitleDe: "Newsletter",

      // COPYRIGHT
      copyrightTextEn:
        "© Copyright ProLedAll. All Rights Reserved",
      copyrightTextDe:
        "© Copyright ProLedAll. Alle Rechte vorbehalten.",

      updatedAt: new Date(),
    });

    console.log("Footer seeded successfully ✅");
  } catch (error) {
    console.error("Error seeding footer:", error);
  }
}
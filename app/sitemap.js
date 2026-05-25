import { db } from "@/lib/db";
import { products, blogs, controllers } from "@/db/schema";
import { BASE_URL } from "@/lib/constants";
import { eq } from "drizzle-orm";

const siteUrl = (BASE_URL || "https://www.proledall.eu").replace(/\/$/, "");

export const revalidate = 3600;

function latestModified(dates, fallback) {
  if (!dates.length) return fallback;
  return new Date(Math.max(...dates.map((d) => new Date(d).getTime())));
}

function pageEntry(path, { lastModified, changeFrequency, priority }) {
  return {
    url: path ? `${siteUrl}${path}` : siteUrl,
    lastModified,
    changeFrequency,
    priority,
  };
}

/** @returns {Promise<import('next').MetadataRoute.Sitemap>} */
export default async function sitemap() {
  const now = new Date();

  const entries = [
    pageEntry("", { lastModified: now, changeFrequency: "weekly", priority: 1.0 }),
    pageEntry("/products", { lastModified: now, changeFrequency: "weekly", priority: 0.9 }),
    pageEntry("/leditor", { lastModified: now, changeFrequency: "monthly", priority: 0.85 }),
    pageEntry("/become-partner", { lastModified: now, changeFrequency: "monthly", priority: 0.8 }),
    pageEntry("/contact", { lastModified: now, changeFrequency: "yearly", priority: 0.7 }),
    pageEntry("/faqs", { lastModified: now, changeFrequency: "monthly", priority: 0.65 }),
    pageEntry("/imprint", { lastModified: now, changeFrequency: "yearly", priority: 0.3 }),
    pageEntry("/terms-and-conditions", { lastModified: now, changeFrequency: "yearly", priority: 0.3 }),
  ];

  try {
    const [productRows, blogRows, controllerRows] = await Promise.all([
      db
        .select({ id: products.id, updatedAt: products.updatedAt })
        .from(products)
        .where(eq(products.isActive, true)),
      db
        .select({ id: blogs.id, updatedAt: blogs.updatedAt })
        .from(blogs),
      db
        .select({ id: controllers.id, updatedAt: controllers.updatedAt })
        .from(controllers)
        .where(eq(controllers.isActive, true)),
    ]);

    if (productRows.length > 0) {
      const productLastMod = latestModified(
        productRows.map((p) => p.updatedAt),
        now,
      );
      entries[1] = pageEntry("/products", {
        lastModified: productLastMod,
        changeFrequency: "weekly",
        priority: 0.9,
      });

      for (const product of productRows) {
        entries.push(
          pageEntry(`/products/${product.id}`, {
            lastModified: product.updatedAt ?? now,
            changeFrequency: "monthly",
            priority: 0.75,
          }),
        );
      }
    }

    if (blogRows.length > 0) {
      const blogLastMod = latestModified(
        blogRows.map((b) => b.updatedAt),
        now,
      );
      entries.push(
        pageEntry("/blogs", {
          lastModified: blogLastMod,
          changeFrequency: "weekly",
          priority: 0.8,
        }),
      );

      for (const blog of blogRows) {
        entries.push(
          pageEntry(`/blogs/${blog.id}`, {
            lastModified: blog.updatedAt ?? now,
            changeFrequency: "monthly",
            priority: 0.7,
          }),
        );
      }
    }

    if (controllerRows.length > 0) {
      const controllerLastMod = latestModified(
        controllerRows.map((c) => c.updatedAt),
        now,
      );
      entries.push(
        pageEntry("/controllers", {
          lastModified: controllerLastMod,
          changeFrequency: "weekly",
          priority: 0.8,
        }),
      );

      for (const controller of controllerRows) {
        entries.push(
          pageEntry(`/controllers/${controller.id}`, {
            lastModified: controller.updatedAt ?? now,
            changeFrequency: "monthly",
            priority: 0.75,
          }),
        );
      }
    }
  } catch (error) {
    console.error("sitemap: failed to fetch dynamic routes", error);
  }

  return entries;
}

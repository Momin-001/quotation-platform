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

/** German (default) + English (/en) sitemap entries for the same logical path. */
function localizedPageEntries(path, options) {
    const enPath = path ? `/en${path}` : "/en";
    return [pageEntry(path, options), pageEntry(enPath, options)];
}

/** @returns {Promise<import('next').MetadataRoute.Sitemap>} */
export default async function sitemap() {
    const now = new Date();

    const entries = [
        ...localizedPageEntries("", { lastModified: now, changeFrequency: "weekly", priority: 1.0 }),
        ...localizedPageEntries("/products", {
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
        }),
        ...localizedPageEntries("/leditor", {
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.85,
        }),
        ...localizedPageEntries("/become-partner", {
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        }),
        ...localizedPageEntries("/contact", {
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.7,
        }),
        ...localizedPageEntries("/faqs", {
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.65,
        }),
        ...localizedPageEntries("/imprint", {
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        }),
        ...localizedPageEntries("/terms-and-conditions", {
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        }),
    ];

    try {
        const [productRows, blogRows, controllerRows] = await Promise.all([
            db
                .select({ id: products.id, updatedAt: products.updatedAt })
                .from(products)
                .where(eq(products.isActive, true)),
            db.select({ id: blogs.id, updatedAt: blogs.updatedAt }).from(blogs),
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
            const productOptions = {
                lastModified: productLastMod,
                changeFrequency: "weekly",
                priority: 0.9,
            };
            entries.splice(2, 2, ...localizedPageEntries("/products", productOptions));

            for (const product of productRows) {
                const opts = {
                    lastModified: product.updatedAt ?? now,
                    changeFrequency: "monthly",
                    priority: 0.75,
                };
                entries.push(
                    ...localizedPageEntries(`/products/${product.id}`, opts),
                );
            }
        }

        if (blogRows.length > 0) {
            const blogLastMod = latestModified(
                blogRows.map((b) => b.updatedAt),
                now,
            );
            const blogListOptions = {
                lastModified: blogLastMod,
                changeFrequency: "weekly",
                priority: 0.8,
            };
            entries.push(...localizedPageEntries("/blogs", blogListOptions));

            for (const blog of blogRows) {
                entries.push(
                    ...localizedPageEntries(`/blogs/${blog.id}`, {
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
                ...localizedPageEntries("/controllers", {
                    lastModified: controllerLastMod,
                    changeFrequency: "weekly",
                    priority: 0.8,
                }),
            );

            for (const controller of controllerRows) {
                entries.push(
                    ...localizedPageEntries(`/controllers/${controller.id}`, {
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

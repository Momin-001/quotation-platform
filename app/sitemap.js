// ============================================================
// FILE: app/sitemap.ts
// LOCATION: Place this file inside the /app folder
//           Same folder where layout.tsx lives
//           Full path: your-project/app/sitemap.ts
//
// WHAT THIS DOES:
//   1. Lists all pages for both languages (DE root + EN /en/)
//   2. Removes duplicate URLs from the current broken sitemap
//   3. Tells Google which pages exist and how often they change
//
// AFTER DEPLOYING:
//   - Visit https://www.proledall.eu/sitemap.xml to confirm XML output
//   - Go to Google Search Console → Sitemaps
//   - Delete the old /sitemap.xml submission
//   - Re-submit sitemap.xml fresh
// ============================================================

import { fetchCategorySlugsForSitemap } from '@/features/categories/guest-category'
import { CONTROLLER_BRANDS, controllerBrandSlug } from '@/lib/helpers/controller-brands'
// import { db } from '@/lib/db'
// import { products } from '@/db/schema'
// import { eq } from 'drizzle-orm'

export default async function sitemap() {
  const base = 'https://www.proledall.eu'
  const now  = new Date()

  // ── Dynamic category listing URLs (products + refurbished) ──
  // Each category gets a DE (root) and EN (/en) entry for both
  // the products and refurbished-products listings.
  let categoryEntries = []
  try {
    const rows = await fetchCategorySlugsForSitemap()

    categoryEntries = rows.flatMap((c) => {
      const lastModified = c.updatedAt ?? now
      return [
        {
          url:             `${base}/products/category/${c.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority:        0.8,
        },
        {
          url:             `${base}/en/products/category/${c.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority:        0.8,
        },
        {
          url:             `${base}/refurbished-products/category/${c.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority:        0.7,
        },
        {
          url:             `${base}/en/refurbished-products/category/${c.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority:        0.7,
        },
      ]
    })
  } catch {
    // If the DB is unreachable at build/request time, fall back to the
    // static URLs below rather than failing the whole sitemap.
    categoryEntries = []
  }

  // ── Controller brand listing URLs (static brand list) ───────
  const controllerBrandEntries = CONTROLLER_BRANDS.flatMap((brand) => {
    const slug = controllerBrandSlug(brand)
    return [
      {
        url:             `${base}/controllers/brand/${slug}`,
        lastModified:    now,
        changeFrequency: 'weekly',
        priority:        0.7,
      },
      {
        url:             `${base}/en/controllers/brand/${slug}`,
        lastModified:    now,
        changeFrequency: 'weekly',
        priority:        0.7,
      },
    ]
  })

  // // ── Dynamic product detail URLs (active products only) ───────
  // // Products are SEO-indexed via their slug, so each active product
  // // gets a DE (root) and EN (/en) entry derived from the database.
  // let productEntries: MetadataRoute.Sitemap = []
  // try {
  //   const rows = await db
  //     .select({ slug: products.slug, updatedAt: products.updatedAt })
  //     .from(products)
  //     .where(eq(products.isActive, true))

  //   productEntries = rows.flatMap((p) => {
  //     const lastModified = p.updatedAt ?? now
  //     return [
  //       {
  //         url:             `${base}/products/${p.slug}`,
  //         lastModified,
  //         changeFrequency: 'monthly' as const,
  //         priority:        0.7,
  //       },
  //       {
  //         url:             `${base}/en/products/${p.slug}`,
  //         lastModified,
  //         changeFrequency: 'monthly' as const,
  //         priority:        0.7,
  //       },
  //     ]
  //   })
  // } catch {
  //   // If the DB is unreachable at build/request time, fall back to the
  //   // static URLs below rather than failing the whole sitemap.
  //   productEntries = []
  // }

  return [

    // ── GERMAN PAGES (root — no language prefix) ──────────────
    // These are the German-language pages served at the root domain

    {
      url:             `${base}/`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        1.0,
    },
    {
      url:             `${base}/products`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.9,
    },
    {
      url:             `${base}/refurbished-products`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.85,
    },
    {
      url:             `${base}/controllers`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.75,
    },
    {
      url:             `${base}/leditor`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.85,
    },
    {
      url:             `${base}/become-partner`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.8,
    },
    {
      url:             `${base}/contact`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.7,
    },
    {
      url:             `${base}/imprint`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.3,
    },
    {
      url:             `${base}/terms-and-conditions`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.3,
    },

    // ── ENGLISH PAGES (/en prefix) ────────────────────────────
    // These are the English-language versions of the same pages

    {
      url:             `${base}/en`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        1.0,
    },
    {
      url:             `${base}/en/products`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.9,
    },
    {
      url:             `${base}/en/refurbished-products`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.85,
    },
    {
      url:             `${base}/en/controllers`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.75,
    },
    {
      url:             `${base}/en/leditor`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.85,
    },
    {
      url:             `${base}/en/become-partner`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.8,
    },
    {
      url:             `${base}/en/contact`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.7,
    },
    {
      url:             `${base}/en/imprint`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.3,
    },
    {
      url:             `${base}/en/terms-and-conditions`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.3,
    },

    // ── PAGES TO ADD LATER (when content is live) ────────────
    // Uncomment these lines only when real content is published

    // { url: `${base}/blogs`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    // { url: `${base}/en/blogs`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },

    // ── DYNAMIC PRODUCT DETAIL PAGES (from database) ──────────
    // ...productEntries,

    // ── DYNAMIC CATEGORY LISTING PAGES (from database) ────────
    ...categoryEntries,

    // ── CONTROLLER BRAND LISTING PAGES (static brand list) ────
    ...controllerBrandEntries,

  ]
}

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

import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.proledall.eu'
  const now  = new Date()

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
    // { url: `${base}/controllers`,       lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    // { url: `${base}/en/controllers`,    lastModified: now, changeFrequency: 'monthly', priority: 0.75 },

  ]
}

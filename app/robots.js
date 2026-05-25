import { BASE_URL } from "@/lib/constants";

const siteUrl = (BASE_URL || "https://www.proledall.eu").replace(/\/$/, "");

/** @returns {import('next').MetadataRoute.Robots} */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/register",
          "/login",
          "/forgot-password",
          "/reset-password",
          "/user/",
          "/admin/",
          "/become-partner/submit",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

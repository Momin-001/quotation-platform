import { cache } from "react";
import { db } from "@/lib/db";
import { blogs, blogContentBlocks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

/**
 * Fetch a single blog by its URL slug together with its ordered content blocks.
 * Returns the blog object (with `contentBlocks`) or null if not found.
 *
 * Shared by the guest blog API route and the server-rendered detail page.
 * Wrapped in React `cache` so `generateMetadata` and the page component
 * share a single query per request.
 */
export const fetchGuestBlogBySlug = cache(async function fetchGuestBlogBySlug(slug) {
    if (!slug) return null;

    const blog = await db.select().from(blogs).where(eq(blogs.slug, slug)).then((r) => r[0]);
    if (!blog) return null;

    const contentBlocks = await db
        .select()
        .from(blogContentBlocks)
        .where(eq(blogContentBlocks.blogId, blog.id))
        .orderBy(asc(blogContentBlocks.sortOrder));

    return { ...blog, contentBlocks };
});

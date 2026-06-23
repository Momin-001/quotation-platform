import { notFound } from "next/navigation";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import BreadCrumb from "@/components/user/BreadCrumb";
import SchemaScript from "@/components/guest/SchemaScript";
import { BASE_URL } from "@/lib/constants";
import { validateLocale, buildAlternates } from "@/lib/i18n/metadata";
import { cmsField } from "@/lib/i18n/cms";
import { fetchGuestBlogBySlug } from "@/features/blogs/guest-blog-detail";

const siteUrl = (BASE_URL || "https://www.proledall.eu").replace(/\/$/, "");

// Revalidate the cached page hourly (ISR) — blog content changes infrequently.
export const revalidate = 3600;

function withLocalePrefix(locale, path) {
    if (locale === "en") return path === "/" ? "/en" : `/en${path}`;
    return path;
}

/** Strip HTML tags and collapse whitespace into a plain-text excerpt. */
function htmlToExcerpt(html, maxLength = 160) {
    if (!html) return "";
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }) {
    const { locale, id } = await params;
    const validLocale = validateLocale(locale);
    const blog = await fetchGuestBlogBySlug(id);

    if (!blog) return {};

    const title = cmsField(blog, "metaTitle", validLocale) || blog.title;
    const description =
        cmsField(blog, "metaDescription", validLocale) ||
        htmlToExcerpt(blog.mainContentHtml) ||
        blog.title;
    const path = `/blogs/${blog.slug}`;
    const images = blog.mainImageUrl ? [{ url: blog.mainImageUrl }] : undefined;

    return {
        title,
        description,
        alternates: buildAlternates(path, validLocale),
        openGraph: {
            type: "article",
            title,
            description,
            url: `${siteUrl}${withLocalePrefix(validLocale, path)}`,
            publishedTime: blog.createdAt ? new Date(blog.createdAt).toISOString() : undefined,
            modifiedTime: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
            authors: blog.authorName ? [blog.authorName] : undefined,
            ...(images ? { images } : {}),
        },
    };
}

export default async function BlogDetailPage({ params }) {
    const { id } = await params;
    const blog = await fetchGuestBlogBySlug(id);

    if (!blog) notFound();

    const locale = await getLocale();
    const t = await getTranslations("Blogs.detail");
    const tBlogs = await getTranslations("Blogs");
    const tCommon = await getTranslations("Common");

    const date = new Date(blog.createdAt);
    const formattedDate = date.toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const blogUrl = `${siteUrl}${withLocalePrefix(validateLocale(locale), `/blogs/${blog.slug}`)}`;
    const blogSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: blog.title,
        description: htmlToExcerpt(blog.mainContentHtml) || blog.title,
        datePublished: blog.createdAt ? new Date(blog.createdAt).toISOString() : undefined,
        dateModified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
        author: { "@type": "Person", name: blog.authorName },
        mainEntityOfPage: { "@type": "WebPage", "@id": blogUrl },
        publisher: {
            "@type": "Organization",
            name: "ProLEDALL",
            logo: { "@type": "ImageObject", url: `${siteUrl}/logo.svg` },
        },
        ...(blog.mainImageUrl ? { image: [blog.mainImageUrl] } : {}),
    };

    return (
        <div className="min-h-screen flex flex-col">
            <SchemaScript data={blogSchema} />
            <BreadCrumb
                title={t("breadcrumb")}
                titleTag="p"
                breadcrumbs={[
                    { label: tCommon("home"), href: "/" },
                    { label: tBlogs("breadcrumb"), href: "/blogs" },
                    { label: blog.title },
                ]}
            />
            <main className="flex-1 bg-white">
                <article className="container mx-auto px-4 py-10 lg:py-16 max-w-7xl">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900  leading-tight">
                        {blog.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                        <span>
                            {t("byAuthor")}{" "}
                            <span className="font-medium text-gray-700">{blog.authorName}</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>{formattedDate}</span>
                        <span className="text-gray-300">•</span>
                        <button type="button" className="text-primary hover:underline font-medium">
                            {t("subscribe")}
                        </button>
                    </div>

                    {blog.mainImageUrl && (
                        <div className="relative mt-8 rounded-lg overflow-hidden aspect-video">
                            <Image
                                src={blog.mainImageUrl}
                                alt={blog.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {blog.mainContentHtml && (
                        <div
                            className="prose prose-lg max-w-none mt-10"
                            dangerouslySetInnerHTML={{ __html: blog.mainContentHtml }}
                        />
                    )}

                    {blog.partnerAdImageUrl && (
                        <div className="mt-12">
                            {blog.partnerAdLinkUrl ? (
                                <a
                                    href={blog.partnerAdLinkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <div className="relative rounded-lg overflow-hidden aspect-video">
                                        <Image
                                            src={blog.partnerAdImageUrl}
                                            alt={t("partnerAdAlt")}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </a>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden aspect-video">
                                    <Image
                                        src={blog.partnerAdImageUrl}
                                        alt={t("partnerAdAlt")}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {blog.contentBlocks?.length > 0 && (
                        <div className="mt-12 space-y-10">
                            {blog.contentBlocks.map((block, index) => (
                                <div key={block.id || index}>
                                    {block.textHtml && (
                                        <div
                                            className="prose prose-lg max-w-none"
                                            dangerouslySetInnerHTML={{ __html: block.textHtml }}
                                        />
                                    )}
                                    {block.imageUrl && (
                                        <div className="relative mt-6 rounded-lg overflow-hidden aspect-video">
                                            <Image
                                                src={block.imageUrl}
                                                alt={t("contentBlockAlt", { index: index + 1 })}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            </main>
        </div>
    );
}

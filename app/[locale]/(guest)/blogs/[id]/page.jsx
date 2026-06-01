"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import BreadCrumb from "@/components/user/BreadCrumb";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function BlogDetailPage() {
    const { id } = useParams();
    const locale = useLocale();
    const t = useTranslations("Blogs.detail");
    const tBlogs = useTranslations("Blogs");
    const tCommon = useTranslations("Common");
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await fetch(`/api/blogs/${id}`);
                const response = await res.json();
                if (!response.success) throw new Error(response.message);
                setBlog(response.data);
            } catch (error) {
                toast.error(error.message || t("fetchFailed"));
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchBlog();
    }, [id, t]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col">
                <BreadCrumb
                    title={t("breadcrumb")}
                    breadcrumbs={[
                        { label: tCommon("home"), href: "/" },
                        { label: tBlogs("breadcrumb"), href: "/blogs" },
                        { label: t("notFound") },
                    ]}
                />
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    {t("notFoundMessage")}
                </div>
            </div>
        );
    }

    const date = new Date(blog.createdAt);
    const formattedDate = date.toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title={t("breadcrumb")}
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

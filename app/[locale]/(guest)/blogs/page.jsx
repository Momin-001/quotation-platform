"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import BreadCrumb from "@/components/user/BreadCrumb";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Newspaper } from "lucide-react";

function BlogCard({ blog, locale }) {
    const t = useTranslations("Blogs");
    const date = new Date(blog.createdAt);
    const month = date.toLocaleString(locale, { month: "short" }).toUpperCase();
    const day = date.getDate();

    return (
        <Link href={`/blogs/${blog.id}`} className="block group h-full">
            <article
                className={cn(
                    "flex flex-col h-full bg-white border border-border/60 rounded-xl overflow-hidden",
                    "transition-all duration-300 hover:shadow-lg hover:border-primary/25 hover:-translate-y-0.5",
                )}
            >
                <div className="relative overflow-hidden aspect-4/3 bg-muted/20">
                    {blog.mainImageUrl ? (
                        <Image
                            src={blog.mainImageUrl}
                            alt={blog.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
                            <span className="text-xs font-medium">{t("noImage")}</span>
                        </div>
                    )}
                    <div className="absolute top-3 left-3 bg-secondary text-primary-foreground rounded-md px-3 py-1.5 text-center leading-tight min-w-[52px] shadow-sm">
                        <div className="text-[10px] sm:text-xs font-semibold tracking-wider opacity-90">
                            {month}
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold -mt-0.5">{day}</div>
                    </div>
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
                        {blog.title}
                    </h2>
                    <span className="mt-3 text-sm font-medium text-primary group-hover:text-primary/80 shrink-0">
                        {t("readMore")}
                    </span>
                </div>
            </article>
        </Link>
    );
}

export default function BlogsPage() {
    const locale = useLocale();
    const t = useTranslations("Blogs");
    const tCommon = useTranslations("Common");
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch("/api/blogs");
                const response = await res.json();
                if (!response.success) throw new Error(response.message);
                setBlogs(response.data);
            } catch (error) {
                toast.error(error.message || t("fetchFailed"));
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, [t]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <BreadCrumb
                title={t("breadcrumb")}
                breadcrumbs={[
                    { label: tCommon("home"), href: "/" },
                    { label: t("breadcrumb") },
                ]}
            />
            <main className="flex-1">
                <div className="container mx-auto px-4 lg:px-6 py-6 sm:py-10 lg:py-12">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
                            <Spinner className="h-6 w-6" />
                            <span className="text-sm">{t("loading")}</span>
                        </div>
                    ) : blogs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                            {blogs.map((blog) => (
                                <BlogCard key={blog.id} blog={blog} locale={locale} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 rounded-xl border border-dashed border-border/60 bg-white/60">
                            <Newspaper className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                {t("empty")}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

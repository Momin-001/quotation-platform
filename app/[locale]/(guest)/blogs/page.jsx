import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Newspaper } from "lucide-react";
import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";
import BreadCrumb from "@/components/user/BreadCrumb";
import { fetchGuestBlogsListing } from "@/features/blogs/guest-blogs-list";
import { cn } from "@/lib/utils";

function BlogCard({ blog, locale, labels }) {
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
                            <span className="text-xs font-medium">{labels.noImage}</span>
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
                        {labels.readMore}
                    </span>
                </div>
            </article>
        </Link>
    );
}

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("/blogs", validateLocale(locale));
}

export default async function BlogsPage({ params }) {
    const { locale } = await params;
    const t = await getTranslations("Blogs");
    const tCommon = await getTranslations("Common");

    let blogList = [];
    try {
        blogList = await fetchGuestBlogsListing();
    } catch (error) {
        console.error("Blogs page fetch error:", error);
    }

    const labels = {
        noImage: t("noImage"),
        readMore: t("readMore"),
    };

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
                    {blogList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                            {blogList.map((blog) => (
                                <BlogCard
                                    key={blog.id}
                                    blog={blog}
                                    locale={locale}
                                    labels={labels}
                                />
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

"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

function BlogCard({ blog, isEn }) {
    const date = new Date(blog.createdAt);
    const month = date.toLocaleString(isEn ? "en" : "de", { month: "short" }).toUpperCase();
    const day = date.getDate();

    return (
        <Link href={`/blogs/${blog.id}`} className="block group h-full">
            <article
                className={cn(
                    "flex flex-col h-full bg-white border border-border/60 rounded-xl overflow-hidden",
                    "transition-all duration-300 hover:shadow-lg hover:border-primary/25 hover:-translate-y-0.5"
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
                            <span className="text-xs font-medium">
                                {isEn ? "No image" : "Kein Bild"}
                            </span>
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
                    <h3 className="text-base sm:text-lg font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
                        {blog.title}
                    </h3>
                    <span className="mt-3 text-sm font-medium text-primary group-hover:text-primary/80 shrink-0">
                        {isEn ? "Read more →" : "Weiterlesen →"}
                    </span>
                </div>
            </article>
        </Link>
    );
}

export default function BlogsSection({ homepageData, blogs }) {
    const { language } = useLanguage();
    const isEn = language === "en";

    const getText = (field) => {
        if (!homepageData) return "";
        const key = isEn ? `${field}En` : `${field}De`;
        return homepageData[key] || homepageData[`${field}En`] || "";
    };

    if (!blogs?.length) return null;

    const title =
        getText("blogsSectionTitle") ||
        (isEn ? "Blogs & insights" : "Blog & Einblicke");
    const subtitle =
        getText("blogsSectionSubtitle") ||
        (isEn
            ? "Expert knowledge to help you make informed decisions."
            : "Fachwissen für fundierte Entscheidungen.");

    return (
        <section className="w-full bg-primary-foreground py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center mb-10 md:mb-12 max-w-3xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
                        {title}
                    </h2>
                    <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                        {subtitle}
                    </p>
                </div>

                <div className="relative px-10 sm:px-12 md:px-14">
                    <Carousel
                        opts={{ align: "start", loop: blogs.length > 3 }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4 md:-ml-5">
                            {blogs.map((blog) => (
                                <CarouselItem
                                    key={blog.id}
                                    className="pl-4 md:pl-5 basis-full sm:basis-1/2 lg:basis-1/3"
                                >
                                    <BlogCard blog={blog} isEn={isEn} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {blogs.length > 1 && (
                            <>
                                <CarouselPrevious
                                    className={cn(
                                        "left-0 md:-left-1 h-10 w-10 rounded-full border-primary/50 text-primary",
                                        "hover:bg-primary hover:text-primary-foreground shadow-sm"
                                    )}
                                />
                                <CarouselNext
                                    className={cn(
                                        "right-0 md:-right-1 h-10 w-10 rounded-full border-primary/50 text-primary",
                                        "hover:bg-primary hover:text-primary-foreground shadow-sm"
                                    )}
                                />
                            </>
                        )}
                    </Carousel>
                </div>

                <div className="text-center mt-8 md:mt-10">
                    <Button asChild size="lg">
                        <Link href="/blogs">
                            {isEn ? "View all articles" : "Alle Beiträge ansehen"}
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

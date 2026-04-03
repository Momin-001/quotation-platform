"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

function BlogCard({ blog }) {
    const date = new Date(blog.createdAt);
    const month = date.toLocaleString("en", { month: "short" }).toUpperCase();
    const day = date.getDate();

    return (
        <Link href={`/blogs/${blog.id}`} className="block group">
            <div className="relative overflow-hidden rounded-lg aspect-4/3">
                {blog.mainImageUrl ? (
                    <Image
                        src={blog.mainImageUrl}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 font-archivo bg-secondary text-primary-foreground rounded-sm px-4 py-1.5 text-center leading-tight min-w-[56px]">
                    <div className="text-sm lg:text-md font-medium tracking-wider">{month}</div>
                    <div className="text-3xl font-bold -mt-0.5">{day}</div>
                </div>
            </div>
            <h3 className="mt-3 text-xl lg:text-2xl font-bold font-archivo leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {blog.title}
            </h3>
        </Link>
    );
}

export default function BlogsSection({ homepageData, blogs }) {
    const { language } = useLanguage();
    const getText = (field) => {
        if (!homepageData) return "";
        const key = language === "en" ? `${field}En` : `${field}De`;
        return homepageData[key] || homepageData[`${field}En`] || "";
    };

    if (blogs.length === 0) return null;

    return (
        <section className="w-full bg-primary-foreground py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-[55px] text-black font-bold mb-3 font-archivo">
                        {getText("blogsSectionTitle") || "Blogs & Insights"}
                    </h2>
                    <p className="text-md md:text-lg max-w-3xl mx-auto font-normal font-open-sans">
                        {getText("blogsSectionSubtitle") || "Expert Knowledge to Help You Make Informed Decisions"}
                    </p>
                </div>

                <div className="relative px-12">
                    <Carousel
                        opts={{ align: "start", loop: blogs.length > 3 }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {blogs.map((blog) => (
                                <CarouselItem key={blog.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                                    <BlogCard blog={blog} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="-left-2 md:-left-22 rounded-full p-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                        <CarouselNext className="-right-2 md:-right-22 rounded-full p-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                    </Carousel>
                </div>

                <div className="text-center mt-10">
                    <Link href="/blogs">
                        <Button variant="default" size="lg">
                            {language === "en" ? "VIEW ALL" : "ALLE ANSEHEN"} <MoveRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

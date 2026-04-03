"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import BreadCrumb from "@/components/user/BreadCrumb";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

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

export default function BlogsPage() {
    const { language } = useLanguage();
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
                toast.error(error.message || "Failed to fetch blogs");
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title={language === "en" ? "Blogs" : "Blogs"}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: "Blogs" },
                ]}
            />
            <main className="flex-1 bg-gray-50">
                <div className="container mx-auto px-4 py-12 lg:py-16">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Spinner className="h-6 w-6" />
                        </div>
                    ) : blogs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map((blog) => (
                                <BlogCard key={blog.id} blog={blog} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            No blogs available yet.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

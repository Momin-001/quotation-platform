"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function EditBlogPage() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await fetch(`/api/admin/blogs/${id}`);
                const response = await res.json();
                if (!response.success) throw new Error(response.message);
                setBlog(response.data);
            } catch (error) {
                toast.error(error.message || "Failed to load blog");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner className="h-6 w-6" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="text-center py-20 text-gray-500">
                Blog not found.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold font-archivo">Edit Blog</h1>
                <p className="text-sm text-muted-foreground">
                    Update the blog post details below.
                </p>
            </div>
            <BlogForm initialData={blog} />
        </div>
    );
}

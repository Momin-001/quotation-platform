"use client";

import BlogForm from "@/components/admin/BlogForm";

export default function AddBlogPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold font-archivo">Create New Blog</h1>
                <p className="text-sm text-muted-foreground">
                    Fill in the details below to publish a new blog post.
                </p>
            </div>
            <BlogForm />
        </div>
    );
}

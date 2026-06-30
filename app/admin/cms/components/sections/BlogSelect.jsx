"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Searchable blog picker. Stores the selected blog's id via onChange.
 * Fetches the full blog list once from the admin blogs endpoint and
 * filters client-side by title.
 */
export default function BlogSelect({ value, onChange, disabled = false }) {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch("/api/admin/blogs");
                const data = await res.json();
                if (active && data.success) {
                    setBlogs(Array.isArray(data.data) ? data.data : []);
                }
            } catch {
                // Silent fail — selector simply shows no options.
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    // Close dropdown on outside click.
    useEffect(() => {
        function onClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const selectedBlog = useMemo(
        () => blogs.find((b) => b.id === value) || null,
        [blogs, value]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return blogs;
        return blogs.filter((b) => b.title?.toLowerCase().includes(q));
    }, [blogs, query]);

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs",
                    "focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    !selectedBlog && "text-muted-foreground"
                )}
            >
                <span className="truncate text-left">
                    {selectedBlog ? selectedBlog.title : "Select a blog to link…"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                    {selectedBlog && !disabled && (
                        <X
                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange?.(null);
                                setQuery("");
                            }}
                        />
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
            </button>

            {open && (
                <div className="absolute z-20 mt-1 w-full rounded-md border bg-white shadow-lg">
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search blogs by title…"
                            className="h-8 border-0 p-0 focus-visible:ring-0"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                        {loading ? (
                            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                                <Spinner className="h-4 w-4" /> Loading blogs…
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No blogs found.
                            </div>
                        ) : (
                            filtered.map((blog) => (
                                <button
                                    key={blog.id}
                                    type="button"
                                    onClick={() => {
                                        onChange?.(blog.id);
                                        setOpen(false);
                                        setQuery("");
                                    }}
                                    className={cn(
                                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50",
                                        blog.id === value && "bg-primary/5"
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            "h-4 w-4 shrink-0 text-primary",
                                            blog.id === value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="truncate">{blog.title}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

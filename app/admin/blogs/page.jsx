"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import Link from "next/link";

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/blogs");
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            setBlogs(response.data);
            setFilteredBlogs(response.data);
        } catch (error) {
            toast.error(error.message || "Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredBlogs(blogs);
            return;
        }
        const q = search.toLowerCase();
        setFilteredBlogs(
            blogs.filter(
                (b) =>
                    b.title.toLowerCase().includes(q) ||
                    b.authorName.toLowerCase().includes(q)
            )
        );
    }, [search, blogs]);

    const openDeleteDialog = (blog) => {
        setBlogToDelete(blog);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!blogToDelete) return;
        try {
            const res = await fetch(`/api/admin/blogs/${blogToDelete.id}`, { method: "DELETE" });
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            toast.success("Blog deleted successfully");
            fetchBlogs();
        } catch (error) {
            toast.error(error.message || "Failed to delete blog");
        } finally {
            setDeleteDialogOpen(false);
            setBlogToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold font-archivo">Blog Management</h1>
                    <p className="text-sm text-muted-foreground">
                        Create and manage blog posts for your platform.
                    </p>
                </div>
                <Link href="/admin/blogs/add">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" /> New Blog
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search blogs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Spinner className="h-6 w-6" />
                </div>
            ) : filteredBlogs.length > 0 ? (
                <div className="border rounded-lg bg-white overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBlogs.map((blog) => (
                                <TableRow key={blog.id}>
                                    <TableCell>
                                        {blog.mainImageUrl ? (
                                            <div className="relative w-14 h-10 rounded overflow-hidden">
                                                <Image
                                                    src={blog.mainImageUrl}
                                                    alt={blog.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-10 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                                N/A
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium max-w-xs truncate">
                                        {blog.title}
                                    </TableCell>
                                    <TableCell>{blog.authorName}</TableCell>
                                    <TableCell>
                                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/admin/blogs/${blog.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => openDeleteDialog(blog)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 bg-white border rounded-lg">
                    {search ? "No blogs match your search." : "No blogs yet. Create your first blog post!"}
                </div>
            )}

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Blog</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{blogToDelete?.title}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

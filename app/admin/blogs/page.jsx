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
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    const [sortBy, setSortBy] = useState("");

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
        let filtered = [...blogs];
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (b) =>
                    b.title.toLowerCase().includes(q) ||
                    b.authorName.toLowerCase().includes(q)
            );
        }
        filtered.sort((a, b) => {
            if (sortBy === "title") return a.title.localeCompare(b.title);
            if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt);
            return 0;
        });
        setFilteredBlogs(filtered);
    }, [search, sortBy, blogs]);

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

            {/* Search and Sort */}
            <div className="flex justify-end items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-2 top-4 h-4 w-4" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 placeholder:text-gray-800"
                    />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary font-archivo">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Image</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Title</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Author</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Date</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && filteredBlogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading blogs...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredBlogs.length > 0 ? (
                            filteredBlogs.map((blog) => (
                                <TableRow
                                    key={blog.id}
                                    className="even:bg-[#EAF6FF] font-open-sans"
                                >
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {blog.mainImageUrl ? (
                                            <div className="relative w-14 h-10 rounded overflow-hidden shrink-0">
                                                <Image
                                                    src={blog.mainImageUrl}
                                                    alt={blog.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap max-w-xs truncate">
                                        {blog.title}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{blog.authorName}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div>
                                            <Link href={`/admin/blogs/${blog.id}/edit`}>
                                                <Button variant="link" className="p-0 h-auto">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto text-red-600 hover:text-red-700"
                                                onClick={() => openDeleteDialog(blog)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    {search ? "No blogs match your search." : "No blogs yet. Create your first blog post!"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

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

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
import { Label } from "@/components/ui/label";
import { ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function ProductIconsPage() {
    const [icons, setIcons] = useState([]);
    const [filteredIcons, setFilteredIcons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name");

    const [name, setName] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [iconToDelete, setIconToDelete] = useState(null);

    const fetchIcons = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/product-icons");
            const data = await res.json();
            if (data.success) {
                setIcons(data.data);
                setFilteredIcons(data.data);
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Failed to fetch product icons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIcons();
    }, []);

    useEffect(() => {
        let filtered = [...icons];
        if (search) {
            filtered = filtered.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        filtered.sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt);
            return 0;
        });
        setFilteredIcons(filtered);
    }, [search, sortBy, icons]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Icon name is required");
            return;
        }
        if (!editingId && !imageFile) {
            toast.error("Icon image is required");
            return;
        }
        const formData = new FormData();
        formData.append("name", name.trim());
        if (imageFile) formData.append("image", imageFile);
        const url = editingId ? `/api/admin/product-icons/${editingId}` : "/api/admin/product-icons";
        const method = editingId ? "PATCH" : "POST";
        try {
            const res = await fetch(url, { method, body: formData });
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            toast.success(response.message || "Icon saved");
            fetchIcons();
            clearForm();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEdit = (icon) => {
        setEditingId(icon.id);
        setName(icon.name);
        setImagePreview(icon.imageUrl);
        setImageFile(null);
    };

    const openDeleteDialog = (icon) => {
        setIconToDelete(icon);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!iconToDelete) return;
        try {
            const res = await fetch(`/api/admin/product-icons/${iconToDelete.id}`, { method: "DELETE" });
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            toast.success(response.message || "Icon deleted");
            fetchIcons();
            if (editingId === iconToDelete.id) clearForm();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleteDialogOpen(false);
            setIconToDelete(null);
        }
    };

    const clearForm = () => {
        setName("");
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-archivo">Product Icons</h1>
                <p className="text-sm">
                    Create and manage feature icons (e.g. High Contrast, Energy Saving) that can be assigned to products.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Icon Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., High Contrast"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="image">Icon Image Upload</Label>
                    <div className="flex items-start gap-4">
                        <label
                            htmlFor="image"
                            className="flex items-center justify-center shadow-xs h-24 w-24 bg-white border rounded-lg cursor-pointer"
                        >
                            <span className="text-4xl text-gray-400">+</span>
                        </label>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        {imagePreview && (
                            <div className="relative h-24 w-24 shadow-xs bg-white border rounded-lg overflow-hidden">
                                <Image
                                    src={imagePreview}
                                    alt="Icon preview"
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    {editingId ? (
                        <>
                            <Button type="submit" size="lg" className="bg-primary">
                                Edit Icon
                            </Button>
                            <Button type="button" size="lg" variant="outline" onClick={clearForm}>
                                Clear
                            </Button>
                        </>
                    ) : (
                        <Button type="submit" size="lg" className="bg-primary">
                            Add Icon
                        </Button>
                    )}
                </div>
            </form>

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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="lg" className="gap-2 text-gray-800">
                            Sort By {sortBy === "name" ? "Name" : "Date"}
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("date")}>Date</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary font-archivo">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Image</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Name</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Created At</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && filteredIcons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading icons...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredIcons.length > 0 ? (
                            filteredIcons.map((icon) => (
                                <TableRow key={icon.id} className="even:bg-[#EAF6FF] font-open-sans">
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div className="relative h-12 w-12">
                                            <Image
                                                src={icon.imageUrl}
                                                alt={icon.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{icon.name}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {new Date(icon.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <Button variant="link" onClick={() => handleEdit(icon)}>
                                            Edit
                                        </Button>
                                        <Button variant="link" onClick={() => openDeleteDialog(icon)}>
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No product icons found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the icon &quot;{iconToDelete?.name}&quot;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

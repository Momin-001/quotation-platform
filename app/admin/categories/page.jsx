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
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/categories");
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch categories");
            }
            setCategories(response.data);
            setFilteredCategories(response.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Search and sort
    useEffect(() => {
        let filtered = [...categories];

        // Search
        if (search) {
            filtered = filtered.filter(
                (cat) =>
                    cat.name.toLowerCase().includes(search.toLowerCase()) ||
                    cat.description?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            } else if (sortBy === "products") {
                return b.productCount - a.productCount;
            }
            return 0;
        });

        setFilteredCategories(filtered);
    }, [search, sortBy, categories]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }

        const url = editingId
            ? `/api/admin/categories/${editingId}`
            : "/api/admin/categories";
        const method = editingId ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description }),
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to update category");
            }
            toast.success(response.message || "Category updated");
            fetchCategories();
            clearForm();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setName(category.name);
        setDescription(category.description || "");
    };

    const openDeleteDialog = (category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
                method: "DELETE",
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to delete category");
            }
            toast.success(response.message || "Category deleted");
            fetchCategories();
            if (editingId === categoryToDelete.id) clearForm();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        }
    };

    const clearForm = () => {
        setName("");
        setDescription("");
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-archivo">Product Categories</h1>
                <p className="text-sm">
                    Create, edit, or remove product categories for the catalogue.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Indoor"
                            className="w-1/3"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            className="w-1/3"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    {editingId ? (
                        <>
                            <Button type="submit" className="bg-primary">
                                Edit Category
                            </Button>
                            <Button type="button" variant="outline" onClick={clearForm}>
                                Clear
                            </Button>
                        </>
                    ) : (
                        <Button type="submit" size="lg" className="bg-primary">
                            Add Category
                        </Button>
                    )}
                </div>
            </form>

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
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary font-archivo">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Category Name</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Description</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Products Count</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && filteredCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading categories...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredCategories.length > 0 ? (
                            filteredCategories.map((category, index) => (
                                <TableRow
                                    key={category.id}
                                    className="even:bg-[#EAF6FF] font-open-sans"
                                >
                                    <TableCell className="p-4 whitespace-nowrap">{category.name}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {category.description || "-"}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{category.productCount}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div>
                                            <Button
                                                variant="link"
                                                onClick={() => handleEdit(category)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="link"
                                                onClick={() => openDeleteDialog(category)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the category "{categoryToDelete?.name}".
                            {categoryToDelete?.productCount > 0 && (
                                <span className="block mt-2 text-red-600 font-semibold">
                                    Warning: This category has {categoryToDelete.productCount} product(s) associated with it.
                                </span>
                            )}
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

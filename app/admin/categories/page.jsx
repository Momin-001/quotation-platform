"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { Search, Upload, Plus, Trash2 } from "lucide-react";
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

const emptyFeature = () => ({ en: "", de: "" });

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const [name, setName] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [titleDe, setTitleDe] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [descriptionDe, setDescriptionDe] = useState("");
    const [features, setFeatures] = useState([emptyFeature()]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loadingForm, setLoadingForm] = useState(false);

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

    useEffect(() => {
        let filtered = [...categories];

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (cat) =>
                    cat.name.toLowerCase().includes(q) ||
                    cat.titleEn?.toLowerCase().includes(q) ||
                    cat.titleDe?.toLowerCase().includes(q) ||
                    cat.descriptionEn?.toLowerCase().includes(q) ||
                    cat.descriptionDe?.toLowerCase().includes(q)
            );
        }

        filtered.sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === "products") {
                return b.productCount - a.productCount;
            }
            return 0;
        });

        setFilteredCategories(filtered);
    }, [search, sortBy, categories]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setRemoveImage(false);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        setLoadingForm(true);
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Category name is required");
            setLoadingForm(false);
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("titleEn", titleEn.trim());
        formData.append("titleDe", titleDe.trim());
        formData.append("descriptionEn", descriptionEn.trim());
        formData.append("descriptionDe", descriptionDe.trim());
        formData.append(
            "features",
            JSON.stringify(
                features
                    .map((f) => ({ en: f.en.trim(), de: f.de.trim() }))
                    .filter((f) => f.en || f.de)
            )
        );

        if (imageFile) {
            formData.append("image", imageFile);
        }
        if (removeImage) {
            formData.append("removeImage", "true");
        }

        const url = editingId
            ? `/api/admin/categories/${editingId}`
            : "/api/admin/categories";
        const method = editingId ? "PATCH" : "POST";

        try {
            const res = await fetch(url, { method, body: formData });
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to save category");
            }
            toast.success(response.message || "Category saved");
            fetchCategories();
            clearForm();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingForm(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setName(category.name);
        setTitleEn(category.titleEn || "");
        setTitleDe(category.titleDe || "");
        setDescriptionEn(category.descriptionEn || "");
        setDescriptionDe(category.descriptionDe || "");
        const list = Array.isArray(category.features) ? category.features : [];
        setFeatures(list.length > 0 ? list.map((f) => ({ en: f.en || "", de: f.de || "" })) : [emptyFeature()]);
        setImageFile(null);
        setImagePreview(category.imageUrl || null);
        setRemoveImage(false);
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
        setTitleEn("");
        setTitleDe("");
        setDescriptionEn("");
        setDescriptionDe("");
        setFeatures([emptyFeature()]);
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(false);
        setEditingId(null);
    };

    const updateFeature = (index, field, value) => {
        setFeatures((prev) =>
            prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
        );
    };

    const addFeature = () => setFeatures((prev) => [...prev, emptyFeature()]);

    const removeFeature = (index) => {
        setFeatures((prev) => (prev.length <= 1 ? [emptyFeature()] : prev.filter((_, i) => i !== index)));
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold ">Product Categories</h1>
                <p className="text-sm">
                    Manage catalogue categories and homepage showcase cards (titles, descriptions, features, and images).
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6 bg-white shadow-sm">
                <div className="space-y-2 max-w-md">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Indoor"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="titleEn">Card Title (EN)</Label>
                        <Textarea
                            id="titleEn"
                            value={titleEn}
                            onChange={(e) => setTitleEn(e.target.value)}
                            placeholder="Headline shown on the homepage card"
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="titleDe">Card Title (DE)</Label>
                        <Textarea
                            id="titleDe"
                            value={titleDe}
                            onChange={(e) => setTitleDe(e.target.value)}
                            placeholder="Überschrift auf der Homepage-Karte"
                            rows={3}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="descriptionEn">Description (EN)</Label>
                        <Textarea
                            id="descriptionEn"
                            value={descriptionEn}
                            onChange={(e) => setDescriptionEn(e.target.value)}
                            placeholder="Short description under the title"
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descriptionDe">Description (DE)</Label>
                        <Textarea
                            id="descriptionDe"
                            value={descriptionDe}
                            onChange={(e) => setDescriptionDe(e.target.value)}
                            placeholder="Kurzbeschreibung unter dem Titel"
                            rows={3}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Features (bullet points)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add feature
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-start border rounded-md p-3 bg-slate-50"
                            >
                                <Input
                                    value={feature.en}
                                    onChange={(e) => updateFeature(index, "en", e.target.value)}
                                    placeholder="Feature (EN)"
                                />
                                <Input
                                    value={feature.de}
                                    onChange={(e) => updateFeature(index, "de", e.target.value)}
                                    placeholder="Feature (DE)"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFeature(index)}
                                    aria-label="Remove feature"
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 max-w-md">
                    <Label htmlFor="image">Category Image</Label>
                    <div className="flex items-center gap-4">
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                        />
                        <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                    {imagePreview ? (
                        <div className="relative mt-2 h-32 w-48 rounded border overflow-hidden">
                            <Image
                                src={imagePreview}
                                alt="Category preview"
                                fill
                                className="object-cover"
                                unoptimized={imagePreview.startsWith("data:")}
                            />
                        </div>
                    ) : null}
                    {editingId && imagePreview && !removeImage ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setRemoveImage(true);
                                setImageFile(null);
                                setImagePreview(null);
                            }}
                        >
                            Remove image
                        </Button>
                    ) : null}
                </div>

                <div className="flex gap-2">
                    {editingId ? (
                        <>
                            <Button type="submit" className="bg-primary" disabled={loadingForm}>
                                Save Category
                            </Button>
                            <Button type="button" variant="outline" onClick={clearForm}>
                                Clear
                            </Button>
                        </>
                    ) : (
                        <Button type="submit" size="lg" className="bg-primary" disabled={loadingForm}>
                            Add Category
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

            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary ">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Image</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Name</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Title (EN)</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Products</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && filteredCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading categories...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <TableRow
                                    key={category.id}
                                    className="even:bg-[#EAF6FF] "
                                >
                                    <TableCell className="p-4">
                                        {category.imageUrl ? (
                                            <div className="relative h-12 w-16 rounded overflow-hidden">
                                                <Image
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{category.name}</TableCell>
                                    <TableCell className="p-4 max-w-xs truncate">
                                        {category.titleEn || "—"}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{category.productCount}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div>
                                            <Button variant="link" onClick={() => handleEdit(category)}>
                                                Edit
                                            </Button>
                                            <Button variant="link" onClick={() => openDeleteDialog(category)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No categories found.
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
                            This will permanently delete the category &quot;{categoryToDelete?.name}&quot;.
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

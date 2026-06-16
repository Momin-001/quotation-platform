"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Trash2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchProducts, setSearchProducts] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [exporting, setExporting] = useState(false);
    const [bulkUpdating, setBulkUpdating] = useState(false);
    const bulkUpdateInputRef = useRef(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        let filtered = [...products];
        if (searchProducts) {
            filtered = filtered.filter(
                (product) =>
                    product.productName?.toLowerCase().includes(searchProducts.toLowerCase()) ||
                    product.productNumber?.toLowerCase().includes(searchProducts.toLowerCase())
            );
        }
        if (selectedCategory && selectedCategory !== "all") {
            filtered = filtered.filter(
                (product) => product.areaOfUseId === selectedCategory
            );
        }
        setFilteredProducts(filtered);
    }, [searchProducts, selectedCategory, products]);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await fetch("/api/admin/products");
            const response = await res.json();
            if (!response.success) throw new Error(response.message || "Failed to fetch products");
            setProducts(response.data);
            setFilteredProducts(response.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/categories");
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            setCategories(response.data);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "N/A";
    };

    const toggleProductStatus = async (id, currentStatus) => {
        setProducts((prev) =>
            prev.map((product) =>
                product.id === id ? { ...product, isActive: !currentStatus } : product
            )
        );
        try {
            const res = await fetch(`/api/admin/products/${id}/toggle-status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            const response = await res.json();
            if (!response.success) {
                setProducts((prev) =>
                    prev.map((product) =>
                        product.id === id ? { ...product, isActive: currentStatus } : product
                    )
                );
                toast.error(response.message || "Failed to update product status");
                return;
            }
            toast.success(response.message || "Product status updated");
        } catch (error) {
            setProducts((prev) =>
                prev.map((product) =>
                    product.id === id ? { ...product, isActive: currentStatus } : product
                )
            );
            toast.error(error.message);
        }
    };

    const deleteProduct = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            toast.success("Product deleted");
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            toast.error(error.message);
        }
    };

    const bulkUpdateProducts = async (file) => {
        if (!file) return;
        setBulkUpdating(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/admin/products/bulk-update", {
                method: "POST",
                body: formData,
            });
            const response = await res.json();
            if (!response.success) throw new Error(response.message || "Bulk update failed");
            toast.success(response.message);
            fetchProducts();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setBulkUpdating(false);
            if (bulkUpdateInputRef.current) bulkUpdateInputRef.current.value = "";
        }
    };

    const exportProducts = async () => {
        setExporting(true);
        try {
            const res = await fetch("/api/admin/products/export-products");
            if (!res.ok) {
                const json = await res.json().catch(() => null);
                throw new Error(json?.message || "Failed to export products");
            }
            const blob = await res.blob();
            const disposition = res.headers.get("Content-Disposition");
            const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
            const filename =
                filenameMatch?.[1] ||
                `products-${new Date().toISOString().slice(0, 10)}.xlsx`;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Products exported successfully");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">LED Products</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage all LED products.
                    </p>
                </div>
                <Link href="/admin/products/add">
                    <Button size="lg" className="bg-primary gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            <div className="flex justify-end items-center gap-4 mb-4">
                <div className="relative">
                    <Search className="absolute left-2 top-4 h-4 w-4" />
                    <Input
                        placeholder="Search by name or product number..."
                        value={searchProducts}
                        onChange={(e) => setSearchProducts(e.target.value)}
                        className="pl-8 placeholder:text-gray-800"
                    />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={exportProducts}
                    disabled={exporting}
                >
                    {exporting ? (
                        <>
                            <Spinner className="h-4 w-4" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4" />
                            Export Products
                        </>
                    )}
                </Button>
                <input
                    ref={bulkUpdateInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.xlsm"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) bulkUpdateProducts(file);
                    }}
                />
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => bulkUpdateInputRef.current?.click()}
                    disabled={bulkUpdating}
                >
                    {bulkUpdating ? (
                        <>
                            <Spinner className="h-4 w-4" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4" />
                            Bulk Update
                        </>
                    )}
                </Button>
            </div>

            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Product Name</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Product Number</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Type</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Category</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Pixel Pitch</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Brightness</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Last Updated</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Status</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingProducts && filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading products...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id} className="even:bg-[#EAF6FF]">
                                    <TableCell className="p-4 whitespace-nowrap">{product.productName}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.productNumber}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.productType}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {getCategoryName(product.areaOfUseId)}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.pixelPitch}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.brightnessValue}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {new Date(product.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div className="flex gap-2 items-center">
                                            <span className={`text-sm ${product.isActive ? "text-secondary" : "text-red-500"}`}>
                                                {product.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <Switch
                                                checked={product.isActive}
                                                onCheckedChange={() => toggleProductStatus(product.id, product.isActive)}
                                                className="ml-2 data-[state=checked]:bg-secondary"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <Link href={`/admin/products/${product.id}/edit`}>
                                            <Button variant="link">Edit</Button>
                                        </Link>
                                        <Button
                                            variant="link"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => deleteProduct(product.id)}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

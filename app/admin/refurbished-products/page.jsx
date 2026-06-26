"use client";

import { useEffect, useState } from "react";
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
import { Search, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function RefurbishedProductsPage() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        let list = [...products];
        if (search) {
            list = list.filter(
                (p) =>
                    p.serie?.toLowerCase().includes(search.toLowerCase()) ||
                    p.productNumber?.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (selectedCategory && selectedCategory !== "all") {
            list = list.filter((p) => p.areaOfUseId === selectedCategory);
        }
        setFiltered(list);
    }, [search, selectedCategory, products]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/refurbished-products");
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            setProducts(response.data);
            setFiltered(response.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
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

    const getCategoryName = (categoryId) => categories.find((c) => c.id === categoryId)?.name || "N/A";

    const toggleStatus = async (id, currentStatus) => {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p)));
        try {
            const res = await fetch(`/api/admin/refurbished-products/${id}/toggle-status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            const response = await res.json();
            if (!response.success) {
                setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: currentStatus } : p)));
                toast.error(response.message || "Failed to update status");
                return;
            }
            toast.success(response.message);
        } catch (error) {
            setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: currentStatus } : p)));
            toast.error(error.message);
        }
    };

    const deleteProduct = async (id) => {
        if (!confirm("Are you sure you want to delete this refurbished product?")) return;
        try {
            const res = await fetch(`/api/admin/refurbished-products/${id}`, { method: "DELETE" });
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            toast.success("Refurbished product deleted");
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Refurbished Products</h1>
                    <p className="text-sm text-muted-foreground">View and manage all refurbished (used) products.</p>
                </div>
                <Link href="/admin/refurbished-products/add">
                    <Button size="lg" className="bg-primary gap-2">
                        <Plus className="h-4 w-4" />
                        Add Refurbished Product
                    </Button>
                </Link>
            </div>

            <div className="flex justify-end items-center gap-4 mb-4">
                <div className="relative">
                    <Search className="absolute left-2 top-4 h-4 w-4" />
                    <Input
                        placeholder="Search by serie or product number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 placeholder:text-gray-800"
                    />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by area of use" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Areas</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Serie</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Product Number</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Type</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Area of Use</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Pixel Pitch</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Quality</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Last Updated</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Status</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading refurbished products...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filtered.length > 0 ? (
                            filtered.map((product) => (
                                <TableRow key={product.id} className="even:bg-[#EAF6FF]">
                                    <TableCell className="p-4 whitespace-nowrap">{product.serie}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.productNumber}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.productType}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{getCategoryName(product.areaOfUseId)}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.pixelPitch}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.levelOfQuality}</TableCell>
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
                                                onCheckedChange={() => toggleStatus(product.id, product.isActive)}
                                                className="ml-2 data-[state=checked]:bg-secondary"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <Link href={`/admin/refurbished-products/${product.id}/edit`}>
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
                                    No refurbished products found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

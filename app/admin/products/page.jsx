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
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (search) {
            filtered = filtered.filter(
                (product) =>
                    product.productNameEn?.toLowerCase().includes(search.toLowerCase()) ||
                    product.productNameDe?.toLowerCase().includes(search.toLowerCase()) ||
                    product.productNumber?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(
                (product) => product.areaOfUseId === selectedCategory
            );
        }

        setFilteredProducts(filtered);
    }, [search, selectedCategory, products]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/products");
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch products");
            }
            setProducts(response.data);
            setFilteredProducts(response.data);
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
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch categories");
            }
            setCategories(response.data);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "N/A";
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-archivo">Products Management</h1>
                <p className="text-sm">
                    View and manage all products in the system.
                </p>
            </div>

            {/* Search, Filter, and Add Button */}
            <div className="flex justify-end items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-2 top-4 h-4 w-4" />
                    <Input
                        placeholder="Search by name or product number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
                <Link href="/admin/products/add">
                    <Button size="lg" className="bg-primary gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary font-archivo">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Product Name</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Product Number</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Type</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Category</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Pixel Pitch</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Brightness</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Last Updated</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading products...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <TableRow
                                    key={product.id}
                                    className="even:bg-[#EAF6FF] font-open-sans"
                                >
                                    <TableCell className="p-4 whitespace-nowrap">{product.productName}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.productNumber}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.productType}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {getCategoryName(product.areaOfUseId)}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.pixelPitch}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{product.brightness}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {new Date(product.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div>
                                            <Button variant="link" size="sm">
                                                Edit
                                            </Button>
                                            <Button variant="link" size="sm" className="text-red-600">
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
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

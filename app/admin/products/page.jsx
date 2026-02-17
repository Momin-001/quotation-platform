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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function ProductsPage() {
    // LED Products state
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchProducts, setSearchProducts] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);

    // Controllers state
    const [controllersList, setControllersList] = useState([]);
    const [filteredControllers, setFilteredControllers] = useState([]);
    const [loadingControllers, setLoadingControllers] = useState(false);
    const [searchControllers, setSearchControllers] = useState("");

    // Accessories state
    const [accessoriesList, setAccessoriesList] = useState([]);
    const [filteredAccessories, setFilteredAccessories] = useState([]);
    const [loadingAccessories, setLoadingAccessories] = useState(false);
    const [searchAccessories, setSearchAccessories] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchControllers();
        fetchAccessories();
    }, []);

    // --- LED Products ---
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

    // --- Controllers ---
    useEffect(() => {
        let filtered = [...controllersList];
        if (searchControllers) {
            filtered = filtered.filter(
                (c) =>
                    c.productName?.toLowerCase().includes(searchControllers.toLowerCase()) ||
                    c.productNumber?.toLowerCase().includes(searchControllers.toLowerCase()) ||
                    c.brandName?.toLowerCase().includes(searchControllers.toLowerCase())
            );
        }
        setFilteredControllers(filtered);
    }, [searchControllers, controllersList]);

    const fetchControllers = async () => {
        setLoadingControllers(true);
        try {
            const res = await fetch("/api/admin/controllers");
            const response = await res.json();
            if (!response.success) throw new Error(response.message || "Failed to fetch controllers");
            setControllersList(response.data);
            setFilteredControllers(response.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingControllers(false);
        }
    };

    const deleteController = async (id) => {
        if (!confirm("Are you sure you want to delete this controller?")) return;
        try {
            const res = await fetch(`/api/admin/controllers/${id}`, { method: "DELETE" });
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            toast.success("Controller deleted");
            setControllersList((prev) => prev.filter((c) => c.id !== id));
        } catch (error) {
            toast.error(error.message);
        }
    };

    // --- Accessories ---
    useEffect(() => {
        let filtered = [...accessoriesList];
        if (searchAccessories) {
            filtered = filtered.filter(
                (a) =>
                    a.productName?.toLowerCase().includes(searchAccessories.toLowerCase()) ||
                    a.productNumber?.toLowerCase().includes(searchAccessories.toLowerCase())
            );
        }
        if (selectedGroup && selectedGroup !== "all") {
            filtered = filtered.filter(
                (a) => a.productGroup === selectedGroup
            );
        }
        setFilteredAccessories(filtered);
    }, [searchAccessories, selectedGroup, accessoriesList]);

    const fetchAccessories = async () => {
        setLoadingAccessories(true);
        try {
            const res = await fetch("/api/admin/accessories");
            const response = await res.json();
            if (!response.success) throw new Error(response.message || "Failed to fetch accessories");
            setAccessoriesList(response.data);
            setFilteredAccessories(response.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingAccessories(false);
        }
    };

    const deleteAccessory = async (id) => {
        if (!confirm("Are you sure you want to delete this accessory?")) return;
        try {
            const res = await fetch(`/api/admin/accessories/${id}`, { method: "DELETE" });
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            toast.success("Accessory deleted");
            setAccessoriesList((prev) => prev.filter((a) => a.id !== id));
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold font-archivo">Products Management</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage all products, controllers, and accessories.
                    </p>
                </div>
                <Link href="/admin/products/add">
                    <Button size="lg" className="bg-primary gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="led" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="led">LED Products ({products.length})</TabsTrigger>
                    <TabsTrigger value="controllers">Controllers ({controllersList.length})</TabsTrigger>
                    <TabsTrigger value="accessories">Accessories ({accessoriesList.length})</TabsTrigger>
                </TabsList>

                {/* LED Products Tab */}
                <TabsContent value="led">
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
                    </div>

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
                                        <TableRow key={product.id} className="even:bg-[#EAF6FF] font-open-sans">
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
                                                    <span className={`text-sm ${product.isActive ? 'text-secondary' : 'text-red-500'}`}>
                                                        {product.isActive ? 'Active' : 'Inactive'}
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
                                                    <Button variant="outline" size="sm" className="gap-1">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit
                                                    </Button>
                                                </Link>
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
                </TabsContent>

                {/* Controllers Tab */}
                <TabsContent value="controllers">
                    <div className="flex justify-end items-center gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-4 h-4 w-4" />
                            <Input
                                placeholder="Search by name, number, or brand..."
                                value={searchControllers}
                                onChange={(e) => setSearchControllers(e.target.value)}
                                className="pl-8 placeholder:text-gray-800"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader className="bg-secondary font-archivo">
                                <TableRow>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Product Name</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Product Number</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Brand</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Interface</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Pixel Capacity</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Purchase Price</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Retail Price</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Last Updated</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingControllers && filteredControllers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Spinner className="h-5 w-5" />
                                                <span>Loading controllers...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredControllers.length > 0 ? (
                                    filteredControllers.map((controller) => (
                                        <TableRow key={controller.id} className="even:bg-[#EAF6FF] font-open-sans">
                                            <TableCell className="p-4 whitespace-nowrap">{controller.productName}</TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">{controller.productNumber}</TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">{controller.brandName || "N/A"}</TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">{controller.interfaceName || "N/A"}</TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">
                                                {controller.pixelCapacity ? controller.pixelCapacity.toLocaleString() : "N/A"}
                                            </TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">
                                                {controller.purchasePrice ? `€${controller.purchasePrice}` : "N/A"}
                                            </TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">
                                                {controller.retailPrice ? `€${controller.retailPrice}` : "N/A"}
                                            </TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">
                                                {new Date(controller.updatedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/controllers/${controller.id}/edit`}>
                                                        <Button variant="outline" size="sm" className="gap-1">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => deleteController(controller.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            No controllers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* Accessories Tab */}
                <TabsContent value="accessories">
                    <div className="flex justify-end items-center gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-4 h-4 w-4" />
                            <Input
                                placeholder="Search by name or product number..."
                                value={searchAccessories}
                                onChange={(e) => setSearchAccessories(e.target.value)}
                                className="pl-8 placeholder:text-gray-800"
                            />
                        </div>
                        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter by group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Groups</SelectItem>
                                <SelectItem value="Mechanics">Mechanics</SelectItem>
                                <SelectItem value="Service">Service</SelectItem>
                                <SelectItem value="Software">Software</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader className="bg-secondary font-archivo">
                                <TableRow>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Product Name</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Product Number</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Group</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Short Text</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Manufacturer</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Purchase Price</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Retail Price</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Lead Time</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingAccessories && filteredAccessories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Spinner className="h-5 w-5" />
                                                <span>Loading accessories...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAccessories.length > 0 ? (
                                    filteredAccessories.map((accessory) => (
                                        <TableRow key={accessory.id} className="even:bg-[#EAF6FF] font-open-sans">
                                            <TableCell className="p-4 whitespace-nowrap">{accessory.productName}</TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">{accessory.productNumber}</TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                    {accessory.productGroup}
                                                </span>
                                            </TableCell>
                                            <TableCell className="p-4 max-w-[200px] truncate">{accessory.shortText || "N/A"}</TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">{accessory.manufacturer || "N/A"}</TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">
                                                {accessory.purchasePrice ? `€${accessory.purchasePrice}` : "N/A"}
                                            </TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">
                                                {accessory.retailPrice ? `€${accessory.retailPrice}` : "N/A"}
                                            </TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">{accessory.leadTime || "N/A"}</TableCell>
                                            <TableCell className="p-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/accessories/${accessory.id}/edit`}>
                                                        <Button variant="outline" size="sm" className="gap-1">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => deleteAccessory(accessory.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            No accessories found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

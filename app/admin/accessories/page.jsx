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
import { Search, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function AccessoriesPage() {
    const [accessoriesList, setAccessoriesList] = useState([]);
    const [filteredAccessories, setFilteredAccessories] = useState([]);
    const [loadingAccessories, setLoadingAccessories] = useState(false);
    const [searchAccessories, setSearchAccessories] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");

    useEffect(() => {
        fetchAccessories();
    }, []);

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
            filtered = filtered.filter((a) => a.productGroup === selectedGroup);
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
                    <h1 className="text-2xl font-bold">Accessories</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage all accessories.
                    </p>
                </div>
                <Link href="/admin/accessories/add">
                    <Button size="lg" className="bg-primary gap-2">
                        <Plus className="h-4 w-4" />
                        Add Accessory
                    </Button>
                </Link>
            </div>

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
                    <TableHeader className="bg-secondary">
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
                                <TableRow key={accessory.id} className="even:bg-[#EAF6FF]">
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
                                                <Button variant="link">Edit</Button>
                                            </Link>
                                            <Button
                                                variant="link"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => deleteAccessory(accessory.id)}
                                            >
                                                <Trash2 />
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
        </div>
    );
}

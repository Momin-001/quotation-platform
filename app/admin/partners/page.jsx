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
import { Search, Upload } from "lucide-react";
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

export default function PartnersPage() {
    const [partners, setPartners] = useState([]);
    const [filteredPartners, setFilteredPartners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("");

    // Form states
    const [name, setName] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [partnerToDelete, setPartnerToDelete] = useState(null);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/partners");
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch partners");
            }
            setPartners(response.data);
            setFilteredPartners(response.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    // Search and sort
    useEffect(() => {
        let filtered = [...partners];

        // Search
        if (search) {
            filtered = filtered.filter(
                (partner) =>
                    partner.name.toLowerCase().includes(search.toLowerCase()) ||
                    partner.websiteUrl.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            } else if (sortBy === "clicks") {
                return b.clickCount - a.clickCount;
            }
            return 0;
        });

        setFilteredPartners(filtered);
    }, [search, sortBy, partners]);

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim() || !websiteUrl.trim()) {
            toast.error("Name and website URL are required");
            return;
        }

        if (!editingId && !logoFile) {
            toast.error("Logo is required");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("websiteUrl", websiteUrl.trim());
        if (logoFile) {
            formData.append("logo", logoFile);
        }

        const url = editingId
            ? `/api/admin/partners/${editingId}`
            : "/api/admin/partners";
        const method = editingId ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method,
                body: formData,
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to update partner");
            }
            toast.success(response.message || "Partner updated");
            fetchPartners();
            clearForm();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEdit = (partner) => {
        setEditingId(partner.id);
        setName(partner.name);
        setWebsiteUrl(partner.websiteUrl);
        setLogoPreview(partner.logoUrl);
        setLogoFile(null);
    };

    const openDeleteDialog = (partner) => {
        setPartnerToDelete(partner);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!partnerToDelete) return;

        try {
            const res = await fetch(`/api/admin/partners/${partnerToDelete.id}`, {
                method: "DELETE",
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to delete partner");
            }
            toast.success(response.message || "Partner deleted");
            fetchPartners();
            if (editingId === partnerToDelete.id) clearForm();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleteDialogOpen(false);
            setPartnerToDelete(null);
        }
    };

    const clearForm = () => {
        setName("");
        setWebsiteUrl("");
        setLogoFile(null);
        setLogoPreview(null);
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-archivo">Partners & Manufacturers</h1>
                <p className="text-sm">
                    Create, manage product affiliates such as gree patch, brighttown level, UV strings, and more.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Partner Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Samsung"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="websiteUrl">Website Link</Label>
                        <Input
                            id="websiteUrl"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="logo">Logo Upload</Label>
                    <div className="flex items-start gap-4">
                        <label
                            htmlFor="logo"
                            className="flex items-center justify-center shadow-xs h-24 bg-white w-24 border rounded-lg cursor-pointer"
                        >
                            <span className="text-4xl text-gray-400">+</span>
                        </label>
                        <input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                        />
                        {logoPreview && (
                            <div className="relative h-24 w-24 shadow-xs bg-white border rounded-lg overflow-hidden">
                                <Image
                                    src={logoPreview}
                                    alt="Logo preview"
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
                                Edit Partner
                            </Button>
                            <Button type="button" size="lg" variant="outline" onClick={clearForm}>
                                Clear
                            </Button>
                        </>
                    ) : (
                        <Button type="submit" size="lg" className="bg-primary">
                            Add Partner
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
                        <SelectItem value="clicks">Click Count</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary font-archivo">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Logo</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Name</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Website</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Click Count</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && filteredPartners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading partners...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredPartners.length > 0 ? (
                            filteredPartners.map((partner) => (
                                <TableRow
                                    key={partner.id}
                                    className="even:bg-[#EAF6FF] font-open-sans"
                                >
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div className="relative h-12 w-20">
                                            <Image
                                                src={partner.logoUrl}
                                                alt={partner.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{partner.name}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{partner.websiteUrl}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{partner.clickCount}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div>
                                            <Button
                                                variant="link"
                                                onClick={() => handleEdit(partner)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="link"
                                                onClick={() => openDeleteDialog(partner)}
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
                                    No partners found.
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
                            This will permanently delete the partner "{partnerToDelete?.name}".
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

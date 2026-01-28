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

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState([]);
    const [filteredCertificates, setFilteredCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name");

    // Form states
    const [name, setName] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [certificateToDelete, setCertificateToDelete] = useState(null);

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/certificates");
            const data = await res.json();

            if (data.success) {
                setCertificates(data.data);
                setFilteredCertificates(data.data);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch certificates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    // Search and sort
    useEffect(() => {
        let filtered = [...certificates];

        // Search
        if (search) {
            filtered = filtered.filter(
                (cert) =>
                    cert.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            } else if (sortBy === "date") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return 0;
        });

        setFilteredCertificates(filtered);
    }, [search, sortBy, certificates]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Certificate name is required");
            return;
        }

        if (!editingId && !imageFile) {
            toast.error("Certificate image is required");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        if (imageFile) {
            formData.append("image", imageFile);
        }

        const url = editingId
            ? `/api/admin/certificates/${editingId}`
            : "/api/admin/certificates";
        const method = editingId ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method,
                body: formData,
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to update certificate");
            }
            toast.success(response.message || "Certificate updated");
            fetchCertificates();
            clearForm();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEdit = (certificate) => {
        setEditingId(certificate.id);
        setName(certificate.name);
        setImagePreview(certificate.imageUrl);
        setImageFile(null);
    };

    const openDeleteDialog = (certificate) => {
        setCertificateToDelete(certificate);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!certificateToDelete) return;

        try {
            const res = await fetch(`/api/admin/certificates/${certificateToDelete.id}`, {
                method: "DELETE",
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to delete certificate");
            }
            toast.success(response.message || "Certificate deleted");
            fetchCertificates();
            if (editingId === certificateToDelete.id) clearForm();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleteDialogOpen(false);
            setCertificateToDelete(null);
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
                <h1 className="text-2xl font-bold font-archivo">Certificates Management</h1>
                <p className="text-sm">
                    Create, manage certificates that can be assigned to products.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Certificate Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., ISO 9001"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image">Certificate Image Upload</Label>
                    <div className="flex items-start gap-4">
                        <label
                            htmlFor="image"
                            className="flex items-center justify-center shadow-xs h-24 bg-white w-24 border rounded-lg cursor-pointer"
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
                                    alt="Certificate preview"
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
                                Edit Certificate
                            </Button>
                            <Button type="button" size="lg" variant="outline" onClick={clearForm}>
                                Clear
                            </Button>
                        </>
                    ) : (
                        <Button type="submit" size="lg" className="bg-primary">
                            Add Certificate
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="lg" className="gap-2 text-gray-800">
                            Sort By {sortBy === "name" ? "Name" : "Date"}
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSortBy("name")}>
                            Name
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("date")}>
                            Date
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
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
                        {loading && filteredCertificates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading certificates...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredCertificates.length > 0 ? (
                            filteredCertificates.map((certificate) => (
                                <TableRow
                                    key={certificate.id}
                                    className="even:bg-[#EAF6FF] font-open-sans"
                                >
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div className="relative h-12 w-20">
                                            <Image
                                                src={certificate.imageUrl}
                                                alt={certificate.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{certificate.name}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {new Date(certificate.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div>
                                            <Button
                                                variant="link"
                                                onClick={() => handleEdit(certificate)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="link"
                                                onClick={() => openDeleteDialog(certificate)}
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
                                    No certificates found.
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
                            This will permanently delete the certificate "{certificateToDelete?.name}".
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

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
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
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

export default function AdvertisementsPage() {
    const [ads, setAds] = useState([]);
    const [filteredAds, setFilteredAds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    // Form states
    const [title, setTitle] = useState("");
    const [redirectUrl, setRedirectUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [adToDelete, setAdToDelete] = useState(null);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/advertisements");
            const response = await res.json();
            if (!response.success) throw new Error(response.message || "Failed to fetch advertisements");
            setAds(response.data);
            setFilteredAds(response.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    useEffect(() => {
        let filtered = [...ads];
        if (search) {
            filtered = filtered.filter(
                (ad) =>
                    ad.title.toLowerCase().includes(search.toLowerCase()) ||
                    ad.redirectUrl.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFilteredAds(filtered);
    }, [search, ads]);

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
        if (!title.trim() || !redirectUrl.trim()) {
            toast.error("Title and redirect URL are required");
            return;
        }
        if (!editingId && !imageFile) {
            toast.error("Image is required");
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("redirectUrl", redirectUrl.trim());
        if (imageFile) formData.append("image", imageFile);

        const url = editingId ? `/api/admin/advertisements/${editingId}` : "/api/admin/advertisements";
        const method = editingId ? "PATCH" : "POST";

        try {
            const res = await fetch(url, { method, body: formData });
            const response = await res.json();
            if (!response.success) throw new Error(response.message || "Failed to save advertisement");
            toast.success(response.message);
            fetchAds();
            clearForm();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEdit = (ad) => {
        setEditingId(ad.id);
        setTitle(ad.title);
        setRedirectUrl(ad.redirectUrl);
        setImagePreview(ad.imageUrl);
        setImageFile(null);
    };

    const toggleActive = async (ad) => {
        setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, isActive: !a.isActive } : a)));
        try {
            const formData = new FormData();
            formData.append("isActive", String(!ad.isActive));
            const res = await fetch(`/api/admin/advertisements/${ad.id}`, { method: "PATCH", body: formData });
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            toast.success(!ad.isActive ? "Advertisement activated" : "Advertisement deactivated");
        } catch (error) {
            setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, isActive: ad.isActive } : a)));
            toast.error(error.message);
        }
    };

    const confirmDelete = async () => {
        if (!adToDelete) return;
        try {
            const res = await fetch(`/api/admin/advertisements/${adToDelete.id}`, { method: "DELETE" });
            const response = await res.json();
            if (!response.success) throw new Error(response.message || "Failed to delete advertisement");
            toast.success(response.message);
            fetchAds();
            if (editingId === adToDelete.id) clearForm();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleteDialogOpen(false);
            setAdToDelete(null);
        }
    };

    const clearForm = () => {
        setTitle("");
        setRedirectUrl("");
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Advertisements</h1>
                <p className="text-sm">
                    Banners shown on the Refurbished Products listing page. Active ads appear at random; if none are active, no banner is shown.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Summer Sale" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="redirectUrl">Redirect URL</Label>
                        <Input id="redirectUrl" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="https://example.com" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image">Advertisement Image</Label>
                    <div className="flex items-start gap-4">
                        <label htmlFor="image" className="flex items-center justify-center shadow-xs h-24 bg-white w-40 border rounded-lg cursor-pointer">
                            <span className="text-4xl text-gray-400">+</span>
                        </label>
                        <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        {imagePreview && (
                            <div className="relative h-24 w-40 shadow-xs bg-white border rounded-lg overflow-hidden">
                                <Image src={imagePreview} alt="Advertisement preview" fill className="object-contain p-2" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    {editingId ? (
                        <>
                            <Button type="submit" size="lg" className="bg-primary">Update Advertisement</Button>
                            <Button type="button" size="lg" variant="outline" onClick={clearForm}>Clear</Button>
                        </>
                    ) : (
                        <Button type="submit" size="lg" className="bg-primary">Add Advertisement</Button>
                    )}
                </div>
            </form>

            {/* Search */}
            <div className="flex justify-end items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-2 top-4 h-4 w-4" />
                    <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 placeholder:text-gray-800" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Image</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Title</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Redirect URL</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Clicks</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Active</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && filteredAds.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading advertisements...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredAds.length > 0 ? (
                            filteredAds.map((ad) => (
                                <TableRow key={ad.id} className="even:bg-[#EAF6FF]">
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div className="relative h-12 w-24">
                                            <Image src={ad.imageUrl} alt={ad.title} fill className="object-contain" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{ad.title}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap max-w-[280px] truncate">{ad.redirectUrl}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{ad.clickCount}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <Switch
                                            checked={ad.isActive}
                                            onCheckedChange={() => toggleActive(ad)}
                                            className="data-[state=checked]:bg-secondary"
                                        />
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <Button variant="link" onClick={() => handleEdit(ad)}>Edit</Button>
                                        <Button
                                            variant="link"
                                            onClick={() => {
                                                setAdToDelete(ad);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">No advertisements found.</TableCell>
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
                            This will permanently delete the advertisement "{adToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

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

export default function FAQsPage() {
    const [faqs, setFaqs] = useState([]);
    const [filteredFaqs, setFilteredFaqs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState(null);
    // Form states
    const [titleEn, setTitleEn] = useState("");
    const [titleDe, setTitleDe] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [descriptionDe, setDescriptionDe] = useState("");
    const [editingId, setEditingId] = useState(null);

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/faqs");
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch FAQs");
            }
            setFaqs(response.data);
            setFilteredFaqs(response.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQs();
    }, []);

    // Search and sort
    useEffect(() => {
        let filtered = [...faqs];

        // Search
        if (search) {
            filtered = filtered.filter(
                (faq) =>
                    faq.titleEn.toLowerCase().includes(search.toLowerCase()) ||
                    faq.titleDe.toLowerCase().includes(search.toLowerCase()) ||
                    faq.descriptionEn.toLowerCase().includes(search.toLowerCase()) ||
                    faq.descriptionDe.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === "title") {
                return a.titleEn.localeCompare(b.titleEn);
            } else if (sortBy === "date") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return 0;
        });

        setFilteredFaqs(filtered);
    }, [search, sortBy, faqs]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!titleEn.trim()) {
            toast.error("FAQ Title EN is required");
            return;
        }
        if (!titleDe.trim()) {
            toast.error("FAQ Title DE is required");
            return;
        }
        if (!descriptionEn.trim()) {
            toast.error("FAQ Description EN is required");
            return;
        }
        if (!descriptionDe.trim()) {
            toast.error("FAQ Description DE is required");
            return;
        }

        const url = editingId
            ? `/api/admin/faqs/${editingId}`
            : "/api/admin/faqs";
        const method = editingId ? "PATCH" : "POST";

        const body = {
            titleEn: titleEn.trim(),
            titleDe: titleDe.trim(),
            descriptionEn: descriptionEn.trim(),
            descriptionDe: descriptionDe.trim(),
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to update FAQ");
            }
            toast.success(response.message || "FAQ updated");
            fetchFAQs();
            clearForm();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEdit = (faq) => {
        setEditingId(faq.id);
        setTitleEn(faq.titleEn);
        setTitleDe(faq.titleDe);
        setDescriptionEn(faq.descriptionEn);
        setDescriptionDe(faq.descriptionDe);
    };

    const openDeleteDialog = (faq) => {
        setFaqToDelete(faq);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!faqToDelete) return;

        try {
            const res = await fetch(`/api/admin/faqs/${faqToDelete.id}`, {
                method: "DELETE",
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to delete FAQ");
            }
            toast.success(response.message || "FAQ deleted");
            fetchFAQs();
            if (editingId === faqToDelete.id) clearForm();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleteDialogOpen(false);
            setFaqToDelete(null);
        }
    };

    const clearForm = () => {
        setTitleEn("");
        setTitleDe("");
        setDescriptionEn("");
        setDescriptionDe("");
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-archivo">FAQ Management</h1>
                <p className="text-sm">
                    Create, edit, or remove frequently asked questions.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="titleEn">
                            FAQ Title EN <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="titleEn"
                            value={titleEn}
                            onChange={(e) => setTitleEn(e.target.value)}
                            placeholder="Enter FAQ title in English"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="titleDe">
                            FAQ Title DE <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="titleDe"
                            value={titleDe}
                            onChange={(e) => setTitleDe(e.target.value)}
                            placeholder="Enter FAQ title in German"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="descriptionEn">
                            FAQ Description EN <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="descriptionEn"
                            value={descriptionEn}
                            onChange={(e) => setDescriptionEn(e.target.value)}
                            placeholder="Enter FAQ description in English"
                            rows={4}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descriptionDe">
                            FAQ Description DE <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="descriptionDe"
                            value={descriptionDe}
                            onChange={(e) => setDescriptionDe(e.target.value)}
                            placeholder="Enter FAQ description in German"
                            rows={4}
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    {editingId ? (
                        <>
                            <Button type="submit" className="bg-primary">
                                Update FAQ
                            </Button>
                            <Button type="button" variant="outline" onClick={clearForm}>
                                Clear
                            </Button>
                        </>
                    ) : (
                        <Button type="submit" size="lg" className="bg-primary">
                            Add FAQ
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
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="date">Date Created</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary font-archivo">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Title EN</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Title DE</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Description EN</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Description DE</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && filteredFaqs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading FAQs...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq) => (
                                <TableRow
                                    key={faq.id}
                                    className="even:bg-[#EAF6FF] font-open-sans"
                                >
                                    <TableCell className="p-4">{faq.titleEn}</TableCell>
                                    <TableCell className="p-4">{faq.titleDe}</TableCell>
                                    <TableCell className="p-4 max-w-xs truncate">
                                        {faq.descriptionEn}
                                    </TableCell>
                                    <TableCell className="p-4 max-w-xs truncate">
                                        {faq.descriptionDe}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="link"
                                                onClick={() => handleEdit(faq)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="link"
                                                onClick={() => openDeleteDialog(faq)}
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
                                    No FAQs found.
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
                            This will permanently delete the FAQ "{faqToDelete?.titleEn}".
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

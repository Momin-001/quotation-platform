"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { name: "", description: "" };

export default function ProductGroupsPage() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null); // group being edited, or null when creating
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch("/api/admin/product-groups");
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            setGroups(response.data || []);
        } catch (error) {
            toast.error(error.message || "Failed to fetch product groups");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEdit = (group) => {
        setEditing(group);
        setForm({ name: group.name || "", description: group.description || "" });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error("Group name is required");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(
                editing ? `/api/admin/product-groups/${editing.id}` : "/api/admin/product-groups",
                {
                    method: editing ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: form.name.trim(),
                        description: form.description.trim(),
                    }),
                }
            );
            const response = await res.json();
            if (!response.success) throw new Error(response.message);

            toast.success(response.message);
            setDialogOpen(false);
            await fetchGroups();
        } catch (error) {
            toast.error(error.message || "Failed to save product group");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (group) => {
        const warning = group.productCount
            ? `Delete "${group.name}"? Its ${group.productCount} product${group.productCount === 1 ? "" : "s"} will stay, but will no longer belong to a group.`
            : `Delete "${group.name}"?`;
        if (!window.confirm(warning)) return;

        setDeletingId(group.id);
        try {
            const res = await fetch(`/api/admin/product-groups/${group.id}`, { method: "DELETE" });
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            setGroups((prev) => prev.filter((g) => g.id !== group.id));
            toast.success("Product group deleted");
        } catch (error) {
            toast.error(error.message || "Failed to delete product group");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Related Products Groups</h1>
                    <p className="text-gray-600 mt-1 max-w-2xl">
                        Products in a group share some specifications. Picking a group on the product form fills in the rest.
                    </p>
                </div>
                <Button onClick={openCreate} size="lg" className="shrink-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Group
                </Button>
            </div>

            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Group Name</TableHead>
                            <TableHead className="p-4 text-white">Description</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Products</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading groups...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : groups.length > 0 ? (
                            groups.map((group) => (
                                <TableRow key={group.id} className="even:bg-[#EAF6FF]">
                                    <TableCell className="p-4 font-medium whitespace-nowrap">
                                        {group.name}
                                    </TableCell>
                                    <TableCell className="p-4 max-w-[380px] truncate text-muted-foreground">
                                        {group.description || "—"}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {group.productCount || 0}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div className="flex gap-2">
                                            <Button variant="link" onClick={() => openEdit(group)}>
                                                Edit
                                            </Button>
                                            <Button
                                                variant="link"
                                                className="text-red-500 hover:text-red-700"
                                                disabled={deletingId === group.id}
                                                onClick={() => handleDelete(group)}
                                            >
                                                {deletingId === group.id ? (
                                                    <Spinner className="h-4 w-4" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No groups yet. Create one to start reusing shared specifications.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg">
                            {editing ? "Edit Group" : "Add Group"}
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed">
                            Give the group a name the team will recognise, such as the series it
                            represents.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label htmlFor="group-name">Group Name *</Label>
                            <Input
                                id="group-name"
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. P2.5 Indoor Series"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group-description">Description</Label>
                            <Textarea
                                id="group-description"
                                value={form.description}
                                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Optional note about what belongs in this group"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving && <Spinner className="h-4 w-4 mr-2" />}
                                {editing ? "Save Changes" : "Create Group"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

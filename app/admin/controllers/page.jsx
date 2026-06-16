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
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function ControllersPage() {
    const [controllersList, setControllersList] = useState([]);
    const [filteredControllers, setFilteredControllers] = useState([]);
    const [loadingControllers, setLoadingControllers] = useState(false);
    const [searchControllers, setSearchControllers] = useState("");

    useEffect(() => {
        fetchControllers();
    }, []);

    useEffect(() => {
        let filtered = [...controllersList];
        if (searchControllers) {
            filtered = filtered.filter(
                (c) =>
                    c.interfaceName?.toLowerCase().includes(searchControllers.toLowerCase()) ||
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

    const toggleControllerStatus = async (id, currentStatus) => {
        setControllersList((prev) =>
            prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
        );
        try {
            const res = await fetch(`/api/admin/controllers/${id}/toggle-status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            const response = await res.json();
            if (!response.success) {
                setControllersList((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, isActive: currentStatus } : c))
                );
                toast.error(response.message || "Failed to update controller status");
                return;
            }
            toast.success(response.message || "Controller status updated");
        } catch (error) {
            setControllersList((prev) =>
                prev.map((c) => (c.id === id ? { ...c, isActive: currentStatus } : c))
            );
            toast.error(error.message);
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Controllers</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage all controllers.
                    </p>
                </div>
                <Link href="/admin/controllers/add">
                    <Button size="lg" className="bg-primary gap-2">
                        <Plus className="h-4 w-4" />
                        Add Controller
                    </Button>
                </Link>
            </div>

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
                    <TableHeader className="bg-secondary">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Brand</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Interface</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Pixel Capacity</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Last Updated</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Status</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingControllers && filteredControllers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading controllers...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredControllers.length > 0 ? (
                            filteredControllers.map((controller) => (
                                <TableRow key={controller.id} className="even:bg-[#EAF6FF]">
                                    <TableCell className="p-4 whitespace-nowrap">{controller.brandName || "N/A"}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">{controller.interfaceName || "N/A"}</TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {controller.pixelCapacity ? controller.pixelCapacity.toLocaleString() : "N/A"}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {new Date(controller.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div className="flex gap-2 items-center">
                                            <span className={`text-sm ${controller.isActive ? "text-secondary" : "text-red-500"}`}>
                                                {controller.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <Switch
                                                checked={controller.isActive}
                                                onCheckedChange={() => toggleControllerStatus(controller.id, controller.isActive)}
                                                className="ml-2 data-[state=checked]:bg-secondary"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/controllers/${controller.id}/edit`}>
                                                <Button variant="link">Edit</Button>
                                            </Link>
                                            <Button
                                                variant="link"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => deleteController(controller.id)}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No controllers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

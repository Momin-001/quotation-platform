"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const observer = useRef();

    const fetchUsers = useCallback(async (pageNum, searchTerm = "") => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/admin/users?page=${pageNum}&limit=10&search=${searchTerm}`
            );
            const data = await res.json();

            if (data.success) {
                setUsers((prev) => (pageNum === 1 ? data.data : [...prev, ...data.data]));
                setHasMore(data.data.length === 10);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            setPage(1);
            fetchUsers(1, search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, fetchUsers]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchUsers(nextPage, search);
    }, [page, loading, hasMore, search, fetchUsers]);

    const lastUserElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore();
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, loadMore]
    );

    const toggleStatus = async (id, currentStatus) => {
        // Optimistic update
        setUsers((prev) =>
            prev.map((user) =>
                user.id === id ? { ...user, isActive: !currentStatus } : user
            )
        );

        try {
            const res = await fetch(`/api/admin/users/${id}/toggle-status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            const data = await res.json();

            if (!data.success) {
                // Revert on failure
                setUsers((prev) =>
                    prev.map((user) =>
                        user.id === id ? { ...user, isActive: currentStatus } : user
                    )
                );
                toast.error(data.message);
            } else {
                toast.success("User status updated");
            }
        } catch (error) {
            // Revert on failure
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === id ? { ...user, isActive: currentStatus } : user
                )
            );
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold font-archivo">
                    Products Management
                </h1>
                {/*Add Button for Add product */}
                <Button size="lg">
                    Add New Product
                </Button>

            </div>

            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary font-archivo">
                        <TableRow >
                            <TableHead className="p-4 text-white whitespace-nowrap">Product Name</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Category</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Pixel Pitch</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Brightness</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Last Updated</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Status</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user, index) => {
                                const isLastElement = users.length === index + 1;
                                return (
                                    <TableRow
                                        key={user.id}
                                        ref={isLastElement ? lastUserElementRef : null}
                                        className="even:bg-[#E7F1FF] font-open-sans"
                                    >
                                        <TableCell className="p-4 whitespace-nowrap">{user.fullName}</TableCell>
                                        <TableCell className="p-4 whitespace-nowrap">{user.email}</TableCell>
                                        <TableCell className="p-4 whitespace-nowrap">{user.companyName || "-"}</TableCell>
                                        <TableCell className="p-4 whitespace-nowrap">{user.phoneNumber || "-"}</TableCell>
                                        <TableCell className="capitalize p-4 whitespace-nowrap">{user.role}</TableCell>
                                        <TableCell className="p-4 whitespace-nowrap">
                                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="p-4 whitespace-nowrap">
                                            <Button variant="link">Edit</Button>
                                            <Button variant="link">Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    {loading ? "Loading..." : "No users found."}
                                </TableCell>
                            </TableRow>
                        )}
                        {loading && users.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                    Loading more users...
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

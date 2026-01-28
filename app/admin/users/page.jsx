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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

const addAdminSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    companyName: z.string().optional(),
    phoneNumber: z
        .string()
        .min(1, "Phone number is required")
        .refine((val) => isValidPhoneNumber(val), {
            message: "Please enter a valid phone number",
        }),
});

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const isSuperAdmin = currentUser?.role === "super_admin";
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [addAdminDialogOpen, setAddAdminDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const observer = useRef();

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(addAdminSchema),
    });

    const fetchUsers = useCallback(async (pageNum, searchTerm = "") => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/admin/users?page=${pageNum}&limit=10&search=${searchTerm}`
            );
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch users");
            }
            setUsers((prev) => (pageNum === 1 ? response.data : [...prev, ...response.data]));
            setHasMore(response.data.length === 10);
        } catch (error) {
            toast.error(error.message);
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
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to update user status");
            }
            // Revert on failure
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === id ? { ...user, isActive: currentStatus } : user
                )
            );
            toast.success(response.message || "User status updated");
        } catch (error) {
            // Revert on failure
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === id ? { ...user, isActive: currentStatus } : user
                )
            );
            toast.error(error.message);
        }
    };

    const onSubmitAddAdmin = async (data) => {
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/users/add-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to create admin user");
            }
            toast.success(response.message || "Admin user created successfully");
            setAddAdminDialogOpen(false);
            reset();
            // Refresh users list
            setPage(1);
            fetchUsers(1, search);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">

            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-archivo">User Management</h1>
                <p className="text-sm">
                    View and manage all users in the system.
                </p>
            </div>
            {/*Add search bar and Add Admin button */}
            <div className="flex justify-end items-center gap-4">

                <div className="relative">
                    <Search className="absolute left-2 top-4 h-4 w-4" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Users"
                        className="pl-8 placeholder:text-gray-800"
                    />
                </div>
                {isSuperAdmin && (
                    <Dialog open={addAdminDialogOpen} onOpenChange={setAddAdminDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default" size="lg">
                                <Plus className="h-4 w-4" />
                                Add Admin
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Admin</DialogTitle>
                                <DialogDescription>
                                    Create a new admin user. The user will have admin role and will be active by default.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmitAddAdmin)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="fullName"
                                        {...register("fullName")}
                                        placeholder="Full Name"
                                        className={errors.fullName ? "border-red-500" : ""}
                                    />
                                    {errors.fullName && (
                                        <p className="text-xs text-red-500">{errors.fullName.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register("email")}
                                        placeholder="Email"
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        {...register("password")}
                                        placeholder="Password (min 6 characters)"
                                        className={errors.password ? "border-red-500" : ""}
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-red-500">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        {...register("companyName")}
                                        placeholder="Company Name (optional)"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">
                                        Phone Number <span className="text-red-500">*</span>
                                    </Label>
                                    <div className={cn("phone-input-wrapper")}>
                                        <Controller
                                            name="phoneNumber"
                                            control={control}
                                            render={({ field: { onChange, value } }) => (
                                                <PhoneInput
                                                    placeholder="Enter phone number"
                                                    international
                                                    defaultCountry="DE"
                                                    value={value || ""}
                                                    countryCallingCodeEditable={false}
                                                    onChange={(val) => onChange(val || "")}
                                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.phoneNumber ? "border-red-500" : ""}`}
                                                />
                                            )}
                                        />
                                    </div>
                                    {errors.phoneNumber && (
                                        <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setAddAdminDialogOpen(false);
                                            reset();
                                        }}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? "Creating..." : "Create Admin"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>


            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary font-archivo">
                        <TableRow >
                            <TableHead className="p-4 text-white whitespace-nowrap">Full Name</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Email</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Company</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Phone</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Role</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Joined Date</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Status & Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading users...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : users.length > 0 ? (
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
                                            <div className="flex gap-2 items-center">
                                                <span className={`text-sm ${user.isActive ? 'text-secondary' : 'text-red-500'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <Switch
                                                    checked={user.isActive}
                                                    onCheckedChange={() => toggleStatus(user.id, user.isActive)}
                                                    className="ml-2 data-[state=checked]:bg-secondary"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                        {loading && users.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-4 w-4" />
                                        <span>Loading more users...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

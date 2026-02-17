"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/helpers";

export default function AdminEnquiriesPage() {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("desc");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchEnquiries = useCallback(async (pageNum = 1, searchTerm = "", sortOrder = "desc") => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: "10",
                sortBy: sortOrder,
            });
            if (searchTerm) {
                params.append("search", searchTerm);
            }

            const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch enquiries");
            }

            if (pageNum === 1) {
                setEnquiries(response.data.enquiries || []);
            } else {
                setEnquiries((prev) => [...prev, ...(response.data.enquiries || [])]);
            }
            setHasMore(response.data.hasMore || false);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchEnquiries(1, search, sortBy);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, sortBy, fetchEnquiries]);

    // Initial load
    useEffect(() => {
        fetchEnquiries(1, search, sortBy);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "text-yellow-500";
            case "in_progress":
                return "text-blue-500";
            case "completed":
                return "text-green-500";
            case "cancelled":
                return "text-red-500";
            default:
                return "text-gray-500";
        }
    };

    const getStatusLabel = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-archivo">Customer Enquiries</h1>
                <p className="text-sm">
                    View and manage all customer enquiries in the system.
                </p>
            </div>

            {/* Search and Sort Controls */}
            <div className="flex justify-end items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search"
                        className="pl-8 placeholder:text-gray-800 w-[200px]"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px] pl-8">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Newest First</SelectItem>
                            <SelectItem value="asc">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-secondary font-archivo">
                        <TableRow>
                            <TableHead className="p-4 text-white whitespace-nowrap">Enquiry ID</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Customer Name</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Submitted On</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Status</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && enquiries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading enquiries...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : enquiries.length > 0 ? (
                            enquiries.map((enquiry, index) => (
                                <TableRow
                                    key={enquiry.id}
                                    className={`font-open-sans ${index % 2 === 0 ? "bg-white" : "bg-[#EAF6FF]"}`}
                                >
                                    <TableCell className="p-4 whitespace-nowrap font-medium">
                                        <div className="flex items-center gap-2">
                                            {enquiry.enquiryId}
                                            {enquiry.isCustom && (
                                                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-1.5 py-0.5 rounded">
                                                    Custom
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {enquiry.customerName}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {formatDate(enquiry.createdAt)}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <span className={getStatusColor(enquiry.status)}>
                                            {getStatusLabel(enquiry.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <Link href={`/admin/enquiries/${enquiry.id}`}>
                                            <Button variant="link" size="sm" className="text-blue-600 hover:text-blue-800">
                                                View Details
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No enquiries found.
                                </TableCell>
                            </TableRow>
                        )}
                        {loading && enquiries.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-4 w-4" />
                                        <span>Loading more enquiries...</span>
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

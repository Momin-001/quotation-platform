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
import { Search, Filter, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";

export default function AdminQuotationsPage() {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("desc");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);

    const fetchQuotations = useCallback(async (pageNum = 1, searchTerm = "", status = "all", sortOrder = "desc") => {
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
            if (status && status !== "all") {
                params.append("status", status);
            }

            const res = await fetch(`/api/admin/quotations?${params.toString()}`);
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch quotations");
            }

            if (pageNum === 1) {
                setQuotations(response.data.quotations || []);
            } else {
                setQuotations((prev) => [...prev, ...(response.data.quotations || [])]);
            }
            setHasMore(response.data.pagination?.hasMore || false);
            setTotal(response.data.pagination?.total || 0);
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
            fetchQuotations(1, search, statusFilter, sortBy);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, statusFilter, sortBy, fetchQuotations]);

    // Initial load
    useEffect(() => {
        fetchQuotations(1, search, statusFilter, sortBy);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchQuotations(nextPage, search, statusFilter, sortBy);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "draft":
                return "bg-gray-100 text-gray-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "accepted":
                return "bg-green-100 text-green-700";
            case "rejected":
                return "bg-red-100 text-red-700";
            case "revision_requested":
                return "bg-blue-100 text-blue-700";
            case "expired":
                return "bg-orange-100 text-orange-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusLabel = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
    };

    const formatCurrency = (amount) => {
        if (!amount) return "-";
        return `€${parseFloat(amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`;
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-archivo">Quotations</h1>
                <p className="text-sm text-gray-600">
                    View and manage all quotations in the system. Total: {total}
                </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-wrap justify-end items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search quotations..."
                        className="pl-8 placeholder:text-gray-500 w-[220px]"
                    />
                </div>
                <div className="relative">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="revision_requested">Revision Requested</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="relative">
                    <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[160px] pl-8">
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
                            <TableHead className="p-4 text-white whitespace-nowrap">Quotation #</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Customer</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Description</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Total Amount</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Status</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Created</TableHead>
                            <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && quotations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="h-5 w-5" />
                                        <span>Loading quotations...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : quotations.length > 0 ? (
                            quotations.map((quotation, index) => (
                                <TableRow
                                    key={quotation.id}
                                    className={`font-open-sans ${index % 2 === 0 ? "bg-white" : "bg-[#EAF6FF]"}`}
                                >
                                    <TableCell className="p-4 whitespace-nowrap font-medium">
                                        {quotation.quotationNumber}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <div>
                                            <p className="font-medium">{quotation.customerName}</p>
                                            <p className="text-xs text-gray-500">{quotation.customerEmail}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 max-w-[200px] truncate">
                                        {quotation.description || "-"}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap font-medium">
                                        {formatCurrency(quotation.totalAmount)}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(quotation.status)}`}>
                                            {getStatusLabel(quotation.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        {format(new Date(quotation.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="p-4 whitespace-nowrap">
                                        <Link href={`/admin/quotations/${quotation.id}`}>
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No quotations found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Load More */}
            {hasMore && !loading && (
                <div className="flex justify-center">
                    <Button onClick={handleLoadMore} variant="outline">
                        Load More
                    </Button>
                </div>
            )}

            {loading && quotations.length > 0 && (
                <div className="flex items-center justify-center gap-2 py-4">
                    <Spinner className="h-4 w-4" />
                    <span>Loading more quotations...</span>
                </div>
            )}
        </div>
    );
}

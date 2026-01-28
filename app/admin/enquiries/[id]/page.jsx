"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { FileText, ArrowLeft, Eye } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function EnquiryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [enquiry, setEnquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchEnquiry();
        }
    }, [params.id]);

    const fetchEnquiry = async () => {
        try {
            const res = await fetch(`/api/admin/enquiries/${params.id}`);
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch enquiry");
            }
            setEnquiry(response.data);
        } catch (error) {
            toast.error(error.message);
            router.push("/admin/enquiries");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadDatasheet = async (productId, productNumber) => {
        setGeneratingPdf(true);
        try {
            const res = await fetch(`/api/products/${productId}/datasheet`);
            if (!res.ok) {
                throw new Error("Failed to generate datasheet");
            }

            const blob = await res.blob();

            if (blob.size === 0) {
                return;
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${productNumber}_datasheet.pdf`;
            a.style.display = "none";
            document.body.appendChild(a);

            a.click();

            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);

            toast.success("Datasheet downloaded successfully");
        } catch (error) {
            toast.error(error.message || "Failed to download datasheet");
        } finally {
            setGeneratingPdf(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!enquiry) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg">Enquiry not found</p>
            </div>
        );
    }

    const items = enquiry.items || [];

    let totalWidth = 0;
    let totalHeight = 0;
    items.forEach((item) => {
        const width = item.cabinetResolutionHorizontal || 0;
        const height = item.cabinetResolutionVertical || 0;
        const quantity = item.quantity || 1;
        totalWidth += width * quantity;
        totalHeight = Math.max(totalHeight, height);
    });

    return (
        <div className="space-y-6">
            <div>
                <Button onClick={() => router.back()} variant="ghost" size="lg" className="mb-2 p-0!">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Enquiries
                </Button>

                <h1 className="text-2xl font-bold font-archivo">Enquiry Detail Page</h1>
                <p className="text-lg text-gray-600 mt-1">{enquiry.enquiryId}</p>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6 space-y-8">
                <div>
                    <h2 className="text-xl font-bold font-archivo mb-2">Customer Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <span className="font-semibold text-gray-700">Name:</span>
                            <span className="ml-2 text-gray-900">{enquiry.customerName}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Email:</span>
                            <span className="ml-2 text-gray-900">{enquiry.customerEmail}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Phone:</span>
                            <span className="ml-2 text-gray-900">{enquiry.customerPhone}</span>
                        </div>
                    </div>
                </div>
                {enquiry.message && (
                    <div className="mt-4">
                        <h2 className="text-xl font-bold font-archivo mb-2">Message</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{enquiry.message}</p>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-bold font-archivo mb-4">Enquiry Products</h2>
                {items.length > 0 ? (
                    <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader className="bg-secondary font-archivo">
                                <TableRow>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Product Name</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Pixel Pitch</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Quantity</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Cabinet Resolution (H)</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Cabinet Resolution (V)</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Download Datasheet</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow
                                        key={item.id}
                                        className={index % 2 === 0 ? "bg-white" : "bg-[#EAF6FF]"}
                                    >
                                        <TableCell className="p-4 font-medium">
                                            {item.productName}
                                        </TableCell>
                                        <TableCell className="p-4">
                                            {item.pixelPitch ? `${item.pixelPitch}mm` : "N/A"}
                                        </TableCell>
                                        <TableCell className="p-4">{item.quantity || 1}</TableCell>
                                        <TableCell className="p-4">
                                            {item.cabinetResolutionHorizontal
                                                ? `${item.cabinetResolutionHorizontal}px`
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell className="p-4">
                                            {item.cabinetResolutionVertical
                                                ? `${item.cabinetResolutionVertical}px`
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <button
                                                onClick={() => handleDownloadDatasheet(
                                                    item.productId,
                                                    item.productNumber
                                                )}
                                                disabled={generatingPdf}
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                                            >
                                                <FileText className="h-4 w-4 text-red-500" />
                                                <span className="text-sm">{item.productNumber}_datasheet.pdf</span>
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-gray-500">No products found in this enquiry.</p>
                )}
            </div>

            {/* Quotations for this Enquiry */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold font-archivo">Quotations</h2>
                    <Link href={`/admin/enquiries/${params.id}/quotation`}>
                        <Button variant="default" size="lg">
                            + Create New Quotation
                        </Button>
                    </Link>
                </div>
                {enquiry.quotations && enquiry.quotations.length > 0 ? (
                    <div className="bg-white rounded-lg border shadow-sm w-full overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader className="bg-secondary font-archivo">
                                <TableRow>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Quotation Number</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Description</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Total Amount</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Status</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Created</TableHead>
                                    <TableHead className="p-4 text-white whitespace-nowrap">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enquiry.quotations.map((quotation, index) => (
                                    <TableRow
                                        key={quotation.id}
                                        className={index % 2 === 0 ? "bg-white" : "bg-[#EAF6FF]"}
                                    >
                                        <TableCell className="p-4 font-medium">
                                            {quotation.quotationNumber}
                                        </TableCell>
                                        <TableCell className="p-4">
                                            {quotation.description || "-"}
                                        </TableCell>
                                        <TableCell className="p-4">
                                            {quotation.totalAmount 
                                                ? `€${parseFloat(quotation.totalAmount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
                                                : "-"
                                            }
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                quotation.status === "accepted" ? "bg-green-100 text-green-700" :
                                                quotation.status === "rejected" ? "bg-red-100 text-red-700" :
                                                quotation.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                quotation.status === "draft" ? "bg-gray-100 text-gray-700" :
                                                quotation.status === "revision_requested" ? "bg-blue-100 text-blue-700" :
                                                "bg-gray-100 text-gray-700"
                                            }`}>
                                                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1).replace("_", " ")}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            {format(new Date(quotation.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <Link href={`/admin/quotations/${quotation.id}`}>
                                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No quotations created for this enquiry yet.</p>
                        <Link href={`/admin/enquiries/${params.id}/quotation`}>
                            <Button variant="outline" className="mt-4">
                                Create First Quotation
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

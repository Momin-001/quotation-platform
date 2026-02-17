"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { FileSpreadsheet, Upload, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ACCEPT_TYPES = ".csv,.xlsx,.xls,.xlsm";

export default function BulkProductImportPage() {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFile = e.dataTransfer?.files?.[0];
        if (droppedFile && isValidFile(droppedFile)) {
            setFile(droppedFile);
            setResult(null);
        }
    };

    const handleChange = (e) => {
        const selectedFile = e.target?.files?.[0];
        if (selectedFile && isValidFile(selectedFile)) {
            setFile(selectedFile);
            setResult(null);
        }
    };

    const isValidFile = (f) => {
        const name = (f.name || "").toLowerCase();
        return name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm");
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setResult(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/admin/products/import", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Import failed");
            }

            setResult(data.data);
            toast.success(data.message);
            setFile(null);
            if (inputRef.current) inputRef.current.value = "";
        } catch (err) {
            toast.error(err.message || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const openFileDialog = () => inputRef.current?.click();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-archivo text-gray-900">
                    Bulk Product Import
                </h1>
                <p className="text-gray-600 mt-1">
                    Upload a CSV or Excel file to import multiple products at once.
                </p>
            </div>

            <div className="space-y-2">
                <Label className="text-base font-medium">Upload your CSV/Excel file</Label>
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[220px]",
                        dragActive
                            ? "border-primary bg-primary/5"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                        file && "border-primary bg-primary/5"
                    )}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPT_TYPES}
                        onChange={handleChange}
                        className="hidden"
                        aria-label="Select CSV or Excel file"
                    />
                    <FileSpreadsheet className="h-14 w-14 text-blue-500 mb-4" />
                    <p className="text-primary font-semibold text-center mb-1">
                        {file ? file.name : "Select CSV File to Upload"}
                    </p>
                    <p className="text-sm text-gray-500 text-center">or drag & drop it here</p>
                </div>
            </div>

            <Button onClick={handleUpload} disabled={!file || uploading} className="bg-primary hover:bg-primary/90">
                {uploading ? (
                    <>
                        <Spinner className="h-4 w-4 mr-2" />
                        Uploading & Processing…
                    </>
                ) : (
                    <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                    </>
                )}
            </Button>

            {/* ── Import Results ── */}
            {result && (
                <div className="space-y-4 mt-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
                            <div className="bg-blue-100 rounded-full p-2">
                                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Found</p>
                                <p className="text-xl font-bold">{result.total}</p>
                            </div>
                        </div>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
                            <div className="bg-green-100 rounded-full p-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="text-xl font-bold text-green-700">{result.created || 0}</p>
                            </div>
                        </div>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
                            <div className="bg-orange-100 rounded-full p-2">
                                <CheckCircle className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Updated</p>
                                <p className="text-xl font-bold text-orange-700">{result.updated || 0}</p>
                            </div>
                        </div>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
                            <div className={`rounded-full p-2 ${result.errors?.length > 0 ? "bg-red-100" : "bg-gray-100"}`}>
                                {result.errors?.length > 0 ? (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                ) : (
                                    <CheckCircle className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Errors</p>
                                <p className={`text-xl font-bold ${result.errors?.length > 0 ? "text-red-700" : "text-gray-400"}`}>
                                    {result.errors?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error details */}
                    {result.errors && result.errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <h3 className="font-semibold text-red-800">Import Errors</h3>
                            </div>
                            <ul className="space-y-1.5 text-sm text-red-700 max-h-64 overflow-y-auto">
                                {result.errors.map((err, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-red-400 mt-0.5">•</span>
                                        <span>{err}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

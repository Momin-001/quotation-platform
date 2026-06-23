"use client";

import { useEffect, useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { getPdfPreviewUrl } from "@/lib/cloudinaryPdfUrls";

const PDF_ENDPOINT = "/api/admin/footer/privacy-policy-pdf";

export default function PrivacyPolicyTab({ onSaveHandlerReady }) {
    const [loading, setLoading] = useState(true);
    const [privacyPdfUrl, setPrivacyPdfUrl] = useState(null);
    const [pdfBusy, setPdfBusy] = useState(false);

    const fetchPdf = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(PDF_ENDPOINT);
            const data = await res.json();
            if (data.success) {
                setPrivacyPdfUrl(data.data?.privacyPolicyPdfUrl || null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to fetch privacy policy PDF");
        } finally {
            setLoading(false);
        }
    }, []);

    const handlePrivacyPdfChange = async (e) => {
        const file = e.target.files?.[0];
        // allow picking the same file again
        e.target.value = "";

        if (!file) return;
        const isPdf = file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            toast.error("Please choose a PDF file");
            return;
        }

        setPdfBusy(true);
        try {
            const fd = new FormData();
            fd.append("file", file);

            const res = await fetch(PDF_ENDPOINT, { method: "POST", body: fd });
            const json = await res.json();

            if (!json.success) {
                throw new Error(json.message || "Upload failed");
            }

            toast.success(json.message || "Privacy policy PDF uploaded");
            setPrivacyPdfUrl(json.data?.privacyPolicyPdfUrl || null);
        } catch (err) {
            toast.error(err.message || "Upload failed");
        } finally {
            setPdfBusy(false);
        }
    };

    const handleRemovePrivacyPdf = async () => {
        if (!privacyPdfUrl) return;
        if (!window.confirm("Remove the uploaded privacy policy PDF?")) return;

        setPdfBusy(true);
        try {
            const res = await fetch(PDF_ENDPOINT, { method: "DELETE" });
            const json = await res.json();

            if (!json.success) {
                throw new Error(json.message || "Remove failed");
            }

            toast.success(json.message || "PDF removed");
            setPrivacyPdfUrl(null);
        } catch (err) {
            toast.error(err.message || "Remove failed");
        } finally {
            setPdfBusy(false);
        }
    };

    useEffect(() => {
        fetchPdf();
    }, [fetchPdf]);

    // Uploads/removals are applied immediately; the global Save button is a no-op here.
    useEffect(() => {
        if (onSaveHandlerReady) {
            onSaveHandlerReady(async () => ({ success: true }));
        }
    }, [onSaveHandlerReady]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <Spinner className="h-6 w-6" />
                    <span>Loading privacy policy PDF...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-sm font-bold text-primary mb-2">PRIVACY POLICY PDF</h2>

            <div className="rounded-md border border-border p-4 space-y-3 bg-muted/30 max-w-2xl">
                <div>
                    <Label htmlFor="privacyPolicyPdf">Privacy policy PDF</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                        Upload the privacy policy PDF shown in the footer. It opens in a new browser tab.
                        Changes apply immediately.
                    </p>
                </div>
                <Input
                    id="privacyPolicyPdf"
                    type="file"
                    accept="application/pdf,.pdf"
                    disabled={pdfBusy}
                    onChange={handlePrivacyPdfChange}
                    className="cursor-pointer"
                />
                {privacyPdfUrl && (
                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href={getPdfPreviewUrl(privacyPdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary underline"
                        >
                            Preview current PDF
                        </a>
                        <Button type="button" variant="outline" size="sm" disabled={pdfBusy} onClick={handleRemovePrivacyPdf}>
                            Remove PDF
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

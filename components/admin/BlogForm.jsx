"use client";

import { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, GripVertical, X, Save } from "lucide-react";

const RichTextEditor = lazy(() => import("@/components/admin/RichTextEditor"));

function EditorFallback() {
    return <div className="border rounded-lg p-3 min-h-[120px] bg-gray-50 animate-pulse" />;
}

export default function BlogForm({ initialData = null }) {
    const router = useRouter();
    const isEdit = !!initialData;

    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState(initialData?.title || "");
    const [authorName, setAuthorName] = useState(initialData?.authorName || "");
    const [mainContentHtml, setMainContentHtml] = useState(initialData?.mainContentHtml || "");
    const [partnerAdLinkUrl, setPartnerAdLinkUrl] = useState(initialData?.partnerAdLinkUrl || "");

    // Main image
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(initialData?.mainImageUrl || null);

    // Partner ad image
    const [partnerAdImageFile, setPartnerAdImageFile] = useState(null);
    const [partnerAdImagePreview, setPartnerAdImagePreview] = useState(initialData?.partnerAdImageUrl || null);
    const [removePartnerAd, setRemovePartnerAd] = useState(false);

    // Content blocks
    const [contentBlocks, setContentBlocks] = useState(
        initialData?.contentBlocks?.map((b) => ({
            textHtml: b.textHtml || "",
            existingImageUrl: b.imageUrl || null,
            existingImagePublicId: b.imagePublicId || null,
            newImageFile: null,
            newImagePreview: b.imageUrl || null,
        })) || []
    );

    const handleMainImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePartnerAdImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPartnerAdImageFile(file);
            setPartnerAdImagePreview(URL.createObjectURL(file));
            setRemovePartnerAd(false);
        }
    };

    const handleRemovePartnerAd = () => {
        setPartnerAdImageFile(null);
        setPartnerAdImagePreview(null);
        setRemovePartnerAd(true);
    };

    const addContentBlock = () => {
        setContentBlocks((prev) => [
            ...prev,
            { textHtml: "", existingImageUrl: null, existingImagePublicId: null, newImageFile: null, newImagePreview: null },
        ]);
    };

    const removeContentBlock = (index) => {
        setContentBlocks((prev) => prev.filter((_, i) => i !== index));
    };

    const updateBlockText = (index, html) => {
        setContentBlocks((prev) =>
            prev.map((b, i) => (i === index ? { ...b, textHtml: html } : b))
        );
    };

    const handleBlockImageChange = (index, e) => {
        const file = e.target.files?.[0];
        if (file) {
            setContentBlocks((prev) =>
                prev.map((b, i) =>
                    i === index
                        ? { ...b, newImageFile: file, newImagePreview: URL.createObjectURL(file), existingImageUrl: null, existingImagePublicId: null }
                        : b
                )
            );
        }
    };

    const removeBlockImage = (index) => {
        setContentBlocks((prev) =>
            prev.map((b, i) =>
                i === index
                    ? { ...b, newImageFile: null, newImagePreview: null, existingImageUrl: null, existingImagePublicId: null }
                    : b
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) return toast.error("Title is required");
        if (!authorName.trim()) return toast.error("Author name is required");
        if (!isEdit && !mainImageFile) return toast.error("Main image is required");

        setSaving(true);
        try {
            const payload = {
                title,
                authorName,
                mainContentHtml,
                partnerAdLinkUrl,
                removePartnerAd,
                contentBlocks: contentBlocks.map((b) => ({
                    textHtml: b.textHtml,
                    existingImageUrl: b.existingImageUrl,
                    existingImagePublicId: b.existingImagePublicId,
                })),
            };

            const formData = new FormData();
            formData.append("payload", JSON.stringify(payload));

            if (mainImageFile) formData.append("mainImage", mainImageFile);
            if (partnerAdImageFile) formData.append("partnerAdImage", partnerAdImageFile);

            contentBlocks.forEach((block, i) => {
                if (block.newImageFile) {
                    formData.append(`blockImage_${i}`, block.newImageFile);
                }
            });

            const url = isEdit ? `/api/admin/blogs/${initialData.id}` : "/api/admin/blogs";
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, { method, body: formData });
            const response = await res.json();

            if (!response.success) throw new Error(response.message);

            toast.success(response.message || (isEdit ? "Blog updated" : "Blog created"));
            router.push("/admin/blogs");
        } catch (error) {
            toast.error(error.message || "Failed to save blog");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
                <h2 className="text-lg font-semibold font-archivo">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Blog title"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="authorName">Author Name *</Label>
                        <Input
                            id="authorName"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="e.g. Uwe Kaiser"
                        />
                    </div>
                </div>
            </div>

            {/* Main Image */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
                <h2 className="text-lg font-semibold font-archivo">Main Image *</h2>
                <div className="flex items-start gap-4">
                    <label
                        htmlFor="mainImage"
                        className="flex items-center justify-center shadow-xs h-24 w-24 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
                    >
                        <span className="text-4xl text-gray-400">+</span>
                    </label>
                    <input
                        id="mainImage"
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        className="hidden"
                    />
                    {mainImagePreview && (
                        <div className="relative h-24 w-24 shadow-xs bg-white border rounded-lg overflow-hidden shrink-0">
                            <Image
                                src={mainImagePreview}
                                alt="Main"
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-red-600"
                                onClick={() => {
                                    setMainImageFile(null);
                                    setMainImagePreview(null);
                                }}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
                <h2 className="text-lg font-semibold font-archivo">Main Content</h2>
                <p className="text-sm text-muted-foreground">
                    Write the main body of your blog post. This appears below the main image.
                </p>
                <Suspense fallback={<EditorFallback />}>
                    <RichTextEditor content={mainContentHtml} onChange={setMainContentHtml} />
                </Suspense>
            </div>

            {/* Partner Advertisement */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
                <h2 className="text-lg font-semibold font-archivo">Partner Advertisement</h2>
                <p className="text-sm text-muted-foreground">
                    Optional partner ad image with a clickable link to their website.
                </p>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <label
                            htmlFor="partnerAdImage"
                            className="flex items-center justify-center shadow-xs h-24 w-24 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
                        >
                            <span className="text-4xl text-gray-400">+</span>
                        </label>
                        <input
                            id="partnerAdImage"
                            type="file"
                            accept="image/*"
                            onChange={handlePartnerAdImageChange}
                            className="hidden"
                        />
                        {partnerAdImagePreview && !removePartnerAd && (
                            <div className="relative h-24 w-24 shadow-xs bg-white border rounded-lg overflow-hidden shrink-0">
                                <Image src={partnerAdImagePreview} alt="Partner Ad" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={handleRemovePartnerAd}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="partnerAdLinkUrl">Partner Website URL</Label>
                        <Input
                            id="partnerAdLinkUrl"
                            value={partnerAdLinkUrl}
                            onChange={(e) => setPartnerAdLinkUrl(e.target.value)}
                            placeholder="https://partner-website.com"
                        />
                    </div>
                </div>
            </div>

            {/* Content Blocks */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold font-archivo">Additional Content Blocks</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Add numbered text sections, each with an optional image below.
                        </p>
                    </div>
                    <Button type="button" variant="outline" size="lg" onClick={addContentBlock}>
                        <Plus className="h-4 w-4 mr-1" /> Add Block
                    </Button>
                </div>

                {contentBlocks.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6 border border-dashed rounded-lg">
                        No content blocks yet. Click &quot;Add Block&quot; to add one.
                    </p>
                )}

                <div className="space-y-6">
                    {contentBlocks.map((block, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium">Block {index + 1}</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => removeContentBlock(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <Suspense fallback={<EditorFallback />}>
                                <RichTextEditor
                                    content={block.textHtml}
                                    onChange={(html) => updateBlockText(index, html)}
                                />
                            </Suspense>

                            <div>
                                <Label className="text-xs text-gray-500">Optional Image</Label>
                                <div className="flex items-start gap-3 mt-1">
                                    <label
                                        htmlFor={`blockImage-${index}`}
                                        className="flex items-center justify-center shadow-xs h-24 w-24 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
                                    >
                                        <span className="text-4xl text-gray-400">+</span>
                                    </label>
                                    <input
                                        id={`blockImage-${index}`}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleBlockImageChange(index, e)}
                                    />
                                    {(block.newImagePreview || block.existingImageUrl) && (
                                        <div className="relative h-24 w-24 shadow-xs bg-white border rounded-lg overflow-hidden shrink-0">
                                            <Image
                                                src={block.newImagePreview || block.existingImageUrl}
                                                alt={`Block ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeBlockImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving} size="lg">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : isEdit ? "Update Blog" : "Create Blog"}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/blogs")}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

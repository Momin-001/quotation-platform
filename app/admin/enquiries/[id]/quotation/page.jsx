"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ArrowLeft, Plus, Eye } from "lucide-react";

import QuotationPreview from "@/components/admin/Quotation/QuotationPreview";
import QuotationBuilderSection from "@/components/admin/Quotation/QuotationBuilderSection";

export default function QuotationBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftId = searchParams.get("draft");
    
    const [enquiry, setEnquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [editingDraftId, setEditingDraftId] = useState(null);
    
    const [mainProduct, setMainProduct] = useState({
        product: null,
        quantity: 1,
        unitPrice: "",
        taxPercentage: "",
        discountPercentage: "",
        description: "",
        optionalItems: [],
        additionalItems: [],
    });

    const [alternativeProduct, setAlternativeProduct] = useState(null);
    const [alternativeFromEnquiry, setAlternativeFromEnquiry] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchEnquiry();
        }
    }, [params.id]);

    // Load draft if editing
    useEffect(() => {
        if (draftId && enquiry) {
            fetchDraft(draftId);
        }
    }, [draftId, enquiry]);

    const fetchEnquiry = async () => {
        try {
            const res = await fetch(`/api/admin/enquiries/${params.id}`);
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch enquiry");
            }
            setEnquiry(response.data);

            const items = response.data.items || [];

            const buildOptionalItems = (item) => {
                if (!item.accessories || item.accessories.length === 0) return [];
                return item.accessories.map((acc) => ({
                    product: {
                        id: acc.id,
                        productName: acc.productName,
                        productNumber: acc.productNumber,
                        sourceType: "accessory",
                    },
                    quantity: acc.quantity || 1,
                    unitPrice: "",
                    taxPercentage: "",
                    discountPercentage: "",
                    description: "",
                }));
            };

            // First item is always the main product
            if (items[0]) {
                const mainAdditionalItems = items[0].controller
                    ? [{
                        product: items[0].controller,
                        quantity: 1,
                        unitPrice: "",
                        taxPercentage: "",
                        discountPercentage: "",
                        description: "",
                    }]
                    : [];
                setMainProduct({
                    product: {
                        id: items[0].productId,
                        productName: items[0].productName,
                        productNumber: items[0].productNumber,
                        pixelPitch: items[0].pixelPitch,
                        imageUrl: items[0].imageUrl || null,
                    },
                    quantity: items[0].quantity || 1,
                    unitPrice: "",
                    taxPercentage: "",
                    discountPercentage: "",
                    description: "",
                    optionalItems: buildOptionalItems(items[0]),
                    additionalItems: mainAdditionalItems,
                });
            }

            // Second item (if exists) is the alternative product
            if (items[1]) {
                const altAdditionalItems = items[1].controller
                    ? [{
                        product: items[1].controller,
                        quantity: 1,
                        unitPrice: "",
                        taxPercentage: "",
                        discountPercentage: "",
                        description: "",
                    }]
                    : [];
                setAlternativeProduct({
                    product: {
                        id: items[1].productId,
                        productName: items[1].productName,
                        productNumber: items[1].productNumber,
                        pixelPitch: items[1].pixelPitch,
                        imageUrl: items[1].imageUrl || null,
                    },
                    quantity: items[1].quantity || 1,
                    unitPrice: "",
                    taxPercentage: "",
                    discountPercentage: "",
                    description: "",
                    optionalItems: buildOptionalItems(items[1]),
                    additionalItems: altAdditionalItems,
                });
                setAlternativeFromEnquiry(true);
            }
        } catch (error) {
            toast.error(error.message);
            router.push("/admin/enquiries");
        } finally {
            // Only set loading false if we're not loading a draft
            if (!draftId) {
                setLoading(false);
            }
        }
    };

    // Fetch draft quotation for editing
    const fetchDraft = async (quotationId) => {
        try {
            const res = await fetch(`/api/admin/quotations/${quotationId}`);
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch draft");
            }

            const draft = response.data;
            
            // Only allow editing drafts
            if (draft.status !== "draft") {
                toast.error("Only draft quotations can be edited");
                router.push(`/admin/quotations/${quotationId}`);
                return;
            }

            setEditingDraftId(quotationId);

            // Load main product from draft
            if (draft.mainProduct) {
                setMainProduct({
                    product: draft.mainProduct.product,
                    quantity: draft.mainProduct.quantity || 1,
                    unitPrice: draft.mainProduct.unitPrice || "",
                    taxPercentage: draft.mainProduct.taxPercentage || "",
                    discountPercentage: draft.mainProduct.discountPercentage || "",
                    description: draft.mainProduct.description || "",
                    optionalItems: (draft.mainProduct.optionalItems || []).map(opt => ({
                        product: opt.product,
                        quantity: opt.quantity || 1,
                        unitPrice: opt.unitPrice || "",
                        taxPercentage: opt.taxPercentage || "",
                        discountPercentage: opt.discountPercentage || "",
                        description: opt.description || "",
                    })),
                    additionalItems: (draft.mainProduct.additionalItems || []).map(add => ({
                        product: add.product,
                        quantity: add.quantity || 1,
                        unitPrice: add.unitPrice || "",
                        taxPercentage: add.taxPercentage || "",
                        discountPercentage: add.discountPercentage || "",
                        description: add.description || "",
                    })),
                });
            }

            // Load alternative product from draft
            if (draft.alternativeProduct) {
                setAlternativeProduct({
                    product: draft.alternativeProduct.product,
                    quantity: draft.alternativeProduct.quantity || 1,
                    unitPrice: draft.alternativeProduct.unitPrice || "",
                    taxPercentage: draft.alternativeProduct.taxPercentage || "",
                    discountPercentage: draft.alternativeProduct.discountPercentage || "",
                    description: draft.alternativeProduct.description || "",
                    optionalItems: (draft.alternativeProduct.optionalItems || []).map(opt => ({
                        product: opt.product,
                        quantity: opt.quantity || 1,
                        unitPrice: opt.unitPrice || "",
                        taxPercentage: opt.taxPercentage || "",
                        discountPercentage: opt.discountPercentage || "",
                        description: opt.description || "",
                    })),
                    additionalItems: (draft.alternativeProduct.additionalItems || []).map(add => ({
                        product: add.product,
                        quantity: add.quantity || 1,
                        unitPrice: add.unitPrice || "",
                        taxPercentage: add.taxPercentage || "",
                        discountPercentage: add.discountPercentage || "",
                        description: add.description || "",
                    })),
                });
                setAlternativeFromEnquiry(true);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Format enquiry ID for display
    const formatEnquiryId = (id) => {
        if (!id) return "";
        const last4 = id.slice(-4).toUpperCase();
        const year = new Date().getFullYear();
        return `#${last4}${year}`;
    };

    // Main Product Handlers
    const handleUpdateMainProduct = (updated) => {
        setMainProduct(prev => ({ ...prev, ...updated }));
    };

    const handleAddMainOptional = () => {
        setMainProduct(prev => ({
            ...prev,
            optionalItems: [...prev.optionalItems, {
                product: null,
                quantity: 1,
                unitPrice: "",
                taxPercentage: "",
                discountPercentage: "",
                description: "",
            }]
        }));
    };

    const handleUpdateMainOptional = (index, updated) => {
        setMainProduct(prev => ({
            ...prev,
            optionalItems: prev.optionalItems.map((opt, i) => 
                i === index ? updated : opt
            )
        }));
    };

    const handleRemoveMainOptional = (index) => {
        setMainProduct(prev => ({
            ...prev,
            optionalItems: prev.optionalItems.filter((_, i) => i !== index)
        }));
    };

    const handleAddMainAdditional = () => {
        setMainProduct(prev => ({
            ...prev,
            additionalItems: [...(prev.additionalItems || []), {
                product: null,
                quantity: 1,
                unitPrice: "",
                taxPercentage: "",
                discountPercentage: "",
                description: "",
            }]
        }));
    };

    const handleUpdateMainAdditional = (index, updated) => {
        setMainProduct(prev => ({
            ...prev,
            additionalItems: (prev.additionalItems || []).map((add, i) => i === index ? updated : add)
        }));
    };

    const handleRemoveMainAdditional = (index) => {
        setMainProduct(prev => ({
            ...prev,
            additionalItems: (prev.additionalItems || []).filter((_, i) => i !== index)
        }));
    };

    // Alternative Product Handlers
    const handleAddAlternative = () => {
        setAlternativeProduct({
            product: null,
            quantity: 1,
            unitPrice: "",
            taxPercentage: "",
            discountPercentage: "",
            description: "",
            optionalItems: [],
            additionalItems: [],
        });
    };

    const handleUpdateAlternativeProduct = (updated) => {
        setAlternativeProduct(prev => ({ ...prev, ...updated }));
    };

    const handleAddAlternativeOptional = () => {
        setAlternativeProduct(prev => ({
            ...prev,
            optionalItems: [...(prev?.optionalItems || []), {
                product: null,
                quantity: 1,
                unitPrice: "",
                taxPercentage: "",
                discountPercentage: "",
                description: "",
            }]
        }));
    };

    const handleUpdateAlternativeOptional = (index, updated) => {
        setAlternativeProduct(prev => ({
            ...prev,
            optionalItems: prev.optionalItems.map((opt, i) => 
                i === index ? updated : opt
            )
        }));
    };

    const handleRemoveAlternativeOptional = (index) => {
        setAlternativeProduct(prev => ({
            ...prev,
            optionalItems: prev.optionalItems.filter((_, i) => i !== index)
        }));
    };

    const handleAddAlternativeAdditional = () => {
        setAlternativeProduct(prev => ({
            ...prev,
            additionalItems: [...(prev.additionalItems || []), {
                product: null,
                quantity: 1,
                unitPrice: "",
                taxPercentage: "",
                discountPercentage: "",
                description: "",
            }]
        }));
    };

    const handleUpdateAlternativeAdditional = (index, updated) => {
        setAlternativeProduct(prev => ({
            ...prev,
            additionalItems: (prev.additionalItems || []).map((add, i) => i === index ? updated : add)
        }));
    };

    const handleRemoveAlternativeAdditional = (index) => {
        setAlternativeProduct(prev => ({
            ...prev,
            additionalItems: (prev.additionalItems || []).filter((_, i) => i !== index)
        }));
    };

    // Validate form
    const validateForm = () => {
        // Validate main product
        if (!mainProduct.product || !mainProduct.unitPrice) {
            toast.error("Main product must have a unit price");
            return false;
        }

        for (const optItem of mainProduct.optionalItems) {
            if (!optItem.product || !optItem.unitPrice) {
                toast.error("Each optional product must have a product selected and a unit price");
                return false;
            }
        }
        const mainAdditionalIds = (mainProduct.additionalItems || []).map(a => a.product?.id).filter(Boolean);
        if (new Set(mainAdditionalIds).size !== mainAdditionalIds.length) {
            toast.error("The same controller cannot be added more than once in Main Product additional items");
            return false;
        }
        for (const addItem of mainProduct.additionalItems || []) {
            if (!addItem.product || !addItem.unitPrice) {
                toast.error("Each additional product must have a controller selected and a unit price");
                return false;
            }
        }

        // Validate alternative product (if exists)
        if (alternativeProduct) {
            if (!alternativeProduct.product || !alternativeProduct.unitPrice) {
                toast.error("Alternative product must have a product selected and a unit price");
                return false;
            }

            for (const optItem of alternativeProduct.optionalItems || []) {
                if (!optItem.product || !optItem.unitPrice) {
                    toast.error("Each optional product for alternative must have a product selected and a unit price");
                    return false;
                }
            }
            const altAdditionalIds = (alternativeProduct.additionalItems || []).map(a => a.product?.id).filter(Boolean);
            if (new Set(altAdditionalIds).size !== altAdditionalIds.length) {
                toast.error("The same controller cannot be added more than once in Alternative Product additional items");
                return false;
            }
            for (const addItem of alternativeProduct.additionalItems || []) {
                if (!addItem.product || !addItem.unitPrice) {
                    toast.error("Each additional product for alternative must have a controller selected and a unit price");
                    return false;
                }
            }
        }

        return true;
    };

    // Save quotation
    const handleSave = async (status = "draft") => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            // Build items array
            const items = [];
            
            // Main product
            items.push({
                productId: mainProduct.product.id,
                quantity: mainProduct.quantity,
                unitPrice: parseFloat(mainProduct.unitPrice),
                taxPercentage: parseFloat(mainProduct.taxPercentage) || 0,
                discountPercentage: parseFloat(mainProduct.discountPercentage) || 0,
                description: mainProduct.description || null,
                itemType: "main",
                optionalItems: (mainProduct.optionalItems || []).map((opt) => ({
                    sourceType: opt.product.sourceType || "accessory",
                    sourceId: opt.product.id,
                    quantity: opt.quantity,
                    unitPrice: parseFloat(opt.unitPrice),
                    taxPercentage: parseFloat(opt.taxPercentage) || 0,
                    discountPercentage: parseFloat(opt.discountPercentage) || 0,
                    description: opt.description || null,
                })),
                additionalItems: (mainProduct.additionalItems || []).map((add) => ({
                    controllerId: add.product?.id,
                    quantity: add.quantity || 1,
                    unitPrice: parseFloat(add.unitPrice),
                    taxPercentage: parseFloat(add.taxPercentage) || 0,
                    discountPercentage: parseFloat(add.discountPercentage) || 0,
                    description: add.description || null,
                })),
            });

            // Alternative product (if exists)
            if (alternativeProduct && alternativeProduct.product) {
                items.push({
                    productId: alternativeProduct.product.id,
                    quantity: alternativeProduct.quantity,
                    unitPrice: parseFloat(alternativeProduct.unitPrice),
                    taxPercentage: parseFloat(alternativeProduct.taxPercentage) || 0,
                    discountPercentage: parseFloat(alternativeProduct.discountPercentage) || 0,
                    description: alternativeProduct.description || null,
                    itemType: "alternative",
                    optionalItems: (alternativeProduct.optionalItems || []).map((opt) => ({
                        sourceType: opt.product.sourceType || "accessory",
                        sourceId: opt.product.id,
                        quantity: opt.quantity,
                        unitPrice: parseFloat(opt.unitPrice),
                        taxPercentage: parseFloat(opt.taxPercentage) || 0,
                        discountPercentage: parseFloat(opt.discountPercentage) || 0,
                        description: opt.description || null,
                    })),
                    additionalItems: (alternativeProduct.additionalItems || []).map((add) => ({
                        controllerId: add.product?.id,
                        quantity: add.quantity || 1,
                        unitPrice: parseFloat(add.unitPrice),
                        taxPercentage: parseFloat(add.taxPercentage) || 0,
                        discountPercentage: parseFloat(add.discountPercentage) || 0,
                        description: add.description || null,
                    })),
                });
            }

            let res;
            
            if (editingDraftId) {
                // Update existing draft
                res = await fetch(`/api/admin/quotations/${editingDraftId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status,
                        items,
                    }),
                });
            } else {
                // Create new quotation
                res = await fetch("/api/admin/quotations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        enquiryId: params.id,
                        status,
                        items,
                    }),
                });
            }

            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to save quotation");
            }

            if (status === "pending") {
                toast.success("Quotation sent to customer successfully");
            } else {
                toast.success("Draft saved successfully");
            }
            
            router.push(`/admin/enquiries/${params.id}`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.push(`/admin/enquiries/${params.id}`);
    };

    const handlePreview = () => {
        if (!validateForm()) return;
        setShowPreview(true);
    };

    const handleSendQuotation = async () => {
        await handleSave("pending");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    // Show preview
    if (showPreview) {
        return (
            <QuotationPreview
                quotationId={enquiry?.enquiryId ? formatEnquiryId(enquiry.id) : ""}
                mainProduct={mainProduct}
                alternativeProduct={alternativeProduct}
                onClose={() => setShowPreview(false)}
                onSaveDraft={() => handleSave("draft")}
                onSendQuotation={handleSendQuotation}
                saving={saving}
            />
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div>
                <Button 
                    onClick={() => router.back()} 
                    variant="ghost" 
                    size="lg" 
                    className="mb-2 p-0!"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Enquiry
                </Button>

                <h1 className="text-2xl font-bold font-archivo">
                    {editingDraftId ? "Edit Draft Quotation" : "Quotation Builder"} {enquiry?.enquiryId ? formatEnquiryId(enquiry.id) : ""}
                </h1>
                <p className="text-gray-600 mt-1">
                    {editingDraftId 
                        ? "Update the draft quotation or send it to the customer" 
                        : "Create a quotation for the customer's enquiry"
                    }
                </p>
            </div>

            {/* Main Product Section */}
            <QuotationBuilderSection
                title="Main Product"
                titleColor="text-blue-700"
                borderColor="border-blue-200"
                bgColor="bg-blue-50/30"
                productData={mainProduct}
                onUpdateProduct={handleUpdateMainProduct}
                optionalItems={mainProduct.optionalItems || []}
                onAddOptional={handleAddMainOptional}
                onUpdateOptional={handleUpdateMainOptional}
                onRemoveOptional={handleRemoveMainOptional}
                additionalItems={mainProduct.additionalItems || []}
                onAddAdditional={handleAddMainAdditional}
                onUpdateAdditional={handleUpdateMainAdditional}
                onRemoveAdditional={handleRemoveMainAdditional}
                isMainProduct={true}
                productFromEnquiry={true}
            />

            {/* Alternative Product Section */}
            <QuotationBuilderSection
                title="Alternative Product"
                titleColor="text-blue-700"
                borderColor="border-blue-200"
                bgColor="bg-blue-50/30"
                productData={alternativeProduct}
                onUpdateProduct={handleUpdateAlternativeProduct}
                optionalItems={alternativeProduct?.optionalItems || []}
                onAddOptional={handleAddAlternativeOptional}
                onUpdateOptional={handleUpdateAlternativeOptional}
                onRemoveOptional={handleRemoveAlternativeOptional}
                additionalItems={alternativeProduct?.additionalItems || []}
                onAddAdditional={handleAddAlternativeAdditional}
                onUpdateAdditional={handleUpdateAlternativeAdditional}
                onRemoveAdditional={handleRemoveAlternativeAdditional}
                isMainProduct={false}
                productFromEnquiry={alternativeFromEnquiry}
                onAddAlternative={handleAddAlternative}
                showAddAlternativeButton={!alternativeProduct}
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
                <Button
                    onClick={() => handleSave("draft")}
                    disabled={saving}
                    variant="default"
                    size="lg"
                >
                    {saving ? <Spinner className="h-4 w-4 mr-2" /> : null}
                    Save Draft
                </Button>
                <Button
                    onClick={handlePreview}
                    disabled={saving}
                    variant="secondary"
                    size="lg"
                >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Quotation
                </Button>
                <Button
                    onClick={handleCancel}
                    variant="destructive"
                    disabled={saving}
                    size="lg"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}

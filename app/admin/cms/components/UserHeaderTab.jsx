"use client";

import { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
// Zod schema for user header validation
const userHeaderSchema = z.object({
    userHeaderMyEnquiryEn: z.string().min(1, "My Enquiry EN is required"),
    userHeaderMyEnquiryDe: z.string().min(1, "My Enquiry DE is required"),
    userHeaderMyQuotationEn: z.string().min(1, "My Quotation EN is required"),
    userHeaderMyQuotationDe: z.string().min(1, "My Quotation DE is required"),
    userHeaderMyAccountEn: z.string().min(1, "My Account EN is required"),
    userHeaderMyAccountDe: z.string().min(1, "My Account DE is required"),
    userHeaderMyCartEn: z.string().min(1, "My Cart EN is required"),
    userHeaderMyCartDe: z.string().min(1, "My Cart DE is required"),
});

export default function UserHeaderTab({ onDataChange, onValidationChange, onSaveHandlerReady }) {
    const [loading, setLoading] = useState(true);
    const {
        register,
        reset,
        watch,
        trigger,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(userHeaderSchema),
        mode: "onChange",
        defaultValues: {
            userHeaderMyEnquiryEn: "",
            userHeaderMyEnquiryDe: "",
            userHeaderMyQuotationEn: "",
            userHeaderMyQuotationDe: "",
            userHeaderMyAccountEn: "",
            userHeaderMyAccountDe: "",
            userHeaderMyCartEn: "",
            userHeaderMyCartDe: "",
        },
    });

    // Watch form values for validation updates
    const formValues = watch();

    // Update validation state when form changes
    useEffect(() => {
        if (onValidationChange) {
            onValidationChange(isValid);
        }
    }, [isValid, onValidationChange]);

    // Update parent when form data changes
    useEffect(() => {
        if (onDataChange) {
            onDataChange(formValues);
        }
    }, [formValues, onDataChange]);

    // Fetch user header data
    const fetchUserHeaderData = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/user-header");
            const data = await res.json();
            if (data.success) {
                reset(data.data);
            } else {
                toast.error(data.message);
            }        
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch user header content");
        } finally {
            setLoading(false);
        }
    }, [reset]);

    useEffect(() => {
        fetchUserHeaderData();
    }, [fetchUserHeaderData]);

    // Save handler
    const handleSave = useCallback(async (data) => {
        try {
            const res = await fetch("/api/admin/user-header", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to save user header content");
            }
            toast.success(response.message || "User header content saved successfully");
            fetchUserHeaderData(); // Refresh data
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false };
        }
    }, [fetchUserHeaderData]);

    // Wrapper for save handler that validates first
    const onSave = useCallback(async () => {
        const isValid = await trigger();
        if (!isValid) {
            toast.error("Please fill in all required fields");
            return { success: false };
        }
        const data = watch();
        return await handleSave(data);
    }, [trigger, watch, handleSave]);

    // Expose save handler to parent
    useEffect(() => {
        if (onSaveHandlerReady) {
            onSaveHandlerReady(onSave);
        }
    }, [onSave, onSaveHandlerReady]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <Spinner className="h-6 w-6" />
                    <span>Loading user header content...</span>
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <Label htmlFor="userHeaderMyEnquiryEn">My Enquiry EN</Label>
                    <Input id="userHeaderMyEnquiryEn" {...register("userHeaderMyEnquiryEn")} />
                </div>
      
                <div className="col-span-1">
                    <Label htmlFor="userHeaderMyEnquiryDe">My Enquiry DE</Label>
                    <Input id="userHeaderMyEnquiryDe" {...register("userHeaderMyEnquiryDe")} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <Label htmlFor="userHeaderMyQuotationEn">My Quotation EN</Label>
                    <Input id="userHeaderMyQuotationEn" {...register("userHeaderMyQuotationEn")} />
                </div>
                <div className="col-span-1">
                    <Label htmlFor="userHeaderMyQuotationDe">My Quotation DE</Label>
                    <Input id="userHeaderMyQuotationDe" {...register("userHeaderMyQuotationDe")} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">

                <div className="col-span-1">
                    <Label htmlFor="userHeaderMyAccountEn">My Account EN</Label>
                    <Input id="userHeaderMyAccountEn" {...register("userHeaderMyAccountEn")} />
                </div>
                <div className="col-span-1">
                    <Label htmlFor="userHeaderMyAccountDe">My Account DE</Label>
                    <Input id="userHeaderMyAccountDe" {...register("userHeaderMyAccountDe")} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <Label htmlFor="userHeaderMyCartEn">My Cart EN</Label>
                    <Input id="userHeaderMyCartEn" {...register("userHeaderMyCartEn")} />
                </div>
                <div className="col-span-1">
                    <Label htmlFor="userHeaderMyCartDe">My Cart DE</Label>
                    <Input id="userHeaderMyCartDe" {...register("userHeaderMyCartDe")} />
                </div>
            </div>
        </div>
    );
}
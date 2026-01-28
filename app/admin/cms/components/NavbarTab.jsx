"use client";

import { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

// Zod schema for navbar validation
const navbarSchema = z.object({
    navItem1En: z.string().min(1, "Nav Item 1 EN is required"),
    navItem1De: z.string().min(1, "Nav Item 1 DE is required"),
    navItem2En: z.string().min(1, "Nav Item 2 EN is required"),
    navItem2De: z.string().min(1, "Nav Item 2 DE is required"),
    navItem3En: z.string().min(1, "Nav Item 3 EN is required"),
    navItem3De: z.string().min(1, "Nav Item 3 DE is required"),
    navItem4En: z.string().min(1, "Nav Item 4 EN is required"),
    navItem4De: z.string().min(1, "Nav Item 4 DE is required"),
    navItem5En: z.string().min(1, "Nav Item 5 EN is required"),
    navItem5De: z.string().min(1, "Nav Item 5 DE is required"),
});

export default function NavbarTab({ onDataChange, onValidationChange, onSaveHandlerReady }) {
    const [loading, setLoading] = useState(true);
    const {
        register,
        reset,
        watch,
        trigger,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(navbarSchema),
        mode: "onChange",
        defaultValues: {
            navItem1En: "",
            navItem1De: "",
            navItem2En: "",
            navItem2De: "",
            navItem3En: "",
            navItem3De: "",
            navItem4En: "",
            navItem4De: "",
            navItem5En: "",
            navItem5De: "",
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

    // Fetch navbar data
    const fetchNavbarData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/navbar");
            const data = await res.json();

            if (data.success) {
                const fetchedData = {
                    navItem1En: data.data.navItem1En || "",
                    navItem1De: data.data.navItem1De || "",
                    navItem2En: data.data.navItem2En || "",
                    navItem2De: data.data.navItem2De || "",
                    navItem3En: data.data.navItem3En || "",
                    navItem3De: data.data.navItem3De || "",
                    navItem4En: data.data.navItem4En || "",
                    navItem4De: data.data.navItem4De || "",
                    navItem5En: data.data.navItem5En || "",
                    navItem5De: data.data.navItem5De || "",
                };
                reset(fetchedData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch navbar content");
        } finally {
            setLoading(false);
        }
    }, [reset]);

    useEffect(() => {
        fetchNavbarData();
    }, [fetchNavbarData]);

    // Save handler
    const handleSave = useCallback(async (data) => {
        try {
            const res = await fetch("/api/admin/navbar", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to save navbar content");
            }
            toast.success(response.message || "Navbar content saved successfully");
            fetchNavbarData(); // Refresh data
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false };
        }
    }, [fetchNavbarData]);

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
                    <span>Loading navbar content...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-sm font-bold text-primary font-open-sans mb-6">
                SECTION 1 — NAVBAR
            </h2>
            
            {/* Nav Item 1 */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="navItem1En">
                            Navbar Item 1 EN
                        </Label>
                        <Input
                            id="navItem1En"
                            {...register("navItem1En")}
                            placeholder="Enter Nav Item 1 in English"
                        />
                        {errors.navItem1En && (
                            <p className="text-sm text-red-500">{errors.navItem1En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="navItem1De">
                            Navbar Item 1 DE
                        </Label>
                        <Input
                            id="navItem1De"
                            {...register("navItem1De")}
                            placeholder="Enter Nav Item 1 in German"
                        />
                        {errors.navItem1De && (
                            <p className="text-sm text-red-500">{errors.navItem1De.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Nav Item 2 */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="navItem2En">
                            Navbar Item 2 EN
                        </Label>
                        <Input
                            id="navItem2En"
                            {...register("navItem2En")}
                            placeholder="Enter Nav Item 2 in English"
                        />
                        {errors.navItem2En && (
                            <p className="text-sm text-red-500">{errors.navItem2En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="navItem2De">
                            Navbar Item 2 DE
                        </Label>
                        <Input
                            id="navItem2De"
                            {...register("navItem2De")}
                            placeholder="Enter Nav Item 2 in German"
                        />
                        {errors.navItem2De && (
                            <p className="text-sm text-red-500">{errors.navItem2De.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Nav Item 3 */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="navItem3En">
                            Navbar Item 3 EN
                        </Label>
                        <Input
                            id="navItem3En"
                            {...register("navItem3En")}
                            placeholder="Enter Nav Item 3 in English"
                        />
                        {errors.navItem3En && (
                            <p className="text-sm text-red-500">{errors.navItem3En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="navItem3De">
                            Navbar Item 3 DE
                        </Label>
                        <Input
                            id="navItem3De"
                            {...register("navItem3De")}
                            placeholder="Enter Nav Item 3 in German"
                        />
                        {errors.navItem3De && (
                            <p className="text-sm text-red-500">{errors.navItem3De.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Nav Item 4 */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="navItem4En">
                            Navbar Item 4 EN
                        </Label>
                        <Input
                            id="navItem4En"
                            {...register("navItem4En")}
                            placeholder="Enter Nav Item 4 in English"
                        />
                        {errors.navItem4En && (
                            <p className="text-sm text-red-500">{errors.navItem4En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="navItem4De">
                            Navbar Item 4 DE
                        </Label>
                        <Input
                            id="navItem4De"
                            {...register("navItem4De")}
                            placeholder="Enter Nav Item 4 in German"
                        />
                        {errors.navItem4De && (
                            <p className="text-sm text-red-500">{errors.navItem4De.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Nav Item 5 */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="navItem5En">
                            Navbar Item 5 EN
                        </Label>
                        <Input
                            id="navItem5En"
                            {...register("navItem5En")}
                            placeholder="Enter Nav Item 5 in English"
                        />
                        {errors.navItem5En && (
                            <p className="text-sm text-red-500">{errors.navItem5En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="navItem5De">
                            Navbar Item 5 DE
                        </Label>
                        <Input
                            id="navItem5De"
                            {...register("navItem5De")}
                            placeholder="Enter Nav Item 5 in German"
                        />
                        {errors.navItem5De && (
                            <p className="text-sm text-red-500">{errors.navItem5De.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

// Zod schema for footer validation
const footerSchema = z.object({
    descriptionEn: z.string().min(1, "Description EN is required"),
    descriptionDe: z.string().min(1, "Description DE is required"),
    ourAddressTitleEn: z.string().min(1, "Our Address Title EN is required"),
    ourAddressTitleDe: z.string().min(1, "Our Address Title DE is required"),
    quickLinksTitleEn: z.string().min(1, "Quick Links Title EN is required"),
    quickLinksTitleDe: z.string().min(1, "Quick Links Title DE is required"),
    quickLink1En: z.string().min(1, "Quick Link 1 EN is required"),
    quickLink1De: z.string().min(1, "Quick Link 1 DE is required"),
    quickLink2En: z.string().min(1, "Quick Link 2 EN is required"),
    quickLink2De: z.string().min(1, "Quick Link 2 DE is required"),
    quickLink3En: z.string().min(1, "Quick Link 3 EN is required"),
    quickLink3De: z.string().min(1, "Quick Link 3 DE is required"),
    quickLink4En: z.string().min(1, "Quick Link 4 EN is required"),
    quickLink4De: z.string().min(1, "Quick Link 4 DE is required"),
    quickLink5En: z.string().min(1, "Quick Link 5 EN is required"),
    quickLink5De: z.string().min(1, "Quick Link 5 DE is required"),
    newsletterTitleEn: z.string().min(1, "Newsletter Title EN is required"),
    newsletterTitleDe: z.string().min(1, "Newsletter Title DE is required"),
    emailPlaceholderEn: z.string().min(1, "Email Placeholder EN is required"),
    emailPlaceholderDe: z.string().min(1, "Email Placeholder DE is required"),
    subscribeButtonEn: z.string().min(1, "Subscribe Button EN is required"),
    subscribeButtonDe: z.string().min(1, "Subscribe Button DE is required"),
    copyrightTextEn: z.string().min(1, "Copyright Text EN is required"),
    copyrightTextDe: z.string().min(1, "Copyright Text DE is required"),
});

export default function FooterTab({ onDataChange, onValidationChange, onSaveHandlerReady }) {
    const [loading, setLoading] = useState(true);
    const {
        register,
        reset,
        watch,
        trigger,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(footerSchema),
        mode: "onChange",
        defaultValues: {
            descriptionEn: "",
            descriptionDe: "",
            ourAddressTitleEn: "",
            ourAddressTitleDe: "",
            quickLinksTitleEn: "",
            quickLinksTitleDe: "",
            quickLink1En: "",
            quickLink1De: "",
            quickLink2En: "",
            quickLink2De: "",
            quickLink3En: "",
            quickLink3De: "",
            quickLink4En: "",
            quickLink4De: "",
            quickLink5En: "",
            quickLink5De: "",
            newsletterTitleEn: "",
            newsletterTitleDe: "",
            emailPlaceholderEn: "",
            emailPlaceholderDe: "",
            subscribeButtonEn: "",
            subscribeButtonDe: "",
            copyrightTextEn: "",
            copyrightTextDe: "",
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

    // Fetch footer data
    const fetchFooterData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/footer");
            const data = await res.json();

            if (data.success) {
                const fetchedData = {
                    descriptionEn: data.data.descriptionEn || "",
                    descriptionDe: data.data.descriptionDe || "",
                    ourAddressTitleEn: data.data.ourAddressTitleEn || "",
                    ourAddressTitleDe: data.data.ourAddressTitleDe || "",
                    quickLinksTitleEn: data.data.quickLinksTitleEn || "",
                    quickLinksTitleDe: data.data.quickLinksTitleDe || "",
                    quickLink1En: data.data.quickLink1En || "",
                    quickLink1De: data.data.quickLink1De || "",
                    quickLink2En: data.data.quickLink2En || "",
                    quickLink2De: data.data.quickLink2De || "",
                    quickLink3En: data.data.quickLink3En || "",
                    quickLink3De: data.data.quickLink3De || "",
                    quickLink4En: data.data.quickLink4En || "",
                    quickLink4De: data.data.quickLink4De || "",
                    quickLink5En: data.data.quickLink5En || "",
                    quickLink5De: data.data.quickLink5De || "",
                    newsletterTitleEn: data.data.newsletterTitleEn || "",
                    newsletterTitleDe: data.data.newsletterTitleDe || "",
                    emailPlaceholderEn: data.data.emailPlaceholderEn || "",
                    emailPlaceholderDe: data.data.emailPlaceholderDe || "",
                    subscribeButtonEn: data.data.subscribeButtonEn || "",
                    subscribeButtonDe: data.data.subscribeButtonDe || "",
                    copyrightTextEn: data.data.copyrightTextEn || "",
                    copyrightTextDe: data.data.copyrightTextDe || "",
                };
                reset(fetchedData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch footer content");
        } finally {
            setLoading(false);
        }
    }, [reset]);

    useEffect(() => {
        fetchFooterData();
    }, [fetchFooterData]);

    // Save handler
    const handleSave = useCallback(async (data) => {
        try {
            const res = await fetch("/api/admin/footer", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to save footer content");
            }
            toast.success(response.message || "Footer content saved successfully");
            fetchFooterData(); // Refresh data
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false };
        }
    }, [fetchFooterData]);

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
                    <span>Loading footer content...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <h2 className="text-sm font-bold text-primary font-open-sans mb-6">
            SECTION 1 — FOOTER SECTION
            </h2>

            {/* Description */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="descriptionEn">Description EN</Label>
                        <Textarea
                            id="descriptionEn"
                            {...register("descriptionEn")}
                            placeholder="Enter company description in English"
                            rows={4}
                        />
                        {errors.descriptionEn && (
                            <p className="text-sm text-red-500">{errors.descriptionEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descriptionDe">
                            Description DE
                        </Label>
                        <Textarea
                            id="descriptionDe"
                            {...register("descriptionDe")}
                            placeholder="Enter company description in German"
                            rows={4}
                        />
                        {errors.descriptionDe && (
                            <p className="text-sm text-red-500">{errors.descriptionDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Our Address Section */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Our Address Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="ourAddressTitleEn">
                            Our Address Title EN
                        </Label>
                        <Input
                            id="ourAddressTitleEn"
                            {...register("ourAddressTitleEn")}
                            placeholder="Enter Our Address title in English"
                        />
                        {errors.ourAddressTitleEn && (
                            <p className="text-sm text-red-500">{errors.ourAddressTitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ourAddressTitleDe">
                            Our Address Title DE
                        </Label>
                        <Input
                            id="ourAddressTitleDe"
                            {...register("ourAddressTitleDe")}
                            placeholder="Enter Our Address title in German"
                        />
                        {errors.ourAddressTitleDe && (
                            <p className="text-sm text-red-500">{errors.ourAddressTitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Links Section */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Quick Links Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quickLinksTitleEn">
                            Quick Links Title EN
                        </Label>
                        <Input
                            id="quickLinksTitleEn"
                            {...register("quickLinksTitleEn")}
                            placeholder="Enter Quick Links title in English"
                        />
                        {errors.quickLinksTitleEn && (
                            <p className="text-sm text-red-500">{errors.quickLinksTitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quickLinksTitleDe">
                            Quick Links Title DE
                        </Label>
                        <Input
                            id="quickLinksTitleDe"
                            {...register("quickLinksTitleDe")}
                            placeholder="Enter Quick Links title in German"
                        />
                        {errors.quickLinksTitleDe && (
                            <p className="text-sm text-red-500">{errors.quickLinksTitleDe.message}</p>
                        )}
                    </div>
                </div>

                {/* Quick Link 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="quickLink1En">
                            Quick Link 1 EN
                        </Label>
                        <Input
                            id="quickLink1En"
                            {...register("quickLink1En")}
                            placeholder="Enter Quick Link 1 text in English"
                        />
                        {errors.quickLink1En && (
                            <p className="text-sm text-red-500">{errors.quickLink1En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quickLink1De">
                            Quick Link 1 DE
                        </Label>
                        <Input
                            id="quickLink1De"
                            {...register("quickLink1De")}
                            placeholder="Enter Quick Link 1 text in German"
                        />
                        {errors.quickLink1De && (
                            <p className="text-sm text-red-500">{errors.quickLink1De.message}</p>
                        )}
                    </div>
                </div>

                {/* Quick Link 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quickLink2En">
                            Quick Link 2 EN
                        </Label>
                        <Input
                            id="quickLink2En"
                            {...register("quickLink2En")}
                            placeholder="Enter Quick Link 2 text in English"
                        />
                        {errors.quickLink2En && (
                            <p className="text-sm text-red-500">{errors.quickLink2En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quickLink2De">
                            Quick Link 2 DE
                        </Label>
                        <Input
                            id="quickLink2De"
                            {...register("quickLink2De")}
                            placeholder="Enter Quick Link 2 text in German"
                        />
                        {errors.quickLink2De && (
                            <p className="text-sm text-red-500">{errors.quickLink2De.message}</p>
                        )}
                    </div>
                </div>

                {/* Quick Link 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quickLink3En">
                            Quick Link 3 EN
                        </Label>
                        <Input
                            id="quickLink3En"
                            {...register("quickLink3En")}
                            placeholder="Enter Quick Link 3 text in English"
                        />
                        {errors.quickLink3En && (
                            <p className="text-sm text-red-500">{errors.quickLink3En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quickLink3De">
                            Quick Link 3 DE
                        </Label>
                        <Input
                            id="quickLink3De"
                            {...register("quickLink3De")}
                            placeholder="Enter Quick Link 3 text in German"
                        />
                        {errors.quickLink3De && (
                            <p className="text-sm text-red-500">{errors.quickLink3De.message}</p>
                        )}
                    </div>
                </div>

                {/* Quick Link 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quickLink4En">
                            Quick Link 4 EN
                        </Label>
                        <Input
                            id="quickLink4En"
                            {...register("quickLink4En")}
                            placeholder="Enter Quick Link 4 text in English"
                        />
                        {errors.quickLink4En && (
                            <p className="text-sm text-red-500">{errors.quickLink4En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quickLink4De">
                            Quick Link 4 DE
                        </Label>
                        <Input
                            id="quickLink4De"
                            {...register("quickLink4De")}
                            placeholder="Enter Quick Link 4 text in German"
                        />
                        {errors.quickLink4De && (
                            <p className="text-sm text-red-500">{errors.quickLink4De.message}</p>
                        )}
                    </div>
                </div>

                {/* Quick Link 5 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quickLink5En">
                            Quick Link 5 EN
                        </Label>
                        <Input
                            id="quickLink5En"
                            {...register("quickLink5En")}
                            placeholder="Enter Quick Link 5 text in English"
                        />
                        {errors.quickLink5En && (
                            <p className="text-sm text-red-500">{errors.quickLink5En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quickLink5De">
                            Quick Link 5 DE
                        </Label>
                        <Input
                            id="quickLink5De"
                            {...register("quickLink5De")}
                            placeholder="Enter Quick Link 5 text in German"
                        />
                        {errors.quickLink5De && (
                            <p className="text-sm text-red-500">{errors.quickLink5De.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Newsletter Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="newsletterTitleEn">
                            Newsletter Title EN
                        </Label>
                        <Input
                            id="newsletterTitleEn"
                            {...register("newsletterTitleEn")}
                            placeholder="Enter Newsletter title in English"
                        />
                        {errors.newsletterTitleEn && (
                            <p className="text-sm text-red-500">{errors.newsletterTitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newsletterTitleDe">
                            Newsletter Title DE
                        </Label>
                        <Input
                            id="newsletterTitleDe"
                            {...register("newsletterTitleDe")}
                            placeholder="Enter Newsletter title in German"
                        />
                        {errors.newsletterTitleDe && (
                            <p className="text-sm text-red-500">{errors.newsletterTitleDe.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="emailPlaceholderEn">
                            Email Placeholder EN
                        </Label>
                        <Input
                            id="emailPlaceholderEn"
                            {...register("emailPlaceholderEn")}
                            placeholder="Enter email placeholder text in English"
                        />
                        {errors.emailPlaceholderEn && (
                            <p className="text-sm text-red-500">{errors.emailPlaceholderEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="emailPlaceholderDe">
                            Email Placeholder DE
                        </Label>
                        <Input
                            id="emailPlaceholderDe"
                            {...register("emailPlaceholderDe")}
                            placeholder="Enter email placeholder text in German"
                        />
                        {errors.emailPlaceholderDe && (
                            <p className="text-sm text-red-500">{errors.emailPlaceholderDe.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="subscribeButtonEn">
                            Subscribe Button EN
                        </Label>
                        <Input
                            id="subscribeButtonEn"
                            {...register("subscribeButtonEn")}
                            placeholder="Enter Subscribe button text in English"
                        />
                        {errors.subscribeButtonEn && (
                            <p className="text-sm text-red-500">{errors.subscribeButtonEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subscribeButtonDe">
                            Subscribe Button DE
                        </Label>
                        <Input
                            id="subscribeButtonDe"
                            {...register("subscribeButtonDe")}
                            placeholder="Enter Subscribe button text in German"
                        />
                        {errors.subscribeButtonDe && (
                            <p className="text-sm text-red-500">{errors.subscribeButtonDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Copyright Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="copyrightTextEn">
                            Copyright Text EN
                        </Label>
                        <Input
                            id="copyrightTextEn"
                            {...register("copyrightTextEn")}
                            placeholder="Enter copyright text in English"
                        />
                        {errors.copyrightTextEn && (
                            <p className="text-sm text-red-500">{errors.copyrightTextEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="copyrightTextDe">
                            Copyright Text DE
                        </Label>
                        <Input
                            id="copyrightTextDe"
                            {...register("copyrightTextDe")}
                            placeholder="Enter copyright text in German"
                        />
                        {errors.copyrightTextDe && (
                            <p className="text-sm text-red-500">{errors.copyrightTextDe.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import HeroSection from "./sections/HeroSection";
import ValueBlocksSection from "./sections/ValueBlocksSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import FAQSection from "./sections/FAQSection";
import PartnersSection from "./sections/PartnersSection";

// Zod schema for homepage validation
const homepageSchema = z.object({
    // Hero Section
    heroSmallLabelEn: z.string().min(1, "Small Label EN is required"),
    heroSmallLabelDe: z.string().min(1, "Small Label DE is required"),
    heroTitleEn: z.string().min(1, "Hero Title EN is required"),
    heroTitleDe: z.string().min(1, "Hero Title DE is required"),
    heroDescriptionEn: z.string().min(1, "Hero Description EN is required"),
    heroDescriptionDe: z.string().min(1, "Hero Description DE is required"),
    heroShortDescriptionEn: z.string().min(1, "Hero Short Description EN is required"),
    heroShortDescriptionDe: z.string().min(1, "Hero Short Description DE is required"),
    heroInputPlaceholderEn: z.string().min(1, "Hero Input Placeholder EN is required"),
    heroInputPlaceholderDe: z.string().min(1, "Hero Input Placeholder DE is required"),
    heroPrimaryButtonEn: z.string().min(1, "Primary Button EN is required"),
    heroPrimaryButtonDe: z.string().min(1, "Primary Button DE is required"),
    heroSecondaryButtonEn: z.string().min(1, "Secondary Button EN is required"),
    heroSecondaryButtonDe: z.string().min(1, "Secondary Button DE is required"),
    heroHotlineCtaEn: z.string().min(1, "Hotline CTA EN is required"),
    heroHotlineCtaDe: z.string().min(1, "Hotline CTA DE is required"),
    heroRequestButtonEn: z.string().min(1, "Request Button EN is required"),
    heroRequestButtonDe: z.string().min(1, "Request Button DE is required"),
    // Value Blocks Section
    valueBlocksTitleEn: z.string().min(1, "Value Blocks Title EN is required"),
    valueBlocksTitleDe: z.string().min(1, "Value Blocks Title DE is required"),
    valueBlocksSubtitleEn: z.string().min(1, "Value Blocks Subtitle EN is required"),
    valueBlocksSubtitleDe: z.string().min(1, "Value Blocks Subtitle DE is required"),
    valueBlock1TitleEn: z.string().min(1, "Block 1 Title EN is required"),
    valueBlock1TitleDe: z.string().min(1, "Block 1 Title DE is required"),
    valueBlock1DescriptionEn: z.string().min(1, "Block 1 Description EN is required"),
    valueBlock1DescriptionDe: z.string().min(1, "Block 1 Description DE is required"),
    valueBlock2TitleEn: z.string().min(1, "Block 2 Title EN is required"),
    valueBlock2TitleDe: z.string().min(1, "Block 2 Title DE is required"),
    valueBlock2DescriptionEn: z.string().min(1, "Block 2 Description EN is required"),
    valueBlock2DescriptionDe: z.string().min(1, "Block 2 Description DE is required"),
    valueBlock3TitleEn: z.string().min(1, "Block 3 Title EN is required"),
    valueBlock3TitleDe: z.string().min(1, "Block 3 Title DE is required"),
    valueBlock3DescriptionEn: z.string().min(1, "Block 3 Description EN is required"),
    valueBlock3DescriptionDe: z.string().min(1, "Block 3 Description DE is required"),
    valueBlock4TitleEn: z.string().min(1, "Block 4 Title EN is required"),
    valueBlock4TitleDe: z.string().min(1, "Block 4 Title DE is required"),
    valueBlock4DescriptionEn: z.string().min(1, "Block 4 Description EN is required"),
    valueBlock4DescriptionDe: z.string().min(1, "Block 4 Description DE is required"),
    // How It Works Section
    howItWorksTitleEn: z.string().min(1, "How It Works Title EN is required"),
    howItWorksTitleDe: z.string().min(1, "How It Works Title DE is required"),
    howItWorksSubtitleEn: z.string().min(1, "How It Works Subtitle EN is required"),
    howItWorksSubtitleDe: z.string().min(1, "How It Works Subtitle DE is required"),
    step1TitleEn: z.string().min(1, "Step 1 Title EN is required"),
    step1TitleDe: z.string().min(1, "Step 1 Title DE is required"),
    step1Description1En: z.string().min(1, "Step 1 Description 1 EN is required"),
    step1Description1De: z.string().min(1, "Step 1 Description 1 DE is required"),
    step1Description2En: z.string().min(1, "Step 1 Description 2 EN is required"),
    step1Description2De: z.string().min(1, "Step 1 Description 2 DE is required"),
    step2TitleEn: z.string().min(1, "Step 2 Title EN is required"),
    step2TitleDe: z.string().min(1, "Step 2 Title DE is required"),
    step2Description1En: z.string().min(1, "Step 2 Description 1 EN is required"),
    step2Description1De: z.string().min(1, "Step 2 Description 1 DE is required"),
    step2Description2En: z.string().min(1, "Step 2 Description 2 EN is required"),
    step2Description2De: z.string().min(1, "Step 2 Description 2 DE is required"),
    step3TitleEn: z.string().min(1, "Step 3 Title EN is required"),
    step3TitleDe: z.string().min(1, "Step 3 Title DE is required"),
    step3Description1En: z.string().min(1, "Step 3 Description 1 EN is required"),
    step3Description1De: z.string().min(1, "Step 3 Description 1 DE is required"),
    step3Description2En: z.string().min(1, "Step 3 Description 2 EN is required"),
    step3Description2De: z.string().min(1, "Step 3 Description 2 DE is required"),
    step4TitleEn: z.string().min(1, "Step 4 Title EN is required"),
    step4TitleDe: z.string().min(1, "Step 4 Title DE is required"),
    step4Description1En: z.string().min(1, "Step 4 Description 1 EN is required"),
    step4Description1De: z.string().min(1, "Step 4 Description 1 DE is required"),
    step4Description2En: z.string().min(1, "Step 4 Description 2 EN is required"),
    step4Description2De: z.string().min(1, "Step 4 Description 2 DE is required"),
    step5TitleEn: z.string().min(1, "Step 5 Title EN is required"),
    step5TitleDe: z.string().min(1, "Step 5 Title DE is required"),
    step5Description1En: z.string().min(1, "Step 5 Description 1 EN is required"),
    step5Description1De: z.string().min(1, "Step 5 Description 1 DE is required"),
    step5Description2En: z.string().min(1, "Step 5 Description 2 EN is required"),
    step5Description2De: z.string().min(1, "Step 5 Description 2 DE is required"),
    ctaCardButton1En: z.string().min(1, "CTA Card Button 1 EN is required"),
    ctaCardButton1De: z.string().min(1, "CTA Card Button 1 DE is required"),
    ctaCardButton2En: z.string().min(1, "CTA Card Button 2 EN is required"),
    ctaCardButton2De: z.string().min(1, "CTA Card Button 2 DE is required"),
    // FAQ Section
    faqTitleEn: z.string().min(1, "FAQ Title EN is required"),
    faqTitleDe: z.string().min(1, "FAQ Title DE is required"),
    faqSubtitleEn: z.string().min(1, "FAQ Subtitle EN is required"),
    faqSubtitleDe: z.string().min(1, "FAQ Subtitle DE is required"),
    // Partners Section
    partnersTitleEn: z.string().min(1, "Partners Title EN is required"),
    partnersTitleDe: z.string().min(1, "Partners Title DE is required"),
    partnersSubtitleEn: z.string().min(1, "Partners Subtitle EN is required"),
    partnersSubtitleDe: z.string().min(1, "Partners Subtitle DE is required"),
});

export default function HomepageTab({ onDataChange, onValidationChange, onSaveHandlerReady }) {
    const [loading, setLoading] = useState(true);
    const {
        register,
        reset,
        watch,
        trigger,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(homepageSchema),
        mode: "onChange",
        defaultValues: {
            // Hero Section
            heroSmallLabelEn: "",
            heroSmallLabelDe: "",
            heroTitleEn: "",
            heroTitleDe: "",
            heroDescriptionEn: "",
            heroDescriptionDe: "",
            heroShortDescriptionEn: "",
            heroShortDescriptionDe: "",
            heroInputPlaceholderEn: "",
            heroInputPlaceholderDe: "",
            heroPrimaryButtonEn: "",
            heroPrimaryButtonDe: "",
            heroSecondaryButtonEn: "",
            heroSecondaryButtonDe: "",
            heroHotlineCtaEn: "",
            heroHotlineCtaDe: "",
            heroRequestButtonEn: "",
            heroRequestButtonDe: "",
            // Value Blocks Section
            valueBlocksTitleEn: "",
            valueBlocksTitleDe: "",
            valueBlocksSubtitleEn: "",
            valueBlocksSubtitleDe: "",
            valueBlock1TitleEn: "",
            valueBlock1TitleDe: "",
            valueBlock1DescriptionEn: "",
            valueBlock1DescriptionDe: "",
            valueBlock2TitleEn: "",
            valueBlock2TitleDe: "",
            valueBlock2DescriptionEn: "",
            valueBlock2DescriptionDe: "",
            valueBlock3TitleEn: "",
            valueBlock3TitleDe: "",
            valueBlock3DescriptionEn: "",
            valueBlock3DescriptionDe: "",
            valueBlock4TitleEn: "",
            valueBlock4TitleDe: "",
            valueBlock4DescriptionEn: "",
            valueBlock4DescriptionDe: "",
            // How It Works Section
            howItWorksTitleEn: "",
            howItWorksTitleDe: "",
            howItWorksSubtitleEn: "",
            howItWorksSubtitleDe: "",
            step1TitleEn: "",
            step1TitleDe: "",
            step1Description1En: "",
            step1Description1De: "",
            step1Description2En: "",
            step1Description2De: "",
            step2TitleEn: "",
            step2TitleDe: "",
            step2Description1En: "",
            step2Description1De: "",
            step2Description2En: "",
            step2Description2De: "",
            step3TitleEn: "",
            step3TitleDe: "",
            step3Description1En: "",
            step3Description1De: "",
            step3Description2En: "",
            step3Description2De: "",
            step4TitleEn: "",
            step4TitleDe: "",
            step4Description1En: "",
            step4Description1De: "",
            step4Description2En: "",
            step4Description2De: "",
            step5TitleEn: "",
            step5TitleDe: "",
            step5Description1En: "",
            step5Description1De: "",
            step5Description2En: "",
            step5Description2De: "",
            ctaCardButton1En: "",
            ctaCardButton1De: "",
            ctaCardButton2En: "",
            ctaCardButton2De: "",
            // FAQ Section
            faqTitleEn: "",
            faqTitleDe: "",
            faqSubtitleEn: "",
            faqSubtitleDe: "",
            // Partners Section
            partnersTitleEn: "",
            partnersTitleDe: "",
            partnersSubtitleEn: "",
            partnersSubtitleDe: "",
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

    // Fetch homepage data
    const fetchHomepageData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/homepage");
            const data = await res.json();

            if (data.success) {
                const fetchedData = {
                    // Hero Section
                    heroSmallLabelEn: data.data.heroSmallLabelEn || "",
                    heroSmallLabelDe: data.data.heroSmallLabelDe || "",
                    heroTitleEn: data.data.heroTitleEn || "",
                    heroTitleDe: data.data.heroTitleDe || "",
                    heroDescriptionEn: data.data.heroDescriptionEn || "",
                    heroDescriptionDe: data.data.heroDescriptionDe || "",
                    heroShortDescriptionEn: data.data.heroShortDescriptionEn || "",
                    heroShortDescriptionDe: data.data.heroShortDescriptionDe || "",
                    heroInputPlaceholderEn: data.data.heroInputPlaceholderEn || "",
                    heroInputPlaceholderDe: data.data.heroInputPlaceholderDe || "",
                    heroPrimaryButtonEn: data.data.heroPrimaryButtonEn || "",
                    heroPrimaryButtonDe: data.data.heroPrimaryButtonDe || "",
                    heroSecondaryButtonEn: data.data.heroSecondaryButtonEn || "",
                    heroSecondaryButtonDe: data.data.heroSecondaryButtonDe || "",
                    heroHotlineCtaEn: data.data.heroHotlineCtaEn || "",
                    heroHotlineCtaDe: data.data.heroHotlineCtaDe || "",
                    heroRequestButtonEn: data.data.heroRequestButtonEn || "",
                    heroRequestButtonDe: data.data.heroRequestButtonDe || "",
                    // Value Blocks Section
                    valueBlocksTitleEn: data.data.valueBlocksTitleEn || "",
                    valueBlocksTitleDe: data.data.valueBlocksTitleDe || "",
                    valueBlocksSubtitleEn: data.data.valueBlocksSubtitleEn || "",
                    valueBlocksSubtitleDe: data.data.valueBlocksSubtitleDe || "",
                    valueBlock1TitleEn: data.data.valueBlock1TitleEn || "",
                    valueBlock1TitleDe: data.data.valueBlock1TitleDe || "",
                    valueBlock1DescriptionEn: data.data.valueBlock1DescriptionEn || "",
                    valueBlock1DescriptionDe: data.data.valueBlock1DescriptionDe || "",
                    valueBlock2TitleEn: data.data.valueBlock2TitleEn || "",
                    valueBlock2TitleDe: data.data.valueBlock2TitleDe || "",
                    valueBlock2DescriptionEn: data.data.valueBlock2DescriptionEn || "",
                    valueBlock2DescriptionDe: data.data.valueBlock2DescriptionDe || "",
                    valueBlock3TitleEn: data.data.valueBlock3TitleEn || "",
                    valueBlock3TitleDe: data.data.valueBlock3TitleDe || "",
                    valueBlock3DescriptionEn: data.data.valueBlock3DescriptionEn || "",
                    valueBlock3DescriptionDe: data.data.valueBlock3DescriptionDe || "",
                    valueBlock4TitleEn: data.data.valueBlock4TitleEn || "",
                    valueBlock4TitleDe: data.data.valueBlock4TitleDe || "",
                    valueBlock4DescriptionEn: data.data.valueBlock4DescriptionEn || "",
                    valueBlock4DescriptionDe: data.data.valueBlock4DescriptionDe || "",
                    // How It Works Section
                    howItWorksTitleEn: data.data.howItWorksTitleEn || "",
                    howItWorksTitleDe: data.data.howItWorksTitleDe || "",
                    howItWorksSubtitleEn: data.data.howItWorksSubtitleEn || "",
                    howItWorksSubtitleDe: data.data.howItWorksSubtitleDe || "",
                    step1TitleEn: data.data.step1TitleEn || "",
                    step1TitleDe: data.data.step1TitleDe || "",
                    step1Description1En: data.data.step1Description1En || "",
                    step1Description1De: data.data.step1Description1De || "",
                    step1Description2En: data.data.step1Description2En || "",
                    step1Description2De: data.data.step1Description2De || "",
                    step2TitleEn: data.data.step2TitleEn || "",
                    step2TitleDe: data.data.step2TitleDe || "",
                    step2Description1En: data.data.step2Description1En || "",
                    step2Description1De: data.data.step2Description1De || "",
                    step2Description2En: data.data.step2Description2En || "",
                    step2Description2De: data.data.step2Description2De || "",
                    step3TitleEn: data.data.step3TitleEn || "",
                    step3TitleDe: data.data.step3TitleDe || "",
                    step3Description1En: data.data.step3Description1En || "",
                    step3Description1De: data.data.step3Description1De || "",
                    step3Description2En: data.data.step3Description2En || "",
                    step3Description2De: data.data.step3Description2De || "",
                    step4TitleEn: data.data.step4TitleEn || "",
                    step4TitleDe: data.data.step4TitleDe || "",
                    step4Description1En: data.data.step4Description1En || "",
                    step4Description1De: data.data.step4Description1De || "",
                    step4Description2En: data.data.step4Description2En || "",
                    step4Description2De: data.data.step4Description2De || "",
                    step5TitleEn: data.data.step5TitleEn || "",
                    step5TitleDe: data.data.step5TitleDe || "",
                    step5Description1En: data.data.step5Description1En || "",
                    step5Description1De: data.data.step5Description1De || "",
                    step5Description2En: data.data.step5Description2En || "",
                    step5Description2De: data.data.step5Description2De || "",
                    ctaCardButton1En: data.data.ctaCardButton1En || "",
                    ctaCardButton1De: data.data.ctaCardButton1De || "",
                    ctaCardButton2En: data.data.ctaCardButton2En || "",
                    ctaCardButton2De: data.data.ctaCardButton2De || "",
                    // FAQ Section
                    faqTitleEn: data.data.faqTitleEn || "",
                    faqTitleDe: data.data.faqTitleDe || "",
                    faqSubtitleEn: data.data.faqSubtitleEn || "",
                    faqSubtitleDe: data.data.faqSubtitleDe || "",                    
                    // Partners Section
                    partnersTitleEn: data.data.partnersTitleEn || "",
                    partnersTitleDe: data.data.partnersTitleDe || "",
                    partnersSubtitleEn: data.data.partnersSubtitleEn || "",
                    partnersSubtitleDe: data.data.partnersSubtitleDe || "",
                };
                reset(fetchedData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch homepage content");
        } finally {
            setLoading(false);
        }
    }, [reset]);

    useEffect(() => {
        fetchHomepageData();
    }, [fetchHomepageData]);

    // Save handler
    const handleSave = useCallback(async (data) => {
        try {
            const res = await fetch("/api/admin/homepage", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to save homepage content");
            }
            toast.success(response.message || "Homepage content saved successfully");
            fetchHomepageData(); // Refresh data
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false };
        }
    }, [fetchHomepageData]);

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
                    <span>Loading homepage content...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <HeroSection register={register} errors={errors} />
            <ValueBlocksSection register={register} errors={errors} />
            <HowItWorksSection register={register} errors={errors} />
            <FAQSection register={register} errors={errors} />
            <PartnersSection register={register} errors={errors} />
        </div>
    );
}

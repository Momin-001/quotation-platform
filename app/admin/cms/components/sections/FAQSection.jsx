"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function FAQSection({ register, errors }) {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-bold text-primary font-open-sans mb-6">
                SECTION 4 — FAQ
            </h2>
            
            {/* FAQ Title */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="faqTitleEn">
                            FAQ Title EN
                        </Label>
                        <Input
                            id="faqTitleEn"
                            {...register("faqTitleEn")}
                            placeholder="Enter FAQ Title in English"
                        />
                        {errors.faqTitleEn && (
                            <p className="text-sm text-red-500">{errors.faqTitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="faqTitleDe">
                            FAQ Title DE
                        </Label>
                        <Input
                            id="faqTitleDe"
                            {...register("faqTitleDe")}
                            placeholder="Enter FAQ Title in German"
                        />
                        {errors.faqTitleDe && (
                            <p className="text-sm text-red-500">{errors.faqTitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* FAQ Subtitle */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="faqSubtitleEn">
                            FAQ Subtitle EN
                        </Label>
                        <Input
                            id="faqSubtitleEn"
                            {...register("faqSubtitleEn")}
                            placeholder="Enter FAQ Subtitle in English"
                        />
                        {errors.faqSubtitleEn && (
                            <p className="text-sm text-red-500">{errors.faqSubtitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="faqSubtitleDe">
                            FAQ Subtitle DE
                        </Label>
                        <Input
                            id="faqSubtitleDe"
                            {...register("faqSubtitleDe")}
                            placeholder="Enter FAQ Subtitle in German"
                        />
                        {errors.faqSubtitleDe && (
                            <p className="text-sm text-red-500">{errors.faqSubtitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


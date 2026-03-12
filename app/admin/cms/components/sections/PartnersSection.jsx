"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PartnersSection({ register, errors }) {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-bold text-primary font-open-sans mb-6">
                SECTION 5 — TECHNOLOGY PARTNERS
            </h2>
            
            {/* Partners Title */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="partnersTitleEn">
                            Partners Title EN
                        </Label>
                        <Input
                            id="partnersTitleEn"
                            {...register("partnersTitleEn")}
                            placeholder="Enter Partners Title in English"
                        />
                        {errors.partnersTitleEn && (
                            <p className="text-sm text-red-500">{errors.partnersTitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="partnersTitleDe">
                            Partners Title DE
                        </Label>
                        <Input
                            id="partnersTitleDe"
                            {...register("partnersTitleDe")}
                            placeholder="Enter Partners Title in German"
                        />
                        {errors.partnersTitleDe && (
                            <p className="text-sm text-red-500">{errors.partnersTitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Partners Subtitle */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="partnersSubtitleEn">
                            Partners Subtitle EN
                        </Label>
                        <Input
                            id="partnersSubtitleEn"
                            {...register("partnersSubtitleEn")}
                            placeholder="Enter Partners Subtitle in English"
                        />
                        {errors.partnersSubtitleEn && (
                            <p className="text-sm text-red-500">{errors.partnersSubtitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="partnersSubtitleDe">
                            Partners Subtitle DE
                        </Label>
                        <Input
                            id="partnersSubtitleDe"
                            {...register("partnersSubtitleDe")}
                            placeholder="Enter Partners Subtitle in German"
                        />
                        {errors.partnersSubtitleDe && (
                            <p className="text-sm text-red-500">{errors.partnersSubtitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            <h2 className="text-sm font-bold text-primary font-open-sans mb-6 pt-6">
                SECTION 5b — MARKETING PARTNERS
            </h2>

            {/* Marketing Partners Title */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="marketingPartnersTitleEn">
                            Marketing Partners Title EN
                        </Label>
                        <Input
                            id="marketingPartnersTitleEn"
                            {...register("marketingPartnersTitleEn")}
                            placeholder="Enter Marketing Partners Title in English"
                        />
                        {errors.marketingPartnersTitleEn && (
                            <p className="text-sm text-red-500">{errors.marketingPartnersTitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="marketingPartnersTitleDe">
                            Marketing Partners Title DE
                        </Label>
                        <Input
                            id="marketingPartnersTitleDe"
                            {...register("marketingPartnersTitleDe")}
                            placeholder="Enter Marketing Partners Title in German"
                        />
                        {errors.marketingPartnersTitleDe && (
                            <p className="text-sm text-red-500">{errors.marketingPartnersTitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Marketing Partners Subtitle */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="marketingPartnersSubtitleEn">
                            Marketing Partners Subtitle EN
                        </Label>
                        <Input
                            id="marketingPartnersSubtitleEn"
                            {...register("marketingPartnersSubtitleEn")}
                            placeholder="Enter Marketing Partners Subtitle in English"
                        />
                        {errors.marketingPartnersSubtitleEn && (
                            <p className="text-sm text-red-500">{errors.marketingPartnersSubtitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="marketingPartnersSubtitleDe">
                            Marketing Partners Subtitle DE
                        </Label>
                        <Input
                            id="marketingPartnersSubtitleDe"
                            {...register("marketingPartnersSubtitleDe")}
                            placeholder="Enter Marketing Partners Subtitle in German"
                        />
                        {errors.marketingPartnersSubtitleDe && (
                            <p className="text-sm text-red-500">{errors.marketingPartnersSubtitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


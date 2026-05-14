"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PreSelectedFiltersSection({
    register,
    errors,
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-bold text-primary font-open-sans mb-6">
                SECTION 6 — PRE-SELECTED FILTERS
            </h2>
            
            {/* Pre-Selected Filters Title */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="preSelectedFiltersTitleEn">
                            Pre-Selected Filters Title EN
                        </Label>
                        <Input
                            id="preSelectedFiltersTitleEn"
                            {...register("preSelectedFiltersTitleEn")}
                            placeholder="Enter Pre-Selected Filters Title in English"
                        />
                        {errors.preSelectedFiltersTitleEn && (
                            <p className="text-sm text-red-500">{errors.preSelectedFiltersTitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="preSelectedFiltersTitleDe">
                            Pre-Selected Filters Title DE
                        </Label>
                        <Input
                            id="preSelectedFiltersTitleDe"
                            {...register("preSelectedFiltersTitleDe")}
                            placeholder="Enter Pre-Selected Filters Title in German"
                        />
                        {errors.preSelectedFiltersTitleDe && (
                            <p className="text-sm text-red-500">{errors.preSelectedFiltersTitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Pre-Selected Filters Subtitle */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                            <Label htmlFor="preSelectedFiltersSubtitleEn">
                            Pre-Selected Filters Subtitle EN
                        </Label>
                        <Input
                            id="preSelectedFiltersSubtitleEn"
                            {...register("preSelectedFiltersSubtitleEn")}
                            placeholder="Enter Pre-Selected Filters Subtitle in English"
                        />
                        {errors.preSelectedFiltersSubtitleEn && (
                            <p className="text-sm text-red-500">{errors.preSelectedFiltersSubtitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="preSelectedFiltersSubtitleDe">
                            Pre-Selected Filters Subtitle DE
                        </Label>
                        <Input
                            id="preSelectedFiltersSubtitleDe"
                            {...register("preSelectedFiltersSubtitleDe")}
                            placeholder="Enter Pre-Selected Filters Subtitle in German"
                        />
                        {errors.preSelectedFiltersSubtitleDe && (
                            <p className="text-sm text-red-500">{errors.preSelectedFiltersSubtitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Pre-Selected Filters Preset Prefix */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="preSelectedFiltersPresetPrefixEn">
                            Pre-Selected Filters Preset Prefix EN
                        </Label>
                        <Input
                            id="preSelectedFiltersPresetPrefixEn"
                            {...register("preSelectedFiltersPresetPrefixEn")}
                            placeholder="Enter Pre-Selected Filters Preset Prefix in English"
                        />
                            {errors.preSelectedFiltersPresetPrefixEn && (
                            <p className="text-sm text-red-500">{errors.preSelectedFiltersPresetPrefixEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                            <Label htmlFor="preSelectedFiltersPresetPrefixDe">
                            Pre-Selected Filters Preset Prefix DE
                        </Label>
                        <Input
                                id="preSelectedFiltersPresetPrefixDe"
                            {...register("preSelectedFiltersPresetPrefixDe")}
                            placeholder="Enter Pre-Selected Filters Preset Prefix in German"
                        />
                        {errors.preSelectedFiltersPresetPrefixDe && (
                            <p className="text-sm text-red-500">{errors.preSelectedFiltersPresetPrefixDe.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}



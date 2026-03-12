"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import Image from "next/image";

export default function HeroSection({
    register,
    errors,
    heroImageUrl,
    pendingHeroImageFile,
    pendingHeroImagePreviewUrl,
    heroImageWillRemove,
    onPickHeroImageFile,
    onClearPendingHeroImage,
    onToggleRemoveHeroImage,
    disabled = false,
}) {
    const showPreview = pendingHeroImagePreviewUrl || heroImageUrl;

    return (
        <div className="space-y-6">
            <h2 className="text-sm font-bold text-primary font-open-sans mb-6">
                SECTION 1 — HERO SECTION
            </h2>

            {/* Hero Background Image */}
            <div className="space-y-2">
                <Label>Hero Background Image</Label>
                <div className="flex items-start gap-4">
                    <label className="flex items-center justify-center h-24 w-24 border rounded-lg cursor-pointer bg-white shadow-xs hover:bg-gray-50 transition-colors">
                        <span className="text-4xl text-gray-400">+</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                onPickHeroImageFile?.(file);
                            }}
                            className="hidden"
                            disabled={disabled}
                        />
                    </label>
                    {showPreview && (
                        <div className="relative h-24 w-24 border rounded-lg overflow-hidden bg-white shadow-xs">
                            <Image
                                src={showPreview}
                                alt="Hero background"
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                disabled={disabled}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                                onClick={() => {
                                    if (pendingHeroImageFile) {
                                        onClearPendingHeroImage?.();
                                    } else {
                                        onToggleRemoveHeroImage?.();
                                    }
                                }}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    {!showPreview && (
                        <p className="text-sm text-muted-foreground self-center">
                            No custom image. Using default: /hero-led-display.jpg
                        </p>
                    )}
                    {heroImageWillRemove && !pendingHeroImageFile && (
                        <p className="text-sm text-red-600 self-center">
                            Will be removed on save.
                        </p>
                    )}
                </div>
            </div>
            
            {/* Small Label */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="heroSmallLabelEn">
                            Small Label EN
                        </Label>
                        <Input
                            id="heroSmallLabelEn"
                            {...register("heroSmallLabelEn")}
                            placeholder="Enter Small Label in English"
                        />
                        {errors.heroSmallLabelEn && (
                            <p className="text-sm text-red-500">{errors.heroSmallLabelEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroSmallLabelDe">
                            Small Label DE
                        </Label>
                        <Input
                            id="heroSmallLabelDe"
                            {...register("heroSmallLabelDe")}
                            placeholder="Enter Small Label in German"
                        />
                        {errors.heroSmallLabelDe && (
                            <p className="text-sm text-red-500">{errors.heroSmallLabelDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Title */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="heroTitleEn">
                            Hero Title EN
                        </Label>
                        <Input
                            id="heroTitleEn"
                            {...register("heroTitleEn")}
                            placeholder="Enter Hero Title in English"
                        />
                        {errors.heroTitleEn && (
                            <p className="text-sm text-red-500">{errors.heroTitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroTitleDe">
                            Hero Title DE
                        </Label>
                        <Input
                            id="heroTitleDe"
                            {...register("heroTitleDe")}
                            placeholder="Enter Hero Title in German"
                        />
                        {errors.heroTitleDe && (
                            <p className="text-sm text-red-500">{errors.heroTitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Description */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="heroDescriptionEn">
                            Hero Description EN
                        </Label>
                        <Textarea
                            id="heroDescriptionEn"
                            {...register("heroDescriptionEn")}
                            placeholder="Enter Hero Description in English"
                            rows={4}
                        />
                        {errors.heroDescriptionEn && (
                            <p className="text-sm text-red-500">{errors.heroDescriptionEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroDescriptionDe">
                            Hero Description DE
                        </Label>
                        <Textarea
                            id="heroDescriptionDe"
                            {...register("heroDescriptionDe")}
                            placeholder="Enter Hero Description in German"
                            rows={4}
                        />
                        {errors.heroDescriptionDe && (
                            <p className="text-sm text-red-500">{errors.heroDescriptionDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Short Description */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="heroShortDescriptionEn">
                            Hero Short Description EN
                        </Label>
                        <Input
                            id="heroShortDescriptionEn"
                            {...register("heroShortDescriptionEn")}
                            placeholder="Enter Hero Short Description in English"
                        />
                        {errors.heroShortDescriptionEn && (
                            <p className="text-sm text-red-500">{errors.heroShortDescriptionEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroShortDescriptionDe">
                            Hero Short Description DE
                        </Label>
                        <Input
                            id="heroShortDescriptionDe"
                            {...register("heroShortDescriptionDe")}
                            placeholder="Enter Hero Short Description in German"
                        />
                        {errors.heroShortDescriptionDe && (
                            <p className="text-sm text-red-500">{errors.heroShortDescriptionDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Input Placeholder */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="heroInputPlaceholderEn">
                            Hero Input Placeholder EN
                        </Label>
                        <Input
                            id="heroInputPlaceholderEn"
                            {...register("heroInputPlaceholderEn")}
                            placeholder="Enter Hero Input Placeholder in English"
                        />
                        {errors.heroInputPlaceholderEn && (
                            <p className="text-sm text-red-500">{errors.heroInputPlaceholderEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroInputPlaceholderDe">
                            Hero Input Placeholder DE
                        </Label>
                        <Input
                            id="heroInputPlaceholderDe"
                            {...register("heroInputPlaceholderDe")}
                            placeholder="Enter Hero Input Placeholder in German"
                        />
                        {errors.heroInputPlaceholderDe && (
                            <p className="text-sm text-red-500">{errors.heroInputPlaceholderDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Primary Button (Left) */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="heroPrimaryButtonEn">
                            Primary Button (Left) EN
                        </Label>
                        <Input
                            id="heroPrimaryButtonEn"
                            {...register("heroPrimaryButtonEn")}
                            placeholder="Enter Primary Button text in English"
                        />
                        {errors.heroPrimaryButtonEn && (
                            <p className="text-sm text-red-500">{errors.heroPrimaryButtonEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroPrimaryButtonDe">
                            Primary Button (Left) DE
                        </Label>
                        <Input
                            id="heroPrimaryButtonDe"
                            {...register("heroPrimaryButtonDe")}
                            placeholder="Enter Primary Button text in German"
                        />
                        {errors.heroPrimaryButtonDe && (
                            <p className="text-sm text-red-500">{errors.heroPrimaryButtonDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Secondary Button (Right) */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="heroSecondaryButtonEn">
                            Secondary Button (Right) EN
                        </Label>
                        <Input
                            id="heroSecondaryButtonEn"
                            {...register("heroSecondaryButtonEn")}
                            placeholder="Enter Secondary Button text in English"
                        />
                        {errors.heroSecondaryButtonEn && (
                            <p className="text-sm text-red-500">{errors.heroSecondaryButtonEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroSecondaryButtonDe">
                            Secondary Button (Right) DE
                        </Label>
                        <Input
                            id="heroSecondaryButtonDe"
                            {...register("heroSecondaryButtonDe")}
                            placeholder="Enter Secondary Button text in German"
                        />
                        {errors.heroSecondaryButtonDe && (
                            <p className="text-sm text-red-500">{errors.heroSecondaryButtonDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Hotline CTA (Card) */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="heroHotlineCtaEn">
                            Hotline CTA (Card) EN
                        </Label>
                        <Input
                            id="heroHotlineCtaEn"
                            {...register("heroHotlineCtaEn")}
                            placeholder="Enter Hotline CTA text in English"
                        />
                        {errors.heroHotlineCtaEn && (
                            <p className="text-sm text-red-500">{errors.heroHotlineCtaEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroHotlineCtaDe">
                            Hotline CTA (Card) DE
                        </Label>
                        <Input
                            id="heroHotlineCtaDe"
                            {...register("heroHotlineCtaDe")}
                            placeholder="Enter Hotline CTA text in German"
                        />
                        {errors.heroHotlineCtaDe && (
                            <p className="text-sm text-red-500">{errors.heroHotlineCtaDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Request Button */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="heroRequestButtonEn">
                            Request Button EN
                        </Label>
                        <Input
                            id="heroRequestButtonEn"
                            {...register("heroRequestButtonEn")}
                            placeholder="Enter Request Button text in English"
                        />
                        {errors.heroRequestButtonEn && (
                            <p className="text-sm text-red-500">{errors.heroRequestButtonEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroRequestButtonDe">
                            Request Button DE
                        </Label>
                        <Input
                            id="heroRequestButtonDe"
                            {...register("heroRequestButtonDe")}
                            placeholder="Enter Request Button text in German"
                        />
                        {errors.heroRequestButtonDe && (
                            <p className="text-sm text-red-500">{errors.heroRequestButtonDe.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}



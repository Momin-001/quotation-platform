"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ValueBlocksSection({ register, errors }) {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-bold text-primary font-open-sans mb-6">
                SECTION 2 — VALUE BLOCKS
            </h2>
            
            {/* Value Blocks Title */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valueBlocksTitleEn">
                            Value Blocks Title EN
                        </Label>
                        <Input
                            id="valueBlocksTitleEn"
                            {...register("valueBlocksTitleEn")}
                            placeholder="Enter Value Blocks Title in English"
                        />
                        {errors.valueBlocksTitleEn && (
                            <p className="text-sm text-red-500">{errors.valueBlocksTitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valueBlocksTitleDe">
                            Value Blocks Title DE
                        </Label>
                        <Input
                            id="valueBlocksTitleDe"
                            {...register("valueBlocksTitleDe")}
                            placeholder="Enter Value Blocks Title in German"
                        />
                        {errors.valueBlocksTitleDe && (
                            <p className="text-sm text-red-500">{errors.valueBlocksTitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Value Blocks Subtitle */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valueBlocksSubtitleEn">
                            Value Blocks Subtitle EN
                        </Label>
                        <Input
                            id="valueBlocksSubtitleEn"
                            {...register("valueBlocksSubtitleEn")}
                            placeholder="Enter Value Blocks Subtitle in English"
                        />
                        {errors.valueBlocksSubtitleEn && (
                            <p className="text-sm text-red-500">{errors.valueBlocksSubtitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valueBlocksSubtitleDe">
                            Value Blocks Subtitle DE
                        </Label>
                        <Input
                            id="valueBlocksSubtitleDe"
                            {...register("valueBlocksSubtitleDe")}
                            placeholder="Enter Value Blocks Subtitle in German"
                        />
                        {errors.valueBlocksSubtitleDe && (
                            <p className="text-sm text-red-500">{errors.valueBlocksSubtitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Value Block 1 */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Value Block 1</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock1TitleEn">
                            Block 1 Title EN
                        </Label>
                        <Input
                            id="valueBlock1TitleEn"
                            {...register("valueBlock1TitleEn")}
                            placeholder="Enter Block 1 Title in English"
                        />
                        {errors.valueBlock1TitleEn && (
                            <p className="text-sm text-red-500">{errors.valueBlock1TitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock1TitleDe">
                            Block 1 Title DE
                        </Label>
                        <Input
                            id="valueBlock1TitleDe"
                            {...register("valueBlock1TitleDe")}
                            placeholder="Enter Block 1 Title in German"
                        />
                        {errors.valueBlock1TitleDe && (
                            <p className="text-sm text-red-500">{errors.valueBlock1TitleDe.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock1DescriptionEn">
                            Block 1 Description EN
                        </Label>
                        <Textarea
                            id="valueBlock1DescriptionEn"
                            {...register("valueBlock1DescriptionEn")}
                            placeholder="Enter Block 1 Description in English"
                            rows={3}
                        />
                        {errors.valueBlock1DescriptionEn && (
                            <p className="text-sm text-red-500">{errors.valueBlock1DescriptionEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock1DescriptionDe">
                            Block 1 Description DE
                        </Label>
                        <Textarea
                            id="valueBlock1DescriptionDe"
                            {...register("valueBlock1DescriptionDe")}
                            placeholder="Enter Block 1 Description in German"
                            rows={3}
                        />
                        {errors.valueBlock1DescriptionDe && (
                            <p className="text-sm text-red-500">{errors.valueBlock1DescriptionDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Value Block 2 */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Value Block 2</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock2TitleEn">
                            Block 2 Title EN
                        </Label>
                        <Input
                            id="valueBlock2TitleEn"
                            {...register("valueBlock2TitleEn")}
                            placeholder="Enter Block 2 Title in English"
                        />
                        {errors.valueBlock2TitleEn && (
                            <p className="text-sm text-red-500">{errors.valueBlock2TitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock2TitleDe">
                            Block 2 Title DE
                        </Label>
                        <Input
                            id="valueBlock2TitleDe"
                            {...register("valueBlock2TitleDe")}
                            placeholder="Enter Block 2 Title in German"
                        />
                        {errors.valueBlock2TitleDe && (
                            <p className="text-sm text-red-500">{errors.valueBlock2TitleDe.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock2DescriptionEn">
                            Block 2 Description EN
                        </Label>
                        <Textarea
                            id="valueBlock2DescriptionEn"
                            {...register("valueBlock2DescriptionEn")}
                            placeholder="Enter Block 2 Description in English"
                            rows={3}
                        />
                        {errors.valueBlock2DescriptionEn && (
                            <p className="text-sm text-red-500">{errors.valueBlock2DescriptionEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock2DescriptionDe">
                            Block 2 Description DE
                        </Label>
                        <Textarea
                            id="valueBlock2DescriptionDe"
                            {...register("valueBlock2DescriptionDe")}
                            placeholder="Enter Block 2 Description in German"
                            rows={3}
                        />
                        {errors.valueBlock2DescriptionDe && (
                            <p className="text-sm text-red-500">{errors.valueBlock2DescriptionDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Value Block 3 */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Value Block 3</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock3TitleEn">
                            Block 3 Title EN
                        </Label>
                        <Input
                            id="valueBlock3TitleEn"
                            {...register("valueBlock3TitleEn")}
                            placeholder="Enter Block 3 Title in English"
                        />
                        {errors.valueBlock3TitleEn && (
                            <p className="text-sm text-red-500">{errors.valueBlock3TitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock3TitleDe">
                            Block 3 Title DE
                        </Label>
                        <Input
                            id="valueBlock3TitleDe"
                            {...register("valueBlock3TitleDe")}
                            placeholder="Enter Block 3 Title in German"
                        />
                        {errors.valueBlock3TitleDe && (
                            <p className="text-sm text-red-500">{errors.valueBlock3TitleDe.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock3DescriptionEn">
                            Block 3 Description EN
                        </Label>
                        <Textarea
                            id="valueBlock3DescriptionEn"
                            {...register("valueBlock3DescriptionEn")}
                            placeholder="Enter Block 3 Description in English"
                            rows={3}
                        />
                        {errors.valueBlock3DescriptionEn && (
                            <p className="text-sm text-red-500">{errors.valueBlock3DescriptionEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock3DescriptionDe">
                            Block 3 Description DE
                        </Label>
                        <Textarea
                            id="valueBlock3DescriptionDe"
                            {...register("valueBlock3DescriptionDe")}
                            placeholder="Enter Block 3 Description in German"
                            rows={3}
                        />
                        {errors.valueBlock3DescriptionDe && (
                            <p className="text-sm text-red-500">{errors.valueBlock3DescriptionDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Value Block 4 */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Value Block 4</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock4TitleEn">
                            Block 4 Title EN
                        </Label>
                        <Input
                            id="valueBlock4TitleEn"
                            {...register("valueBlock4TitleEn")}
                            placeholder="Enter Block 4 Title in English"
                        />
                        {errors.valueBlock4TitleEn && (
                            <p className="text-sm text-red-500">{errors.valueBlock4TitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock4TitleDe">
                            Block 4 Title DE
                        </Label>
                        <Input
                            id="valueBlock4TitleDe"
                            {...register("valueBlock4TitleDe")}
                            placeholder="Enter Block 4 Title in German"
                        />
                        {errors.valueBlock4TitleDe && (
                            <p className="text-sm text-red-500">{errors.valueBlock4TitleDe.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock4DescriptionEn">
                            Block 4 Description EN
                        </Label>
                        <Textarea
                            id="valueBlock4DescriptionEn"
                            {...register("valueBlock4DescriptionEn")}
                            placeholder="Enter Block 4 Description in English"
                            rows={3}
                        />
                        {errors.valueBlock4DescriptionEn && (
                            <p className="text-sm text-red-500">{errors.valueBlock4DescriptionEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valueBlock4DescriptionDe">
                            Block 4 Description DE
                        </Label>
                        <Textarea
                            id="valueBlock4DescriptionDe"
                            {...register("valueBlock4DescriptionDe")}
                            placeholder="Enter Block 4 Description in German"
                            rows={3}
                        />
                        {errors.valueBlock4DescriptionDe && (
                            <p className="text-sm text-red-500">{errors.valueBlock4DescriptionDe.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}



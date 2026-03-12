"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BlogsSection({ register, errors }) {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-bold text-primary font-open-sans mb-6">
                SECTION 6 — BLOGS
            </h2>

            {/* Blogs Section Title */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="blogsSectionTitleEn">Blogs Section Title EN</Label>
                        <Input
                            id="blogsSectionTitleEn"
                            {...register("blogsSectionTitleEn")}
                            placeholder="e.g. Blogs & Insights"
                        />
                        {errors.blogsSectionTitleEn && (
                            <p className="text-sm text-red-500">{errors.blogsSectionTitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="blogsSectionTitleDe">Blogs Section Title DE</Label>
                        <Input
                            id="blogsSectionTitleDe"
                            {...register("blogsSectionTitleDe")}
                            placeholder="e.g. Blogs & Einblicke"
                        />
                        {errors.blogsSectionTitleDe && (
                            <p className="text-sm text-red-500">{errors.blogsSectionTitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Blogs Section Subtitle */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="blogsSectionSubtitleEn">Blogs Section Subtitle EN</Label>
                        <Input
                            id="blogsSectionSubtitleEn"
                            {...register("blogsSectionSubtitleEn")}
                            placeholder="e.g. Expert Knowledge to Help You Make Informed Decisions"
                        />
                        {errors.blogsSectionSubtitleEn && (
                            <p className="text-sm text-red-500">{errors.blogsSectionSubtitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="blogsSectionSubtitleDe">Blogs Section Subtitle DE</Label>
                        <Input
                            id="blogsSectionSubtitleDe"
                            {...register("blogsSectionSubtitleDe")}
                            placeholder="e.g. Expertenwissen, um fundierte Entscheidungen zu treffen"
                        />
                        {errors.blogsSectionSubtitleDe && (
                            <p className="text-sm text-red-500">{errors.blogsSectionSubtitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

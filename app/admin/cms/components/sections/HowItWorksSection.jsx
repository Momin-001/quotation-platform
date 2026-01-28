"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function HowItWorksSection({ register, errors }) {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-bold text-primary font-open-sans mb-6">
                SECTION 3 — HOW IT WORKS
            </h2>
            
            {/* How It Works Title */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="howItWorksTitleEn">
                            How It Works Title EN
                        </Label>
                        <Input
                            id="howItWorksTitleEn"
                            {...register("howItWorksTitleEn")}
                            placeholder="Enter How It Works Title in English"
                        />
                        {errors.howItWorksTitleEn && (
                            <p className="text-sm text-red-500">{errors.howItWorksTitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="howItWorksTitleDe">
                            How It Works Title DE
                        </Label>
                        <Input
                            id="howItWorksTitleDe"
                            {...register("howItWorksTitleDe")}
                            placeholder="Enter How It Works Title in German"
                        />
                        {errors.howItWorksTitleDe && (
                            <p className="text-sm text-red-500">{errors.howItWorksTitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* How It Works Subtitle */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="howItWorksSubtitleEn">
                            How It Works Subtitle EN
                        </Label>
                        <Input
                            id="howItWorksSubtitleEn"
                            {...register("howItWorksSubtitleEn")}
                            placeholder="Enter How It Works Subtitle in English"
                        />
                        {errors.howItWorksSubtitleEn && (
                            <p className="text-sm text-red-500">{errors.howItWorksSubtitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="howItWorksSubtitleDe">
                            How It Works Subtitle DE
                        </Label>
                        <Input
                            id="howItWorksSubtitleDe"
                            {...register("howItWorksSubtitleDe")}
                            placeholder="Enter How It Works Subtitle in German"
                        />
                        {errors.howItWorksSubtitleDe && (
                            <p className="text-sm text-red-500">{errors.howItWorksSubtitleDe.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 1 */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Step 1</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step1TitleEn">
                            Step 1 Title EN
                        </Label>
                        <Input
                            id="step1TitleEn"
                            {...register("step1TitleEn")}
                            placeholder="Enter Step 1 Title in English"
                        />
                        {errors.step1TitleEn && (
                            <p className="text-sm text-red-500">{errors.step1TitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step1TitleDe">
                            Step 1 Title DE
                        </Label>
                        <Input
                            id="step1TitleDe"
                            {...register("step1TitleDe")}
                            placeholder="Enter Step 1 Title in German"
                        />
                        {errors.step1TitleDe && (
                            <p className="text-sm text-red-500">{errors.step1TitleDe.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step1Description1En">
                            Step 1 Description 1 EN
                        </Label>
                        <Textarea
                            id="step1Description1En"
                            {...register("step1Description1En")}
                            placeholder="Enter Step 1 Description 1 in English"
                            rows={2}
                        />
                        {errors.step1Description1En && (
                            <p className="text-sm text-red-500">{errors.step1Description1En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step1Description1De">
                            Step 1 Description 1 DE
                        </Label>
                        <Textarea
                            id="step1Description1De"
                            {...register("step1Description1De")}
                            placeholder="Enter Step 1 Description 1 in German"
                            rows={2}
                        />
                        {errors.step1Description1De && (
                            <p className="text-sm text-red-500">{errors.step1Description1De.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step1Description2En">
                            Step 1 Description 2 EN
                        </Label>
                        <Textarea
                            id="step1Description2En"
                            {...register("step1Description2En")}
                            placeholder="Enter Step 1 Description 2 in English"
                            rows={2}
                        />
                        {errors.step1Description2En && (
                            <p className="text-sm text-red-500">{errors.step1Description2En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step1Description2De">
                            Step 1 Description 2 DE
                        </Label>
                        <Textarea
                            id="step1Description2De"
                            {...register("step1Description2De")}
                            placeholder="Enter Step 1 Description 2 in German"
                            rows={2}
                        />
                        {errors.step1Description2De && (
                            <p className="text-sm text-red-500">{errors.step1Description2De.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Step 2</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step2TitleEn">
                            Step 2 Title EN
                        </Label>
                        <Input
                            id="step2TitleEn"
                            {...register("step2TitleEn")}
                            placeholder="Enter Step 2 Title in English"
                        />
                        {errors.step2TitleEn && (
                            <p className="text-sm text-red-500">{errors.step2TitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step2TitleDe">
                            Step 2 Title DE
                        </Label>
                        <Input
                            id="step2TitleDe"
                            {...register("step2TitleDe")}
                            placeholder="Enter Step 2 Title in German"
                        />
                        {errors.step2TitleDe && (
                            <p className="text-sm text-red-500">{errors.step2TitleDe.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step2Description1En">
                            Step 2 Description 1 EN
                        </Label>
                        <Textarea
                            id="step2Description1En"
                            {...register("step2Description1En")}
                            placeholder="Enter Step 2 Description 1 in English"
                            rows={2}
                        />
                        {errors.step2Description1En && (
                            <p className="text-sm text-red-500">{errors.step2Description1En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step2Description1De">
                            Step 2 Description 1 DE
                        </Label>
                        <Textarea
                            id="step2Description1De"
                            {...register("step2Description1De")}
                            placeholder="Enter Step 2 Description 1 in German"
                            rows={2}
                        />
                        {errors.step2Description1De && (
                            <p className="text-sm text-red-500">{errors.step2Description1De.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step2Description2En">
                            Step 2 Description 2 EN
                        </Label>
                        <Textarea
                            id="step2Description2En"
                            {...register("step2Description2En")}
                            placeholder="Enter Step 2 Description 2 in English"
                            rows={2}
                        />
                        {errors.step2Description2En && (
                            <p className="text-sm text-red-500">{errors.step2Description2En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step2Description2De">
                            Step 2 Description 2 DE
                        </Label>
                        <Textarea
                            id="step2Description2De"
                            {...register("step2Description2De")}
                            placeholder="Enter Step 2 Description 2 in German"
                            rows={2}
                        />
                        {errors.step2Description2De && (
                            <p className="text-sm text-red-500">{errors.step2Description2De.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Step 3</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step3TitleEn">
                            Step 3 Title EN
                        </Label>
                        <Input
                            id="step3TitleEn"
                            {...register("step3TitleEn")}
                            placeholder="Enter Step 3 Title in English"
                        />
                        {errors.step3TitleEn && (
                            <p className="text-sm text-red-500">{errors.step3TitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step3TitleDe">
                            Step 3 Title DE
                        </Label>
                        <Input
                            id="step3TitleDe"
                            {...register("step3TitleDe")}
                            placeholder="Enter Step 3 Title in German"
                        />
                        {errors.step3TitleDe && (
                            <p className="text-sm text-red-500">{errors.step3TitleDe.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step3Description1En">
                            Step 3 Description 1 EN
                        </Label>
                        <Textarea
                            id="step3Description1En"
                            {...register("step3Description1En")}
                            placeholder="Enter Step 3 Description 1 in English"
                            rows={2}
                        />
                        {errors.step3Description1En && (
                            <p className="text-sm text-red-500">{errors.step3Description1En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step3Description1De">
                            Step 3 Description 1 DE
                        </Label>
                        <Textarea
                            id="step3Description1De"
                            {...register("step3Description1De")}
                            placeholder="Enter Step 3 Description 1 in German"
                            rows={2}
                        />
                        {errors.step3Description1De && (
                            <p className="text-sm text-red-500">{errors.step3Description1De.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step3Description2En">
                            Step 3 Description 2 EN
                        </Label>
                        <Textarea
                            id="step3Description2En"
                            {...register("step3Description2En")}
                            placeholder="Enter Step 3 Description 2 in English"
                            rows={2}
                        />
                        {errors.step3Description2En && (
                            <p className="text-sm text-red-500">{errors.step3Description2En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step3Description2De">
                            Step 3 Description 2 DE
                        </Label>
                        <Textarea
                            id="step3Description2De"
                            {...register("step3Description2De")}
                            placeholder="Enter Step 3 Description 2 in German"
                            rows={2}
                        />
                        {errors.step3Description2De && (
                            <p className="text-sm text-red-500">{errors.step3Description2De.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Step 4</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step4TitleEn">
                            Step 4 Title EN
                        </Label>
                        <Input
                            id="step4TitleEn"
                            {...register("step4TitleEn")}
                            placeholder="Enter Step 4 Title in English"
                        />
                        {errors.step4TitleEn && (
                            <p className="text-sm text-red-500">{errors.step4TitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step4TitleDe">
                            Step 4 Title DE
                        </Label>
                        <Input
                            id="step4TitleDe"
                            {...register("step4TitleDe")}
                            placeholder="Enter Step 4 Title in German"
                        />
                        {errors.step4TitleDe && (
                            <p className="text-sm text-red-500">{errors.step4TitleDe.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step4Description1En">
                            Step 4 Description 1 EN
                        </Label>
                        <Textarea
                            id="step4Description1En"
                            {...register("step4Description1En")}
                            placeholder="Enter Step 4 Description 1 in English"
                            rows={2}
                        />
                        {errors.step4Description1En && (
                            <p className="text-sm text-red-500">{errors.step4Description1En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step4Description1De">
                            Step 4 Description 1 DE
                        </Label>
                        <Textarea
                            id="step4Description1De"
                            {...register("step4Description1De")}
                            placeholder="Enter Step 4 Description 1 in German"
                            rows={2}
                        />
                        {errors.step4Description1De && (
                            <p className="text-sm text-red-500">{errors.step4Description1De.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step4Description2En">
                            Step 4 Description 2 EN
                        </Label>
                        <Textarea
                            id="step4Description2En"
                            {...register("step4Description2En")}
                            placeholder="Enter Step 4 Description 2 in English"
                            rows={2}
                        />
                        {errors.step4Description2En && (
                            <p className="text-sm text-red-500">{errors.step4Description2En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step4Description2De">
                            Step 4 Description 2 DE
                        </Label>
                        <Textarea
                            id="step4Description2De"
                            {...register("step4Description2De")}
                            placeholder="Enter Step 4 Description 2 in German"
                            rows={2}
                        />
                        {errors.step4Description2De && (
                            <p className="text-sm text-red-500">{errors.step4Description2De.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 5 */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">Step 5</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step5TitleEn">
                            Step 5 Title EN
                        </Label>
                        <Input
                            id="step5TitleEn"
                            {...register("step5TitleEn")}
                            placeholder="Enter Step 5 Title in English"
                        />
                        {errors.step5TitleEn && (
                            <p className="text-sm text-red-500">{errors.step5TitleEn.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step5TitleDe">
                            Step 5 Title DE
                        </Label>
                        <Input
                            id="step5TitleDe"
                            {...register("step5TitleDe")}
                            placeholder="Enter Step 5 Title in German"
                        />
                        {errors.step5TitleDe && (
                            <p className="text-sm text-red-500">{errors.step5TitleDe.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step5Description1En">
                            Step 5 Description 1 EN
                        </Label>
                        <Textarea
                            id="step5Description1En"
                            {...register("step5Description1En")}
                            placeholder="Enter Step 5 Description 1 in English"
                            rows={2}
                        />
                        {errors.step5Description1En && (
                            <p className="text-sm text-red-500">{errors.step5Description1En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step5Description1De">
                            Step 5 Description 1 DE
                        </Label>
                        <Textarea
                            id="step5Description1De"
                            {...register("step5Description1De")}
                            placeholder="Enter Step 5 Description 1 in German"
                            rows={2}
                        />
                        {errors.step5Description1De && (
                            <p className="text-sm text-red-500">{errors.step5Description1De.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="step5Description2En">
                            Step 5 Description 2 EN
                        </Label>
                        <Textarea
                            id="step5Description2En"
                            {...register("step5Description2En")}
                            placeholder="Enter Step 5 Description 2 in English"
                            rows={2}
                        />
                        {errors.step5Description2En && (
                            <p className="text-sm text-red-500">{errors.step5Description2En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step5Description2De">
                            Step 5 Description 2 DE
                        </Label>
                        <Textarea
                            id="step5Description2De"
                            {...register("step5Description2De")}
                            placeholder="Enter Step 5 Description 2 in German"
                            rows={2}
                        />
                        {errors.step5Description2De && (
                            <p className="text-sm text-red-500">{errors.step5Description2De.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* CTA Card */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold">CTA Card</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="ctaCardButton1En">
                            CTA Card Button 1 EN
                        </Label>
                        <Input
                            id="ctaCardButton1En"
                            {...register("ctaCardButton1En")}
                            placeholder="Enter CTA Card Button 1 text in English"
                        />
                        {errors.ctaCardButton1En && (
                            <p className="text-sm text-red-500">{errors.ctaCardButton1En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ctaCardButton1De">
                            CTA Card Button 1 DE
                        </Label>
                        <Input
                            id="ctaCardButton1De"
                            {...register("ctaCardButton1De")}
                            placeholder="Enter CTA Card Button 1 text in German"
                        />
                        {errors.ctaCardButton1De && (
                            <p className="text-sm text-red-500">{errors.ctaCardButton1De.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="ctaCardButton2En">
                            CTA Card Button 2 EN
                        </Label>
                        <Input
                            id="ctaCardButton2En"
                            {...register("ctaCardButton2En")}
                            placeholder="Enter CTA Card Button 2 text in English"
                        />
                        {errors.ctaCardButton2En && (
                            <p className="text-sm text-red-500">{errors.ctaCardButton2En.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ctaCardButton2De">
                            CTA Card Button 2 DE
                        </Label>
                        <Input
                            id="ctaCardButton2De"
                            {...register("ctaCardButton2De")}
                            placeholder="Enter CTA Card Button 2 text in German"
                        />
                        {errors.ctaCardButton2De && (
                            <p className="text-sm text-red-500">{errors.ctaCardButton2De.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}



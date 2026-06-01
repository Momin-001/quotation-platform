"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, FileText, Handshake, TrendingUp } from "lucide-react";

const STEP_ICONS = [FileText, ClipboardCheck, Handshake, TrendingUp];

export default function BecomePartnerHowToSection() {
    const t = useTranslations("BecomePartner.howTo");
    const steps = t.raw("steps");

    return (
        <section className="w-full bg-white pt-16 md:pt-20 lg:pt-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center mb-10 md:mb-14 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
                        {t("title")}
                    </h2>
                    <p className="mt-3 md:mt-4 text-base md:text-lg max-w-2xl mx-auto text-muted-foreground leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                    {steps.map((step, index) => {
                        const IconComponent = STEP_ICONS[index];
                        return (
                            <div
                                key={step.title}
                                className="flex flex-col items-center text-center space-y-4"
                            >
                                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border border-border/60 bg-white shadow-sm">
                                    <IconComponent
                                        className="h-8 w-8 text-primary"
                                        strokeWidth={1.5}
                                    />
                                </div>

                                <h3 className="text-lg font-bold text-foreground leading-snug">
                                    <span className="text-primary text-xl sm:text-2xl mr-1.5">
                                        {step.number}
                                    </span>
                                    {step.title}
                                </h3>

                                <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed max-w-[260px]">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 md:mt-16 lg:mt-20 rounded-xl bg-primary/5 border border-primary/10 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary">
                            <Handshake
                                className="h-7 w-7 text-primary-foreground"
                                strokeWidth={1.75}
                            />
                        </div>

                        <div className="flex-1 space-y-1 text-center md:text-left">
                            <h3 className="text-lg md:text-xl font-bold text-foreground leading-snug">
                                {t("ctaTitle")}
                            </h3>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                                {t("ctaSubtitle")}
                            </p>
                        </div>

                        <Button asChild size="lg" className="w-full md:w-auto shrink-0">
                            <Link href="/become-partner/submit">{t("ctaButton")}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

import { getTranslations } from "next-intl/server";
import { ClipboardCheck, FileText, Handshake, TrendingUp } from "lucide-react";

const STEP_ICONS = [FileText, ClipboardCheck, Handshake, TrendingUp];

export default async function BecomePartnerHowToSection() {
    const t = await getTranslations("BecomePartner.howTo");
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
            </div>
        </section>
    );
}

import { CheckCircle2, FileSpreadsheet, Eye, ShieldCheck, Grid3X3 } from "lucide-react";
import { cmsField } from "@/lib/i18n/cms";

export default function ValueBlocksSection({ homepageData, locale }) {
    const getText = (field) => cmsField(homepageData, field, locale);

    const valueBlocks = [
        {
            icon: CheckCircle2,
            title: getText("valueBlock1Title"),
            description: getText("valueBlock1Description"),
        },
        {
            icon: FileSpreadsheet,
            title: getText("valueBlock2Title"),
            description: getText("valueBlock2Description"),
        },
        {
            icon: Grid3X3,
            title: getText("valueBlock3Title"),
            description: getText("valueBlock3Description"),
        },
        {
            icon: ShieldCheck,
            title: getText("valueBlock4Title"),
            description: getText("valueBlock4Description"),
        },
    ];

    return (
        <section className="w-full bg-gray-50 py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center mb-10 md:mb-14 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold  text-foreground leading-tight tracking-tight">
                        {getText("valueBlocksTitle")}
                    </h2>
                    <p className="mt-3 md:mt-4 text-base md:text-lg max-w-2xl mx-auto text-muted-foreground leading-relaxed">
                        {getText("valueBlocksSubtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {valueBlocks.map((block, index) => {
                        const IconComponent = block.icon;
                        return (
                            <div
                                key={index}
                                className="rounded-xl p-6 lg:p-7 flex flex-col items-start space-y-4 hover:shadow-md transition-shadow duration-300 bg-white"
                            >
                                <div className="text-secondary">
                                    <IconComponent className="h-9 w-9 lg:h-10 lg:w-10" strokeWidth={1.2} />
                                </div>

                                <h3 className="text-lg font-semibold  text-foreground leading-snug">
                                    {block.title}
                                </h3>

                                <div className="w-8 rounded-full h-0.5 bg-primary/50"></div>

                                <p className="text-[15px] text-muted-foreground leading-relaxed">
                                    {block.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

import { getTranslations } from "next-intl/server";
import { Monitor, MonitorCog, Network, Store, Tag } from "lucide-react";

const CARD_ICONS = [Network, Tag, MonitorCog, Monitor, Store];

export default async function BecomePartnerOpportunitiesSection() {
    const t = await getTranslations("BecomePartner.opportunities");
    const cards = t.raw("cards");

    return (
        <section className="w-full bg-[#0F2E4A] py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center mb-10 md:mb-14 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight tracking-tight">
                        {t("title")}
                    </h2>
                    <p className="mt-3 md:mt-4 text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 lg:gap-6">
                    {cards.map((card, index) => {
                        const IconComponent = CARD_ICONS[index];
                        return (
                            <div
                                key={card.title}
                                className="bg-white rounded-xl p-6 lg:p-7 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shrink-0">
                                    <IconComponent
                                        className="h-6 w-6 text-primary-foreground"
                                        strokeWidth={1.75}
                                    />
                                </div>

                                <h3 className="text-base lg:text-lg font-bold text-foreground leading-snug">
                                    {card.title}
                                </h3>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {card.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

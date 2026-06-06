import { cmsField } from "@/lib/i18n/cms";
import PartnerLogoMarquee from "./PartnerLogoMarquee";

export default function PartnersSection({ homepageData, partners = [], locale }) {
    const getText = (field) => cmsField(homepageData, field, locale);

    return (
        <section className="w-full bg-gray-50 py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold  text-foreground leading-tight tracking-tight">
                        {getText("partnersTitle")}
                    </h2>
                    <p className="mt-3 md:mt-4 text-base md:text-lg max-w-2xl mx-auto text-muted-foreground leading-relaxed">
                        {getText("partnersSubtitle")}
                    </p>
                </div>

                {partners.length > 0 ? (
                    <PartnerLogoMarquee partners={partners} />
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        <p className="text-sm">No partners available</p>
                    </div>
                )}
            </div>
        </section>
    );
}

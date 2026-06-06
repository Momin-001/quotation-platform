import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function BecomePartnerHeroSection() {
    const t = await getTranslations("BecomePartner.hero");

    return (
        <section className="relative w-full overflow-hidden bg-white">
            <div className="flex flex-col lg:flex-row min-h-[520px] lg:min-h-[640px]">
                <div className="flex-1 flex items-center justify-center lg:justify-end">
                    <div className="w-full lg:max-w-[680px] space-y-6 lg:space-y-8 px-6 sm:px-8 lg:pr-16 lg:pl-8 py-12 lg:py-16">
                        <div className="space-y-3">
                            <p className="text-sm sm:text-base font-medium text-primary tracking-wide uppercase">
                                {t("overline")}
                            </p>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold leading-[1.1] tracking-tight text-foreground">
                                {t("title")}
                            </h1>
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                                {t("description")}
                            </p>
                            <p className="text-muted-foreground text-base sm:text-lg font-semibold leading-relaxed">
                                {t("tagline")}
                            </p>
                        </div>

                        <div className="pt-2">
                            <Button asChild size="lg" className="w-full sm:w-auto">
                                <Link href="#partner-form-section">{t("primaryButton")}</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="relative h-[360px] sm:h-[440px] lg:h-auto w-full lg:w-[50%] shrink-0">
                    <Image
                        src="/become-partner.png"
                        alt={t("title")}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 2048px) 100vw, 50vw"
                    />
                </div>
            </div>
        </section>
    );
}

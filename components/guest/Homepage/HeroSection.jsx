"use client";

import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { PhoneCall, Pencil } from "lucide-react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { cmsField } from "@/lib/i18n/cms";


export default function HeroSection({ homepageData }) {
    const locale = useLocale();
    const router = useRouter();

    const getText = (field) => cmsField(homepageData, field, locale);

    return (
        <section className="relative w-full overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[720px]">

                <div className="flex-1 flex items-center justify-center lg:justify-end">
                    <div className="w-full lg:max-w-[680px] space-y-6 lg:space-y-8 px-6 sm:px-8 lg:pr-16 lg:pl-8 py-12 lg:py-16">
                        <div className="space-y-3">
                            <p className="text-sm sm:text-base font-medium  text-primary tracking-wide uppercase">
                                {getText("heroSmallLabel")}
                            </p>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold  leading-[1.1] tracking-tight text-foreground">
                                {getText("heroTitle")}
                            </h1>
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                                {getText("heroDescription")}
                            </p>
                            <p className="text-muted-foreground text-base sm:text-lg font-semibold leading-relaxed">
                                {getText("heroShortDescription")}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Link href="/leditor">
                                <Button size="lg" className="w-full sm:w-auto">
                                    {getText("heroPrimaryButton")}
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto border-secondary text-secondary hover:bg-secondary/5">
                                    {getText("heroSecondaryButton")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="relative h-[400px] sm:h-[500px] lg:h-auto w-full lg:w-[50%] shrink-0">
                    <Image
                        src={homepageData?.heroImageUrl || "/hero-led-display.jpg"}
                        alt="LED Display"
                        fill
                        className="object-cover"
                        priority
                    />

                    <div className="absolute bottom-0 left-0 w-full flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 p-4 sm:p-0 z-10">
                        <div className="bg-secondary rounded-tr-xl text-primary-foreground px-5 py-5 sm:px-6 sm:py-6 flex items-center gap-3 shadow-lg max-w-[400px]">
                            <div className="bg-[#018C85] rounded-full p-4">
                                <PhoneCall className="h-4 w-4 shrink-0" />
                            </div>
                            <p className="text-base sm:text-lg font-bold  leading-snug">
                                {getText("heroHotlineCta")}
                            </p>
                        </div>

                        <Button
                            onClick={() => router.push("/products")}
                            variant="secondary"
                            size="lg"
                            className="sm:mr-12 sm:mb-5  font-bold rounded-full px-6"
                        >
                            <Pencil className="h-4 w-4 shrink-0" />
                            {getText("heroRequestButton")}
                        </Button>
                    </div>
                </div>

            </div>
        </section>
    );
}

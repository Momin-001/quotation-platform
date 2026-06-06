import { Fragment } from "react";
import { getTranslations } from "next-intl/server";

export default async function BecomePartnerNetworkBar() {
    const t = await getTranslations("BecomePartner.networkBar");
    const audiences = t.raw("audiences");

    return (
        <section className="w-full bg-[#0F2E4A] text-primary-foreground">
            <div className="container mx-auto px-4 lg:px-6 py-5 md:py-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <p className="text-base md:text-lg font-bold shrink-0">{t("heading")}</p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm md:text-base font-medium text-primary-foreground/90">
                        {audiences.map((audience, index) => (
                            <Fragment key={audience}>
                                {index > 0 ? (
                                    <span
                                        aria-hidden
                                        className="hidden sm:inline text-primary-foreground/35 select-none"
                                    >
                                        |
                                    </span>
                                ) : null}
                                <span>{audience}</span>
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

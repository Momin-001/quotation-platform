import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    const baseMessages = (await import(`../messages/${locale}.json`)).default;
    const becomePartner = (await import(`../messages/becomePartner.${locale}.json`)).default;

    let legalPages = {};
    try {
        const imprint = (await import(`../messages/legal/imprint.${locale}.json`)).default;
        const terms = (await import(`../messages/legal/terms.${locale}.json`)).default;
        legalPages = { imprint, terms };
    } catch {
        // Legal partials added in batch 5
    }

    return {
        locale,
        messages: {
            ...baseMessages,
            BecomePartner: becomePartner,
            LegalPages: legalPages,
        },
    };
});

"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { getPdfPreviewUrl } from "@/lib/cloudinaryPdfUrls";

const FooterContext = createContext({
    footerData: null,
    privacyPolicyPdfUrl: null,
    setFooterData: () => {},
});

export function FooterProvider({ children, initialFooterData = null }) {
    const [footerData, setFooterData] = useState(initialFooterData);

    const privacyPolicyPdfUrl = useMemo(() => {
        const url = footerData?.privacyPolicyPdfUrl || null;
        return url ? getPdfPreviewUrl(url) : null;
    }, [footerData]);

    const value = useMemo(
        () => ({ footerData, setFooterData, privacyPolicyPdfUrl }),
        [footerData, privacyPolicyPdfUrl]
    );

    return <FooterContext.Provider value={value}>{children}</FooterContext.Provider>;
}

export function useFooter() {
    return useContext(FooterContext);
}


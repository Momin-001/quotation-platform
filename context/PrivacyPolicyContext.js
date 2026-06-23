"use client";

import { createContext, useContext, useMemo } from "react";
import { getPdfPreviewUrl } from "@/lib/cloudinaryPdfUrls";

const PrivacyPolicyContext = createContext({
    privacyPolicyPdfUrl: null,
});

export function PrivacyPolicyProvider({ children, pdfUrl = null }) {
    const value = useMemo(
        () => ({ privacyPolicyPdfUrl: pdfUrl ? getPdfPreviewUrl(pdfUrl) : null }),
        [pdfUrl]
    );

    return (
        <PrivacyPolicyContext.Provider value={value}>
            {children}
        </PrivacyPolicyContext.Provider>
    );
}

export function usePrivacyPolicy() {
    return useContext(PrivacyPolicyContext);
}

"use client";

import { useEffect } from "react";

export default function LocaleHtmlLang({ locale }) {
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    return null;
}

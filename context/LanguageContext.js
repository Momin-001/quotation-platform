"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext({
    language: "en",
    setLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState("en");

    // Load language from localStorage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem("language") || "en";
        setLanguageState(savedLanguage);
    }, []);

    const setLanguage = (lang) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);









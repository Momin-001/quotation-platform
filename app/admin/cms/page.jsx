"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import NavbarTab from "./components/NavbarTab";
import HomepageTab from "./components/HomepageTab";
import FooterTab from "./components/FooterTab";

export default function CMSPage() {
    const [activeTab, setActiveTab] = useState("navbar");
    const [saving, setSaving] = useState(false);
    const [isValid, setIsValid] = useState(false);

    // Refs to store save handlers from child components
    const navbarSaveHandlerRef = useRef(null);
    const homepageSaveHandlerRef = useRef(null);
    const footerSaveHandlerRef = useRef(null);

    // Handle data change from child components
    const handleDataChange = (data) => {
        // Store the data if needed, but validation is handled in child components
    };

    // Handle validation change from child components
    const handleValidationChange = (valid) => {
        setIsValid(valid);
    };

    // Save handler
    const handleSave = async () => {
        setSaving(true);
        try {
            let result;

            if (activeTab === "navbar") {
                if (navbarSaveHandlerRef.current) {
                    result = await navbarSaveHandlerRef.current();
                } else {
                    return;
                }
            } else if (activeTab === "homepage") {
                if (homepageSaveHandlerRef.current) {
                    result = await homepageSaveHandlerRef.current();
                } else {
                    return;
                }
            } else if (activeTab === "footer") {
                if (footerSaveHandlerRef.current) {
                    result = await footerSaveHandlerRef.current();
                } else {
                    return;
                }
            }

            if (result && !result.success) {
                // Error already shown in child component
                return;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-archivo">Manage CMS Pages</h1>
                <p className="text-sm text-muted-foreground">
                    Edit website content blocks such as homepage, case studies, and blog posts.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <TabsList className="">
                        <TabsTrigger
                            value="navbar"
                            className="data-[state=active]:bg-primary data-[state=active]:text-white px-6"
                        >
                            NAVBAR
                        </TabsTrigger>
                        <TabsTrigger
                            value="homepage"
                            className="data-[state=active]:bg-primary data-[state=active]:text-white px-6"
                        >
                            HOMEPAGE
                        </TabsTrigger>
                        <TabsTrigger
                            value="footer"
                            className="data-[state=active]:bg-primary data-[state=active]:text-white px-6"
                        >
                            FOOTER
                        </TabsTrigger>
                    </TabsList>

                </div>

                <TabsContent value="navbar" className="space-y-6">
                    <NavbarTab
                        onDataChange={handleDataChange}
                        onValidationChange={handleValidationChange}
                        onSaveHandlerReady={(handler) => {
                            navbarSaveHandlerRef.current = handler;
                        }}
                    />
                </TabsContent>

                <TabsContent value="homepage" className="space-y-6">
                    <HomepageTab
                        onDataChange={handleDataChange}
                        onValidationChange={handleValidationChange}
                        onSaveHandlerReady={(handler) => {
                            homepageSaveHandlerRef.current = handler;
                        }}
                    />
                </TabsContent>

                <TabsContent value="footer" className="space-y-6">
                    <FooterTab
                        onDataChange={handleDataChange}
                        onValidationChange={handleValidationChange}
                        onSaveHandlerReady={(handler) => {
                            footerSaveHandlerRef.current = handler;
                        }}
                    />
                </TabsContent>
            </Tabs>
            <Button
                size="lg"
                onClick={handleSave}
                disabled={saving}
                className="mt-2"
            >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
            </Button>
        </div>
    );
}

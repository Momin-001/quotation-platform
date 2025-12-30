"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";

export default function CMSPage() {
    const [activeTab, setActiveTab] = useState("navbar");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        navItem1En: "",
        navItem1De: "",
        navItem2En: "",
        navItem2De: "",
        navItem3En: "",
        navItem3De: "",
        navItem4En: "",
        navItem4De: "",
        navItem5En: "",
        navItem5De: "",
    });

    // Fetch navbar data
    const fetchNavbarData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/navbar");
            const data = await res.json();

            if (data.success) {
                setFormData({
                    navItem1En: data.data.navItem1En || "",
                    navItem1De: data.data.navItem1De || "",
                    navItem2En: data.data.navItem2En || "",
                    navItem2De: data.data.navItem2De || "",
                    navItem3En: data.data.navItem3En || "",
                    navItem3De: data.data.navItem3De || "",
                    navItem4En: data.data.navItem4En || "",
                    navItem4De: data.data.navItem4De || "",
                    navItem5En: data.data.navItem5En || "",
                    navItem5De: data.data.navItem5De || "",
                });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch navbar content");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "navbar") {
            fetchNavbarData();
        }
    }, [activeTab]);

    // Handle input change
    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Save navbar data
    const handleSave = async () => {
        if (activeTab === "navbar") {
            setSaving(true);
            try {
                const res = await fetch("/api/admin/navbar", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const data = await res.json();

                if (data.success) {
                    toast.success("Navbar content saved successfully");
                    fetchNavbarData(); // Refresh data
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to save navbar content");
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading content...</p>
            </div>
        );
    }

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
                    </TabsList>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>

                <TabsContent value="navbar" className="space-y-6">
                    <div className="space-y-6">
                        <h2 className="text-sm font-bold text-primary font-open-sans mb-6">
                            SECTION 1 — NAVBAR
                        </h2>
                        
                        {/* Nav Item 1 */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="navItem1En">
                                        Navbar Item 1 EN
                                    </Label>
                                    <Input
                                        id="navItem1En"
                                        value={formData.navItem1En}
                                        onChange={(e) => handleChange("navItem1En", e.target.value)}
                                        placeholder="Enter Nav Item 1 in English"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="navItem1De">
                                        Navbar Item 1 DE
                                    </Label>
                                    <Input
                                        id="navItem1De"
                                        value={formData.navItem1De}
                                        onChange={(e) => handleChange("navItem1De", e.target.value)}
                                        placeholder="Enter Nav Item 1 in German"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Nav Item 2 */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="navItem2En">
                                        Navbar Item 2 EN
                                    </Label>
                                    <Input
                                        id="navItem2En"
                                        value={formData.navItem2En}
                                        onChange={(e) => handleChange("navItem2En", e.target.value)}
                                        placeholder="Enter Nav Item 2 in English"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="navItem2De">
                                        Navbar Item 2 DE
                                    </Label>
                                    <Input
                                        id="navItem2De"
                                        value={formData.navItem2De}
                                        onChange={(e) => handleChange("navItem2De", e.target.value)}
                                        placeholder="Enter Nav Item 2 in German"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Nav Item 3 */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="navItem3En">
                                        Navbar Item 3 EN
                                    </Label>
                                    <Input
                                        id="navItem3En"
                                        value={formData.navItem3En}
                                        onChange={(e) => handleChange("navItem3En", e.target.value)}
                                        placeholder="Enter Nav Item 3 in English"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="navItem3De">
                                        Navbar Item 3 DE
                                    </Label>
                                    <Input
                                        id="navItem3De"
                                        value={formData.navItem3De}
                                        onChange={(e) => handleChange("navItem3De", e.target.value)}
                                        placeholder="Enter Nav Item 3 in German"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Nav Item 4 */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="navItem4En">
                                        Navbar Item 4 EN
                                    </Label>
                                    <Input
                                        id="navItem4En"
                                        value={formData.navItem4En}
                                        onChange={(e) => handleChange("navItem4En", e.target.value)}
                                        placeholder="Enter Nav Item 4 in English"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="navItem4De">
                                        Navbar Item 4 DE
                                    </Label>
                                    <Input
                                        id="navItem4De"
                                        value={formData.navItem4De}
                                        onChange={(e) => handleChange("navItem4De", e.target.value)}
                                        placeholder="Enter Nav Item 4 in German"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Nav Item 5 */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="navItem5En">
                                        Navbar Item 5 EN
                                    </Label>
                                    <Input
                                        id="navItem5En"
                                        value={formData.navItem5En}
                                        onChange={(e) => handleChange("navItem5En", e.target.value)}
                                        placeholder="Enter Nav Item 5 in English"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="navItem5De">
                                        Navbar Item 5 DE
                                    </Label>
                                    <Input
                                        id="navItem5De"
                                        value={formData.navItem5De}
                                        onChange={(e) => handleChange("navItem5De", e.target.value)}
                                        placeholder="Enter Nav Item 5 in German"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="homepage" className="space-y-6 mt-6">
                    <div className="bg-white rounded-lg border shadow-sm p-6">
                        <p className="text-muted-foreground">Homepage content will be added here.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}


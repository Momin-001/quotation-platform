"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import Link from "next/link";
import BreadCrumb from "@/components/user/BreadCrumb";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

const BRANDS = ["Colorlight", "Novastar", "Brompton", "LINSN", "Other"];

export default function ControllersPage() {
    const { language } = useLanguage();
    const [controllers, setControllers] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");

    const observer = useRef();

    const buildQueryParams = useCallback((pageNum = page) => {
        const params = new URLSearchParams();
        params.append("page", pageNum.toString());
        params.append("limit", "10");
        if (search) params.append("search", search);
        if (selectedBrand) params.append("brand", selectedBrand);
        return params.toString();
    }, [page, search, selectedBrand]);

    const fetchControllers = useCallback(async (pageNum, reset = false) => {
        setLoading(true);
        try {
            const queryParams = buildQueryParams(pageNum);
            const res = await fetch(`/api/controllers?${queryParams}`);
            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch controllers");
            }
            if (reset) {
                setControllers(response.data);
            } else {
                setControllers((prev) => [...prev, ...response.data]);
            }
            setHasMore(response.data.length === 10);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [buildQueryParams]);

    useEffect(() => {
        setPage(1);
        setControllers([]);
        fetchControllers(1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, selectedBrand]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchControllers(nextPage);
    }, [page, loading, hasMore, fetchControllers]);

    const lastCardRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore();
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, loadMore]
    );

    return (
        <div className="min-h-screen flex flex-col">
            <BreadCrumb
                title={language === "en" ? "Controllers" : "Controller"}
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" },
                    { label: language === "en" ? "Controllers" : "Controller" },
                ]}
            />
            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 text-gray-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search controllers by interface or brand"
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Brand Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <Button
                        variant={selectedBrand === "" ? "default" : "outline"}
                        className={selectedBrand === "" ? "" : "border-primary text-primary hover:bg-primary hover:text-white"}
                        onClick={() => setSelectedBrand("")}
                    >
                        All
                    </Button>
                    {BRANDS.map((brand) => (
                        <Button
                            key={brand}
                            variant={selectedBrand === brand ? "default" : "outline"}
                            onClick={() => setSelectedBrand(brand)}
                            className={selectedBrand === brand ? "" : "border-primary text-primary hover:bg-primary hover:text-white"}
                        >
                            {brand}
                        </Button>
                    ))}
                </div>

                {/* Controller Grid */}
                <div>
                    {loading && controllers.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex items-center gap-2">
                                <Spinner className="h-6 w-6" />
                                <span>Loading controllers...</span>
                            </div>
                        </div>
                    ) : controllers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {controllers.map((controller, index) => {
                                const isLast = controllers.length === index + 1;
                                return (
                                    <Link
                                        href={`/controllers/${controller.id}`}
                                        key={controller.id}
                                        ref={isLast ? lastCardRef : null}
                                        className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block"
                                    >
                                        <div className="relative aspect-8/7 bg-gray-100">
                                            {controller.images?.length > 0 ? (
                                                <Image
                                                    src={controller.images[0]}
                                                    alt={controller.interfaceName || "Controller"}
                                                    fill
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                                <h3 className="font-bold font-open-sans text-lg mb-1">
                                                    {controller.interfaceName}
                                                </h3>
                                                <p className="text-xl mb-1">{controller.controllerNumber}</p>
                                                <p className="text-lg bg-secondary text-white rounded-md px-4 py-1 w-fit">{controller.brandDisplay || "N/A"}</p>
                                            </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No controllers found. Try adjusting your search or brand filter.
                        </div>
                    )}
                    {loading && controllers.length > 0 && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-2">
                                <Spinner className="h-5 w-5" />
                                <span>Loading more controllers...</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

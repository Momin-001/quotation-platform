import { useState, useCallback, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const CATALOG_CONFIG = {
    product: {
        searchUrl: "/api/admin/products/search",
        sourceType: "product",
        showBadge: false,
        limit: 10,
        searchPlaceholder: "Search products...",
        emptyMessage: "No products found",
        defaultPlaceholder: "Select product",
        getSubtitle: (item) =>
            item.pixelPitch ? `${item.productNumber} • ${item.pixelPitch}mm` : item.productNumber,
    },
    controller: {
        searchUrl: "/api/admin/controllers/search",
        sourceType: "controller",
        showBadge: true,
        badge: { label: "Controller", className: "bg-purple-100 text-purple-700" },
        limit: 20,
        searchPlaceholder: "Search controllers...",
        emptyMessage: "No controllers found",
        defaultPlaceholder: "Select controller",
        getSubtitle: (item) => item.subtitle || item.productNumber,
    },
    accessory: {
        searchUrl: "/api/admin/accessories/search",
        sourceType: "accessory",
        showBadge: true,
        badge: { label: "Accessory", className: "bg-amber-100 text-amber-700" },
        limit: 20,
        searchPlaceholder: "Search accessories...",
        emptyMessage: "No accessories found",
        defaultPlaceholder: "Select accessory",
        getSubtitle: (item) => item.subtitle || item.productNumber,
    },
};

export default function QuotationCatalogDropDown({
    catalogType = "product",
    value,
    onChange,
    placeholder,
    disabled = false,
}) {
    const config = CATALOG_CONFIG[catalogType] || CATALOG_CONFIG.product;
    const resolvedPlaceholder = placeholder || config.defaultPlaceholder;

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchItems = useCallback(
        async (searchTerm = "", pageNum = 1, append = false) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    search: searchTerm,
                    page: String(pageNum),
                    limit: String(config.limit),
                });
                const res = await fetch(`${config.searchUrl}?${params}`);
                const response = await res.json();
                if (response.success) {
                    const nextItems = response.data.items || [];
                    if (append) {
                        setItems((prev) => [...prev, ...nextItems]);
                    } else {
                        setItems(nextItems);
                    }
                    setHasMore(response.data.pagination.hasMore);
                }
            } catch {
                // ignore fetch errors in dropdown
            } finally {
                setLoading(false);
            }
        },
        [config.searchUrl, config.limit]
    );

    useEffect(() => {
        if (isOpen) {
            fetchItems(search, 1, false);
            setPage(1);
        }
    }, [isOpen, fetchItems]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen) {
                fetchItems(search, 1, false);
                setPage(1);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search, isOpen, fetchItems]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchItems(search, nextPage, true);
    };

    const handleSelect = (item) => {
        setSelectedItem(item);
        onChange(item);
        setIsOpen(false);
        setSearch("");
    };

    const matchesValue = (item, selected) => {
        if (item.id !== selected.id) return false;
        if (selected.sourceType) return item.sourceType === selected.sourceType;
        return config.sourceType === "product";
    };

    useEffect(() => {
        if (value && !selectedItem) {
            const found = items.find((item) => matchesValue(item, value));
            if (found) {
                setSelectedItem(found);
            } else if (value.productName || value.displayLabel) {
                setSelectedItem(value);
            }
        }
    }, [value, items, selectedItem, config.sourceType]);

    const renderSelectedLabel = () => {
        if (!selectedItem) return resolvedPlaceholder;

        const name = `${selectedItem.productName} (${selectedItem.productNumber})`;
        if (!config.showBadge) return name;

        return (
            <>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${config.badge.className}`}>
                    {config.badge.label}
                </span>
                {name}
            </>
        );
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors ${
                    disabled
                        ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                        : "hover:border-gray-400 cursor-pointer"
                }`}
            >
                <span
                    className={
                        selectedItem
                            ? `text-gray-900${config.showBadge ? " flex items-center gap-2" : ""}`
                            : "text-gray-400"
                    }
                >
                    {renderSelectedLabel()}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            </button>

            {isOpen && !disabled && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg">
                        <div className="p-2 border-b">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={config.searchPlaceholder}
                                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                            {loading && items.length === 0 ? (
                                <div className="flex items-center justify-center py-4">
                                    <Spinner className="h-5 w-5" />
                                </div>
                            ) : items.length === 0 ? (
                                <div className="py-4 text-center text-sm text-gray-500">{config.emptyMessage}</div>
                            ) : (
                                <>
                                    {items.map((item, index) => (
                                        <button
                                            key={`${item.sourceType || catalogType}-${item.id}-${index}`}
                                            type="button"
                                            onClick={() => handleSelect(item)}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                                selectedItem && matchesValue(item, selectedItem) ? "bg-blue-50" : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate">{item.productName}</span>
                                                {config.showBadge && (
                                                    <span
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${config.badge.className}`}
                                                    >
                                                        {config.badge.label}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">{config.getSubtitle(item)}</div>
                                        </button>
                                    ))}

                                    {hasMore && (
                                        <button
                                            type="button"
                                            onClick={handleLoadMore}
                                            disabled={loading}
                                            className="w-full py-2 text-sm text-primary hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            {loading ? "Loading..." : "Load more..."}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

import { useState, useCallback, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

/**
 * Dropdown that fetches from all product types (LED, Controller, Accessory)
 * for optional items in the quotation builder.
 */
export default function QuotationOptionalDropDown({ value, onChange, placeholder = "Select product", disabled = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchProducts = useCallback(async (searchTerm = "", pageNum = 1, append = false) => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/admin/products/search-all?search=${encodeURIComponent(searchTerm)}&page=${pageNum}&limit=20`
            );
            const response = await res.json();
            if (response.success) {
                if (append) {
                    setProducts(prev => [...prev, ...response.data.products]);
                } else {
                    setProducts(response.data.products);
                }
                setHasMore(response.data.pagination.hasMore);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchProducts(search, 1, false);
            setPage(1);
        }
    }, [isOpen, fetchProducts]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen) {
                fetchProducts(search, 1, false);
                setPage(1);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search, isOpen, fetchProducts]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(search, nextPage, true);
    };

    const handleSelect = (product) => {
        setSelectedProduct(product);
        onChange(product);
        setIsOpen(false);
        setSearch("");
    };

    // Sync selected product with value prop
    useEffect(() => {
        if (value && !selectedProduct) {
            const found = products.find(p => p.id === value.id && p.sourceType === value.sourceType);
            if (found) {
                setSelectedProduct(found);
            } else if (value.productName || value.displayLabel) {
                setSelectedProduct(value);
            }
        }
    }, [value, products, selectedProduct]);

    const getSourceBadgeColor = (sourceType) => {
        switch (sourceType) {
            case "product": return "bg-blue-100 text-blue-700";
            case "controller": return "bg-purple-100 text-purple-700";
            case "accessory": return "bg-amber-100 text-amber-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getSourceLabel = (sourceType) => {
        switch (sourceType) {
            case "product": return "LED";
            case "controller": return "Controller";
            case "accessory": return "Accessory";
            default: return "Product";
        }
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
                <span className={selectedProduct ? "text-gray-900 flex items-center gap-2" : "text-gray-400"}>
                    {selectedProduct ? (
                        <>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSourceBadgeColor(selectedProduct.sourceType)}`}>
                                {getSourceLabel(selectedProduct.sourceType)}
                            </span>
                            {selectedProduct.productName} ({selectedProduct.productNumber})
                        </>
                    ) : placeholder}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            </button>

            {isOpen && !disabled && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg">
                        <div className="p-2 border-b">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search all products..."
                                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                            {loading && products.length === 0 ? (
                                <div className="flex items-center justify-center py-4">
                                    <Spinner className="h-5 w-5" />
                                </div>
                            ) : products.length === 0 ? (
                                <div className="py-4 text-center text-sm text-gray-500">
                                    No products found
                                </div>
                            ) : (
                                <>
                                    {products.map((product, index) => (
                                        <button
                                            key={`${product.sourceType}-${product.id}-${index}`}
                                            type="button"
                                            onClick={() => handleSelect(product)}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                                selectedProduct?.id === product.id && selectedProduct?.sourceType === product.sourceType 
                                                    ? "bg-blue-50" 
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${getSourceBadgeColor(product.sourceType)}`}>
                                                    {getSourceLabel(product.sourceType)}
                                                </span>
                                                <span className="font-medium truncate">{product.productName}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 ml-12">
                                                {product.subtitle || product.productNumber}
                                            </div>
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

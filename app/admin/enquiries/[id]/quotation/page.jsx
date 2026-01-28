"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Search, ChevronDown, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

// Helper function to calculate item total
function calculateItemTotal(unitPrice, quantity, taxPercentage, discountPercentage) {
    const basePrice = parseFloat(unitPrice || 0) * parseInt(quantity || 1);
    const taxAmount = basePrice * (parseFloat(taxPercentage || 0) / 100);
    const discountAmount = basePrice * (parseFloat(discountPercentage || 0) / 100);
    return basePrice + taxAmount - discountAmount;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

// ============================================
// Quotation Preview Component
// ============================================
function QuotationPreview({ 
    quotationId, 
    mainProduct,
    alternativeProduct,
    onClose, 
    onSaveDraft, 
    onSendQuotation,
    saving 
}) {
    // Calculate grand total
    let grandTotal = 0;
    
    // Main product total
    if (mainProduct.product) {
        grandTotal += calculateItemTotal(
            mainProduct.unitPrice,
            mainProduct.quantity,
            mainProduct.taxPercentage,
            mainProduct.discountPercentage
        );
        
        // Main product optional items
        mainProduct.optionalItems?.forEach((opt) => {
            grandTotal += calculateItemTotal(
                opt.unitPrice,
                opt.quantity,
                opt.taxPercentage,
                opt.discountPercentage
            );
        });
    }
    
    // Alternative product total
    if (alternativeProduct?.product) {
        grandTotal += calculateItemTotal(
            alternativeProduct.unitPrice,
            alternativeProduct.quantity,
            alternativeProduct.taxPercentage,
            alternativeProduct.discountPercentage
        );
        
        // Alternative product optional items
        alternativeProduct.optionalItems?.forEach((opt) => {
            grandTotal += calculateItemTotal(
                opt.unitPrice,
                opt.quantity,
                opt.taxPercentage,
                opt.discountPercentage
            );
        });
    }

    // Product Item Display Component
    const ProductItem = ({ product, quantity, unitPrice, description, taxPercentage, discountPercentage, badge, badgeColor }) => {
        const total = calculateItemTotal(unitPrice, quantity, taxPercentage, discountPercentage);
        
        return (
            <div className="flex items-start gap-4 py-4">
                <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border">
                    {product?.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.productName || "Product"}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h4 className="font-semibold text-gray-900">
                                {product?.productName || "Unknown Product"}
                            </h4>
                            <p className="text-sm text-gray-500">
                                (Artikel: {product?.productNumber || "N/A"})
                            </p>
                            {badge && (
                                <span className={`inline-block mt-1 px-2 py-0.5 ${badgeColor} text-white text-xs rounded`}>
                                    {badge}
                                </span>
                            )}
                            {description && (
                                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                                    {description}
                                </p>
                            )}
                        </div>
                        <div className="text-right shrink-0">
                            <div className="grid grid-cols-3 gap-8 text-sm">
                                <div>
                                    <span className="text-gray-500">Qty:</span>{" "}
                                    <span className="font-medium">{quantity || 1}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Unit:</span>{" "}
                                    <span className="font-medium">{formatCurrency(unitPrice || 0)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Total:</span>{" "}
                                    <span className="font-semibold">{formatCurrency(total)}</span>
                                </div>
                            </div>
                            {(taxPercentage > 0 || discountPercentage > 0) && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {taxPercentage > 0 && <span>Tax: {taxPercentage}%</span>}
                                    {taxPercentage > 0 && discountPercentage > 0 && <span> | </span>}
                                    {discountPercentage > 0 && <span>Discount: {discountPercentage}%</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button 
                        onClick={onClose} 
                        variant="ghost" 
                        size="lg" 
                        className="mb-2 p-0!"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Editor
                    </Button>
                    <h1 className="text-2xl font-bold font-archivo">
                        Quotation {quotationId}
                    </h1>
                    <p className="text-gray-500">Preview</p>
                </div>
            </div>

            {/* Quotation Content */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                {/* Main Product Section */}
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Main Product</h3>
                    {mainProduct.product && (
                        <>
                            <ProductItem
                                product={mainProduct.product}
                                quantity={mainProduct.quantity}
                                unitPrice={mainProduct.unitPrice}
                                description={mainProduct.description}
                                taxPercentage={mainProduct.taxPercentage}
                                badge="Main"
                                badgeColor="bg-blue-600"
                                discountPercentage={mainProduct.discountPercentage}
                            />

                            {/* Main Product Optional Items */}
                            {mainProduct.optionalItems && mainProduct.optionalItems.length > 0 && (
                                <div className="mt-4 ml-8 border-l-3 border-blue-300 pl-4 space-y-2">
                                    <h5 className="text-sm font-semibold text-blue-600">Optional Products</h5>
                                    {mainProduct.optionalItems.map((opt, optIndex) => (
                                        <div key={optIndex} className="bg-blue-50/50 rounded-lg px-3 py-2">
                                            <ProductItem
                                                product={opt.product}
                                                quantity={opt.quantity}
                                                unitPrice={opt.unitPrice}
                                                description={opt.description}
                                                taxPercentage={opt.taxPercentage}
                                                discountPercentage={opt.discountPercentage}
                                                badge="Optional"
                                                badgeColor="bg-blue-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Main Product Total */}
                            <div className="mt-6 pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900">Grand Total</p>
                                    </div>
                                    <span className="text-2xl font-bold text-blue-700">
                                        {formatCurrency(
                                            calculateItemTotal(mainProduct.unitPrice, mainProduct.quantity, mainProduct.taxPercentage, mainProduct.discountPercentage) +
                                            (mainProduct.optionalItems?.reduce((sum, opt) => sum + calculateItemTotal(opt.unitPrice, opt.quantity, opt.taxPercentage, opt.discountPercentage), 0) || 0)
                                        )}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Alternative Product Section */}
                {alternativeProduct?.product && (
                    <div className="p-6 border-b bg-green-50/30">
                        <h3 className="text-xl font-semibold text-green-700 mb-4">Alternative Product</h3>
                        <ProductItem
                            product={alternativeProduct.product}
                            quantity={alternativeProduct.quantity}
                            unitPrice={alternativeProduct.unitPrice}
                            description={alternativeProduct.description}
                            taxPercentage={alternativeProduct.taxPercentage}
                            discountPercentage={alternativeProduct.discountPercentage}
                            badge="Alternative"
                            badgeColor="bg-green-600"
                        />

                        {/* Alternative Product Optional Items */}
                        {alternativeProduct.optionalItems && alternativeProduct.optionalItems.length > 0 && (
                            <div className="mt-4 ml-8 border-l-3 border-green-300 pl-4 space-y-2">
                                <h5 className="text-sm font-semibold text-green-600">Optional Products</h5>
                                {alternativeProduct.optionalItems.map((opt, optIndex) => (
                                    <div key={optIndex} className="bg-green-50 rounded-lg px-3 py-2">
                                        <ProductItem
                                            product={opt.product}
                                            quantity={opt.quantity}
                                            unitPrice={opt.unitPrice}
                                            description={opt.description}
                                            taxPercentage={opt.taxPercentage}
                                            discountPercentage={opt.discountPercentage}
                                            badge="Optional"
                                            badgeColor="bg-green-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Alternative Product Total */}
                        <div className="mt-6 pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">Grand Total</p>
                                </div>
                                <span className="text-2xl font-bold text-green-700">
                                    {formatCurrency(
                                        calculateItemTotal(alternativeProduct.unitPrice, alternativeProduct.quantity, alternativeProduct.taxPercentage, alternativeProduct.discountPercentage) +
                                        (alternativeProduct.optionalItems?.reduce((sum, opt) => sum + calculateItemTotal(opt.unitPrice, opt.quantity, opt.taxPercentage, opt.discountPercentage), 0) || 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
                <Button
                    onClick={onSaveDraft}
                    disabled={saving}
                    variant="default"
                    size="lg"
                >
                    {saving ? <Spinner className="h-4 w-4 mr-2" /> : null}
                    Save Draft
                </Button>
                <Button
                    onClick={onSendQuotation}
                    disabled={saving}
                    variant="secondary"
                    size="lg"
                >
                    {saving ? <Spinner className="h-4 w-4 mr-2" /> : null}
                    Send Quotation
                </Button>
                <Button
                    onClick={onClose}
                    variant="destructive"
                    disabled={saving}
                    size="lg"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}

// ============================================
// Searchable Product Dropdown Component
// ============================================
function ProductSearchDropdown({ value, onChange, placeholder = "Select product", disabled = false }) {
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
                `/api/admin/products/search?search=${encodeURIComponent(searchTerm)}&page=${pageNum}&limit=10`
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
            const found = products.find(p => p.id === value.id);
            if (found) {
                setSelectedProduct(found);
            } else if (value.productName) {
                setSelectedProduct(value);
            }
        }
    }, [value, products, selectedProduct]);

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
                <span className={selectedProduct ? "text-gray-900" : "text-gray-400"}>
                    {selectedProduct 
                        ? `${selectedProduct.productName} (${selectedProduct.productNumber})` 
                        : placeholder
                    }
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
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
                                    placeholder="Search products..."
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
                                    {products.map((product) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => handleSelect(product)}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                                selectedProduct?.id === product.id ? "bg-blue-50" : ""
                                            }`}
                                        >
                                            <div className="font-medium">{product.productName}</div>
                                            <div className="text-xs text-gray-500">
                                                {product.productNumber} • {product.pixelPitch}mm
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

// ============================================
// Product Form Component
// ============================================
function ProductForm({ 
    item, 
    onUpdate, 
    onRemove, 
    isMainProduct = false,
    productDisabled = false,
    label = "Product"
}) {
    const handleChange = (field, value) => {
        onUpdate({ ...item, [field]: value });
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold font-archivo">{label}</h3>
                {onRemove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product
                    </label>
                    <ProductSearchDropdown
                        value={item.product}
                        onChange={(product) => handleChange("product", product)}
                        placeholder="Select product"
                        disabled={productDisabled}
                    />
                </div>

                {/* Quantity */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                    </label>
                    <Input
                        type="number"
                        min="1"
                        value={item.quantity || ""}
                        onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 1)}
                        placeholder="0"
                        disabled={isMainProduct}
                    />
                </div>

                {/* Unit Price */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price (€)
                    </label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice || ""}
                        onChange={(e) => handleChange("unitPrice", e.target.value)}
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tax % */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax %
                    </label>
                    <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.taxPercentage || ""}
                        onChange={(e) => handleChange("taxPercentage", e.target.value)}
                        placeholder="0%"
                    />
                </div>

                {/* Discount % */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount %
                    </label>
                    <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discountPercentage || ""}
                        onChange={(e) => handleChange("discountPercentage", e.target.value)}
                        placeholder="0%"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                    </label>
                    <Textarea
                        value={item.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Write here"
                        rows={2}
                        className="resize-none"
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================
// Product Section Component (Main or Alternative)
// ============================================
function ProductSection({
    title,
    titleColor,
    borderColor,
    bgColor,
    productData,
    onUpdateProduct,
    optionalItems,
    onAddOptional,
    onUpdateOptional,
    onRemoveOptional,
    isMainProduct = false,
    productFromEnquiry = false,
    onAddAlternative,
    showAddAlternativeButton = false,
}) {
    return (
        <div className={`${bgColor} rounded-xl p-6 border-2 ${borderColor}`}>
            <h2 className={`text-xl font-bold font-archivo mb-4 ${titleColor}`}>{title}</h2>
            
            {productData ? (
                <div className="space-y-4">
                    {/* Main Product Form */}
                    <ProductForm
                        item={productData}
                        onUpdate={onUpdateProduct}
                        isMainProduct={isMainProduct}
                        productDisabled={productFromEnquiry}
                        label={isMainProduct ? "Main Product" : "Alternative Product"}
                    />

                    {/* Optional Products */}
                    {optionalItems.length > 0 && (
                        <div className="ml-4 border-l-3 border-blue-300 pl-4 space-y-4">
                            <h4 className="text-sm font-semibold text-blue-700">Optional Products</h4>
                            {optionalItems.map((optItem, optIndex) => (
                                <ProductForm
                                    key={optIndex}
                                    item={optItem}
                                    onUpdate={(updated) => onUpdateOptional(optIndex, updated)}
                                    onRemove={() => onRemoveOptional(optIndex)}
                                    label={`Optional Product ${optIndex + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Add Optional Products Button */}
                    <div className="ml-4">
                        <button
                            type="button"
                            onClick={onAddOptional}
                            className="w-full border-2 border-dashed border-blue-300 rounded-lg py-3 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Optional Product
                        </button>
                    </div>
                </div>
            ) : showAddAlternativeButton ? (
                <button
                    type="button"
                    onClick={onAddAlternative}
                    className="w-full border-2 border-dashed border-green-400 rounded-lg py-6 text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add Alternative Product
                </button>
            ) : null}
        </div>
    );
}

// ============================================
// Main Page Component
// ============================================
export default function QuotationBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const [enquiry, setEnquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    
    // State for Main Product (required)
    const [mainProduct, setMainProduct] = useState({
        product: null,
        quantity: 1,
        unitPrice: "",
        taxPercentage: "",
        discountPercentage: "",
        description: "",
        optionalItems: [],
    });

    // State for Alternative Product (optional)
    const [alternativeProduct, setAlternativeProduct] = useState(null);
    
    // Track if alternative was added by user in enquiry
    const [alternativeFromEnquiry, setAlternativeFromEnquiry] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchEnquiry();
        }
    }, [params.id]);

    const fetchEnquiry = async () => {
        try {
            const res = await fetch(`/api/admin/enquiries/${params.id}`);
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch enquiry");
            }
            setEnquiry(response.data);

            const items = response.data.items || [];
            
            // First item is always the main product
            if (items[0]) {
                setMainProduct({
                    product: {
                        id: items[0].productId,
                        productName: items[0].productName,
                        productNumber: items[0].productNumber,
                        pixelPitch: items[0].pixelPitch,
                        imageUrl: items[0].imageUrl || null,
                    },
                    quantity: items[0].quantity || 1,
                    unitPrice: "",
                    taxPercentage: "",
                    discountPercentage: "",
                    description: "",
                    optionalItems: [],
                });
            }

            // Second item (if exists) is the alternative product
            if (items[1]) {
                setAlternativeProduct({
                    product: {
                        id: items[1].productId,
                        productName: items[1].productName,
                        productNumber: items[1].productNumber,
                        pixelPitch: items[1].pixelPitch,
                        imageUrl: items[1].imageUrl || null,
                    },
                    quantity: items[1].quantity || 1,
                    unitPrice: "",
                    taxPercentage: "",
                    discountPercentage: "",
                    description: "",
                    optionalItems: [],
                });
                setAlternativeFromEnquiry(true);
            }
        } catch (error) {
            toast.error(error.message);
            router.push("/admin/enquiries");
        } finally {
            setLoading(false);
        }
    };

    // Format enquiry ID for display
    const formatEnquiryId = (id) => {
        if (!id) return "";
        const last4 = id.slice(-4).toUpperCase();
        const year = new Date().getFullYear();
        return `#${last4}${year}`;
    };

    // Main Product Handlers
    const handleUpdateMainProduct = (updated) => {
        setMainProduct(prev => ({ ...prev, ...updated }));
    };

    const handleAddMainOptional = () => {
        setMainProduct(prev => ({
            ...prev,
            optionalItems: [...prev.optionalItems, {
                product: null,
                quantity: 1,
                unitPrice: "",
                taxPercentage: "",
                discountPercentage: "",
                description: "",
            }]
        }));
    };

    const handleUpdateMainOptional = (index, updated) => {
        setMainProduct(prev => ({
            ...prev,
            optionalItems: prev.optionalItems.map((opt, i) => 
                i === index ? updated : opt
            )
        }));
    };

    const handleRemoveMainOptional = (index) => {
        setMainProduct(prev => ({
            ...prev,
            optionalItems: prev.optionalItems.filter((_, i) => i !== index)
        }));
    };

    // Alternative Product Handlers
    const handleAddAlternative = () => {
        setAlternativeProduct({
            product: null,
            quantity: 1,
            unitPrice: "",
            taxPercentage: "",
            discountPercentage: "",
            description: "",
            optionalItems: [],
        });
    };

    const handleUpdateAlternativeProduct = (updated) => {
        setAlternativeProduct(prev => ({ ...prev, ...updated }));
    };

    const handleAddAlternativeOptional = () => {
        setAlternativeProduct(prev => ({
            ...prev,
            optionalItems: [...(prev?.optionalItems || []), {
                product: null,
                quantity: 1,
                unitPrice: "",
                taxPercentage: "",
                discountPercentage: "",
                description: "",
            }]
        }));
    };

    const handleUpdateAlternativeOptional = (index, updated) => {
        setAlternativeProduct(prev => ({
            ...prev,
            optionalItems: prev.optionalItems.map((opt, i) => 
                i === index ? updated : opt
            )
        }));
    };

    const handleRemoveAlternativeOptional = (index) => {
        setAlternativeProduct(prev => ({
            ...prev,
            optionalItems: prev.optionalItems.filter((_, i) => i !== index)
        }));
    };

    // Validate form
    const validateForm = () => {
        // Validate main product
        if (!mainProduct.product || !mainProduct.unitPrice) {
            toast.error("Main product must have a unit price");
            return false;
        }

        for (const optItem of mainProduct.optionalItems) {
            if (!optItem.product || !optItem.unitPrice) {
                toast.error("Each optional product must have a product selected and a unit price");
                return false;
            }
        }

        // Validate alternative product (if exists)
        if (alternativeProduct) {
            if (!alternativeProduct.product || !alternativeProduct.unitPrice) {
                toast.error("Alternative product must have a product selected and a unit price");
                return false;
            }

            for (const optItem of alternativeProduct.optionalItems || []) {
                if (!optItem.product || !optItem.unitPrice) {
                    toast.error("Each optional product for alternative must have a product selected and a unit price");
                    return false;
                }
            }
        }

        return true;
    };

    // Save quotation
    const handleSave = async (status = "draft") => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            // Build items array
            const items = [];
            
            // Main product
            items.push({
                productId: mainProduct.product.id,
                quantity: mainProduct.quantity,
                unitPrice: parseFloat(mainProduct.unitPrice),
                taxPercentage: parseFloat(mainProduct.taxPercentage) || 0,
                discountPercentage: parseFloat(mainProduct.discountPercentage) || 0,
                description: mainProduct.description || null,
                itemType: "main",
                optionalItems: mainProduct.optionalItems.map((opt) => ({
                    productId: opt.product.id,
                    quantity: opt.quantity,
                    unitPrice: parseFloat(opt.unitPrice),
                    taxPercentage: parseFloat(opt.taxPercentage) || 0,
                    discountPercentage: parseFloat(opt.discountPercentage) || 0,
                    description: opt.description || null,
                })),
            });

            // Alternative product (if exists)
            if (alternativeProduct && alternativeProduct.product) {
                items.push({
                    productId: alternativeProduct.product.id,
                    quantity: alternativeProduct.quantity,
                    unitPrice: parseFloat(alternativeProduct.unitPrice),
                    taxPercentage: parseFloat(alternativeProduct.taxPercentage) || 0,
                    discountPercentage: parseFloat(alternativeProduct.discountPercentage) || 0,
                    description: alternativeProduct.description || null,
                    itemType: "alternative",
                    optionalItems: (alternativeProduct.optionalItems || []).map((opt) => ({
                        productId: opt.product.id,
                        quantity: opt.quantity,
                        unitPrice: parseFloat(opt.unitPrice),
                        taxPercentage: parseFloat(opt.taxPercentage) || 0,
                        discountPercentage: parseFloat(opt.discountPercentage) || 0,
                        description: opt.description || null,
                    })),
                });
            }

            const res = await fetch("/api/admin/quotations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    enquiryId: params.id,
                    status,
                    items,
                }),
            });

            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to save quotation");
            }

            toast.success(`Quotation ${status === "draft" ? "saved as draft" : "created"} successfully`);
            router.push(`/admin/enquiries/${params.id}`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.push(`/admin/enquiries/${params.id}`);
    };

    const handlePreview = () => {
        if (!validateForm()) return;
        setShowPreview(true);
    };

    const handleSendQuotation = async () => {
        await handleSave("pending");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    // Show preview
    if (showPreview) {
        return (
            <QuotationPreview
                quotationId={enquiry?.enquiryId ? formatEnquiryId(enquiry.id) : ""}
                mainProduct={mainProduct}
                alternativeProduct={alternativeProduct}
                onClose={() => setShowPreview(false)}
                onSaveDraft={() => handleSave("draft")}
                onSendQuotation={handleSendQuotation}
                saving={saving}
            />
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div>
                <Button 
                    onClick={() => router.back()} 
                    variant="ghost" 
                    size="lg" 
                    className="mb-2 p-0!"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Enquiry
                </Button>

                <h1 className="text-2xl font-bold font-archivo">
                    Quotation Builder {enquiry?.enquiryId ? formatEnquiryId(enquiry.id) : ""}
                </h1>
                <p className="text-gray-600 mt-1">
                    Create a quotation for the customer's enquiry
                </p>
            </div>

            {/* Main Product Section */}
            <ProductSection
                title="Main Product"
                titleColor="text-blue-700"
                borderColor="border-blue-200"
                bgColor="bg-blue-50/30"
                productData={mainProduct}
                onUpdateProduct={handleUpdateMainProduct}
                optionalItems={mainProduct.optionalItems}
                onAddOptional={handleAddMainOptional}
                onUpdateOptional={handleUpdateMainOptional}
                onRemoveOptional={handleRemoveMainOptional}
                isMainProduct={true}
                productFromEnquiry={true}
            />

            {/* Alternative Product Section */}
            <ProductSection
                title="Alternative Product"
                titleColor="text-blue-700"
                borderColor="border-blue-200"
                bgColor="bg-blue-50/30"
                productData={alternativeProduct}
                onUpdateProduct={handleUpdateAlternativeProduct}
                optionalItems={alternativeProduct?.optionalItems || []}
                onAddOptional={handleAddAlternativeOptional}
                onUpdateOptional={handleUpdateAlternativeOptional}
                onRemoveOptional={handleRemoveAlternativeOptional}
                isMainProduct={false}
                productFromEnquiry={alternativeFromEnquiry}
                onAddAlternative={handleAddAlternative}
                showAddAlternativeButton={!alternativeProduct}
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
                <Button
                    onClick={() => handleSave("draft")}
                    disabled={saving}
                    variant="default"
                    size="lg"
                >
                    {saving ? <Spinner className="h-4 w-4 mr-2" /> : null}
                    Save Draft
                </Button>
                <Button
                    onClick={handlePreview}
                    disabled={saving}
                    variant="secondary"
                    size="lg"
                >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Quotation
                </Button>
                <Button
                    onClick={handleCancel}
                    variant="destructive"
                    disabled={saving}
                    size="lg"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}

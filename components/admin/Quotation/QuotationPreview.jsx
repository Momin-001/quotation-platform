import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { calculateItemTotal, formatCurrency } from "@/lib/helpers";
import ProductItemDisplay from "@/components/common/ProductItemDisplay";

export default function QuotationPreview({ quotationId, mainProduct, alternativeProduct, onClose,  onSaveDraft,  onSendQuotation, saving }) {
    let grandTotal = 0;
    
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
                            <ProductItemDisplay
                                product={mainProduct.product}
                                quantity={mainProduct.quantity}
                                unitPrice={mainProduct.unitPrice}
                                description={mainProduct.description}
                                taxPercentage={mainProduct.taxPercentage}
                                discountPercentage={mainProduct.discountPercentage}
                                badge="Main"
                                badgeColor="bg-blue-600"
                               
                            />

                            {/* Main Product Optional Items */}
                            {mainProduct.optionalItems && mainProduct.optionalItems.length > 0 && (
                                <div className="mt-4 ml-8 border-l-3 border-blue-300 pl-4 space-y-2">
                                    <h5 className="text-sm font-semibold text-blue-600">Optional Products</h5>
                                    {mainProduct.optionalItems.map((opt, optIndex) => (
                                        <div key={optIndex} className="bg-blue-50/50 rounded-lg px-3 py-2">
                                            <ProductItemDisplay
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
                                        <p className="text-lg font-semibold text-gray-900">Main Product Total</p>
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
                        <ProductItemDisplay
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
                                        <ProductItemDisplay
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
                                    <p className="text-lg font-semibold text-gray-900">Alternative Product Total</p>
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
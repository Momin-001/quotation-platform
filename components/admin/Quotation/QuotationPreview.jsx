import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { calculateQuotationOfferTotals, formatCurrency } from "@/lib/helpers";
import ProductItemDisplay from "@/components/common/ProductItemDisplay";

function mainLineQuantity(product, quantity) {
    return product?.isCustom ? product?.customTotalCabinets : quantity;
}

export default function QuotationPreview({
    quotationId,
    quotationTaxPercentage,
    mainProduct,
    alternativeProduct,
    onClose,
    onSaveDraft,
    onSendQuotation,
    saving,
    savingDraft,
    savingQuotation,
}) {
    const taxRate = quotationTaxPercentage ?? "19";
    const mainTotals =
        mainProduct?.product && calculateQuotationOfferTotals(mainProduct, taxRate);
    const altTotals =
        alternativeProduct?.product &&
        calculateQuotationOfferTotals(alternativeProduct, taxRate);

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <Button onClick={onClose} variant="ghost" size="lg" className="mb-2 p-0!">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Editor
                    </Button>
                    <h1 className="text-2xl font-bold ">Quotation {quotationId}</h1>
                    <p className="text-gray-500">Preview · MwSt {taxRate}% je Angebot (auf Nettosumme)</p>
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Main Product</h3>
                    {mainProduct.product && (
                        <>
                            <ProductItemDisplay
                                product={mainProduct.product}
                                quantity={mainLineQuantity(mainProduct.product, mainProduct.quantity)}
                                unitPrice={mainProduct.unitPrice}
                                description={mainProduct.description}
                                discountPercentage={mainProduct.discountPercentage}
                                badge="Main"
                                badgeColor="bg-blue-600"
                                quotationTaxPercentage={taxRate}
                            />

                            {mainProduct.additionalItems && mainProduct.additionalItems.length > 0 && (
                                <div className="mt-4 ml-8 border-l-3 border-purple-300 pl-4 space-y-2">
                                    <h5 className="text-sm font-semibold text-purple-600">Additional Products</h5>
                                    {mainProduct.additionalItems.map((add, addIndex) => (
                                        <div key={addIndex} className="bg-purple-50/50 rounded-lg px-3 py-2">
                                            <ProductItemDisplay
                                                product={add.product}
                                                quantity={mainLineQuantity(add.product, add.quantity)}
                                                unitPrice={add.unitPrice}
                                                description={add.description}
                                                discountPercentage={add.discountPercentage}
                                                badge="Additional"
                                                badgeColor="bg-purple-500"
                                                quotationTaxPercentage={taxRate}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {mainProduct.optionalItems && mainProduct.optionalItems.length > 0 && (
                                <div className="mt-4 ml-8 border-l-3 border-blue-300 pl-4 space-y-2">
                                    <h5 className="text-sm font-semibold text-blue-600">Optional Products</h5>
                                    {mainProduct.optionalItems.map((opt, optIndex) => (
                                        <div key={optIndex} className="bg-blue-50/50 rounded-lg px-3 py-2">
                                            <ProductItemDisplay
                                                product={opt.product}
                                                quantity={mainLineQuantity(opt.product, opt.quantity)}
                                                unitPrice={opt.unitPrice}
                                                description={opt.description}
                                                discountPercentage={opt.discountPercentage}
                                                badge="Optional"
                                                badgeColor="bg-blue-500"
                                                quotationTaxPercentage={taxRate}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {mainTotals && (
                                <div className="mt-6 pt-4 border-t border-gray-200 space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Net:</span>
                                        <span className="font-medium">{formatCurrency(mainTotals.offerNet)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">+ ({mainTotals.taxPercentage}%) VAT on</span>
                                        <span className="font-medium">{formatCurrency(mainTotals.tax)}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline pt-1">
                                        <span className="text-lg font-semibold text-gray-900">Main Product Total</span>
                                        <span className="text-2xl font-bold text-blue-700">
                                            {formatCurrency(mainTotals.offerTotal)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {alternativeProduct?.product && (
                    <div className="p-6 border-b bg-green-50/30">
                        <h3 className="text-xl font-semibold text-green-700 mb-4">Alternative Product</h3>
                        <ProductItemDisplay
                            product={alternativeProduct.product}
                            quantity={mainLineQuantity(
                                alternativeProduct.product,
                                alternativeProduct.quantity
                            )}
                            unitPrice={alternativeProduct.unitPrice}
                            description={alternativeProduct.description}
                            discountPercentage={alternativeProduct.discountPercentage}
                            badge="Alternative"
                            badgeColor="bg-green-600"
                            quotationTaxPercentage={taxRate}
                        />

                        {alternativeProduct.additionalItems &&
                            alternativeProduct.additionalItems.length > 0 && (
                                <div className="mt-4 ml-8 border-l-3 border-purple-300 pl-4 space-y-2">
                                    <h5 className="text-sm font-semibold text-purple-600">Additional Products</h5>
                                    {alternativeProduct.additionalItems.map((add, addIndex) => (
                                        <div key={addIndex} className="bg-purple-50 rounded-lg px-3 py-2">
                                            <ProductItemDisplay
                                                product={add.product}
                                                quantity={mainLineQuantity(add.product, add.quantity)}
                                                unitPrice={add.unitPrice}
                                                description={add.description}
                                                discountPercentage={add.discountPercentage}
                                                badge="Additional"
                                                badgeColor="bg-purple-500"
                                                quotationTaxPercentage={taxRate}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                        {alternativeProduct.optionalItems &&
                            alternativeProduct.optionalItems.length > 0 && (
                                <div className="mt-4 ml-8 border-l-3 border-green-300 pl-4 space-y-2">
                                    <h5 className="text-sm font-semibold text-green-600">Optional Products</h5>
                                    {alternativeProduct.optionalItems.map((opt, optIndex) => (
                                        <div key={optIndex} className="bg-green-50 rounded-lg px-3 py-2">
                                            <ProductItemDisplay
                                                product={opt.product}
                                                quantity={mainLineQuantity(opt.product, opt.quantity)}
                                                unitPrice={opt.unitPrice}
                                                description={opt.description}
                                                discountPercentage={opt.discountPercentage}
                                                badge="Optional"
                                                badgeColor="bg-green-500"
                                                quotationTaxPercentage={taxRate}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                        {altTotals && (
                            <div className="mt-6 pt-4 border-t border-gray-200 space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Net:</span>
                                    <span className="font-medium">{formatCurrency(altTotals.offerNet)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">+ ({altTotals.taxPercentage}%) VAT on</span>
                                    <span className="font-medium">{formatCurrency(altTotals.tax)}</span>
                                </div>
                                <div className="flex justify-between items-baseline pt-1">
                                    <span className="text-lg font-semibold text-gray-900">Alternative Product Total</span>
                                    <span className="text-2xl font-bold text-green-700">
                                        {formatCurrency(altTotals.offerTotal)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <Button onClick={onSaveDraft} disabled={saving} variant="default" size="lg">
                    {savingDraft ? <Spinner className="h-4 w-4 mr-2" /> : null}
                    Save Draft
                </Button>
                <Button onClick={onSendQuotation} disabled={savingQuotation} variant="secondary" size="lg">
                    {savingQuotation ? <Spinner className="h-4 w-4 mr-2" /> : null}
                    Send Quotation
                </Button>
                <Button onClick={onClose} variant="destructive" disabled={saving} size="lg">
                    Cancel
                </Button>
            </div>
        </div>
    );
}

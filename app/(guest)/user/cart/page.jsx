"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, Trash2, ArrowUpDown, Cpu } from "lucide-react";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import BreadCrumb from "@/components/user/BreadCrumb";
import { useLanguage } from "@/context/LanguageContext";

const formSchema = z.object({
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function CartPage() {
    const { 
        cartItems, 
        updateQuantity, 
        removeFromCart, 
        removeControllerFromProduct,
        clearCart,
        swapProducts,
        canAddToCart 
    } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [captchaVal, setCaptchaVal] = useState(null);
    const [loading, setLoading] = useState(false);
    const { language } = useLanguage();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data) => {
        if (cartItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        if (!captchaVal) {
            toast.error("Please complete the captcha");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/user/enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: data.message,
                    items: cartItems.map((item, index) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        itemType: item.itemType || (index === 0 ? "main" : "alternative"),
                        additionalController: item.additionalController || null,
                    })),
                }),
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to submit enquiry");
            }
            toast.success(response.message || "Enquiry submitted successfully!");
            clearCart();
            router.push("/user/my-enquiries");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Get item type label and styling
    const getItemTypeInfo = (item, index) => {
        const itemType = item.itemType || (index === 0 ? "main" : "alternative");
        if (itemType === "main") {
            return {
                label: "Main Product",
                bgColor: "bg-primary",
                borderColor: "border-blue-200",
            };
        }
        return {
            label: "Alternative Product",
            bgColor: "bg-green-600",
            borderColor: "border-green-200",
        };
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                    <p className="text-gray-600 mb-6">
                        Add up to 2 products: a Main Product and an Alternative Product
                    </p>
                    <Button onClick={() => router.push("/products")}>
                        Browse Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb 
                title={language === "en" ? "My Cart" : "Mein Warenkorb"} 
                breadcrumbs={[
                    { label: language === "en" ? "Home" : "Startseite", href: "/" }, 
                    { label: language === "en" ? "Cart" : "Warenkorb" }
                ]} 
            />
            <div className="container mx-auto px-4 py-8">

                {/* Cart limit info */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-primary">
                        <strong>Cart Limit:</strong> You can add up to 2 products - 
                        a <span className="font-semibold">Main Product</span> (the product you want a quotation for) 
                        and an <span className="font-semibold">Alternative Product</span> (an alternative option).
                        {!canAddToCart() && (
                            <span className="block mt-1 text-primary">
                                Your cart is full. Remove a product to add a different one.
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center justify-end mb-8">
                    {cartItems.length === 2 && (
                        <Button 
                            variant="secondary" 
                            onClick={swapProducts}
                            className="flex items-center gap-2"
                        >
                            <ArrowUpDown className="h-4 w-4" />
                            Swap Products
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Selected Products */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">Selected Products ({cartItems.length}/2)</h2>
                        {cartItems.map((item, index) => {
                            const typeInfo = getItemTypeInfo(item, index);
                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white border-2 ${typeInfo.borderColor} rounded-lg p-4 space-y-4`}
                                >
                                    {/* Main product row */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Product Image */}
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-gray-100 rounded overflow-hidden">
                                            {item.imageUrl ? (
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.productName}
                                                    fill
                                                    className="object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info + Quantity */}
                                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`${typeInfo.bgColor} text-white text-xs px-3 py-1 rounded-full font-medium shrink-0`}>
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-1">
                                                {item.productName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {item.productNumber}
                                            </p>

                                            {/* Quantity Input */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`quantity-${item.id}`}>
                                                    Choose Quantity*
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity - 1
                                                            )
                                                        }
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Input
                                                        id={`quantity-${item.id}`}
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateQuantity(
                                                                item.id,
                                                                parseInt(e.target.value) || 1
                                                            )
                                                        }
                                                        className="w-16 h-8 pl-6 text-center"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity + 1
                                                            )
                                                        }
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm self-start sm:mt-8"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Additional Controller - separate block below (like quotation page) */}
                                    {item.additionalController && (
                                        <div className="mt-4 pt-4 border-t border-purple-200 ml-0 sm:ml-8 border-l-0 sm:border-l-4 sm:border-l-purple-300 pl-0 sm:pl-4">
                                            <h5 className="text-xs font-semibold text-purple-600 uppercase mb-2">Additional Controller</h5>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-purple-50/50 rounded-lg p-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{item.additionalController.interfaceName || item.additionalController.productName}</p>
                                                    <p className="text-xs text-gray-500">{item.additionalController.brandDisplay || item.additionalController.brandName || "N/A"}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeControllerFromProduct(item.id)}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium self-start sm:self-center"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Add Controller Button */}
                        <Link
                            href="/controllers"
                            className="w-full border-2 border-dashed border-purple-300 rounded-lg py-4 text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Cpu className="h-5 w-5" />
                            Add Controller
                        </Link>

                        {/* Add More Products Button (if cart not full) */}
                        {canAddToCart() && (
                            <button
                                onClick={() => router.push("/products")}
                                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                Add {cartItems.length === 0 ? "Main Product" : "Alternative Product"}
                            </button>
                        )}
                    </div>

                    {/* Right Side - Get a quote form */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">Get a quote</h2>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="bg-white border rounded-lg p-6 space-y-4"
                        >
                            {/* User Info (Read-only) */}
                            <div className="space-y-2">
                                <Label>Your Name*</Label>
                                <Input
                                    value={user?.fullName || ""}
                                    disabled
                                    className="bg-gray-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Your Email*</Label>
                                <Input
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-gray-100"
                                />
                            </div>

                            {/* Message Field */}
                            <div className="space-y-2">
                                <Label htmlFor="message">Your Message*</Label>
                                <Textarea
                                    id="message"
                                    {...register("message")}
                                    placeholder="Describe your project requirements..."
                                    rows={5}
                                />
                                {errors.message && (
                                    <p className="text-sm text-red-500">
                                        {errors.message.message}
                                    </p>
                                )}
                            </div>

                            {/* Privacy Policy Checkbox */}
                            <div className="flex items-center gap-2">
                                <Checkbox id="privacy" required />
                                <Label
                                    htmlFor="privacy"
                                    className="text-sm cursor-pointer"
                                >
                                    I agree to the <Link href="/privacy-policy" target="_blank" className="font-bold hover:underline">Privacy Policy</Link> and <Link href="/terms-and-conditions" target="_blank" className="font-bold hover:underline">Terms & Conditions.</Link>
                                </Label>
                            </div>

                            {/* reCAPTCHA */}
                            <div className="flex items-center gap-2">
                                <ReCAPTCHA
                                    sitekey={NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                    onChange={(val) => setCaptchaVal(val)}
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Submit"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

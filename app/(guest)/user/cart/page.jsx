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
import { Minus, Plus, Trash2, ArrowUpDown, Cpu, ShoppingCart, Send } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import BreadCrumb from "@/components/user/BreadCrumb";
import { useLanguage } from "@/context/LanguageContext";
import { useFooter } from "@/context/FooterContext";
import { cn } from "@/lib/utils";

const readOnlyInputClass = "h-10 text-sm bg-muted/30 border-border/60";

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
        canAddToCart,
    } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [captchaVal, setCaptchaVal] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { language } = useLanguage();
    const isEn = language === "en";
    const { privacyPolicyPdfUrl } = useFooter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data) => {
        if (cartItems.length === 0) {
            toast.error(isEn ? "Your cart is empty" : "Ihr Warenkorb ist leer");
            return;
        }

        if (!captchaVal) {
            toast.error(isEn ? "Please complete the captcha" : "Bitte Captcha ausfüllen");
            return;
        }

        setSubmitting(true);
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
            toast.success(
                response.message ||
                    (isEn ? "Enquiry submitted successfully" : "Anfrage erfolgreich gesendet")
            );
            clearCart();
            router.push("/user/my-enquiries");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getItemTypeInfo = (item, index) => {
        const itemType = item.itemType || (index === 0 ? "main" : "alternative");
        if (itemType === "main") {
            return {
                label: isEn ? "Main product" : "Hauptprodukt",
                badgeClass: "bg-primary text-primary-foreground",
                borderClass: "border-primary/30",
            };
        }
        return {
            label: isEn ? "Alternative product" : "Alternativprodukt",
            badgeClass: "bg-secondary text-primary-foreground",
            borderClass: "border-secondary/40",
        };
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <BreadCrumb
                    title={isEn ? "My cart" : "Mein Warenkorb"}
                    breadcrumbs={[
                        { label: isEn ? "Home" : "Startseite", href: "/" },
                        { label: isEn ? "Cart" : "Warenkorb" },
                    ]}
                />
                <main className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="text-center max-w-md">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                        <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                            {isEn ? "Your cart is empty" : "Ihr Warenkorb ist leer"}
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                            {isEn
                                ? "Add up to two products: one main and one alternative option for your quotation."
                                : "Fügen Sie bis zu zwei Produkte hinzu: ein Haupt- und ein Alternativprodukt für Ihr Angebot."}
                        </p>
                        <Button size="lg" onClick={() => router.push("/products")}>
                            {isEn ? "Browse products" : "Produkte ansehen"}
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb
                title={isEn ? "My cart" : "Mein Warenkorb"}
                breadcrumbs={[
                    { label: isEn ? "Home" : "Startseite", href: "/" },
                    { label: isEn ? "Cart" : "Warenkorb" },
                ]}
            />
            <main className="container mx-auto px-4 lg:px-6 py-6 sm:py-8">
                <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5">
                    <p className="text-sm text-foreground leading-relaxed">
                        <span className="font-semibold">
                            {isEn ? "Cart limit:" : "Warenkorblimit:"}
                        </span>{" "}
                        {isEn
                            ? "Up to 2 products — a "
                            : "Max. 2 Produkte — ein "}
                        <span className="font-semibold text-primary">
                            {isEn ? "main product" : "Hauptprodukt"}
                        </span>
                        {isEn ? " for your quotation and an " : " für Ihr Angebot und ein "}
                        <span className="font-semibold text-secondary">
                            {isEn ? "alternative product" : "Alternativprodukt"}
                        </span>
                        .
                        {!canAddToCart() && (
                            <span className="block mt-1.5 text-muted-foreground">
                                {isEn
                                    ? "Your cart is full. Remove a product to add a different one."
                                    : "Warenkorb voll. Entfernen Sie ein Produkt, um ein anderes hinzuzufügen."}
                            </span>
                        )}
                    </p>
                </div>

                {cartItems.length === 2 && (
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={swapProducts}
                            className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            {isEn ? "Swap products" : "Produkte tauschen"}
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold text-foreground">
                            {isEn ? "Selected products" : "Ausgewählte Produkte"}
                            <span className="text-muted-foreground font-normal ml-1">
                                ({cartItems.length}/2)
                            </span>
                        </h2>

                        {cartItems.map((item, index) => {
                            const typeInfo = getItemTypeInfo(item, index);
                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "bg-white border rounded-xl p-4 sm:p-5 space-y-4 shadow-sm",
                                        typeInfo.borderClass
                                    )}
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden border border-border/40 bg-muted/20">
                                            {item.imageUrl ? (
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.productName}
                                                    fill
                                                    className="object-cover"
                                                    sizes="96px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                                    {isEn ? "No image" : "Kein Bild"}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col gap-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <span
                                                        className={cn(
                                                            "inline-flex text-[10px] sm:text-xs font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-md mb-2",
                                                            typeInfo.badgeClass
                                                        )}
                                                    >
                                                        {typeInfo.label}
                                                    </span>
                                                    <h3 className="font-semibold text-base sm:text-lg text-foreground leading-snug">
                                                        {item.productName}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-0.5">
                                                        {item.productNumber}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-destructive hover:text-destructive/80 flex items-center gap-1 text-xs sm:text-sm shrink-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {isEn ? "Remove" : "Entfernen"}
                                                </button>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor={`quantity-${item.id}`}
                                                    className="text-sm font-medium"
                                                >
                                                    {isEn ? "Quantity" : "Menge"}
                                                    <span className="text-destructive ml-0.5">*</span>
                                                </Label>
                                                <div className="flex items-center gap-2 w-fit">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9 shrink-0"
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
                                                                parseInt(e.target.value, 10) || 1
                                                            )
                                                        }
                                                        className="w-16 h-9 text-center text-sm"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9 shrink-0"
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
                                    </div>

                                    {item.additionalController && (
                                        <div className="pt-4 border-t border-border/40 sm:ml-2 sm:pl-4 sm:border-l-2 sm:border-l-primary/30">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                                                {isEn ? "Additional controller" : "Zusätzlicher Controller"}
                                            </p>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {item.additionalController.interfaceName ||
                                                            item.additionalController.productName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.additionalController.brandDisplay ||
                                                            item.additionalController.brandName ||
                                                            "N/A"}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeControllerFromProduct(item.id)
                                                    }
                                                    className="text-sm font-medium text-destructive hover:text-destructive/80 self-start sm:self-center shrink-0"
                                                >
                                                    {isEn ? "Remove" : "Entfernen"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <Link
                            href="/controllers"
                            className="w-full border-2 border-dashed border-primary/40 rounded-xl py-3.5 text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Cpu className="h-5 w-5" />
                            {isEn ? "Add controller" : "Controller hinzufügen"}
                        </Link>

                        {canAddToCart() && (
                            <button
                                type="button"
                                onClick={() => router.push("/products")}
                                className="w-full border-2 border-dashed border-border/60 rounded-xl py-3.5 text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <Plus className="h-5 w-5" />
                                {cartItems.length === 0
                                    ? isEn
                                        ? "Add main product"
                                        : "Hauptprodukt hinzufügen"
                                    : isEn
                                      ? "Add alternative product"
                                      : "Alternativprodukt hinzufügen"}
                            </button>
                        )}
                    </div>

                    <div className="lg:sticky lg:top-24 space-y-4">
                        <h2 className="text-base font-semibold text-foreground">
                            {isEn ? "Request a quote" : "Angebot anfordern"}
                        </h2>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="bg-white border border-border/60 rounded-xl p-5 sm:p-6 space-y-5 shadow-sm"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">
                                        {isEn ? "Your name" : "Ihr Name"}
                                        <span className="text-destructive ml-0.5">*</span>
                                    </Label>
                                    <Input
                                        value={user?.fullName || ""}
                                        disabled
                                        className={readOnlyInputClass}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">
                                        {isEn ? "Your email" : "Ihre E-Mail"}
                                        <span className="text-destructive ml-0.5">*</span>
                                    </Label>
                                    <Input
                                        value={user?.email || ""}
                                        disabled
                                        className={readOnlyInputClass}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="message" className="text-sm font-medium">
                                    {isEn ? "Your message" : "Ihre Nachricht"}
                                    <span className="text-destructive ml-0.5">*</span>
                                </Label>
                                <Textarea
                                    id="message"
                                    {...register("message")}
                                    placeholder={
                                        isEn
                                            ? "Describe your project requirements…"
                                            : "Beschreiben Sie Ihre Projektanforderungen…"
                                    }
                                    rows={4}
                                    className={cn(
                                        "text-sm min-h-[100px] resize-y",
                                        errors.message && "border-destructive"
                                    )}
                                />
                                {errors.message && (
                                    <p className="text-xs text-destructive">
                                        {errors.message.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-start gap-2.5">
                                    <Checkbox id="privacy-cart" required className="mt-0.5" />
                                    <Label
                                        htmlFor="privacy-cart"
                                        className="text-sm text-muted-foreground leading-relaxed font-normal cursor-pointer"
                                    >
                                        {isEn ? "I agree to the" : "Ich stimme der"}{" "}
                                        <Link
                                            href={privacyPolicyPdfUrl || "#"}
                                            target="_blank"
                                            className={cn(
                                                "font-semibold text-primary hover:text-primary/80",
                                                !privacyPolicyPdfUrl &&
                                                    "pointer-events-none opacity-60"
                                            )}
                                        >
                                            {isEn ? "Privacy Policy" : "Datenschutzerklärung"}
                                        </Link>{" "}
                                        {isEn ? "and" : "und den"}{" "}
                                        <Link
                                            href="/terms-and-conditions"
                                            target="_blank"
                                            className="font-semibold text-primary hover:text-primary/80"
                                        >
                                            {isEn ? "Terms & Conditions" : "AGB"}
                                        </Link>
                                        .
                                    </Label>
                                </div>
                            </div>

                            <div>
                                <ReCAPTCHA
                                    sitekey={NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                    onChange={(val) => setCaptchaVal(val)}
                                />
                            </div>

                            <Button type="submit" size="lg" disabled={submitting} className="w-full">
                                {submitting ? (
                                    <>
                                        <Spinner className="h-4 w-4 mr-2" />
                                        {isEn ? "Submitting…" : "Wird gesendet…"}
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        {isEn ? "Submit enquiry" : "Anfrage absenden"}
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

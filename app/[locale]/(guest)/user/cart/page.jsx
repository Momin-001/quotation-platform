"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useRouter } from "@/i18n/navigation";
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
import { useTranslations } from "next-intl";
import { usePrivacyPolicy } from "@/context/PrivacyPolicyContext";
import { cn } from "@/lib/utils";

const readOnlyInputClass = "h-10 text-sm bg-muted/30 border-border/60";

export default function CartPage() {
    const t = useTranslations("User.cart");
    const tVal = useTranslations("User.cart.validation");
    const tCommon = useTranslations("Common");
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
    const { privacyPolicyPdfUrl } = usePrivacyPolicy();

    const formSchema = useMemo(
        () =>
            z.object({
                projectName: z.string().max(200).optional(),
                message: z.string().min(10, tVal("messageTooShort")),
            }),
        [tVal]
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data) => {
        if (cartItems.length === 0) {
            toast.error(t("emptyCartToast"));
            return;
        }

        if (!captchaVal) {
            toast.error(tCommon("captchaRequired"));
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/user/enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectName: data.projectName?.trim() || null,
                    message: data.message,
                    items: cartItems.map((item, index) => {
                        const isRefurbished = item.productSourceType === "refurbished";
                        return {
                            productId: isRefurbished ? null : item.id,
                            refurbishedProductId: isRefurbished ? item.id : null,
                            productSourceType: isRefurbished ? "refurbished" : "product",
                            quantity: item.quantity,
                            itemType: item.itemType || (index === 0 ? "main" : "alternative"),
                            additionalController: isRefurbished ? null : item.additionalController || null,
                        };
                    }),
                }),
            });

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || "Failed to submit enquiry");
            }
            toast.success(response.message || t("submitSuccess"));
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
                label: t("mainProduct"),
                badgeClass: "bg-primary text-primary-foreground",
                borderClass: "border-primary/30",
            };
        }
        return {
            label: t("alternativeProduct"),
            badgeClass: "bg-secondary text-primary-foreground",
            borderClass: "border-secondary/40",
        };
    };

    // A refurbished product owns the cart alone: no controller, no alternative.
    const isRefurbishedCart = cartItems.some((item) => item.productSourceType === "refurbished");

    const breadcrumbs = [
        { label: t("breadcrumbHome"), href: "/" },
        { label: t("breadcrumbCart") },
    ];

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <BreadCrumb title={t("title")} breadcrumbs={breadcrumbs} />
                <main className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="text-center max-w-md">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                        <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                            {t("emptyTitle")}
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                            {t("emptyDescription")}
                        </p>
                        <Button size="lg" onClick={() => router.push("/products")}>
                            {t("browseProducts")}
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb title={t("title")} breadcrumbs={breadcrumbs} />
            <main className="container mx-auto px-4 lg:px-6 py-6 sm:py-8">
                <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5">
                    <p className="text-sm text-foreground leading-relaxed">
                        <span className="font-semibold">{t("cartLimitLabel")}</span>{" "}
                        {t("limitPrefix")}
                        <span className="font-semibold text-primary">{t("mainProduct")}</span>
                        {t("limitMiddle")}
                        <span className="font-semibold text-secondary">{t("alternativeProduct")}</span>
                        {t("limitSuffix")}
                        {!canAddToCart() && (
                            <span className="block mt-1.5 text-muted-foreground">{t("cartFull")}</span>
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
                            {t("swapProducts")}
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold text-foreground">
                            {t("selectedProducts")}
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
                                                    {t("noImage")}
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
                                                    {t("remove")}
                                                </button>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor={`quantity-${item.id}`}
                                                    className="text-sm font-medium"
                                                >
                                                    {t("quantity")}
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
                                                {t("additionalController")}
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
                                                    {t("remove")}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {!isRefurbishedCart && (
                            <Link
                                href="/controllers"
                                className="w-full border-2 border-dashed border-primary/40 rounded-xl py-3.5 text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <Cpu className="h-5 w-5" />
                                {t("addController")}
                            </Link>
                        )}

                        {canAddToCart() && (
                            <button
                                type="button"
                                onClick={() => router.push("/products")}
                                className="w-full border-2 border-dashed border-border/60 rounded-xl py-3.5 text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <Plus className="h-5 w-5" />
                                {cartItems.length === 0
                                    ? t("addMainProduct")
                                    : t("addAlternativeProduct")}
                            </button>
                        )}
                    </div>

                    <div className="lg:sticky lg:top-24 space-y-4">
                        <h2 className="text-base font-semibold text-foreground">{t("requestQuote")}</h2>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="bg-white border border-border/60 rounded-xl p-5 sm:p-6 space-y-5 shadow-sm"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">
                                        {t("yourName")}
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
                                        {t("yourEmail")}
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
                                <Label htmlFor="projectName" className="text-sm font-medium">
                                    {t("projectName")}
                                    <span className="text-muted-foreground font-normal ml-1">
                                        ({t("optional")})
                                    </span>
                                </Label>
                                <Input
                                    id="projectName"
                                    {...register("projectName")}
                                    placeholder={t("projectNamePlaceholder")}
                                    className="text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="message" className="text-sm font-medium">
                                    {t("yourMessage")}
                                    <span className="text-destructive ml-0.5">*</span>
                                </Label>
                                <Textarea
                                    id="message"
                                    {...register("message")}
                                    placeholder={t("messagePlaceholder")}
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
                                        {t("privacyPrefix")}{" "}
                                        <Link
                                            href={privacyPolicyPdfUrl || "#"}
                                            target="_blank"
                                            className={cn(
                                                "font-semibold text-primary hover:text-primary/80",
                                                !privacyPolicyPdfUrl &&
                                                    "pointer-events-none opacity-60"
                                            )}
                                        >
                                            {tCommon("privacyPolicy")}
                                        </Link>{" "}
                                        {t("privacyAnd")}{" "}
                                        <Link
                                            href="/terms-and-conditions"
                                            target="_blank"
                                            className="font-semibold text-primary hover:text-primary/80"
                                        >
                                            {t("termsConditions")}
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
                                        {t("submitting")}
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        {t("submitEnquiry")}
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

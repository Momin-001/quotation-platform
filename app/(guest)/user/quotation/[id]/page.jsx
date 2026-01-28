"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import BreadCrumb from "@/components/BreadCrumb";
import { toast } from "sonner";
import { format } from "date-fns";
import { Send, FileText, ArrowLeft } from "lucide-react";
import Image from "next/image";

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

// Calculate item total
function calculateItemTotal(unitPrice, quantity, taxPercentage, discountPercentage) {
    const basePrice = parseFloat(unitPrice || 0) * parseInt(quantity || 1);
    const taxAmount = basePrice * (parseFloat(taxPercentage || 0) / 100);
    const discountAmount = basePrice * (parseFloat(discountPercentage || 0) / 100);
    return basePrice + taxAmount - discountAmount;
}

// Chat Component
function QuotationChat({ quotationId, chatDisabled, chatDisabledReason, currentUserId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/user/quotations/${quotationId}/messages`);
            const response = await res.json();
            if (response.success) {
                setMessages(response.data.messages || []);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    }, [quotationId]);

    useEffect(() => {
        fetchMessages();
        
        // Poll for new messages every 3 seconds
        pollIntervalRef.current = setInterval(fetchMessages, 3000);
        
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [fetchMessages]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || chatDisabled) return;

        setSending(true);
        try {
            const res = await fetch(`/api/user/quotations/${quotationId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: newMessage.trim() }),
            });
            const response = await res.json();
            if (response.success) {
                setNewMessage("");
                fetchMessages();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Conversation with Admin</h3>
            </div>
            
            {/* Messages Container */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Spinner className="h-6 w-6" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.senderRole === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                    msg.senderRole === "user"
                                        ? "bg-primary text-white"
                                        : "bg-white border shadow-sm"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-semibold ${
                                        msg.senderRole === "user" ? "text-white/80" : "text-gray-600"
                                    }`}>
                                        {msg.senderRole === "user" ? "You" : "Admin"}
                                    </span>
                                    <span className={`text-xs ${
                                        msg.senderRole === "user" ? "text-white/60" : "text-gray-400"
                                    }`}>
                                        {format(new Date(msg.createdAt), "dd MMM, yyyy HH:mm")}
                                    </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
                {chatDisabled ? (
                    <div className="text-center text-sm text-gray-500 py-2">
                        {chatDisabledReason || "Chat is disabled for this quotation"}
                    </div>
                ) : (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Write your message..."
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={sending}
                        />
                        <Button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="px-4"
                        >
                            {sending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

// Product Item Display Component
function ProductItemDisplay({ product, quantity, unitPrice, description, taxPercentage, discountPercentage, badge, badgeColor }) {
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
                        <div className="grid grid-cols-3 gap-6 text-sm">
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
}

export default function QuotationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/login");
                return;
            }
            if (params.id) {
                fetchQuotation();
            }
        }
    }, [isAuthenticated, authLoading, params.id]);

    const fetchQuotation = async () => {
        try {
            const res = await fetch(`/api/user/quotations/${params.id}`);
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch quotation");
            }
            setQuotation(response.data);
        } catch (error) {
            toast.error(error.message);
            router.push("/user/my-quotations");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        if (actionLoading) return;
        
        const confirmMessages = {
            accept: "Are you sure you want to accept this quotation?",
            reject: "Are you sure you want to reject this quotation?",
            request_revision: "Are you sure you want to request a revision?",
        };

        if (!confirm(confirmMessages[action])) return;

        setActionLoading(action);
        try {
            const res = await fetch(`/api/user/quotations/${params.id}/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message);
            }
            toast.success(response.message);
            fetchQuotation(); // Refresh data
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownloadPDF = () => {
        toast.info("PDF download coming soon");
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!quotation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Quotation not found</p>
            </div>
        );
    }

    const { mainProduct, alternativeProduct } = quotation;

    // Format enquiry number
    const formatEnquiryNumber = (id, createdAt) => {
        const number = id?.slice(-4).toUpperCase() || "0000";
        return `Enquiry#${number}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb 
                title="Quotation Details" 
                breadcrumbs={[
                    { label: "Home", href: "/" }, 
                    { label: "Quotations", href: "/user/my-quotations" },
                    { label: quotation.quotationNumber }
                ]} 
            />
            
            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Back Button */}
                <Button 
                    onClick={() => router.push("/user/my-quotations")} 
                    variant="ghost" 
                    className="p-0!"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Quotations
                </Button>

                {/* Header Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-primary font-medium">
                        {formatEnquiryNumber(quotation.enquiry?.id || "", quotation.createdAt)}
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Quotation {quotation.quotationNumber}
                    </h1>
                    {quotation.description && (
                        <p className="text-gray-600">{quotation.description}</p>
                    )}
                </div>

                {/* Project Info */}
                <div className="grid grid-cols-3 gap-4 bg-white rounded-lg border p-4">
                    <div>
                        <p className="text-sm text-gray-500">Project</p>
                        <p className="font-medium">{quotation.description || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium">{formatCurrency(quotation.calculatedTotal || 0)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Valid Until</p>
                        <p className="font-medium">
                            {format(new Date(new Date(quotation.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000), "MMM dd, yyyy")}
                        </p>
                    </div>
                </div>

                {/* Main Product Section */}
                {mainProduct && (
                    <div className="bg-blue-50/30 rounded-xl border-2 border-blue-200 p-6">
                        <h2 className="text-xl font-bold text-blue-700 mb-4">Main Product</h2>
                        
                        <ProductItemDisplay
                            product={mainProduct.product}
                            quantity={mainProduct.quantity}
                            unitPrice={mainProduct.unitPrice}
                            description={mainProduct.description}
                            taxPercentage={mainProduct.taxPercentage}
                            discountPercentage={mainProduct.discountPercentage}
                        />

                        {/* Main Product Optional Items */}
                        {mainProduct.optionalItems && mainProduct.optionalItems.length > 0 && (
                            <div className="mt-4 ml-8 border-l-2 border-blue-200 pl-4 space-y-2">
                                <h5 className="text-sm font-semibold text-blue-600">Optional Products</h5>
                                {mainProduct.optionalItems.map((opt) => (
                                    <div key={opt.id} className="bg-blue-50 rounded-lg px-3 py-2">
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
                        <div className="mt-6 pt-4 border-t border-blue-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm text-blue-600 font-medium">Option 1</span>
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
                    </div>
                )}

                {/* Alternative Product Section */}
                {alternativeProduct && (
                    <div className="bg-green-50/30 rounded-xl border-2 border-green-200 p-6">
                        <h2 className="text-xl font-bold text-green-700 mb-4">Alternative Product</h2>
                        
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
                            <div className="mt-4 ml-8 border-l-2 border-green-200 pl-4 space-y-2">
                                <h5 className="text-sm font-semibold text-green-600">Optional Products</h5>
                                {alternativeProduct.optionalItems.map((opt) => (
                                    <div key={opt.id} className="bg-green-50 rounded-lg px-3 py-2">
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
                        <div className="mt-6 pt-4 border-t border-green-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm text-green-600 font-medium">Option 2</span>
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

                {/* Action Buttons */}
                <div className="bg-white rounded-lg border shadow-sm p-4">
                    <h3 className="text-lg font-semibold mb-4">Actions</h3>
                    <div className="flex flex-wrap items-center gap-3">
                        {quotation.status === "pending" ? (
                            <>
                                <Button
                                    onClick={() => handleAction("accept")}
                                    disabled={actionLoading !== null}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {actionLoading === "accept" ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                    Accept
                                </Button>
                                <Button
                                    onClick={() => handleAction("reject")}
                                    disabled={actionLoading !== null}
                                    variant="destructive"
                                >
                                    {actionLoading === "reject" ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => handleAction("request_revision")}
                                    disabled={actionLoading !== null}
                                    className="bg-yellow-500 hover:bg-yellow-600"
                                >
                                    {actionLoading === "request_revision" ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                    Request Revision
                                </Button>
                            </>
                        ) : (
                            <div className="text-sm text-gray-600">
                                Status: <span className="font-semibold capitalize">{quotation.status.replace("_", " ")}</span>
                            </div>
                        )}
                        <Button
                            onClick={handleDownloadPDF}
                            variant="outline"
                            className="ml-auto"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Chat Section */}
                <QuotationChat
                    quotationId={params.id}
                    chatDisabled={quotation.chatDisabled}
                    chatDisabledReason={quotation.chatDisabledReason}
                    currentUserId={user?.id}
                />
            </div>
        </div>
    );
}

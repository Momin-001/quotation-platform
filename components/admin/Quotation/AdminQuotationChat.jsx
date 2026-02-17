import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { Wifi, WifiOff, Send } from "lucide-react";

export default function AdminQuotationChat({ quotationId, chatDisabled, chatDisabledReason }) {
    const { user } = useAuth();
    const { 
        isConnected, 
        connectionError,
        joinRoom, 
        leaveRoom, 
        sendMessage: socketSendMessage, 
        onNewMessage,
        onUserTyping,
        startTyping,
        stopTyping 
    } = useSocket();
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
    
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lastTypingRef = useRef(false);

    // Fetch initial messages from API
    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/quotations/${quotationId}/messages`);
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

    // Fetch initial messages on mount
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Join socket room when connected
    useEffect(() => {
        if (isConnected && user && quotationId && !chatDisabled) {
            joinRoom(quotationId, user.id, "admin");
            setHasJoinedRoom(true);
        }

        return () => {
            if (hasJoinedRoom) {
                leaveRoom(quotationId);
                setHasJoinedRoom(false);
            }
        };
    }, [isConnected, user, quotationId, chatDisabled, joinRoom, leaveRoom, hasJoinedRoom]);

    // Listen for new messages via Socket.IO
    useEffect(() => {
        const unsubscribe = onNewMessage((message) => {
            if (message.quotationId === quotationId) {
                setMessages((prev) => {
                    // Check if message already exists (avoid duplicates)
                    const exists = prev.some((m) => m.id === message.id);
                    if (exists) return prev;
                    return [...prev, message];
                });
            }
        });

        return unsubscribe;
    }, [onNewMessage, quotationId]);

    // Listen for typing indicator
    useEffect(() => {
        const unsubscribe = onUserTyping((data) => {
            // Only show typing for user (customer), not admin
            if (data.userRole === "user") {
                if (data.isTyping) {
                    setTypingUser(data);
                } else {
                    setTypingUser(null);
                }
            }
        });

        return unsubscribe;
    }, [onUserTyping]);

    // Clear typing user after 3 seconds of no typing events
    useEffect(() => {
        if (typingUser) {
            const timeout = setTimeout(() => {
                setTypingUser(null);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [typingUser]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle input change with typing indicator
    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        // Send typing indicator
        if (isConnected && user && !chatDisabled) {
            if (value.trim() && !lastTypingRef.current) {
                startTyping(quotationId, user.id, "admin");
                lastTypingRef.current = true;
            }

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to stop typing indicator
            typingTimeoutRef.current = setTimeout(() => {
                if (lastTypingRef.current) {
                    stopTyping(quotationId, user.id, "admin");
                    lastTypingRef.current = false;
                }
            }, 1500);
        }
    };

    // Handle send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || chatDisabled) return;

        const messageText = newMessage.trim();
        setNewMessage("");
        setSending(true);

        // Stop typing indicator
        if (lastTypingRef.current) {
            stopTyping(quotationId, user.id, "admin");
            lastTypingRef.current = false;
        }

        try {
            // Save to database via API
            const res = await fetch(`/api/admin/quotations/${quotationId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: messageText }),
            });
            const response = await res.json();

            if (response.success) {
                // Broadcast via Socket.IO for real-time delivery
                socketSendMessage({
                    quotationId,
                    message: messageText,
                    messageId: response.data.id,
                    senderId: user.id,
                    senderRole: "admin",
                    createdAt: response.data.createdAt,
                });
            } else {
                toast.error(response.message || "Failed to send message");
                setNewMessage(messageText); // Restore message on error
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
            setNewMessage(messageText); // Restore message on error
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            {/* Header with connection status */}
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Conversation with Customer</h3>
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <Wifi className="h-3 w-3" />
                            Live
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            <WifiOff className="h-3 w-3" />
                            Connecting...
                        </span>
                    )}
                </div>
            </div>

            {/* Connection error banner */}
            {connectionError && (
                <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
                    {connectionError}
                </div>
            )}
            
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
                            className={`flex ${msg.senderRole === "admin" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                    msg.senderRole === "admin"
                                        ? "bg-primary text-white"
                                        : "bg-white border shadow-sm"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-semibold ${
                                        msg.senderRole === "admin" ? "text-white/80" : "text-gray-600"
                                    }`}>
                                        {msg.senderRole === "admin" ? "You (Admin)" : "Customer"}
                                    </span>
                                    <span className={`text-xs ${
                                        msg.senderRole === "admin" ? "text-white/60" : "text-gray-400"
                                    }`}>
                                        {format(new Date(msg.createdAt), "dd MMM, yyyy HH:mm")}
                                    </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        </div>
                    ))
                )}
                
                {/* Typing indicator */}
                {typingUser && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-lg px-4 py-2">
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-600">Customer is typing</span>
                                <span className="flex gap-0.5">
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                </span>
                            </div>
                        </div>
                    </div>
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
                            onChange={handleInputChange}
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
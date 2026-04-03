import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { Send, Wifi, WifiOff } from "lucide-react";

export default function UserQuotationChat({ quotationId, chatDisabled, chatDisabledReason, currentUserId, currentUserName }) {
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

    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lastTypingRef = useRef(false);

    // Fetch initial messages from API
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

    // Fetch initial messages on mount
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Join socket room when connected
    useEffect(() => {
        if (isConnected && currentUserId && quotationId && !chatDisabled) {
            joinRoom(quotationId, currentUserId, "user");
            setHasJoinedRoom(true);
        }

        return () => {
            if (hasJoinedRoom) {
                leaveRoom(quotationId);
                setHasJoinedRoom(false);
            }
        };
    }, [isConnected, currentUserId, quotationId, chatDisabled, joinRoom, leaveRoom, hasJoinedRoom]);

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
            // Only show typing for admin, not user
            if (data.userRole === "admin") {
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
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle input change with typing indicator
    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        // Send typing indicator
        if (isConnected && currentUserId && !chatDisabled) {
            if (value.trim() && !lastTypingRef.current) {
                startTyping(quotationId, currentUserId, "user");
                lastTypingRef.current = true;
            }

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to stop typing indicator
            typingTimeoutRef.current = setTimeout(() => {
                if (lastTypingRef.current) {
                    stopTyping(quotationId, currentUserId, "user");
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
            stopTyping(quotationId, currentUserId, "user");
            lastTypingRef.current = false;
        }

        try {
            // Save to database via API
            const res = await fetch(`/api/user/quotations/${quotationId}/messages`, {
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
                    senderId: currentUserId,
                    senderRole: "user",
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

    function getInitials(name = "") {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }

    return (
        <div className="px-4">
            {/* Header with connection status */}
            <div className="pb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold font-open-sans">Conversation with Admin</h3>
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
         <div
  ref={messagesContainerRef}
  className="h-80 overflow-y-auto p-6 space-y-6 rounded-lg border bg-primary-foreground/80"
>
  {loading ? (
    <div className="flex items-center justify-center h-full">
      <Spinner className="h-6 w-6" />
    </div>
  ) : messages.length === 0 ? (
    <div className="flex items-center justify-center h-full text-gray-500">
      No messages yet. Start the conversation!
    </div>
  ) : (
    messages.map((msg) => {
      const isUser = msg.senderRole === "user";

      const name = isUser ? currentUserName : "Admin"; // you can replace with real name later
      const avatar = msg.avatar; // optional if backend sends it

      return (
        <div
          key={msg.id}
          className={`flex items-start gap-3 ${
            isUser ? "justify-end text-right" : "justify-start"
          }`}
        >
          {/* LEFT AVATAR (ADMIN) */}
          {!isUser && (
            avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                {getInitials(name)}
              </div>
            )
          )}

          {/* MESSAGE CONTENT */}
          <div className="max-w-[70%] font-open-sans">
            <div
              className={`flex flex-col items-center gap-1 mb-2 ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              <span className="text-sm font-bold text-gray-900">
                {name}
              </span>
              <span className="text-xs">
                {format(new Date(msg.createdAt), "dd MMM, yyyy HH:mm")}
              </span>
            </div>

            <p className="text-xs leading-relaxed whitespace-pre-wrap">
              {msg.message}
            </p>
          </div>

          {/* RIGHT AVATAR (USER) */}
          {isUser && (
            avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                {getInitials(name)}
              </div>
            )
          )}
        </div>
      );
    })
  )}

  {/* Typing indicator */}
  {typingUser && (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
        A
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        Admin is typing
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )}
</div>

            {/* Message Input */}
            <div className="py-4">
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
                                className="flex-1 px-4 py-3 border border-black/40 placeholder:text-gray-500 placeholder:font-archivo placeholder:text-sm placeholder:font-medium rounded-md focus:outline-none"
                                disabled={sending}
                            />
                            <Button
                                type="submit"
                                size="lg"
                                disabled={sending || !newMessage.trim()}
                                className="px-4"
                            >
                                {sending ? <Spinner className="h-4 w-4" /> :
                                    <span>Send</span>
                                }
                            </Button>
                        </form>
                    )}
                </div>
        </div>
    );
}
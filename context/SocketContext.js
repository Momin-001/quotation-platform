"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";

// Socket context
const SocketContext = createContext(null);

// Custom hook to use socket context
export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}

// Socket Provider Component
export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    // Initialize socket connection
    useEffect(() => {
        const socketInstance = io({
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            transports: ["websocket", "polling"], // Prefer WebSocket, fallback to polling
        });

        // Connection established
        socketInstance.on("connect", () => {
            console.log("[Socket] Connected:", socketInstance.id);
            setIsConnected(true);
            setConnectionError(null);
            reconnectAttempts.current = 0;
        });

        // Connection lost
        socketInstance.on("disconnect", (reason) => {
            console.log("[Socket] Disconnected:", reason);
            setIsConnected(false);

            // If the server disconnected us, try to reconnect
            if (reason === "io server disconnect") {
                socketInstance.connect();
            }
        });

        // Connection error
        socketInstance.on("connect_error", (error) => {
            console.error("[Socket] Connection error:", error.message);
            reconnectAttempts.current += 1;
            
            if (reconnectAttempts.current >= maxReconnectAttempts) {
                setConnectionError("Unable to connect to chat server. Please refresh the page.");
            }
        });

        // Reconnection attempt
        socketInstance.on("reconnect_attempt", (attempt) => {
            console.log("[Socket] Reconnection attempt:", attempt);
        });

        // Reconnection successful
        socketInstance.on("reconnect", (attempt) => {
            console.log("[Socket] Reconnected after", attempt, "attempts");
            setIsConnected(true);
            setConnectionError(null);
        });

        // Reconnection failed
        socketInstance.on("reconnect_failed", () => {
            console.error("[Socket] Reconnection failed");
            setConnectionError("Failed to reconnect to chat server. Please refresh the page.");
        });

        // Server error
        socketInstance.on("error", (error) => {
            console.error("[Socket] Server error:", error);
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            console.log("[Socket] Cleaning up connection");
            socketInstance.removeAllListeners();
            socketInstance.disconnect();
        };
    }, []);

    // Join a quotation chat room
    const joinRoom = useCallback((quotationId, userId, userRole) => {
        if (socket && isConnected) {
            socket.emit("join-room", { quotationId, userId, userRole });
            console.log("[Socket] Joining room for quotation:", quotationId);
        }
    }, [socket, isConnected]);

    // Leave a quotation chat room
    const leaveRoom = useCallback((quotationId) => {
        if (socket) {
            socket.emit("leave-room", { quotationId });
            console.log("[Socket] Leaving room for quotation:", quotationId);
        }
    }, [socket]);

    // Send a chat message
    const sendMessage = useCallback((data) => {
        if (socket && isConnected) {
            socket.emit("send-message", data);
        } else {
            console.warn("[Socket] Cannot send message - not connected");
        }
    }, [socket, isConnected]);

    // Start typing indicator
    const startTyping = useCallback((quotationId, userId, userRole) => {
        if (socket && isConnected) {
            socket.emit("typing-start", { quotationId, userId, userRole });
        }
    }, [socket, isConnected]);

    // Stop typing indicator
    const stopTyping = useCallback((quotationId, userId, userRole) => {
        if (socket && isConnected) {
            socket.emit("typing-stop", { quotationId, userId, userRole });
        }
    }, [socket, isConnected]);

    // Mark messages as read
    const markMessagesRead = useCallback((quotationId, userId, userRole) => {
        if (socket && isConnected) {
            socket.emit("messages-read", { quotationId, userId, userRole });
        }
    }, [socket, isConnected]);

    // Subscribe to new messages
    const onNewMessage = useCallback((callback) => {
        if (!socket) return () => {};

        socket.on("new-message", callback);
        return () => socket.off("new-message", callback);
    }, [socket]);

    // Subscribe to typing indicator
    const onUserTyping = useCallback((callback) => {
        if (!socket) return () => {};

        socket.on("user-typing", callback);
        return () => socket.off("user-typing", callback);
    }, [socket]);

    // Subscribe to user joined
    const onUserJoined = useCallback((callback) => {
        if (!socket) return () => {};

        socket.on("user-joined", callback);
        return () => socket.off("user-joined", callback);
    }, [socket]);

    // Subscribe to user left
    const onUserLeft = useCallback((callback) => {
        if (!socket) return () => {};

        socket.on("user-left", callback);
        return () => socket.off("user-left", callback);
    }, [socket]);

    // Subscribe to room joined confirmation
    const onRoomJoined = useCallback((callback) => {
        if (!socket) return () => {};

        socket.on("room-joined", callback);
        return () => socket.off("room-joined", callback);
    }, [socket]);

    // Subscribe to messages read notification
    const onMessagesRead = useCallback((callback) => {
        if (!socket) return () => {};

        socket.on("messages-marked-read", callback);
        return () => socket.off("messages-marked-read", callback);
    }, [socket]);

    const value = {
        socket,
        isConnected,
        connectionError,
        joinRoom,
        leaveRoom,
        sendMessage,
        startTyping,
        stopTyping,
        markMessagesRead,
        onNewMessage,
        onUserTyping,
        onUserJoined,
        onUserLeft,
        onRoomJoined,
        onMessagesRead,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}

async function fetchSocketToken() {
    const res = await fetch("/api/auth/socket-token");
    const data = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to get socket token");
    }

    return data.data.token;
}

export function SocketProvider({ children }) {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const socketRef = useRef(null);

    useEffect(() => {
        // Wait until auth state is resolved before deciding what to do.
        if (authLoading) return;

        // Not logged in: make sure any old socket is torn down and clear errors.
        if (!isAuthenticated) {
            setConnectionError(null);
            setIsConnected(false);
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setSocket(null);
            return;
        }

        let cancelled = false;

        async function connect() {
            try {
                const token = await fetchSocketToken();
                if (cancelled) return;

                const socketInstance = io(SOCKET_URL, {
                    auth: { token },
                    autoConnect: true,
                    reconnection: true,
                    reconnectionAttempts: maxReconnectAttempts,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    timeout: 20000,
                    transports: ["websocket", "polling"],
                });

                socketRef.current = socketInstance;

                socketInstance.on("connect", () => {
                    setIsConnected(true);
                    setConnectionError(null);
                    reconnectAttempts.current = 0;
                });

                socketInstance.on("disconnect", (reason) => {
                    setIsConnected(false);

                    if (reason === "io server disconnect") {
                        refreshConnection();
                    }
                });

                socketInstance.on("connect_error", async () => {
                    reconnectAttempts.current += 1;

                    if (reconnectAttempts.current >= maxReconnectAttempts) {
                        setConnectionError(
                            "Unable to connect to chat server. Please refresh the page."
                        );
                    }
                });

                socketInstance.io.on("reconnect_attempt", async () => {
                    try {
                        const newToken = await fetchSocketToken();
                        socketInstance.auth = { token: newToken };
                    } catch {
                        // token refresh failed; reconnect may fail
                    }
                });

                socketInstance.on("reconnect", () => {
                    setIsConnected(true);
                    setConnectionError(null);
                });

                socketInstance.on("reconnect_failed", () => {
                    setConnectionError(
                        "Failed to reconnect to chat server. Please refresh the page."
                    );
                });

                setSocket(socketInstance);
            } catch {
                if (!cancelled) {
                    setConnectionError(
                        "Unable to connect to chat server. Please log in and refresh the page."
                    );
                }
            }
        }

        async function refreshConnection() {
            try {
                const token = await fetchSocketToken();
                if (socketRef.current) {
                    socketRef.current.auth = { token };
                    socketRef.current.connect();
                }
            } catch {
                setConnectionError(
                    "Session expired. Please refresh the page."
                );
            }
        }

        connect();

        return () => {
            cancelled = true;
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, authLoading]);

    const joinRoom = useCallback(
        (quotationId, userId, userRole) => {
            if (socket && isConnected) {
                socket.emit("join-room", { quotationId, userId, userRole });
            }
        },
        [socket, isConnected]
    );

    const leaveRoom = useCallback(
        (quotationId) => {
            if (socket) {
                socket.emit("leave-room", { quotationId });
            }
        },
        [socket]
    );

    const startTyping = useCallback(
        (quotationId, userId, userRole) => {
            if (socket && isConnected) {
                socket.emit("typing-start", { quotationId, userId, userRole });
            }
        },
        [socket, isConnected]
    );

    const stopTyping = useCallback(
        (quotationId, userId, userRole) => {
            if (socket && isConnected) {
                socket.emit("typing-stop", { quotationId, userId, userRole });
            }
        },
        [socket, isConnected]
    );

    const markMessagesRead = useCallback(
        (quotationId, userId, userRole) => {
            if (socket && isConnected) {
                socket.emit("messages-read", { quotationId, userId, userRole });
            }
        },
        [socket, isConnected]
    );

    const onNewMessage = useCallback(
        (callback) => {
            if (!socket) return () => {};

            socket.on("new-message", callback);
            return () => socket.off("new-message", callback);
        },
        [socket]
    );

    const onUserTyping = useCallback(
        (callback) => {
            if (!socket) return () => {};

            socket.on("user-typing", callback);
            return () => socket.off("user-typing", callback);
        },
        [socket]
    );

    const onUserJoined = useCallback(
        (callback) => {
            if (!socket) return () => {};

            socket.on("user-joined", callback);
            return () => socket.off("user-joined", callback);
        },
        [socket]
    );

    const onUserLeft = useCallback(
        (callback) => {
            if (!socket) return () => {};

            socket.on("user-left", callback);
            return () => socket.off("user-left", callback);
        },
        [socket]
    );

    const onRoomJoined = useCallback(
        (callback) => {
            if (!socket) return () => {};

            socket.on("room-joined", callback);
            return () => socket.off("room-joined", callback);
        },
        [socket]
    );

    const onMessagesRead = useCallback(
        (callback) => {
            if (!socket) return () => {};

            socket.on("messages-marked-read", callback);
            return () => socket.off("messages-marked-read", callback);
        },
        [socket]
    );

    const value = {
        socket,
        isConnected,
        connectionError,
        joinRoom,
        leaveRoom,
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
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
}

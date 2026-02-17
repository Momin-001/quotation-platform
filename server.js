import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store active connections for each quotation room
const quotationRooms = new Map();

// Store user socket mappings
const userSockets = new Map();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // Initialize Socket.IO with the HTTP server
    const io = new Server(httpServer, {
        cors: {
            origin: dev ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
        // Connection state recovery for reconnection
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
            skipMiddlewares: true,
        },
    });

    // Make io available globally for potential use in API routes
    global.io = io;

    // Socket.IO connection handling
    io.on("connection", (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);

        // Handle joining a quotation chat room
        socket.on("join-room", (data) => {
            try {
                const { quotationId, userId, userRole } = data;

                if (!quotationId || !userId || !userRole) {
                    socket.emit("error", { message: "Missing required data to join room" });
                    return;
                }

                const roomName = `quotation:${quotationId}`;

                // Join the room
                socket.join(roomName);

                // Store socket metadata
                socket.data = { quotationId, userId, userRole, roomName };

                // Track user socket
                userSockets.set(socket.id, { quotationId, userId, userRole });

                // Track room participants
                if (!quotationRooms.has(roomName)) {
                    quotationRooms.set(roomName, new Map());
                }
                quotationRooms.get(roomName).set(socket.id, { userId, userRole });

                console.log(`[Socket.IO] User ${userId} (${userRole}) joined room ${roomName}`);

                // Notify others in the room that someone joined
                socket.to(roomName).emit("user-joined", {
                    userId,
                    userRole,
                    timestamp: new Date().toISOString(),
                });

                // Send acknowledgment to the joining user
                socket.emit("room-joined", {
                    roomName,
                    participants: Array.from(quotationRooms.get(roomName).values()),
                });
            } catch (error) {
                console.error("[Socket.IO] Error joining room:", error);
                socket.emit("error", { message: "Failed to join room" });
            }
        });

        // Handle leaving a quotation chat room
        socket.on("leave-room", (data) => {
            try {
                const { quotationId } = data;
                const roomName = `quotation:${quotationId}`;

                socket.leave(roomName);

                // Clean up room tracking
                if (quotationRooms.has(roomName)) {
                    quotationRooms.get(roomName).delete(socket.id);
                    if (quotationRooms.get(roomName).size === 0) {
                        quotationRooms.delete(roomName);
                    }
                }

                // Notify others
                socket.to(roomName).emit("user-left", {
                    userId: socket.data?.userId,
                    userRole: socket.data?.userRole,
                    timestamp: new Date().toISOString(),
                });

                console.log(`[Socket.IO] User left room ${roomName}`);
            } catch (error) {
                console.error("[Socket.IO] Error leaving room:", error);
            }
        });

        // Handle new chat message
        socket.on("send-message", (data) => {
            try {
                const { quotationId, message, messageId, senderId, senderRole, createdAt } = data;

                if (!quotationId || !message || !senderId || !senderRole) {
                    socket.emit("error", { message: "Missing required message data" });
                    return;
                }

                const roomName = `quotation:${quotationId}`;

                // Broadcast message to everyone in the room (including sender for confirmation)
                io.to(roomName).emit("new-message", {
                    id: messageId,
                    quotationId,
                    senderId,
                    senderRole,
                    message,
                    isRead: 0,
                    createdAt: createdAt || new Date().toISOString(),
                });

                console.log(`[Socket.IO] Message sent in room ${roomName} by ${senderRole}`);
            } catch (error) {
                console.error("[Socket.IO] Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Handle typing indicator
        socket.on("typing-start", (data) => {
            const { quotationId, userId, userRole } = data;
            const roomName = `quotation:${quotationId}`;

            socket.to(roomName).emit("user-typing", {
                userId,
                userRole,
                isTyping: true,
            });
        });

        socket.on("typing-stop", (data) => {
            const { quotationId, userId, userRole } = data;
            const roomName = `quotation:${quotationId}`;

            socket.to(roomName).emit("user-typing", {
                userId,
                userRole,
                isTyping: false,
            });
        });

        // Handle message read status
        socket.on("messages-read", (data) => {
            const { quotationId, userId, userRole } = data;
            const roomName = `quotation:${quotationId}`;

            socket.to(roomName).emit("messages-marked-read", {
                userId,
                userRole,
                timestamp: new Date().toISOString(),
            });
        });

        // Handle disconnection
        socket.on("disconnect", (reason) => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}, reason: ${reason}`);

            const userData = userSockets.get(socket.id);
            if (userData) {
                const roomName = `quotation:${userData.quotationId}`;

                // Clean up room tracking
                if (quotationRooms.has(roomName)) {
                    quotationRooms.get(roomName).delete(socket.id);
                    if (quotationRooms.get(roomName).size === 0) {
                        quotationRooms.delete(roomName);
                    } else {
                        // Notify others that user disconnected
                        io.to(roomName).emit("user-left", {
                            userId: userData.userId,
                            userRole: userData.userRole,
                            timestamp: new Date().toISOString(),
                        });
                    }
                }

                userSockets.delete(socket.id);
            }
        });

        // Handle connection errors
        socket.on("error", (error) => {
            console.error(`[Socket.IO] Socket error for ${socket.id}:`, error);
        });
    });

    // Handle server-level errors
    io.on("error", (error) => {
        console.error("[Socket.IO] Server error:", error);
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Socket.IO server is running`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
        console.log("SIGTERM received, shutting down gracefully");
        io.close(() => {
            console.log("Socket.IO server closed");
            httpServer.close(() => {
                console.log("HTTP server closed");
                process.exit(0);
            });
        });
    });
});

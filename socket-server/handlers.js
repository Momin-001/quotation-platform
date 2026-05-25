import { canJoinQuotationRoom } from "./lib/room-access.js";

export function registerSocketHandlers(io) {
    const quotationRooms = new Map();
    const userSockets = new Map();

    io.on("connection", (socket) => {
        socket.on("join-room", async (data) => {
            try {
                const { quotationId, userId, userRole } = data;
                const authUser = socket.data.user;

                if (!quotationId || !userId || !userRole) {
                    socket.emit("error", { message: "Missing required data to join room" });
                    return;
                }

                if (!authUser || authUser.id !== userId) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }

                const effectiveRole =
                    authUser.role === "super_admin" ? "admin" : authUser.role;

                if (userRole !== effectiveRole) {
                    socket.emit("error", { message: "Role mismatch" });
                    return;
                }

                const hasAccess = await canJoinQuotationRoom(
                    userId,
                    authUser.role,
                    quotationId
                );

                if (!hasAccess) {
                    socket.emit("error", { message: "Access denied to this quotation" });
                    return;
                }

                const roomName = `quotation:${quotationId}`;

                socket.join(roomName);
                socket.data.quotationId = quotationId;
                socket.data.userId = userId;
                socket.data.userRole = userRole;
                socket.data.roomName = roomName;

                userSockets.set(socket.id, { quotationId, userId, userRole });

                if (!quotationRooms.has(roomName)) {
                    quotationRooms.set(roomName, new Map());
                }
                quotationRooms.get(roomName).set(socket.id, { userId, userRole });

                socket.to(roomName).emit("user-joined", {
                    userId,
                    userRole,
                    timestamp: new Date().toISOString(),
                });

                socket.emit("room-joined", {
                    roomName,
                    participants: Array.from(quotationRooms.get(roomName).values()),
                });
            } catch {
                socket.emit("error", { message: "Failed to join room" });
            }
        });

        socket.on("leave-room", (data) => {
            try {
                const { quotationId } = data;
                const roomName = `quotation:${quotationId}`;

                socket.leave(roomName);

                if (quotationRooms.has(roomName)) {
                    quotationRooms.get(roomName).delete(socket.id);
                    if (quotationRooms.get(roomName).size === 0) {
                        quotationRooms.delete(roomName);
                    }
                }

                socket.to(roomName).emit("user-left", {
                    userId: socket.data?.userId,
                    userRole: socket.data?.userRole,
                    timestamp: new Date().toISOString(),
                });
            } catch {
                // ignore
            }
        });

        socket.on("typing-start", (data) => {
            const { quotationId, userId, userRole } = data;
            if (socket.data.user?.id !== userId) return;

            const roomName = `quotation:${quotationId}`;
            socket.to(roomName).emit("user-typing", {
                userId,
                userRole,
                isTyping: true,
            });
        });

        socket.on("typing-stop", (data) => {
            const { quotationId, userId, userRole } = data;
            if (socket.data.user?.id !== userId) return;

            const roomName = `quotation:${quotationId}`;
            socket.to(roomName).emit("user-typing", {
                userId,
                userRole,
                isTyping: false,
            });
        });

        socket.on("messages-read", (data) => {
            const { quotationId, userId, userRole } = data;
            if (socket.data.user?.id !== userId) return;

            const roomName = `quotation:${quotationId}`;
            socket.to(roomName).emit("messages-marked-read", {
                userId,
                userRole,
                timestamp: new Date().toISOString(),
            });
        });

        socket.on("send-message", () => {
            socket.emit("error", {
                message: "Sending messages via socket is not allowed. Use the API.",
            });
        });

        socket.on("disconnect", () => {
            const userData = userSockets.get(socket.id);
            if (userData) {
                const roomName = `quotation:${userData.quotationId}`;

                if (quotationRooms.has(roomName)) {
                    quotationRooms.get(roomName).delete(socket.id);
                    if (quotationRooms.get(roomName).size === 0) {
                        quotationRooms.delete(roomName);
                    } else {
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

        socket.on("error", () => {
            // ignore
        });
    });
}

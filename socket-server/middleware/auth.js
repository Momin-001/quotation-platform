import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function createAuthMiddleware() {
    return async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, JWT_SECRET);

            if (!decoded?.id || !decoded?.role) {
                return next(new Error("Invalid token payload"));
            }

            if (decoded.purpose !== "socket") {
                return next(new Error("Invalid token purpose"));
            }

            socket.data.user = {
                id: decoded.id,
                role: decoded.role,
            };

            next();
        } catch {
            next(new Error("Authentication failed"));
        }
    };
}

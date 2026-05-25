import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAuthMiddleware } from "./middleware/auth.js";
import { registerSocketHandlers } from "./handlers.js";
import { createInternalHttpHandler } from "./http/internal.js";

const port = parseInt(process.env.SOCKET_PORT || "3001", 10);
const corsOrigin =
    process.env.SOCKET_CORS_ORIGIN ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"],
        credentials: true,
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    },
});

io.use(createAuthMiddleware());
registerSocketHandlers(io);

const internalHandler = createInternalHttpHandler(io);

httpServer.on("request", (req, res) => {
    if (req.url === "/internal/emit" || req.url?.startsWith("/internal/emit")) {
        internalHandler(req, res);
        return;
    }

    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Not found" }));
});

httpServer.listen(port, () => {
    console.log(`Socket server listening on port ${port}`);
});

process.on("SIGTERM", () => {
    io.close(() => {
        httpServer.close(() => {
            process.exit(0);
        });
    });
});

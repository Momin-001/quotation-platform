export function createInternalHttpHandler(io) {
    const secret = process.env.SOCKET_INTERNAL_SECRET;

    return async (req, res) => {
        if (req.method !== "POST" || req.url !== "/internal/emit") {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "Not found" }));
            return;
        }

        if (!secret) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "Server misconfigured" }));
            return;
        }

        const headerSecret = req.headers["x-socket-secret"];
        if (headerSecret !== secret) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "Unauthorized" }));
            return;
        }

        try {
            const body = await readJsonBody(req);
            const { room, event, payload } = body;

            if (!room || !event) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, message: "room and event are required" }));
                return;
            }

            io.to(room).emit(event, payload);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
        } catch {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "Failed to emit event" }));
        }
    };
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
        });
        req.on("end", () => {
            try {
                resolve(JSON.parse(data || "{}"));
            } catch (err) {
                reject(err);
            }
        });
        req.on("error", reject);
    });
}

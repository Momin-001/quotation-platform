const SOCKET_SERVER_URL =
    process.env.SOCKET_SERVER_URL || "http://127.0.0.1:3001";

export function buildNewMessagePayload(message) {
    return {
        id: message.id,
        quotationId: message.quotationId,
        senderId: message.senderId,
        senderRole: message.senderRole,
        message: message.message,
        isRead: message.isRead ?? 0,
        createdAt: message.createdAt,
    };
}

export async function emitToQuotationRoom(quotationId, event, payload) {
    const secret = process.env.SOCKET_INTERNAL_SECRET;

    if (!secret) {
        console.error("SOCKET_INTERNAL_SECRET is not configured");
        return false;
    }

    try {
        const res = await fetch(`${SOCKET_SERVER_URL}/internal/emit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-socket-secret": secret,
            },
            body: JSON.stringify({
                room: `quotation:${quotationId}`,
                event,
                payload,
            }),
        });

        if (!res.ok) {
            console.error(`Socket emit failed: ${res.status}`);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Socket emit error:", err);
        return false;
    }
}

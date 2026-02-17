import { db } from "@/lib/db";
import { controllers } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

// GET /api/admin/controllers/[id] - Fetch a single controller
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const controller = await db
            .select()
            .from(controllers)
            .where(eq(controllers.id, id))
            .limit(1)
            .then((res) => res[0]);

        if (!controller) {
            return errorResponse("Controller not found", 404);
        }

        return successResponse("Controller fetched successfully", controller);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch controller");
    }
}

// PUT /api/admin/controllers/[id] - Update a controller
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validate required fields
        if (!body.productName?.trim()) {
            return errorResponse("Product name is required", 400);
        }

        const existing = await db
            .select()
            .from(controllers)
            .where(eq(controllers.id, id))
            .limit(1)
            .then((res) => res[0]);

        if (!existing) {
            return errorResponse("Controller not found", 404);
        }

        const updateData = {
            productName: body.productName.trim(),
            brandName: body.brandName?.trim() || null,
            interfaceName: body.interfaceName?.trim() || null,
            pixelCapacity: body.pixelCapacity ? parseInt(body.pixelCapacity) : null,
            maxWidthHeight: body.maxWidthHeight ? parseInt(body.maxWidthHeight) : null,

            dp12: body.dp12 ? parseInt(body.dp12) : 0,
            hdmi20: body.hdmi20 ? parseInt(body.hdmi20) : 0,
            hdmi13: body.hdmi13 ? parseInt(body.hdmi13) : 0,
            dviSingleLink: body.dviSingleLink ? parseInt(body.dviSingleLink) : 0,
            sdi12g: body.sdi12g ? parseInt(body.sdi12g) : 0,
            sdi3g: body.sdi3g ? parseInt(body.sdi3g) : 0,
            opticalFiberIn10g: body.opticalFiberIn10g ? parseInt(body.opticalFiberIn10g) : 0,
            usb30MediaPlayback: body.usb30MediaPlayback ? parseInt(body.usb30MediaPlayback) : 0,

            gigabitEthernetRj45: body.gigabitEthernetRj45 ? parseInt(body.gigabitEthernetRj45) : 0,
            opticalFiberOut10g: body.opticalFiberOut10g ? parseInt(body.opticalFiberOut10g) : 0,
            output5g: body.output5g?.trim() || null,

            hdmi13Monitoring: body.hdmi13Monitoring ? parseInt(body.hdmi13Monitoring) : 0,
            connector3dMiniDin4: body.connector3dMiniDin4 ? parseInt(body.connector3dMiniDin4) : 0,

            hdmi20Loop: body.hdmi20Loop ? parseInt(body.hdmi20Loop) : 0,
            sdi12gLoop: body.sdi12gLoop ? parseInt(body.sdi12gLoop) : 0,
            sdi3gLoop: body.sdi3gLoop ? parseInt(body.sdi3gLoop) : 0,
            dviLoop: body.dviLoop ? parseInt(body.dviLoop) : 0,

            audioInput35mm: body.audioInput35mm ? parseInt(body.audioInput35mm) : 0,
            audioOutput35mm: body.audioOutput35mm ? parseInt(body.audioOutput35mm) : 0,
            ethernetControlPort: body.ethernetControlPort ? parseInt(body.ethernetControlPort) : 0,
            usbTypeBPcControl: body.usbTypeBPcControl ? parseInt(body.usbTypeBPcControl) : 0,
            usbTypeACascading: body.usbTypeACascading ? parseInt(body.usbTypeACascading) : 0,
            genlockInLoop: body.genlockInLoop ? parseInt(body.genlockInLoop) : 0,
            rs232: body.rs232 ? parseInt(body.rs232) : 0,

            maximumLayers: body.maximumLayers?.trim() || null,
            layerScaling: body.layerScaling?.trim() || null,
            hdrSupport: body.hdrSupport?.trim() || null,
            colorDepthBit: body.colorDepthBit ? parseInt(body.colorDepthBit) : null,
            lowLatency: body.lowLatency?.trim() || null,
            fibreConverterMode: body.fibreConverterMode?.trim() || null,
            vCanSupport: body.vCanSupport?.trim() || null,
            backupMode: body.backupMode?.trim() || null,
            genlockSync: body.genlockSync?.trim() || null,
            multiViewerMvr: body.multiViewerMvr?.trim() || null,
            usbPlayback: body.usbPlayback?.trim() || null,
            support3d: body.support3d?.trim() || null,

            purchasePrice: body.purchasePrice?.toString() || null,
            retailPrice: body.retailPrice?.toString() || null,

            updatedAt: new Date(),
        };

        const updated = await db
            .update(controllers)
            .set(updateData)
            .where(eq(controllers.id, id))
            .returning();

        return successResponse("Controller updated successfully", updated[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to update controller");
    }
}

// DELETE /api/admin/controllers/[id] - Delete a controller
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const existing = await db
            .select()
            .from(controllers)
            .where(eq(controllers.id, id))
            .limit(1)
            .then((res) => res[0]);

        if (!existing) {
            return errorResponse("Controller not found", 404);
        }

        await db.delete(controllers).where(eq(controllers.id, id));

        return successResponse("Controller deleted successfully");
    } catch (error) {
        return errorResponse(error.message || "Failed to delete controller");
    }
}

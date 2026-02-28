import { db } from "@/lib/db";
import { controllers, productImages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

// GET /api/admin/controllers - Fetch all controllers
export async function GET() {
    try {
        const allControllers = await db
            .select()
            .from(controllers)
            .orderBy(desc(controllers.createdAt));

        return successResponse("Controllers fetched successfully", allControllers);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch controllers");
    }
}

function parseControllerBody(body) {
    return {
        brandName: body.brandName?.trim() || null,
        brandNameOther: body.brandNameOther?.trim() || null,
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
    };
}

async function uploadImages(imageFiles, controllerId) {
    const uploads = imageFiles.map(async (file, index) => {
        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
            const uploadResult = await cloudinary.uploader.upload(base64Image, {
                folder: "controllers/images",
                resource_type: "image",
            });
            return db.insert(productImages).values({
                controllerId,
                imageUrl: uploadResult.secure_url,
                imageOrder: index,
            });
        }
    });
    await Promise.all(uploads.filter(Boolean));
}

// POST /api/admin/controllers - Create a new controller
export async function POST(request) {
    try {
        const formData = await request.formData();
        const fieldsJson = formData.get("fields");
        const body = JSON.parse(fieldsJson);

        if (!body.interfaceName?.trim() || !body.brandName?.trim()) {
            return errorResponse("Interface name and brand name are required", 400);
        }

        const imageFiles = formData.getAll("images");
        const hasImages = imageFiles && imageFiles.length > 0;
        const controllerData = { ...parseControllerBody(body), isActive: !!hasImages };

        const newController = await db
            .insert(controllers)
            .values(controllerData)
            .returning();

        const controllerId = newController[0].id;

        if (hasImages) {
            await uploadImages(imageFiles, controllerId);
        }

        return successResponse("Controller created successfully", newController[0]);
    } catch (error) {
        if (error.message?.includes("unique") || error.code === "23505") {
            return errorResponse("A controller with this product number already exists", 400);
        }
        return errorResponse(error.message || "Failed to create controller");
    }
}

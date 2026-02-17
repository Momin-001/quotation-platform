import { db } from "@/lib/db";
import { products, productImages, productCertificates, certificates, categories } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import PDFDocument from "pdfkit";

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return errorResponse("Product ID is required", 400);
        }

        // Fetch product with related data
        const product = await db.query.products.findFirst({
            where: eq(products.id, id),
            with: {
                areaOfUse: {
                    columns: {
                        name: true,
                    },
                },
                productCertificates: {
                    columns: {},
                    with: {
                        certificate: {
                            columns: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!product) {
            return errorResponse("Product not found", 404);
        }

        const formattedProduct = {
            ...product,
            areaOfUse: product.areaOfUse.name,
            productCertificates: product.productCertificates.map((certificate) => certificate.certificate),
        };

        // Create PDF and set up buffer collection
        const pdfBuffer = await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ 
                margin: 50, 
                size: 'A4'
            });
            const chunks = [];
            
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header - use built-in font
            doc.font('Helvetica-Bold')
               .fontSize(20)
               .text('Product Datasheet', { align: "center" });
            doc.moveDown();

            // Product Name and Number
            doc.font('Helvetica-Bold')
               .fontSize(16)
               .text(product.productName, { align: "center" });
            doc.font('Helvetica')
               .fontSize(12)
               .text(`Product Number: ${product.productNumber}`, { align: "center" });
            doc.moveDown(2);

            // Basic Information Section
            doc.font('Helvetica-Bold')
               .fontSize(14)
               .text('Basic Information', { underline: true });
            doc.moveDown(0.5);
            doc.font('Helvetica')
               .fontSize(10);
            
            const basicInfo = [
                ['Product Type', product.productType || 'N/A'],
                ['Design', product.design || 'N/A'],
                ['Special Types', product.specialTypes || 'N/A'],
                ['Application', product.application || 'N/A'],
                ['Category', formattedProduct.areaOfUse || 'N/A'],
            ];

            basicInfo.forEach(([label, value]) => {
                doc.text(`${label}: ${value}`);
            });
            doc.moveDown();

            // Technical Specifications Section
            doc.font('Helvetica-Bold')
               .fontSize(14)
               .text('Technical Specifications', { underline: true });
            doc.moveDown(0.5);
            doc.font('Helvetica')
               .fontSize(10);

            const techSpecs = [
                ['Pixel Pitch', product.pixelPitch ? `${product.pixelPitch}mm` : 'N/A'],
                ['Pixel Configuration', product.pixelConfiguration || 'N/A'],
                ['Pixel Technology', product.pixelTechnology || 'N/A'],
                ['LED Technology', product.ledTechnology || 'N/A'],
                ['Chip Bonding', product.chipBonding || 'N/A'],
                ['Colour Depth', product.colourDepth ? `${product.colourDepth} bit` : 'N/A'],
                ['Refresh Rate', product.refreshRate ? `${product.refreshRate}Hz` : 'N/A'],
                ['Cabinet Width', product.cabinetWidth ? `${product.cabinetWidth}mm` : 'N/A'],
                ['Cabinet Height', product.cabinetHeight ? `${product.cabinetHeight}mm` : 'N/A'],
                ['Cabinet Resolution (H)', product.cabinetResolutionHorizontal ? `${product.cabinetResolutionHorizontal}px` : 'N/A'],
                ['Cabinet Resolution (V)', product.cabinetResolutionVertical ? `${product.cabinetResolutionVertical}px` : 'N/A'],
                ['Pixel Density', product.pixelDensity ? `${product.pixelDensity} pixels/m²` : 'N/A'],
                ['Scan Rate', product.scanRateDenominator ? `1/${product.scanRateDenominator}` : 'N/A'],
            ];

            techSpecs.forEach(([label, value]) => {
                doc.text(`${label}: ${value}`);
            });
            doc.moveDown();

            // Display Performance Section
            doc.font('Helvetica-Bold')
               .fontSize(14)
               .text('Display Performance', { underline: true });
            doc.moveDown(0.5);
            doc.font('Helvetica')
               .fontSize(10);

            const displayPerf = [
                ['Viewing Angle (H)', product.viewingAngleHorizontal || 'N/A'],
                ['Viewing Angle (V)', product.viewingAngleVertical || 'N/A'],
                ['Brightness Control', product.brightnessControl || 'N/A'],
                ['DCI-P3 Coverage', product.dciP3Coverage || 'N/A'],
                ['Contrast Ratio', product.contrastRatioNumerator && product.contrastRatioDenominator 
                    ? `${product.contrastRatioNumerator}:${product.contrastRatioDenominator}` 
                    : 'N/A'],
                ['Video Rate', product.videoRate || 'N/A'],
                ['Calibration Method', product.calibrationMethod || 'N/A'],
            ];

            displayPerf.forEach(([label, value]) => {
                doc.text(`${label}: ${value}`);
            });
            doc.moveDown();

            // Power & Electrical Section
            doc.font('Helvetica-Bold')
               .fontSize(14)
               .text('Power & Electrical', { underline: true });
            doc.moveDown(0.5);
            doc.font('Helvetica')
               .fontSize(10);

            const powerElec = [
                ['Power Consumption (Max)', product.powerConsumptionMax ? `${product.powerConsumptionMax}W` : 'N/A'],
                ['Power Consumption (Typical)', product.powerConsumptionTypical ? `${product.powerConsumptionTypical}W` : 'N/A'],
                ['Input Voltage', product.inputVoltage || 'N/A'],
                ['Driving Method', product.drivingMethod || 'N/A'],
                ['Current Gain Control', product.currentGainControl || 'N/A'],
                ['Power Redundancy', product.powerRedundancy || 'N/A'],
            ];

            powerElec.forEach(([label, value]) => {
                doc.text(`${label}: ${value}`);
            });
            doc.moveDown();

            // Control & Processing Section
            doc.font('Helvetica-Bold')
               .fontSize(14)
               .text('Control & Processing', { underline: true });
            doc.moveDown(0.5);
            doc.font('Helvetica')
               .fontSize(10);

            const controlProc = [
                ['Control System', product.controlSystem === 'other' && product.controlSystemOther 
                    ? product.controlSystemOther 
                    : product.controlSystem || 'N/A'],
                ['Receiving Card', product.receivingCard || 'N/A'],
                ['Greyscale Processing', product.greyscaleProcessing === 'other' && product.greyscaleProcessingOther
                    ? product.greyscaleProcessingOther
                    : product.greyscaleProcessing || 'N/A'],
                ['Number of Colours', product.numberOfColours ? `${product.numberOfColours}` : 'N/A'],
            ];

            controlProc.forEach(([label, value]) => {
                doc.text(`${label}: ${value}`);
            });
            doc.moveDown();

            // Physical Properties Section
            doc.font('Helvetica-Bold')
               .fontSize(14)
               .text('Physical Properties', { underline: true });
            doc.moveDown(0.5);
            doc.font('Helvetica')
               .fontSize(10);

            const physicalProps = [
                ['Weight (without packaging)', product.weightWithoutPackaging ? `${product.weightWithoutPackaging}kg` : 'N/A'],
                ['Cooling', product.cooling || 'N/A'],
                ['Heat Dissipation', product.heatDissipation || 'N/A'],
                ['IP Rating', product.ipRating || 'N/A'],
                ['Operating Temperature', product.operatingTemperature || 'N/A'],
                ['Operating Humidity', product.operatingHumidity || 'N/A'],
            ];

            physicalProps.forEach(([label, value]) => {
                doc.text(`${label}: ${value}`);
            });
            doc.moveDown();

            // Additional Information Section
            doc.font('Helvetica-Bold')
               .fontSize(14)
               .text('Additional Information', { underline: true });
            doc.moveDown(0.5);
            doc.font('Helvetica')
               .fontSize(10);

            const additionalInfo = [
                ['LED Modules per Cabinet', product.ledModulesPerCabinet || 'N/A'],
                ['LED Chip Manufacturer', product.ledChipManufacturer || 'N/A'],
                ['LED Lifespan', product.ledLifespan ? `${product.ledLifespan} hours` : 'N/A'],
                ['MTBF Power Supply', product.mtbfPowerSupply ? `${product.mtbfPowerSupply} hours` : 'N/A'],
                ['Warranty Period', product.warrantyPeriod ? `${product.warrantyPeriod} months` : 'N/A'],
                ['Memory on Module', product.memoryOnModule || 'N/A'],
                ['Smart Module', product.smartModule || 'N/A'],
                ['Support', product.support || 'N/A'],
            ];

            additionalInfo.forEach(([label, value]) => {
                doc.text(`${label}: ${value}`);
            });

            // Certificates
            if (formattedProduct.productCertificates.length > 0) {
                doc.moveDown();
                doc.font('Helvetica-Bold')
                   .fontSize(14)
                   .text('Certifications', { underline: true });
                doc.moveDown(0.5);
                doc.font('Helvetica')
                   .fontSize(10);
                formattedProduct.productCertificates.forEach((cert) => {
                    doc.text(`• ${cert.name}`);
                });
            }

            // Finalize PDF
            doc.end();
        });

        // Return PDF as response
        // Use 'inline' instead of 'attachment' to prevent browser auto-download
        // The frontend will handle the download via blob
        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${formattedProduct.productNumber}_datasheet.pdf"`,
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error("Error generating datasheet:", error);
        return errorResponse(error.message || "Failed to generate datasheet", 500);
    }
}

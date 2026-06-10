import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import { generateProductDatasheetReactPDF } from "@/features/products/product-datasheet-react-pdf";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return errorResponse("Product ID is required", 400);
        }

        const product = await db.query.products.findFirst({
            where: eq(products.id, id),
            with: {
                areaOfUse: {
                    columns: {
                        name: true,
                    },
                },
                images: {
                    columns: {
                        imageUrl: true,
                    },
                },
                features: {
                    columns: {
                        feature: true,
                    },
                },
                productCertificates: {
                    columns: {},
                    with: {
                        certificate: {
                            columns: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
                productProductIcons: {
                    columns: {
                        iconOrder: true,
                    },
                    with: {
                        productIcon: {
                            columns: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
            },
        });

        if (!product) {
            return errorResponse("Product not found", 404);
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        let logoDataUrl = null;
        let watermarkDataUrl = null;
        try {
            const logoPath = path.join(process.cwd(), "public", "logo-name.png");
            const watermarkPath = path.join(process.cwd(), "public", "logo.png");
            const logoBuf = await readFile(logoPath);
            const watermarkBuf = await readFile(watermarkPath);
            logoDataUrl = `data:image/png;base64,${logoBuf.toString("base64")}`;
            watermarkDataUrl = `data:image/png;base64,${watermarkBuf.toString("base64")}`;
        } catch {
            // logo-name.png missing or unreadable
        }

        const imageUrls = product.images?.map((img) => img.imageUrl) ?? [];
        let mainImageDataUrl = null;
        const firstImageUrl = imageUrls[0];
        if (firstImageUrl) {
            const absoluteUrl =
                firstImageUrl.startsWith("http://") || firstImageUrl.startsWith("https://")
                    ? firstImageUrl
                    : `${baseUrl.replace(/\/$/, "")}${firstImageUrl.startsWith("/") ? firstImageUrl : `/${firstImageUrl}`}`;
            try {
                const imageRes = await fetch(absoluteUrl);
                if (imageRes.ok) {
                    const blob = await imageRes.blob();
                    const buf = Buffer.from(await blob.arrayBuffer());
                    const mime = imageRes.headers.get("content-type") || "image/jpeg";
                    mainImageDataUrl = `data:${mime};base64,${buf.toString("base64")}`;
                }
            } catch (err) {
            }
        }

        const certificates = product.productCertificates?.map((pc) => pc.certificate) ?? [];
        const certificatesWithDataUrls = await Promise.all(
            certificates.map(async (cert) => {
                const url = cert?.imageUrl;
                if (!url) return { ...cert, imageDataUrl: null };
                const absoluteUrl =
                    url.startsWith("http://") || url.startsWith("https://")
                        ? url
                        : `${baseUrl.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
                try {
                    const res = await fetch(absoluteUrl);
                    if (!res.ok) return { ...cert, imageDataUrl: null };
                    const blob = await res.blob();
                    const buf = Buffer.from(await blob.arrayBuffer());
                    const mime = res.headers.get("content-type") || "image/png";
                    return { ...cert, imageDataUrl: `data:${mime};base64,${buf.toString("base64")}` };
                } catch {
                    return { ...cert, imageDataUrl: null };
                }
            })
        );

        const iconRows = [...(product.productProductIcons ?? [])].sort(
            (a, b) => (a.iconOrder ?? 0) - (b.iconOrder ?? 0)
        );
        const productIconsWithDataUrls = await Promise.all(
            iconRows.map(async (row) => {
                const icon = row.productIcon;
                if (!icon?.imageUrl) return { ...icon, imageDataUrl: null };
                const url = icon.imageUrl;
                const absoluteUrl =
                    url.startsWith("http://") || url.startsWith("https://")
                        ? url
                        : `${baseUrl.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
                try {
                    const res = await fetch(absoluteUrl);
                    if (!res.ok) return { ...icon, imageDataUrl: null };
                    const blob = await res.blob();
                    const buf = Buffer.from(await blob.arrayBuffer());
                    const mime = res.headers.get("content-type") || "image/png";
                    return { ...icon, imageDataUrl: `data:${mime};base64,${buf.toString("base64")}` };
                } catch {
                    return { ...icon, imageDataUrl: null };
                }
            })
        );

        const formattedProduct = {
            ...product,
            categoryName: product.areaOfUse?.name ?? null,
            areaOfUse: product.areaOfUse?.name ?? null,
            images: imageUrls,
            features: product.features?.map((f) => f.feature) ?? [],
            productCertificates: certificatesWithDataUrls,
            productIcons: productIconsWithDataUrls,
            mainImageDataUrl,
        };

        const pdfBuffer = await generateProductDatasheetReactPDF(formattedProduct, { baseUrl, logoDataUrl });

        const safeName = String(formattedProduct.productNumber || "datasheet")
            .replace(/[/\\:*?"<>|]/g, "_")
            .trim() || "datasheet";
        const filename = `${safeName}_datasheet.pdf`;

        return new Response(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("GET /api/products/[id]/datasheet error:", error);
        return errorResponse("Failed to generate datasheet", 500);
    }
}

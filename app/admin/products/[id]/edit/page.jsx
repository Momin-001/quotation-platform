import ProductForm from "@/components/admin/ProductForm";

async function getProduct(id) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/${id}`,
            { cache: "no-store" }
        );

        const response = await res.json();

        if (!response.success) {
            return null;
        }

        return response.data;
    } catch (error) {
        return null;
    }
}

export default async function EditProductPage({ params }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">Product not found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold font-archivo">
                            Edit Product
                        </h1>

                        {!product.isActive && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                                Inactive
                            </span>
                        )}

                        {product.isActive && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                Active
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Update product specifications, images, and certificates.
                    </p>
                </div>
            </div>

            <ProductForm
                mode="edit"
                initialData={product}
                initialImages={product.images || []}
                initialFeatures={product.features || []}
                initialCertificateIds={
                    product.certificates?.map((c) => c.id) || []
                }
            />
        </div>
    );
}

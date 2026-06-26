import RefurbishedProductForm from "@/components/admin/RefurbishedProductForm";

export default function AddRefurbishedProductPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Add Refurbished Product</h1>
                    <p className="text-sm text-muted-foreground">Fill in the details of the used product.</p>
                </div>
            </div>

            <RefurbishedProductForm mode="add" />
        </div>
    );
}

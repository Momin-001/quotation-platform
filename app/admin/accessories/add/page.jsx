import AccessoryForm from "@/components/admin/AccessoryForm";

export default function AddAccessoryPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold ">Add New Accessory </h1>
                    <p className="text-sm text-muted-foreground">
                        Choose a product type and fill in the details.
                    </p>
                </div>
            </div>

            <AccessoryForm mode="add" />
        </div>
    );
}

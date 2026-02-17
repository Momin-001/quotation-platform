import AccessoryForm from "@/components/admin/AccessoryForm";

async function getAccessory(id) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/accessories/${id}`,
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


export default async function EditAccessoryPage({ params }) {
    const { id } = await params;
    const accessory = await getAccessory(id);

    if (!accessory) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">Accessory not found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-archivo">Edit Accessory</h1>
                <p className="text-sm text-muted-foreground">
                    Update the accessory details below.
                </p>
            </div>
            <AccessoryForm mode="edit" initialData={accessory} />
        </div>
    );
}

import ControllerForm from "@/components/admin/ControllerForm";

async function getController(id) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/controllers/${id}`,
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

export default async function EditControllerPage({ params }) {
    const { id } = await params;
    const controller = await getController(id);

    if (!controller) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">Controller not found.</p>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-archivo">Edit Controller</h1>
                <p className="text-sm text-muted-foreground">
                    Update the controller details below.
                </p>
            </div>
            <ControllerForm mode="edit" initialData={controller} />
        </div>
    );
}

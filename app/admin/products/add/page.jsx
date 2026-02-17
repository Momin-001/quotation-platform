"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductForm from "@/components/admin/ProductForm";
import ControllerForm from "@/components/admin/ControllerForm";
import AccessoryForm from "@/components/admin/AccessoryForm";

export default function AddProductPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold font-archivo">Add New Product</h1>
                    <p className="text-sm text-muted-foreground">
                        Choose a product type and fill in the details.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="led" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                    <TabsTrigger value="led" className="text-sm font-semibold">
                        LED Product
                    </TabsTrigger>
                    <TabsTrigger value="controller" className="text-sm font-semibold">
                        Controller
                    </TabsTrigger>
                    <TabsTrigger value="accessory" className="text-sm font-semibold">
                        Accessory
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="led">
                    <ProductForm mode="add" />
                </TabsContent>

                <TabsContent value="controller">
                    <ControllerForm mode="add" />
                </TabsContent>

                <TabsContent value="accessory">
                    <AccessoryForm mode="add" />
                </TabsContent>
            </Tabs>
        </div>
    );
}

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BulkImportUploader from "@/components/admin/BulkImportUploader";

export default function BulkImportPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-archivo text-gray-900">
                    Bulk Import
                </h1>
                <p className="text-gray-600 mt-1">
                    Upload a CSV or Excel file to import multiple items at once.
                </p>
            </div>

            <Tabs defaultValue="products" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger className="data-[state=active]:bg-primary data-[state=active]:text-white" value="products">LED Products</TabsTrigger>
                    <TabsTrigger className="data-[state=active]:bg-primary data-[state=active]:text-white" value="controllers">Controllers</TabsTrigger>
                    <TabsTrigger className="data-[state=active]:bg-primary data-[state=active]:text-white" value="accessories">Accessories</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="mt-6">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Import LED Products</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload your LED product specification Excel file. The file should follow the column-oriented format with product data starting from column F.
                        </p>
                    </div>
                    <BulkImportUploader
                        apiEndpoint="/api/admin/products/import"
                        entityLabel="LED products"
                    />
                </TabsContent>

                <TabsContent value="controllers" className="mt-6">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Import Controllers</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload your controller specification Excel file. The file should follow the column-oriented format with controller data starting from column C. Each column represents one controller.
                        </p>
                    </div>
                    <BulkImportUploader
                        apiEndpoint="/api/admin/controllers/import"
                        entityLabel="controllers"
                    />
                </TabsContent>

                <TabsContent value="accessories" className="mt-6">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Import Accessories</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload your accessories Excel file. Supports both transposed format (field labels in column A, data in subsequent columns) and standard table format (headers in the first row, one accessory per row).
                        </p>
                    </div>
                    <BulkImportUploader
                        apiEndpoint="/api/admin/accessories/import"
                        entityLabel="accessories"
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

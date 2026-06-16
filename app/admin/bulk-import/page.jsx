"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BulkImportUploader from "@/components/admin/BulkImportUploader";

export default function BulkImportPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold  text-gray-900">
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
                            Upload your LED product specification Excel file. The file should follow the column-oriented format with each field as a row and each product as a column, starting from column F. Only new products will be created — products with an existing Product Number will be skipped.
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
                            Upload your controller specification Excel file. Each field is a row and each controller is a column, starting from column C. Only new controllers will be created — existing Controller Numbers will be skipped.
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
                            Upload your accessories Excel file. Supports both transposed format (field labels in column A, data in subsequent columns) and standard table format (headers in first row, one accessory per row). Only new accessories will be created — existing Product Numbers will be skipped.
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

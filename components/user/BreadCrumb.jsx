import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb";
  import Link from "next/link";
  
  export default function BreadCrumb({ title, breadcrumbs }) {
    return (
      <div className="bg-secondary">
        <div className="container text-white mx-auto py-3 px-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {/* Left: Page Title */}
          <h1 className="text-2xl font-semibold tracking-tight">
            {title}
          </h1>
  
          {/* Right: Breadcrumb */}
          <div className="border rounded-2xl p-1 px-4">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
  
                return (
                  <div key={index} className="flex items-center">
                    <BreadcrumbItem>
                      {isLast || !item.href ? (
                        <BreadcrumbPage className="space-x-2">{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink className="space-x-2" asChild>
                          <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
  
                    {!isLast && <BreadcrumbSeparator />}
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
          </div>
        </div>
      </div>
    );
  }
  
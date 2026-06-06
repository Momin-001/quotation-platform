import { Link } from "@/i18n/navigation";
import SchemaScript from "@/components/guest/SchemaScript";
import { BASE_URL } from "@/lib/constants";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

export default function BreadCrumb({ title, breadcrumbs }) {
    const siteUrl = BASE_URL || "https://www.proledall.eu";
    const schema =
        breadcrumbs?.length > 0
            ? {
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  itemListElement: breadcrumbs
                      .filter((c) => c?.label && c?.href)
                      .map((c, i) => {
                          const url = c.href.startsWith("http")
                              ? c.href
                              : `${siteUrl}${c.href.startsWith("/") ? c.href : `/${c.href}`}`;
                          return {
                              "@type": "ListItem",
                              position: i + 1,
                              name: c.label,
                              item: url,
                          };
                      }),
              }
            : null;

    return (
        <div className="bg-secondary text-primary-foreground">
            {schema ? <SchemaScript data={schema} /> : null}
            <div className="container mx-auto px-4 lg:px-6 py-1.5 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
                <h1 className="text-base sm:text-lg md:text-xl  leading-tight tracking-tight">
                    {title}
                </h1>

                {breadcrumbs?.length > 0 && (
                    <div className="shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2">
                        <Breadcrumb>
                            <BreadcrumbList className="text-xs sm:text-sm text-primary-foreground/90 gap-1 sm:gap-1.5">
                                {breadcrumbs.map((item, index) => {
                                    const isLast = index === breadcrumbs.length - 1;

                                    return (
                                        <Fragment key={index}>
                                            <BreadcrumbItem>
                                                {isLast || !item.href ? (
                                                    <BreadcrumbPage className="font-medium text-primary-foreground">
                                                        {item.label}
                                                    </BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink
                                                        asChild
                                                        className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                                                    >
                                                        <Link href={item.href}>{item.label}</Link>
                                                    </BreadcrumbLink>
                                                )}
                                            </BreadcrumbItem>
                                            {!isLast && (
                                                <BreadcrumbSeparator className="text-primary-foreground/50 [&>span]:text-primary-foreground/50" />
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                )}
            </div>
        </div>
    );
}

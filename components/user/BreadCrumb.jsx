import { Link } from "@/i18n/navigation";
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
    return (
        <div className="bg-secondary text-primary-foreground">
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

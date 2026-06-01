"use client";

import { Link } from "@/i18n/navigation";
import BreadCrumb from "@/components/user/BreadCrumb";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

function slugifySectionId(title, index) {
    const paraMatch = title.match(/§\s*(\d+)/);
    if (paraMatch) return `section-${paraMatch[1]}`;
    return `section-${index + 1}`;
}

function formatContactLine(line) {
    const emailMatch = line.match(/^(E-?Mail|Email):\s*(.+)$/i);
    if (emailMatch) {
        const addr = emailMatch[2].trim();
        return (
            <p>
                <span className="text-muted-foreground">{emailMatch[1]}: </span>
                <a href={`mailto:${addr}`} className="text-primary font-medium hover:text-primary/80">
                    {addr}
                </a>
            </p>
        );
    }
    const phoneMatch = line.match(/^(Telefon|Phone):\s*(.+)$/i);
    if (phoneMatch) {
        const num = phoneMatch[2].trim().replace(/\s/g, "");
        return (
            <p>
                <span className="text-muted-foreground">{phoneMatch[1]}: </span>
                <a href={`tel:${num}`} className="text-primary font-medium hover:text-primary/80">
                    {phoneMatch[2].trim()}
                </a>
            </p>
        );
    }
    return <p>{line}</p>;
}

export function LegalParagraph({ children, className }) {
    const text = typeof children === "string" ? children : "";
    const isSubList = /^[a-c]\)\s/.test(text);

    return (
        <p
            className={cn(
                "text-sm md:text-[15px] text-foreground/90 leading-relaxed md:leading-7",
                isSubList && "pl-4 md:pl-5 border-l-2 border-primary/25 py-0.5",
                className
            )}
        >
            {children}
        </p>
    );
}

export function LegalSection({ id, title, children, className }) {
    return (
        <section
            id={id}
            className={cn(
                "scroll-mt-28 pt-8 first:pt-0 border-t border-border/50 first:border-t-0",
                className
            )}
        >
            <h2 className="text-base md:text-lg font-semibold text-foreground tracking-tight mb-4">
                {title}
            </h2>
            <div className="space-y-3.5">{children}</div>
        </section>
    );
}

export function LegalTableOfContents({ sections }) {
    const t = useTranslations("Legal");

    if (!sections?.length) return null;

    return (
        <nav
            aria-label={t("tableOfContentsAria")}
            className="rounded-xl border border-border/60 bg-muted/25 p-4 sm:p-5 mb-8"
        >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {t("contents")}
            </p>
            <ol className="grid grid-cols-4 sm:grid-cols-6 gap-x-6 gap-y-2 text-sm">
                {sections.map((section, index) => {
                    const id = section.id || slugifySectionId(section.title, index);
                    const label =
                        section.tocLabel ||
                        section.title.replace(/\s+/g, " ").trim().slice(0, 80);
                    return (
                        <li key={id}>
                            <a
                                href={`#${id}`}
                                className="text-primary hover:text-primary/80 hover:underline underline-offset-2 leading-snug"
                            >
                                {label}
                            </a>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export function LegalPageLayout({
    breadcrumbTitle,
    breadcrumbs,
    documentTitle,
    documentSubtitle,
    intro,
    showToc = false,
    sections = [],
    children,
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <BreadCrumb title={breadcrumbTitle} breadcrumbs={breadcrumbs} />
            <main className="container mx-auto px-4 lg:px-6 py-6 sm:py-10 lg:py-12">
                <article className="mx-auto">
                    <div className="bg-white border border-border/60 rounded-xl shadow-sm overflow-hidden">
                        <header className="px-5 sm:px-8 md:px-10 pt-6 sm:pt-8 pb-6 border-b border-border/50 bg-muted/10">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight">
                                {documentTitle}
                            </h1>
                            {documentSubtitle ? (
                                <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
                                    {documentSubtitle}
                                </p>
                            ) : null}
                            {intro ? (
                                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                    {intro}
                                </p>
                            ) : null}
                        </header>

                        <div className="px-5 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10">
                            {showToc && sections.length > 0 ? (
                                <LegalTableOfContents sections={sections} />
                            ) : null}
                            {children}
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}

export function renderLegalSections(sections) {
    return sections.map((section, index) => {
        const id = section.id || slugifySectionId(section.title, index);

        return (
            <LegalSection key={id} id={id} title={section.title} index={index}>
                {section.paragraphs?.map((p, idx) => (
                    <LegalParagraph key={idx}>{p}</LegalParagraph>
                ))}

                {section.lines?.length ? (
                    <div
                        className={cn(
                            "rounded-lg border border-border/60 bg-muted/15 px-4 py-3.5 space-y-1.5",
                            "text-sm md:text-[15px] leading-relaxed"
                        )}
                    >
                        {section.lines.map((line) => (
                            <div key={line}>{formatContactLine(line)}</div>
                        ))}
                    </div>
                ) : null}

                {section.link ? (
                    <div className="space-y-3">
                        <Link
                            href={section.link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex text-sm md:text-[15px] font-medium text-primary hover:text-primary/80 break-all underline underline-offset-2"
                        >
                            {section.link.label}
                        </Link>
                        {section.afterLink?.map((p, idx) => (
                            <LegalParagraph key={idx}>{p}</LegalParagraph>
                        ))}
                    </div>
                ) : null}
            </LegalSection>
        );
    });
}

export { slugifySectionId };

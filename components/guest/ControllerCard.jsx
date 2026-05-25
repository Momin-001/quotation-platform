import { cn } from "@/lib/utils";
import Image from "next/image";

export default function ControllerCard({ controller, className }) {
    return (
        <article
            className={cn(
                "flex flex-col h-full bg-white border border-border/60 rounded-xl overflow-hidden transition-all duration-300",
                "hover:shadow-lg hover:border-primary/25 hover:-translate-y-0.5",
                className
            )}
        >
            <div className="relative aspect-8/7 overflow-hidden border-b border-border/40">
                {controller.images?.length > 0 ? (
                    <Image
                        src={controller.images[0]}
                        alt={controller.interfaceName || "Controller"}
                        fill
                        className="object-contain p-3"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2">
                <h3 className="font-semibold  text-base sm:text-lg leading-snug line-clamp-2 text-foreground">
                    {controller.interfaceName}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono tracking-tight">
                    {controller.controllerNumber}
                </p>
                <span className="inline-flex self-start text-[11px] sm:text-xs font-semibold uppercase tracking-wide bg-secondary text-primary-foreground rounded-md px-2.5 py-1 mt-0.5">
                    {controller.brandDisplay || "N/A"}
                </span>
            </div>
        </article>
    );
}
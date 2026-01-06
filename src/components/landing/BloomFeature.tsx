import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BloomFeatureProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    variant?: "light" | "dark" | "glass";
    className?: string;
    image?: string;
}

export function BloomFeature({
    title,
    description,
    icon: Icon,
    variant = "glass",
    className,
    image
}: BloomFeatureProps) {

    const variants = {
        light: "bg-bloom-soft text-bloom-dark",
        dark: "bg-bloom-dark text-bloom-soft border border-bloom-soft/10",
        glass: "bg-white/5 backdrop-blur-lg border border-white/10 text-white"
    };

    return (
        <div className={cn(
            "relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02]",
            variants[variant],
            className
        )}>
            {image && (
                <div className="absolute inset-0 z-0">
                    <img src={image} alt="" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${variant === 'light' ? 'from-white/80' : 'from-black/80'} to-transparent`} />
                </div>
            )}

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-3">{title}</h3>
                    <p className={cn(
                        "text-lg leading-relaxed",
                        variant === 'light' ? "text-slate-600" : "text-bloom-purple/70"
                    )}>
                        {description}
                    </p>
                </div>

                {Icon && (
                    <div className="mt-auto">
                        <div className="w-12 h-12 rounded-2xl bg-bloom-primary/20 flex items-center justify-center text-bloom-primary">
                            <Icon className="w-6 h-6" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

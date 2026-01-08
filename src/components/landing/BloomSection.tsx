interface BloomSectionProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    dark?: boolean;
    id?: string;
    withBackground?: boolean;
}

export function BloomSection({ children, className = "", title, subtitle, dark = false, id, withBackground = false }: BloomSectionProps) {
    return (
        <section id={id} className={`py-24 md:py-32 px-4 ${dark ? 'bg-bloom-dark' : 'bg-background'} text-foreground relative overflow-hidden ${className}`}>
            {withBackground && (
                <div className="absolute inset-0 z-0 select-none">
                    <img
                        src="/hero-bg.png"
                        alt=""
                        className="w-full h-full object-cover object-center opacity-15 mix-blend-luminosity grayscale-[30%]"
                    />
                    <div className="absolute inset-0 bg-bloom-dark/80" />
                </div>
            )}
            <div className="container mx-auto max-w-7xl relative z-10">
                {(title || subtitle) && (
                    <div className="mb-16 md:mb-24 max-w-3xl">
                        {title && (
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className={`text-xl md:text-2xl ${dark ? 'text-bloom-purple/80' : 'text-slate-600'}`}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {children}
            </div>
        </section>
    );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Scan, ShieldCheck, AlertCircle } from 'lucide-react';
import { mechanicalTransition, attentionPulse } from '@/lib/animations';

interface AccessPortalProps {
    onAuth: () => Promise<void>;
    isLoading: boolean;
}

export function AccessPortal({ onAuth, isLoading }: AccessPortalProps) {
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'granted' | 'denied'>('idle');

    const handleAccessRequest = async () => {
        setScanState('scanning');

        // Simulate biometric scan delay before actual auth
        setTimeout(async () => {
            try {
                await onAuth();
                // If onAuth doesn't throw, we assume success or redirect happens
                // setScanState('granted'); // Usually redirect happens fast
            } catch (e) {
                setScanState('denied');
                setTimeout(() => setScanState('idle'), 3000);
            }
        }, 2000);
    };

    return (
        <div className="relative w-full max-w-md p-8 overflow-hidden rounded-xl bg-black/80 border border-primary/20 backdrop-blur-xl shadow-[0_0_50px_rgba(0,240,255,0.1)]">
            {/* Decorative Corner Lines */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary opacity-50" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary opacity-50" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary opacity-50" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary opacity-50" />

            {/* Content */}
            <div className="flex flex-col items-center text-center z-10 relative">
                <div className="mb-6 relative h-40 w-40 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {scanState === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                whileHover="hover"
                                className="w-28 h-28 rounded-full bg-primary/5 flex items-center justify-center border border-primary/30 text-primary relative group cursor-pointer"
                                onClick={!isLoading ? handleAccessRequest : undefined}
                            >
                                {/* Ripple/Glow Effect */}
                                <motion.div
                                    className="absolute inset-0 rounded-full border border-primary/50"
                                    variants={{
                                        hover: {
                                            boxShadow: [
                                                "0 0 0px rgba(0,240,255,0)",
                                                "0 0 20px rgba(0,240,255,0.4)",
                                                "0 0 0px rgba(0,240,255,0)"
                                            ],
                                            opacity: 1,
                                        }
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />

                                {/* Orbiting ring for SERGE-style scan feel */}
                                <motion.div
                                    className="absolute inset-[-4px] rounded-full border-2 border-transparent border-t-primary/60 border-b-primary/60"
                                    variants={{
                                        hover: { rotate: 360, scale: 1.05 }
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />

                                {/* Inner pulsing glow */}
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-primary/10 blur-xl"
                                    variants={{
                                        hover: { opacity: [0.2, 0.6, 0.2] }
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />

                                <Fingerprint className="w-14 h-14 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                            </motion.div>
                        )}

                        {scanState === 'scanning' && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative w-28 h-28 flex items-center justify-center"
                            >
                                <motion.div
                                    className="absolute inset-0 border-4 border-t-transparent border-primary rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute inset-2 border-2 border-b-transparent border-secondary rounded-full"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <Scan className="w-10 h-10 text-primary animate-pulse" />
                            </motion.div>
                        )}

                        {scanState === 'denied' && (
                            <motion.button
                                key="denied"
                                variants={attentionPulse}
                                initial="idle"
                                animate="active"
                                onClick={() => setScanState('idle')}
                                className="w-28 h-28 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive text-destructive cursor-pointer hover:bg-destructive/20 transition-colors"
                            >
                                <div className="flex flex-col items-center">
                                    <AlertCircle className="w-10 h-10 mb-1" />
                                    <span className="text-[10px] font-mono tracking-wider">RETRY</span>
                                </div>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Terminal Status Text */}
                <div className="h-16 mb-2 flex flex-col items-center justify-center">
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-1">
                        {scanState === 'scanning' ? (
                            <motion.span
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            >
                                AUTHENTICATION IN PROGRESS
                            </motion.span>
                        ) : scanState === 'denied' ? (
                            <span className="text-destructive">AUTHENTICATION FAILED</span>
                        ) : (
                            <motion.span
                                animate={{ textShadow: ["0 0 5px rgba(0,240,255,0.5)", "0 0 15px rgba(0,240,255,0.2)", "0 0 5px rgba(0,240,255,0.5)"] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                SECURE ACCESS
                            </motion.span>
                        )}
                    </h2>
                    <p className="text-xs text-primary/60 font-mono">
                        {scanState === 'scanning' ? "Verifying credentials..." : "Touch fingerprint to continue"}
                    </p>
                </div>

                <div className="h-4" /> {/* Spacer replacement for button */}

                <div className="mt-6 flex flex-col gap-1 text-[10px] text-muted-foreground font-mono uppercase w-full">
                    <div className="flex justify-between w-full border-t border-white/5 pt-2">
                        <span>ENCRYPTION</span>
                        <span className="text-primary">Secure (AES-256-GCM)</span>
                    </div>
                    <div className="flex justify-between w-full">
                        <span>SYSTEM STATUS</span>
                        <span className="flex items-center gap-1 text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Online and Secure
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

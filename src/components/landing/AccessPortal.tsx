import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Scan, ShieldCheck, AlertCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
                <div className="mb-6 relative h-24 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {scanState === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border border-primary/30 text-primary relative group cursor-pointer"
                                onClick={!isLoading ? handleAccessRequest : undefined}
                            >
                                <motion.div
                                    className="absolute inset-0 rounded-full border border-primary/20"
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <Fingerprint className="w-10 h-10 transition-transform group-hover:scale-110 duration-300" />
                            </motion.div>
                        )}

                        {scanState === 'scanning' && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative w-20 h-20 flex items-center justify-center"
                            >
                                <motion.div
                                    className="absolute inset-0 border-2 border-t-transparent border-primary rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute inset-2 border-2 border-b-transparent border-secondary rounded-full"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <Scan className="w-8 h-8 text-primary animate-pulse" />
                            </motion.div>
                        )}

                        {scanState === 'denied' && (
                            <motion.div
                                key="denied"
                                variants={attentionPulse}
                                initial="idle"
                                animate="active"
                                className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive text-destructive"
                            >
                                <AlertCircle className="w-10 h-10" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Terminal Status Text */}
                <div className="h-16 mb-6 flex flex-col items-center justify-center">
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-1">
                        {scanState === 'scanning' ? (
                            <motion.span
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            >
                                VERIFYING...
                            </motion.span>
                        ) : scanState === 'denied' ? (
                            <span className="text-destructive">ACCESS DENIED</span>
                        ) : (
                            "SECURE ACCESS POINT"
                        )}
                    </h2>
                    <p className="text-xs text-primary/60 font-mono">
                        {scanState === 'scanning' ? "Decrypting biometric signature..." : "MaliBot Protocol v2.5.0"}
                    </p>
                </div>

                <Button
                    onClick={handleAccessRequest}
                    disabled={isLoading || scanState === 'scanning'}
                    className={`
                        w-full h-14 text-sm font-mono tracking-wider rounded-none relative overflow-hidden transition-all duration-300 
                        ${scanState === 'denied'
                            ? 'bg-destructive/20 hover:bg-destructive/30 text-destructive border-destructive/50'
                            : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30'
                        }
                    `}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {scanState === 'idle' && (
                            <>
                                <Terminal className="w-4 h-4" />
                                INITIALIZE_SEQUENCE
                            </>
                        )}
                        {scanState === 'scanning' && "PROCESSING..."}
                        {scanState === 'denied' && "RETRY_AUTH_SEQUENCE"}
                    </span>

                    {/* Hover Scan Effect */}
                    {scanState === 'idle' && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent skew-x-12"
                            initial={{ left: "-100%" }}
                            whileHover={{ left: "200%" }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    )}
                </Button>

                <div className="mt-6 flex flex-col gap-1 text-[10px] text-muted-foreground font-mono uppercase w-full">
                    <div className="flex justify-between w-full border-t border-white/5 pt-2">
                        <span>ENCRYPTION</span>
                        <span className="text-primary">AES-256-GCM</span>
                    </div>
                    <div className="flex justify-between w-full">
                        <span>STATUS</span>
                        <span className="flex items-center gap-1 text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            ONLINE
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

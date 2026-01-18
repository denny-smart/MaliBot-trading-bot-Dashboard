import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { AccessPortal } from '@/components/landing/AccessPortal';

export default function Login() {
  const navigate = useNavigate();
  const { signInWithGoogle, isAuthenticated, isApproved, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (isApproved) {
        navigate('/dashboard');
      } else {
        navigate('/pending-approval');
      }
    }
  }, [isAuthenticated, isApproved, authLoading, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: 'Access Denied',
        description: error.message || 'Security Handshake Failed',
        variant: 'destructive',
      });
      setIsLoading(false);
      throw error; // Propagate to AccessPortal for visual feedback
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-primary font-mono text-sm tracking-widest animate-pulse">ESTABLISHING UPLINK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Cyber Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

      {/* Scanlines Overlay */}
      <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Logo / Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-black/50 border border-primary/20 text-primary mb-6 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
            <img src="/favicon.png" alt="MaliBot Logo" className="w-10 h-10 animate-pulse-slow object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-widest uppercase">MaliBot</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-primary/60 font-mono text-xs tracking-widest">SYSTEM V2.5 ONLINE</span>
          </div>
        </div>

        {/* Access Portal */}
        <div className="w-full animate-slide-in">
          <AccessPortal onAuth={handleGoogleSignIn} isLoading={isLoading} />
        </div>

        <div className="mt-12 w-full flex justify-center">
          <Link to="/">
            <motion.div
              className="relative group px-6 py-2"
              whileHover="hover"
              initial="idle"
            >
              {/* Gooey Background Liquid */}
              <motion.div
                className="absolute inset-0 bg-primary/10 rounded-full blur-md"
                variants={{
                  idle: { scale: 0.8, opacity: 0 },
                  hover: {
                    scale: 1.2,
                    opacity: 1,
                    transition: { duration: 0.4, ease: "easeOut" }
                  }
                }}
              />

              {/* Content Container */}
              <div className="relative flex items-center gap-3 text-primary/80 group-hover:text-primary transition-colors duration-300">
                <motion.div
                  variants={{
                    idle: { x: 0 },
                    hover: { x: -4 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </motion.div>

                <div className="flex flex-col items-start">
                  <span className="text-xs font-mono tracking-widest uppercase">
                    [ RETURN TO COMMAND ]
                  </span>

                  {/* Secondary Tooltip Text */}
                  <motion.span
                    className="text-[10px] text-primary/50 font-sans tracking-wide absolute top-full left-0 mt-1 whitespace-nowrap"
                    variants={{
                      idle: { opacity: 0, y: -5 },
                      hover: { opacity: 1, y: 0 }
                    }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    Revert to Main Interface
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, ShieldCheck, Lock, AlertTriangle, X, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  itemFadeIn,
  containerStagger
} from "@/lib/animations";

export function HeroCommandCenter() {
  const containerRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden perspective-1000">
      {/* Background Grid with Parallax (Simulated via fixed attachment or translate) */}
      <div className="absolute inset-0 bg-grid-white/5 bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)] pointer-events-none" />

      {/* Dynamic Signal Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <motion.div
          className="absolute h-[1px] w-full bg-primary/50 top-1/4"
          animate={{ left: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
        />
        <motion.div
          className="absolute h-[1px] w-full bg-secondary/50 top-3/4"
          animate={{ right: ["-100%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div
        ref={containerRef}
        className="container relative z-10 mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center"
        variants={containerStagger}
        initial="hidden"
        animate="visible"
      >
        {/* Text Content */}
        <div className="space-y-6 text-center lg:text-left">
          <motion.div variants={itemFadeIn}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              SYSTEM ONLINE
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tighter"
            variants={itemFadeIn}
          >
            Trade with rules,<br />
            <span className="text-primary text-glow">not emotions.</span>
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            variants={itemFadeIn}
          >
            Automated trading designed to protect your capital. A system that waits for the right moment. Not every moment.
          </motion.p>

          <motion.div
            className="flex flex-col items-center sm:items-start gap-6 pt-4"
            variants={itemFadeIn}
          >
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/login" className="w-full sm:w-auto">
                <Button className="relative overflow-hidden w-full sm:w-auto h-16 px-8 text-lg font-bold tracking-wide control-btn bg-primary text-primary-foreground hover:bg-primary/90 group group-hover:scale-[1.02] transition-all duration-300 shadow-[0_0_20px_rgba(0,255,157,0.3)]">
                  <span className="relative z-10 flex items-center gap-3">
                    Start Automating Now
                    <ArrowRight className="w-5 h-5" />
                  </span>
                  {/* Button Scan Effect */}
                  <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </Button>
              </Link>


            </div>

            <div className="flex items-center gap-3 text-muted-foreground bg-black/40 px-4 py-2 rounded border border-white/5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="font-mono text-xs tracking-widest uppercase">
                Access Restricted to Authorized Personnel
              </span>
            </div>
          </motion.div>
        </div>

        {/* Visual Terminal / HUD Replacement - Video Trigger */}
        <motion.div
          className="relative lg:h-[500px] w-full flex items-center justify-center perspective-1000"
          variants={itemFadeIn}
        >
          {/* Main Video Trigger Box */}
          <div
            onClick={() => setShowVideo(true)}
            className="relative w-full max-w-lg aspect-video rounded-2xl border border-primary/20 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl cursor-pointer group hover:border-primary/50 transition-all duration-500 rotate-y-12 hover:rotate-0"
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

            {/* Play Button Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="w-20 h-20 rounded-full bg-black/50 border border-primary/50 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:bg-primary text-primary group-hover:text-black transition-all duration-300 shadow-[0_0_30px_rgba(0,255,157,0.3)]">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>
              <span className="font-mono text-sm tracking-[0.2em] text-primary group-hover:text-white transition-colors uppercase font-bold">
                Watch System Demo
              </span>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl group-hover:border-primary transition-colors" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/30 rounded-br-2xl group-hover:border-primary transition-colors" />

            {/* Status Lines */}
            <div className="absolute bottom-6 left-8 right-8 flex justify-between text-[10px] font-mono text-primary/60 uppercase">
              <span>System Status: Online</span>
              <span>v2.5.0</span>
            </div>
          </div>

          {/* Floating Badges */}
          <motion.div
            className="absolute -right-4 top-20 p-3 glass-card rounded-lg flex items-center gap-3 z-20 pointer-events-none"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="p-2 bg-primary/20 rounded-lg text-primary"><Activity className="w-4 h-4" /></div>
            <div>
              <div className="text-[10px] text-muted-foreground">MARKET SCAN</div>
              <div className="text-xs font-bold text-primary">RUNNING</div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -left-4 bottom-20 p-3 glass-card rounded-lg flex items-center gap-3 z-20 pointer-events-none"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="p-2 bg-secondary/20 rounded-lg text-secondary"><ShieldCheck className="w-4 h-4" /></div>
            <div>
              <div className="text-[10px] text-muted-foreground">PROTECTION</div>
              <div className="text-xs font-bold text-secondary">ENABLED</div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-xl border border-primary/20 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/13TMtT3WZw0?autoplay=1"
                title="How MaliBot Works"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

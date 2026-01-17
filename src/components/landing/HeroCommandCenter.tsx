import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Activity } from "lucide-react";
import { motion } from "framer-motion";
import {
  itemFadeIn,
  containerStagger,
  scanlineVertical,
  steadyLoop
} from "@/lib/animations";

export function HeroCommandCenter() {
  const containerRef = useRef(null);

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
            Autonomous Trading.<br />
            <span className="text-primary text-glow">Real-Time Intelligence.</span>
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            variants={itemFadeIn}
          >
            Execute institutional-grade strategies with the MaliBot Command Interface.
            Reserved for approved operators only.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start"
            variants={itemFadeIn}
          >
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto control-btn bg-primary text-primary-foreground hover:bg-primary/90 group group-hover:scale-[1.02] transition-transform">
                <span className="relative z-10 flex items-center gap-2">
                  Request Secure Access
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                {/* Button Scan Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  animate={{ left: ["-100%", "200%"] }}
                  transition={steadyLoop}
                />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary/20 hover:bg-primary/5 hover:text-primary">
              System Documentation
            </Button>
          </motion.div>
        </div>

        {/* Visual Terminal / HUD */}
        <motion.div
          className="relative lg:h-[500px] w-full flex items-center justify-center rotate-x-12"
          variants={itemFadeIn}
        >
          {/* Main HUD Container */}
          <div className="relative w-full max-w-md aspect-square rounded-2xl border border-primary/20 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="h-8 border-b border-primary/20 flex items-center px-4 bg-primary/5 justify-between">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
              <span className="text-[10px] font-mono text-primary/70">MALIBOT_CORE.EXE</span>
            </div>

            <div className="p-6 space-y-4 relative">
              {/* Scanline Overlay */}
              <motion.div
                className="absolute left-0 right-0 h-[2px] bg-primary/30 z-20 shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                variants={scanlineVertical}
                initial="initial"
                animate="animate"
              />

              {/* Data Rows */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-muted-foreground">
                    <span>MODULE_0{i}</span>
                    <span className="text-primary">ACTIVE</span>
                  </div>
                  <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: `${60 + i * 10}%` }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: i * 0.2
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Sim Chart */}
              <div className="mt-8 border border-primary/10 rounded p-4 h-32 relative bg-primary/5 flex items-end gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-primary/40 rounded-t-sm"
                    animate={{ height: ["20%", "80%", "40%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating Badges */}
          <motion.div
            className="absolute -right-4 top-10 p-3 glass-card rounded-lg flex items-center gap-3 z-20"
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
            className="absolute -left-4 bottom-20 p-3 glass-card rounded-lg flex items-center gap-3 z-20"
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
    </section>
  );
}

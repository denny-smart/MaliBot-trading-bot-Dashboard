import { Variants, Transition } from "framer-motion";

// Mechanical ease curve: fast start, smooth stop
export const mechanicalTransition: Transition = {
    type: "tween",
    ease: [0.25, 0.1, 0.25, 1.0],
    duration: 0.4
};

// Subtler curve for continuous loops
export const steadyLoop: Transition = {
    repeat: Infinity,
    ease: "linear",
    duration: 4
};

// Item Entry: Slide up + Fade
export const itemFadeIn: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: mechanicalTransition
    }
};

// Container Stagger
export const containerStagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

// Scanning Line Effect (Vertical)
export const scanlineVertical: Variants = {
    initial: { top: "-10%" },
    animate: {
        top: "110%",
        transition: {
            repeat: Infinity,
            ease: "linear",
            duration: 2.5
        }
    }
};

// Scanning Line Effect (Horizontal)
export const scanlineHorizontal: Variants = {
    initial: { left: "-10%" },
    animate: {
        left: "110%",
        transition: {
            repeat: Infinity,
            ease: "linear",
            duration: 3
        }
    }
};

// Pulse for critical status
export const attentionPulse: Variants = {
    idle: { scale: 1, opacity: 1 },
    active: {
        scale: [1, 1.02, 1],
        opacity: [1, 0.8, 1],
        transition: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
        }
    }
};

// Rotating ring for 'Active' state
export const rotatingRing: Variants = {
    animate: {
        rotate: 360,
        transition: {
            repeat: Infinity,
            duration: 8,
            ease: "linear"
        }
    }
};

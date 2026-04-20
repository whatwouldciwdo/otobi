"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function ScrollReveal({
    children,
    delay = 0,
    y = 50,
    duration = 0.8,
    once = true,
    className = ""
}: {
    children: ReactNode;
    delay?: number;
    y?: number;
    duration?: number;
    once?: boolean;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, margin: "-100px" }}
            transition={{
                duration,
                delay,
                ease: [0.16, 1, 0.3, 1] // Custom refined spring-like easing
            }}
        >
            {children}
        </motion.div>
    );
}

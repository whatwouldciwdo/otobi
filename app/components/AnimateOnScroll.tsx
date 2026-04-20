"use client";
import { useEffect, useRef } from "react";

interface AnimateOnScrollProps {
    children: React.ReactNode;
    className?: string;
    animation?: "fade-up" | "fade-left" | "fade-right" | "scale-in" | "fade-in";
    delay?: number; 
    threshold?: number;
    as?: React.ElementType;
}

export default function AnimateOnScroll({
    children,
    className = "",
    animation = "fade-up",
    delay = 0,
    threshold = 0.15,
    as: Tag = "div",
}: AnimateOnScrollProps) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        el.style.transitionDelay = `${delay}ms`;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("anim-visible");
                    observer.unobserve(el);
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [delay, threshold]);

    return (
        
        <Tag ref={ref} className={`anim-${animation} ${className}`}>
            {children}
        </Tag>
    );
}

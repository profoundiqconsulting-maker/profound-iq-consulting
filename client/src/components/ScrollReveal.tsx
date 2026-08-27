/* Profound IQ Consulting — Executive Observatory motion primitive: quiet, accessible reveals that keep content legible without motion. */
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";

type ScrollRevealProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  delay?: number;
  threshold?: number;
};

export function ScrollReveal({ children, delay = 0, threshold = 0.16, className = "", style, ...props }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold, rootMargin: "0px 0px -8% 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return <div ref={ref} className={`scroll-reveal ${visible ? "is-visible" : ""} ${className}`.trim()} style={{ ...style, transitionDelay: `${delay}ms` }} {...props}>{children}</div>;
}

export function ScrollRevealGroup({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={`scroll-reveal-group ${className}`.trim()} {...props}>{children}</div>;
}

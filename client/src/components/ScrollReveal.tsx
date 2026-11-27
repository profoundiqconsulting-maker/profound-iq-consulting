/* Profound IQ Consulting — Executive Observatory motion primitive: quiet, accessible reveals that keep content legible without motion. */
import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

type RevealVariant = "fade-up" | "fade-in" | "scale-up" | "slide-left" | "slide-right";

type ScrollRevealProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  delay?: number;
  threshold?: number;
  variant?: RevealVariant;
  stagger?: number; // ms between each staggered child
};

const VARIANT_INITIAL: Record<RevealVariant, string> = {
  "fade-up": "translateY(16px)",
  "fade-in": "none",
  "scale-up": "scale(0.94)",
  "slide-left": "translateX(-20px)",
  "slide-right": "translateX(20px)",
};

export function ScrollReveal({
  children,
  delay = 0,
  threshold = 0.16,
  variant = "fade-up",
  stagger,
  className = "",
  style,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  const revealClass = `scroll-reveal scroll-reveal--${variant} ${visible ? "is-visible" : ""} ${className}`.trim();

  // Staggered children: each direct element gets its own reveal-item wrapper
  // with an incremental transition-delay so they animate in sequence.
  const renderChildren = (): ReactNode => {
    if (!stagger || stagger <= 0) return children;
    const arr = Array.isArray(children) ? children : [children];
    return arr.map((child, index) => {
      if (!isValidElement(child)) return child;
      return (
        <div
          key={index}
          className="reveal-item"
          style={{
            transitionDelay: `${index * stagger}ms`,
            ...(((child as any).props?.style || {})),
          }}
        >
          {child}
        </div>
      );
    });
  };

  return (
    <div
      ref={ref}
      className={revealClass}
      style={{ ...style, transitionDelay: `${delay}ms` }}
      {...props}
    >
      {renderChildren()}
    </div>
  );
}

export function ScrollRevealGroup({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`scroll-reveal-group ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

function isValidElement(node: ReactNode): node is React.ReactElement {
  return (
    typeof node === "object" &&
    node !== null &&
    "$$typeof" in (node as object)
  );
}

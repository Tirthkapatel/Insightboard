import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const glowVariants = cva(
  "absolute pointer-events-none -z-10 rounded-full blur-[120px] transition-all opacity-80",
  {
    variants: {
      variant: {
        top: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.22),hsl(var(--brand)/0.35),transparent_70%)]",
        above: "-top-24 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.25),hsl(var(--brand)/0.3),transparent_70%)]",
        bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.28),rgba(217,119,6,0.15),transparent_70%)]",
        below: "-bottom-24 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.3),transparent_70%)]",
        center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.2),hsl(var(--brand)/0.3),transparent_70%)]",
        amber: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-[900px] h-[450px] bg-[radial-gradient(ellipse_at_bottom,rgba(245,158,11,0.35),rgba(217,119,6,0.18),rgba(234,88,12,0.06),transparent_70%)] blur-[130px]",
      },
    },
    defaultVariants: {
      variant: "top",
    },
  }
);

export interface GlowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glowVariants> {
  className?: string;
}

export function Glow({ className, variant, ...props }: GlowProps) {
  return <div className={cn(glowVariants({ variant }), className)} {...props} />;
}

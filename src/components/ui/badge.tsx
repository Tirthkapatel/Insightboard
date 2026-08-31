import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-600 text-white shadow hover:bg-indigo-500",
        secondary:
          "border-transparent bg-slate-800 text-slate-100 hover:bg-slate-700",
        destructive:
          "border-transparent bg-rose-600 text-white shadow hover:bg-rose-500",
        outline:
          "border-indigo-800/80 bg-indigo-950/80 text-indigo-300 backdrop-blur-sm hover:border-indigo-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
  className?: string;
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants };

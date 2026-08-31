import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-[0.98]",
        glow: "relative bg-slate-900 text-slate-100 border border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/90 shadow-md transition-all active:scale-[0.98]",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-500 active:scale-[0.98]",
        outline:
          "border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white",
        secondary:
          "bg-slate-800 text-slate-100 hover:bg-slate-700",
        ghost: "hover:bg-slate-800 hover:text-white text-slate-300",
        link: "text-indigo-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-12 px-6 text-base rounded-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

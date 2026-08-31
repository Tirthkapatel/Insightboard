import React from "react";
import { cn } from "../../lib/utils.js";

export interface MockupFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "large";
  children?: React.ReactNode;
  className?: string;
}

export function MockupFrame({
  children,
  className,
  size = "medium",
  ...props
}: MockupFrameProps) {
  const sizeClasses = {
    small: "max-w-4xl",
    medium: "max-w-5xl",
    large: "max-w-7xl",
  };

  return (
    <div
      className={cn(
        "relative mx-auto rounded-2xl border border-zinc-800 bg-black p-2 sm:p-3 shadow-2xl shadow-black h-auto",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {/* Top Browser Bar Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2 border-b border-zinc-800/80 px-2.5 sm:px-4 pt-1 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500" />
          </div>
          <div className="ml-2 hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 truncate max-w-[200px]">
            <span className="text-emerald-400">https://</span>app.insightboard.io
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-indigo-950/90 text-indigo-300 border border-indigo-800/80 text-[10px] sm:text-xs font-semibold tracking-wider uppercase whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            Live SQL Engine
          </span>
        </div>
      </div>

      <div className="relative rounded-xl bg-black border border-zinc-800 h-auto">
        {children}
      </div>
    </div>
  );
}

export interface MockupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "responsive" | "desktop" | "mobile";
  children?: React.ReactNode;
  className?: string;
}

export function Mockup({
  children,
  className,
  type = "responsive",
  ...props
}: MockupProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden transition-all",
        type === "responsive" && "relative aspect-[16/9] sm:aspect-[16/10]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

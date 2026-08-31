import React from "react";
import { motion } from "framer-motion";
import { Button } from "./button.js";
import { Badge } from "./badge.js";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "./mockup.js";

export interface HeroAction {
  text: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "glow" | "outline" | "secondary" | "ghost";
}

export interface HeroProps {
  badge?: {
    text: string;
    action: { text: string; href?: string; onClick?: () => void };
  };
  title: string;
  description: string;
  actions: HeroAction[];
  image: { light: string; dark: string; alt: string };
  mockupNode?: React.ReactNode;
}

export function HeroSection({ badge, title, description, actions, image, mockupNode }: HeroProps) {
  return (
    <div className="relative bg-black text-zinc-100 overflow-hidden pt-6 lg:pt-10 pb-16 sm:pb-24">
      
      {/* Subtle Indigo/Purple Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[500px] bg-indigo-600/15 rounded-full blur-[160px]" />
        <div className="absolute top-[20%] right-[-10%] w-[650px] h-[550px] bg-purple-600/15 rounded-full blur-[170px]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* SUBTLE TRANSPARENT ANIMATED GRAPH & DATA GRID BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        {/* Transparent Grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="heroGridPattern" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGridPattern)" />
        </svg>

        {/* Low opacity animated graph paths */}
        <div className="absolute inset-x-0 bottom-0 top-0 max-w-7xl mx-auto opacity-20 sm:opacity-25 px-4 pointer-events-none">
          <svg viewBox="0 0 1000 380" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroGraphLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                <stop offset="40%" stopColor="#a855f7" stopOpacity="0.9" />
                <stop offset="80%" stopColor="#818cf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="heroGraphAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
              </linearGradient>
              <filter id="heroGraphGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Faint Horizontal Chart Gridlines */}
            <g opacity="0.15">
              <line x1="0" y1="80" x2="1000" y2="80" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke="#818cf8" strokeWidth="0.8" strokeDasharray="4 4" />
              <line x1="0" y1="220" x2="1000" y2="220" stroke="#818cf8" strokeWidth="0.8" strokeDasharray="4 4" />
              <line x1="0" y1="290" x2="1000" y2="290" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="4 4" />
            </g>

            {/* Area Gradient under time-series chart */}
            <motion.path
              d="M 0 280 L 70 245 L 140 260 L 220 190 L 300 225 L 380 145 L 460 175 L 540 110 L 620 135 L 700 80 L 780 105 L 860 55 L 940 75 L 1000 40 L 1000 380 L 0 380 Z"
              fill="url(#heroGraphAreaGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />

            {/* Primary Time-Series Line Chart Path (Animated Left-to-Right Plot) */}
            <motion.path
              d="M 0 280 L 70 245 L 140 260 L 220 190 L 300 225 L 380 145 L 460 175 L 540 110 L 620 135 L 700 80 L 780 105 L 860 55 L 940 75 L 1000 40"
              fill="none"
              stroke="url(#heroGraphLineGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#heroGraphGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 3, ease: "easeInOut" },
                opacity: { duration: 0.5 }
              }}
            />

            {/* Live Vertical Scan / Cursor Line */}
            <motion.line
              y1="0"
              y2="380"
              stroke="rgba(168, 85, 247, 0.25)"
              strokeWidth="1"
              strokeDasharray="3 3"
              animate={{ x1: [0, 1000], x2: [0, 1000] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            {/* Vertex Data Point Markers along the Line Chart */}
            {[
              { x: 140, y: 260 },
              { x: 220, y: 190 },
              { x: 380, y: 145 },
              { x: 460, y: 175 },
              { x: 620, y: 135 },
              { x: 780, y: 105 },
              { x: 940, y: 75 }
            ].map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill="#818cf8"
                className="opacity-70"
              />
            ))}

            {/* Key Peak Data Points with Live Pulsing Ping Effect */}
            {[
              { x: 540, y: 110 },
              { x: 700, y: 80 },
              { x: 860, y: 55 }
            ].map((pt, idx) => (
              <g key={`ping-${idx}`}>
                {/* Outer Pulsing Ping Ring */}
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.2"
                  animate={{
                    r: [4, 12, 16],
                    opacity: [0.9, 0.4, 0]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: idx * 0.7,
                    ease: "easeOut"
                  }}
                />
                {/* Core Glowing Vertex Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#c084fc"
                  className="shadow-sm"
                />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* ASYMMETRIC SPLIT HERO GRID CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-start w-full">
          
          {/* LEFT COLUMN: HERO TEXT & ACTIONS (50% width) */}
          <div className="lg:col-span-1 flex flex-col items-start text-left space-y-5 sm:space-y-6 w-full max-w-2xl lg:pt-2">
            
            {/* Inline Label with Pulsing Dot Indicator (replaces standard pill badge) */}
            {badge && (
              <div className="animate-appear opacity-0 inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-xs font-semibold text-indigo-300 font-mono shadow-sm">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-zinc-200 font-medium truncate">{badge.text}</span>
                <span className="text-zinc-600">|</span>
                {badge.action.onClick ? (
                  <button
                    onClick={badge.action.onClick}
                    className="inline-flex items-center gap-1 font-bold text-indigo-400 hover:text-white transition-colors cursor-pointer group shrink-0"
                  >
                    <span>{badge.action.text}</span>
                    <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <a
                    href={badge.action.href || "#"}
                    className="inline-flex items-center gap-1 font-bold text-indigo-400 hover:text-white transition-colors group shrink-0"
                  >
                    <span>{badge.action.text}</span>
                    <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}
              </div>
            )}

            {/* Headline with deliberate typographic personality & weight contrast */}
            <h1 className="animate-appear opacity-0 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.1] text-left">
              <span className="font-light text-zinc-300 block mb-1">Turn raw data into </span>
              <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                insight, faster.
              </span>
            </h1>

            {/* Description */}
            <p className="animate-appear opacity-0 delay-100 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-lg text-left font-normal">
              {description}
            </p>

            {/* Actions */}
            <div className="animate-appear opacity-0 delay-200 flex flex-wrap items-center justify-start gap-3.5 pt-2">
              {actions.map((action, index) => {
                if (action.onClick) {
                  return (
                    <Button
                      key={index}
                      variant={action.variant || "default"}
                      size="lg"
                      onClick={action.onClick}
                      className="flex items-center gap-2 text-sm font-bold cursor-pointer shadow-xl shadow-indigo-600/30 px-6 py-3 rounded-xl"
                    >
                      {action.icon}
                      {action.text}
                    </Button>
                  );
                }
                return (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    size="lg"
                    asChild
                    className="px-6 py-3 rounded-xl"
                  >
                    <a href={action.href || "#"} className="flex items-center gap-2 text-sm font-bold">
                      {action.icon}
                      {action.text}
                    </a>
                  </Button>
                );
              })}
            </div>

            {/* Trust highlights */}
            <div className="animate-appear opacity-0 delay-300 pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-400 font-medium border-t border-zinc-800/80 w-full">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span>SQLite &amp; Remote DB Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                <span>In-Memory Latency &lt; 10ms</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: DASHBOARD MOCKUP / PRODUCT SCREENSHOT */}
          <div className="lg:col-span-1 w-full max-w-full overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="w-full relative max-w-full overflow-hidden"
            >
              <MockupFrame size="large" className="w-full max-w-full shadow-2xl shadow-indigo-950/80 border border-indigo-500/30 bg-[#0a0a0f] rounded-2xl overflow-hidden">
                {mockupNode ? (
                  mockupNode
                ) : (
                  <Mockup type="responsive">
                    <img
                      src={image.dark || image.light}
                      alt={image.alt}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </Mockup>
                )}
              </MockupFrame>
            </motion.div>
          </div>

        </div>
      </div>

    </div>
  );
}

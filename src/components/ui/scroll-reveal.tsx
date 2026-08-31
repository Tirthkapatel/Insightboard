import React from 'react';
import { motion, Variants } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom';
}

// Framer Motion - Scroll Triggered Fade-in Slide-up Animation
const scrollAnim: Variants = {
  hidden: (direction: string = 'up') => {
    switch (direction) {
      case 'down':
        return { opacity: 0, y: -50 };
      case 'left':
        return { opacity: 0, x: 50 };
      case 'right':
        return { opacity: 0, x: -50 };
      case 'zoom':
        return { opacity: 0, scale: 0.9, y: 30 };
      case 'up':
      default:
        return { opacity: 0, y: 50 };
    }
  },
  visible: (custom: { delayMs: number }) => ({
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      delay: (custom?.delayMs || 0) / 1000,
    },
  }),
};

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
}) => {
  return (
    <motion.div
      variants={scrollAnim}
      initial="hidden"
      whileInView="visible"
      custom={{ delayMs }}
      viewport={{ once: true, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};


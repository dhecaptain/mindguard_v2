'use client'
import { motion, useScroll, useTransform, useInView, useSpring, useMotionValue } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function Reveal({ children, delay = 0, y = 24, className = '' }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({ children, stagger = 0.1, className = '' }: { children: React.ReactNode; stagger?: number; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Parallax({ children, offset = 40, className = '' }: { children: React.ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -offset])
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}

export function CountUp({ value, suffix = '', prefix = '' }: { value: string; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 90, damping: 20 })
  const num = parseFloat(value.replace(/[^0-9.]/g, '')) || 0
  const isPercent = value.includes('%')
  const hasK = value.toLowerCase().includes('k')
  const display = value.replace(/[^0-9.:/]/g, '')

  useEffect(() => {
    if (inView) motionVal.set(hasK ? num : num)
  }, [inView, motionVal, num, hasK])

  const text = hasK || isPercent || value.includes(':') ? value : display

  if (value.includes(':') || value.includes('/') || hasK) {
    return (
      <motion.span
        ref={ref}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {prefix}{text}{suffix}
      </motion.span>
    )
  }
  return (
    <span ref={ref}>
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {prefix}{text}{suffix}
      </motion.span>
    </span>
  )
}

export function FloatingOrb({ className, size = 400, duration = 18 }: { className?: string; size?: number; duration?: number }) {
  return (
    <motion.div
      aria-hidden
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.05, 0.98, 1] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function HoverLift({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className={className}>
      {children}
    </motion.div>
  )
}

export function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x ${className}`}>
      {children}
    </span>
  )
}

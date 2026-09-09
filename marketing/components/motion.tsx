'use client'
import { motion, useScroll, useTransform, useInView, useMotionValue, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'

const EASE = [0.22, 0.61, 0.36, 1] as const

export function Reveal({ children, delay = 0, y = 20, className = '' }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({ children, stagger = 0.08, className = '' }: { children: React.ReactNode; stagger?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : stagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Parallax({ children, offset = 30, className = '' }: { children: React.ReactNode; offset?: number; className?: string }) {
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
  const num = parseFloat(value.replace(/[^0-9.]/g, '')) || 0
  const hasK = value.toLowerCase().includes('k')
  const display = value.replace(/[^0-9.:/]/g, '')

  useEffect(() => {
    if (inView) motionVal.set(hasK ? num : num)
  }, [inView, motionVal, num, hasK])

  const text = hasK || value.includes('%') || value.includes(':') ? value : display

  if (value.includes(':') || value.includes('/') || hasK) {
    return (
      <motion.span
        ref={ref}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {prefix}{text}{suffix}
      </motion.span>
    )
  }
  return (
    <span ref={ref}>
      <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        {prefix}{text}{suffix}
      </motion.span>
    </span>
  )
}

export function FloatingOrb({ className, size = 400, duration = 18 }: { className?: string; size?: number; duration?: number }) {
  void duration
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute blur-3xl ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function HoverLift({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 24 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-forest ${className}`}>
      {children}
    </span>
  )
}

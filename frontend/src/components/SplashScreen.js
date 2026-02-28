import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black via-obsidian to-obsidian-light"
    >
      <div className="text-center space-y-8">
        {/* Animated Fire Circle */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: 'spring', bounce: 0.5 }}
          className="flex justify-center"
        >
          <div className="relative">
            {/* Outer glow rings */}
            <motion.div
              className="absolute inset-0 w-32 h-32 rounded-full bg-agni/30 blur-2xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute inset-0 w-32 h-32 rounded-full bg-ember/20 blur-xl"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />
            
            {/* Center logo */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-agni via-ember to-agni flex items-center justify-center shadow-[0_0_60px_rgba(255,87,34,0.8)]">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Flame className="w-16 h-16 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* App Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-2"
        >
          <h1 className="text-6xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-agni via-ember to-agni">
            HANUMAN GPT
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-[#cca891] text-lg font-hindi"
          >
            शक्ति, भक्ति, बुद्धि
          </motion.p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-agni"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default SplashScreen
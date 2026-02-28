import React from 'react'
import { motion } from 'framer-motion'

const VoiceOrb = ({ listening, isProcessing }) => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {(listening || isProcessing) && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-agni/20"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-ember/20"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
          />
        </>
      )}
      
      <motion.div
        className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${
          listening || isProcessing
            ? 'from-agni via-ember to-agni'
            : 'from-agni/50 to-ember/50'
        } flex items-center justify-center shadow-[0_0_40px_rgba(255,87,34,0.8)]`}
        animate={
          listening || isProcessing
            ? {
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360],
              }
            : { scale: 1 }
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-obsidian/80 backdrop-blur-sm"
          animate={
            listening || isProcessing
              ? { scale: [1, 0.9, 1] }
              : { scale: 1 }
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  )
}

export default VoiceOrb
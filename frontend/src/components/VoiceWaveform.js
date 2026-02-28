import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const VoiceWaveform = ({ isRecording, audioStream }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const analyserRef = useRef(null)

  useEffect(() => {
    if (!isRecording || !audioStream) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(audioStream)
    
    source.connect(analyser)
    analyser.fftSize = 256
    
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current = analyser

    const draw = () => {
      if (!isRecording) return
      
      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.fillStyle = 'rgba(5, 2, 1, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
        gradient.addColorStop(0, '#ff5722')
        gradient.addColorStop(0.5, '#ffc107')
        gradient.addColorStop(1, '#ff9800')
        
        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        
        x += barWidth + 1
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      audioContext.close()
    }
  }, [isRecording, audioStream])

  if (!isRecording) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full bg-obsidian-card/80 border border-agni/30 rounded-xl p-4 mb-4"
    >
      <div className="text-center mb-2">
        <p className="text-agni font-hindi text-sm font-bold">🎙️ रिकॉर्डिंग चल रही है...</p>
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        className="w-full rounded-lg"
      />
    </motion.div>
  )
}

export default VoiceWaveform
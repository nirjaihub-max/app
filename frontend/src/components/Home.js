import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MessageSquare, Image as ImageIcon, Sparkles, Scissors } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import VoiceOrb from './VoiceOrb'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { toast } from 'sonner'

const Home = ({ sessionId, language }) => {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition()

  useEffect(() => {
    if (transcript.toLowerCase().includes('jai hanuman')) {
      handleVoiceActivation()
    }
  }, [transcript])

  const handleVoiceActivation = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    toast.success('🔥 जय हनुमान! सुन रहा हूं...')
    resetTranscript()
    
    setTimeout(() => {
      setIsProcessing(false)
      navigate('/chat')
    }, 1500)
  }

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('आपका ब्राउज़र वॉइस को सपोर्ट नहीं करता')
      return
    }
    SpeechRecognition.startListening({ continuous: true, language: language === 'hi' ? 'hi-IN' : 'en-IN' })
  }

  const stopListening = () => {
    SpeechRecognition.stopListening()
  }

  const features = [
    {
      icon: MessageSquare,
      title: 'AI चैट',
      desc: 'हिंदी और English में बात करें',
      path: '/chat',
      color: 'from-orange-600 to-red-600'
    },
    {
      icon: ImageIcon,
      title: 'AI इमेज',
      desc: 'कुछ भी imagine करें, create करें',
      path: '/image',
      color: 'from-amber-600 to-orange-600'
    },
    {
      icon: Scissors,
      title: 'Image Editor',
      desc: 'बैकग्राउंड हटाएं, 4K upscale',
      path: '/editor',
      color: 'from-red-600 to-pink-600'
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian-light to-obsidian opacity-90"></div>
      
      <div className="relative z-10 w-full max-w-md space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-agni to-ember flex items-center justify-center shadow-[0_0_40px_rgba(255,87,34,0.6)]">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-agni via-ember to-agni drop-shadow-[0_0_20px_rgba(255,87,34,0.5)]" data-testid="app-title">
            HANUMAN GPT
          </h1>
          <p className="text-[#cca891] text-lg font-hindi">आपका AI सुपर असिस्टेंट</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="flex flex-col items-center gap-4"
        >
          <VoiceOrb listening={listening} isProcessing={isProcessing} />
          
          <div className="text-center space-y-2">
            <p className="text-[#ffb74d] font-hindi text-sm">
              बोलें: <span className="font-bold text-agni">"जय हनुमान"</span> या माइक दबाएं
            </p>
            <button
              onClick={listening ? stopListening : startListening}
              className={`px-8 py-3 rounded-full font-bold uppercase text-sm transition-all duration-300 ${
                listening
                  ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                  : 'bg-gradient-to-r from-agni to-ember hover:from-orange-500 hover:to-amber-500 shadow-[0_0_20px_rgba(255,87,34,0.6)]'
              }`}
              data-testid="voice-activation-button"
            >
              <Mic className="w-5 h-5 inline mr-2" />
              {listening ? 'रोकें' : 'माइक चालू करें'}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(feature.path)}
                className="bg-obsidian-card/80 backdrop-blur-md border border-agni/20 rounded-2xl p-6 hover:border-agni/60 transition-all duration-300 text-left group"
                data-testid={`feature-card-${idx}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:shadow-[0_0_20px_rgba(255,87,34,0.5)] transition-all`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#ffebd6] mb-1 font-hindi">{feature.title}</h3>
                <p className="text-xs text-[#8a6a5c] font-hindi">{feature.desc}</p>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

export default Home
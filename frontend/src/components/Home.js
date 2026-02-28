import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Image as ImageIcon, Sparkles, Scissors } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Home = ({ sessionId, language }) => {
  const navigate = useNavigate()

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
          <div className="mt-4 bg-obsidian-card/60 backdrop-blur-md border border-agni/30 rounded-xl px-6 py-3 inline-block">
            <p className="text-[#ffb74d] font-hindi text-sm">
              🎙️ बोलें: <span className="font-bold text-agni">"जय हनुमान"</span> फिर कोई भी कमांड
            </p>
            <p className="text-[#8a6a5c] text-xs mt-1 font-hindi">
              जैसे: "image banao", "chat kholo", "editor kholo"
            </p>
            <p className="text-[#6a4a3c] text-xs mt-2 font-hindi border-t border-agni/20 pt-2">
              💡 नोट: Desktop Chrome में सबसे बेहतर काम करता है
            </p>
          </div>
        </motion.div>

        {/* Feature Cards */}
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
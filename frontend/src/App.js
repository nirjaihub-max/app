import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, Image as ImageIcon, Settings, Mic, Scissors } from 'lucide-react'
import { Toaster } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import SplashScreen from './components/SplashScreen'
import ChatScreen from './components/ChatScreen'
import ImageGenerator from './components/ImageGenerator'
import ImageEditor from './components/ImageEditor'
import SettingsScreen from './components/SettingsScreen'
import Home from './components/Home'
import useVoiceCommands from './hooks/useVoiceCommands'
import '@/App.css'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: Mic, label: 'होम' },
    { path: '/chat', icon: MessageSquare, label: 'चैट' },
    { path: '/image', icon: ImageIcon, label: 'इमेज' },
    { path: '/editor', icon: Scissors, label: 'एडिटर' },
    { path: '/settings', icon: Settings, label: 'सेटिंग्स' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-agni/30 z-50 safe-area-pb" data-testid="bottom-navigation">
      <div className="flex justify-around items-center p-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-agni' : 'text-[#cca891] hover:text-agni'
              }`}
              data-testid={`nav-${item.label}`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,87,34,0.8)]' : ''}`} />
              <span className="text-xs font-hindi">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function AppContent() {
  const [sessionId] = useState(() => `session-${Date.now()}`)
  const [language, setLanguage] = useState('hi')
  const [voiceType, setVoiceType] = useState('alloy')
  const [showSplash, setShowSplash] = useState(true)
  
  // Voice Commands Hook
  const {
    listening,
    isListeningForCommand,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
    isMobile
  } = useVoiceCommands()

  // Auto-start voice listening after splash (only on desktop)
  // Disabled - user doesn't want voice commands feature
  /*
  useEffect(() => {
    if (!showSplash && browserSupportsSpeechRecognition && !isMobile) {
      startListening()
    }
  }, [showSplash])
  */

  return (
    <div className="min-h-screen pb-20">
      <Toaster position="top-center" theme="dark" />
      
      {/* Voice Command Indicator */}
      <AnimatePresence>
        {isListeningForCommand && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-agni to-ember px-6 py-3 rounded-full shadow-[0_0_30px_rgba(255,87,34,0.8)] border-2 border-white/30"
            data-testid="voice-command-indicator"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-3 h-3 bg-white rounded-full"
              />
              <p className="text-white font-bold font-hindi text-sm">
                🎙️ सुन रहा हूं... कमांड बोलें
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <>
          <Routes>
            <Route path="/" element={<Home sessionId={sessionId} language={language} />} />
            <Route path="/chat" element={<ChatScreen sessionId={sessionId} language={language} voiceType={voiceType} />} />
            <Route path="/image" element={<ImageGenerator language={language} />} />
            <Route path="/editor" element={<ImageEditor />} />
            <Route path="/settings" element={<SettingsScreen language={language} setLanguage={setLanguage} voiceType={voiceType} setVoiceType={setVoiceType} />} />
          </Routes>
          <BottomNav />
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
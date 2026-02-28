import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, Image as ImageIcon, Settings, Mic, Scissors } from 'lucide-react'
import { Toaster } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import SplashScreen from './components/SplashScreen'
import ChatScreen from './components/ChatScreen'
import ImageGenerator from './components/ImageGenerator'
import ImageEditor from './components/ImageEditor'
import SettingsScreen from './components/SettingsScreen'
import Home from './components/Home'
import '@/App.css'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: Mic, label: 'होम' },
    { path: '/chat', icon: MessageSquare, label: 'चैट' },
    { path: '/image', icon: ImageIcon, label: 'इमेज' },
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

  return (
    <div className="min-h-screen pb-20">
      <Toaster position="top-center" theme="dark" />
      
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <>
          <Routes>
            <Route path="/" element={<Home sessionId={sessionId} language={language} />} />
            <Route path="/chat" element={<ChatScreen sessionId={sessionId} language={language} voiceType={voiceType} />} />
            <Route path="/image" element={<ImageGenerator language={language} />} />
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
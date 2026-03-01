import React, { useState, useEffect, useRef } from 'react'
import { BrowserRouter } from 'react-router-dom'
import {
  Send,
  X,
  Plus,
  Mic,
  User,
  Sun,
  Moon,
  MessageSquare,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import useVoiceCommands from './hooks/useVoiceCommands'
import '@/App.css'

/* ================= HELPER ================= */
function SettingItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5">
      <div className="flex items-center gap-3">
        <span>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {value && <span className="text-sm opacity-60">{value}</span>}
    </div>
  )
}

/* ================= APP ================= */
function AppContent() {
  const [theme, setTheme] = useState('dark')
  const [openSidebar, setOpenSidebar] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  const [liveMode, setLiveMode] = useState(false)

  const [chats, setChats] = useState([
    { id: Date.now(), title: 'New chat', messages: [] },
  ])
  const [activeChatId, setActiveChatId] = useState(chats[0].id)
  const [input, setInput] = useState('')

  const bottomRef = useRef(null)

  const {
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
    isMobile,
  } = useVoiceCommands()

  const isDark = theme === 'dark'
  const activeChat = chats.find((c) => c.id === activeChatId)

  /* ===== THEME FIX (GLOBAL) ===== */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages])

  /* ===== CHAT ===== */
  const sendMessage = () => {
    if (!input.trim()) return
    const text = input
    setInput('')

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, { role: 'user', content: text }] }
          : chat
      )
    )

    if (liveMode) {
      setLiveMode(false)
      stopListening()
    }

    setTimeout(() => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { role: 'assistant', content: 'जय हनुमान 🙏\n\nमैं आपकी सहायता के लिए यहाँ हूँ।' },
                ],
              }
            : chat
        )
      )
    }, 700)
  }

  const newChat = () => {
    const id = Date.now()
    setChats([{ id, title: 'New chat', messages: [] }, ...chats])
    setActiveChatId(id)
    setOpenSidebar(false)
  }

  const toggleLive = () => {
    if (!browserSupportsSpeechRecognition || isMobile) return
    setLiveMode((p) => !p)
    !liveMode ? startListening() : stopListening()
  }

  const surface = isDark ? 'bg-[#1e1e1e]' : 'bg-white shadow'
  const soft = isDark ? 'bg-[#141414]' : 'bg-[#f1f1f1]'

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-[#0b0b0b] text-[#f5e6d3]' : 'bg-[#f7f7f8] text-gray-900'}`}>
      <Toaster position="top-center" theme={isDark ? 'dark' : 'light'} />

      {/* ================= HEADER ================= */}
      <header className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setOpenSidebar(true)} className={`w-9 h-9 rounded-full ${surface} flex items-center justify-center`}>
            ☰
          </button>
          <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${surface}`}>
            HanumanGPT
          </div>
        </div>

        <button onClick={() => setOpenProfile(true)} className={`w-9 h-9 rounded-full ${surface} text-agni flex items-center justify-center`}>
          <User size={16} />
        </button>
      </header>

      {/* ================= CHAT ================= */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {activeChat.messages.length === 0 && (
            <div className="flex justify-center py-20">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-28 h-28 rounded-full bg-black flex items-center justify-center border border-agni/40"
              >
                <img src="/icon-512.png" className="w-20 h-20" />
              </motion.div>
            </div>
          )}

          {activeChat.messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-agni text-black rounded-br-md'
                  : `${surface} rounded-bl-md`
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ================= INPUT ================= */}
      <div className={`${isDark ? 'bg-black' : 'bg-white shadow-inner'}`}>
        <div className="max-w-3xl mx-auto px-3 py-3 flex gap-2">
          <button className={`w-10 h-10 rounded-full ${soft} flex items-center justify-center`}>
            <Plus size={18} />
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message HanumanGPT..."
            className={`flex-1 rounded-2xl px-4 text-sm outline-none ${soft}`}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />

          <button onClick={toggleLive} className={`w-10 h-10 rounded-full flex items-center justify-center ${liveMode ? 'bg-agni text-black' : soft}`}>
            <Mic size={18} />
          </button>

          <button onClick={sendMessage} className="w-10 h-10 rounded-full bg-agni text-black flex items-center justify-center">
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* ================= SIDEBAR ================= */}
      <AnimatePresence>
        {openSidebar && (
          <>
            <motion.div className="fixed inset-0 bg-black/60 z-40" onClick={() => setOpenSidebar(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className={`fixed top-0 left-0 h-full w-72 z-50 p-4 flex flex-col ${surface}`}>
              <button onClick={() => setOpenSidebar(false)} className="absolute top-4 right-4 text-agni">
                <X />
              </button>

              <button onClick={newChat} className="w-full mb-4 py-3 rounded-lg bg-agni text-black font-semibold flex items-center justify-center gap-2">
                <Plus size={16} /> New Chat
              </button>

              <div className="flex-1 overflow-y-auto space-y-2">
                {chats.map((chat) => (
                  <button key={chat.id} onClick={() => { setActiveChatId(chat.id); setOpenSidebar(false) }}
                    className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${chat.id === activeChatId ? soft : ''}`}>
                    <MessageSquare size={14} />
                    <span className="truncate">{chat.title}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 ${soft}`}>
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button onClick={() => { setOpenProfile(true); setOpenSidebar(false) }} className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 ${soft}`}>
                  <User size={16} /> Profile
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ================= PROFILE / SETTINGS ================= */}
      <AnimatePresence>
        {openProfile && (
          <>
            <motion.div className="fixed inset-0 bg-black/60 z-40" onClick={() => setOpenProfile(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 overflow-y-auto ${surface}`}>
              <div className="h-14 flex items-center gap-3 px-4 border-b border-black/10">
                <button onClick={() => setOpenProfile(false)} className={`w-9 h-9 rounded-full ${soft}`}>←</button>
                <h2 className="text-lg font-semibold">Settings</h2>
              </div>

              <div className="flex flex-col items-center py-6">
                <div className="w-20 h-20 rounded-full bg-[#32475b] flex items-center justify-center text-white text-2xl font-semibold">
                  PC
                </div>
                <h3 className="mt-3 font-semibold text-lg">Prem Singh Chauhan</h3>
                <p className="text-sm opacity-60">premsinghchauhan7275</p>
                <button className={`mt-4 px-5 py-2 rounded-full text-sm font-medium ${soft}`}>
                  Edit profile
                </button>
              </div>

              <div className="px-4 space-y-6 pb-6">
                <div>
                  <p className="text-xs opacity-60 mb-2">My ChatGPT</p>
                  <SettingItem icon="😊" label="Personalization" />
                  <SettingItem icon="⬛⬛" label="Apps" />
                </div>

                <div>
                  <p className="text-xs opacity-60 mb-2">Account</p>
                  <SettingItem icon="💼" label="Workspace" value="Personal" />
                  <SettingItem icon="➕" label="Subscription" value="Go" />
                  <SettingItem icon="🧒" label="Parental controls" />
                  <SettingItem icon="✉️" label="Email" value="premsinghchauhan7275@gmail.com" />
                  <SettingItem icon="📞" label="Phone number" value="+91 75187 74973" />
                </div>

                <button className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-medium">
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

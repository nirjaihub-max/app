import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, Loader2, Copy, Share2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import TypingIndicator from './TypingIndicator'
import VoiceWaveform from './VoiceWaveform'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

const ChatScreen = ({ sessionId, language, voiceType }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioStream, setAudioStream] = useState(null)
  const messagesEndRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  useEffect(() => {
    loadChatHistory()
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`${API}/chat/history/${sessionId}`)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(`${API}/chat`, {
        message: input,
        session_id: sessionId,
        language: language
      })

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      toast.error('कुछ गड़बड़ हो गई। फिर से कोशिश करें।')
      console.error('Chat error:', error)
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await sendVoiceMessage(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        setAudioStream(null)
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success('रिकॉर्डिंग शुरू...')
    } catch (error) {
      toast.error('माइक एक्सेस नहीं मिला')
      console.error('Recording error:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const sendVoiceMessage = async (audioBlob) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('audio', audioBlob, 'voice.webm')
    formData.append('session_id', sessionId)
    formData.append('language', language)
    formData.append('voice_type', voiceType)

    try {
      const response = await axios.post(`${API}/chat/voice`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const userMessage = {
        role: 'user',
        content: `🎤 ${response.data.text}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])

      const assistantMessage = {
        role: 'assistant',
        content: response.data.text,
        timestamp: new Date(),
        audio: response.data.audio_base64
      }
      setMessages(prev => [...prev, assistantMessage])

      const audio = new Audio(`data:audio/mp3;base64,${response.data.audio_base64}`)
      audio.play()
    } catch (error) {
      toast.error('वॉइस मैसेज भेजने में समस्या')
      console.error('Voice error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <div className="sticky top-0 z-10 bg-obsidian-card/90 backdrop-blur-lg border-b border-agni/30 px-4 py-4">
        <h1 className="text-2xl font-heading font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-agni to-ember" data-testid="chat-title">
          🔱 HANUMAN GPT
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide" data-testid="chat-messages-container">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            data-testid={`chat-message-${idx}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-agni to-ember text-white'
                  : 'bg-obsidian-card border border-agni/20 text-[#ffebd6]'
              }`}
            >
              <p className="font-hindi leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-obsidian-card border border-agni/20 px-4 py-3 rounded-2xl">
              <Loader2 className="w-5 h-5 text-agni animate-spin" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-obsidian-card/90 backdrop-blur-lg border-t border-agni/30 p-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition-all ${
              isRecording
                ? 'bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                : 'bg-agni/20 hover:bg-agni/30 border border-agni/50'
            }`}
            data-testid="voice-record-button"
          >
            <Mic className="w-5 h-5 text-agni" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="कुछ पूछें..."
            className="flex-1 bg-black/40 border border-agni/30 focus:border-agni rounded-full px-4 py-3 text-[#ffebd6] placeholder:text-[#8a6a5c] font-hindi outline-none"
            data-testid="chat-input"
          />
          
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-3 rounded-full bg-gradient-to-r from-agni to-ember hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(255,87,34,0.4)]"
            data-testid="send-message-button"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatScreen
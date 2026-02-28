import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { toast } from 'sonner'

const useVoiceCommands = () => {
  const navigate = useNavigate()
  const [isListeningForCommand, setIsListeningForCommand] = useState(false)
  const [commandTimeout, setCommandTimeout] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition()

  // Check if mobile device
  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setIsMobile(checkMobile)
    
    // Removed mobile warning toast for cleaner UX
  }, [])

  // Voice command mappings
  const commands = {
    // Chat commands
    'chat': '/chat',
    'chat kholo': '/chat',
    'chat open': '/chat',
    'बात करो': '/chat',
    'चैट खोलो': '/chat',
    
    // Image generation commands
    'image': '/image',
    'image banao': '/image',
    'image generate': '/image',
    'photo banao': '/image',
    'इमेज बनाओ': '/image',
    'फोटो बनाओ': '/image',
    
    // Image editor commands
    'editor': '/editor',
    'editor kholo': '/editor',
    'editor open': '/editor',
    'edit': '/editor',
    'एडिटर खोलो': '/editor',
    
    // Settings commands
    'settings': '/settings',
    'settings kholo': '/settings',
    'settings open': '/settings',
    'सेटिंग्स खोलो': '/settings',
    'सेटिंग्स': '/settings',
    
    // Home commands
    'home': '/',
    'home jao': '/',
    'ghar': '/',
    'होम': '/',
  }

  // Check for wake word "Jai Hanuman"
  useEffect(() => {
    if (!transcript) return

    const lowerTranscript = transcript.toLowerCase()
    
    // Wake word detection
    if (lowerTranscript.includes('jai hanuman') || 
        lowerTranscript.includes('जय हनुमान')) {
      
      if (!isListeningForCommand) {
        activateCommandMode()
      }
    }
    
    // Command processing
    if (isListeningForCommand) {
      processCommand(lowerTranscript)
    }
  }, [transcript])

  const activateCommandMode = () => {
    setIsListeningForCommand(true)
    resetTranscript()
    
    // Visual and audio feedback
    toast.success('🔥 जय हनुमान! बोलिए क्या चाहिए?', {
      duration: 2000,
      style: {
        background: 'linear-gradient(135deg, #ff5722 0%, #ff9800 100%)',
        color: 'white',
        fontWeight: 'bold',
      }
    })

    // Auto-deactivate after 5 seconds if no command given
    const timeout = setTimeout(() => {
      deactivateCommandMode()
      toast.info('कोई कमांड नहीं मिली', { duration: 1500 })
    }, 5000)
    
    setCommandTimeout(timeout)
  }

  const deactivateCommandMode = () => {
    setIsListeningForCommand(false)
    resetTranscript()
    if (commandTimeout) {
      clearTimeout(commandTimeout)
      setCommandTimeout(null)
    }
  }

  const processCommand = (text) => {
    // Check each command
    for (const [cmd, route] of Object.entries(commands)) {
      if (text.includes(cmd)) {
        executeCommand(route, cmd)
        return
      }
    }
  }

  const executeCommand = (route, commandName) => {
    deactivateCommandMode()
    
    // Show feedback
    const messages = {
      '/chat': 'चैट खोल रहा हूं... 💬',
      '/image': 'इमेज जनरेटर खोल रहा हूं... 🎨',
      '/editor': 'इमेज एडिटर खोल रहा हूं... ✂️',
      '/settings': 'सेटिंग्स खोल रहा हूं... ⚙️',
      '/': 'होम पर जा रहा हूं... 🏠',
    }
    
    toast.success(messages[route] || 'खोल रहा हूं...', {
      duration: 1500,
      style: {
        background: 'linear-gradient(135deg, #ff5722 0%, #ffc107 100%)',
        color: 'white',
      }
    })
    
    // Navigate after short delay for smooth UX
    setTimeout(() => {
      navigate(route)
    }, 500)
  }

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('आपका ब्राउज़र वॉइस को सपोर्ट नहीं करता। Desktop Chrome में बेहतर काम करता है।', {
        duration: 4000
      })
      return false
    }
    
    try {
      SpeechRecognition.startListening({ 
        continuous: true, 
        language: 'hi-IN' 
      })
      // Removed toast notification for cleaner UX
      return true
    } catch (error) {
      toast.error('माइक access नहीं मिला। Permissions check करें।')
      console.error('Speech recognition error:', error)
      return false
    }
  }

  const stopListening = () => {
    SpeechRecognition.stopListening()
    deactivateCommandMode()
  }

  return {
    listening,
    isListeningForCommand,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
    transcript,
    isMobile
  }
}

export default useVoiceCommands

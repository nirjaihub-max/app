import React from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Volume2, Languages, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { t } from '../utils/translations'

const SettingsScreen = ({ language, setLanguage, voiceType, setVoiceType }) => {
  const { theme, toggleTheme } = useTheme()
  
  const voiceOptions = [
    { value: 'alloy', label: 'Alloy (Neutral)', gender: 'Mixed' },
    { value: 'echo', label: 'Echo (Male)', gender: 'Male' },
    { value: 'fable', label: 'Fable (Male)', gender: 'Male' },
    { value: 'onyx', label: 'Onyx (Male)', gender: 'Male' },
    { value: 'nova', label: 'Nova (Female)', gender: 'Female' },
    { value: 'shimmer', label: 'Shimmer (Female)', gender: 'Female' },
  ]

  return (
    <div className="min-h-screen bg-obsidian p-6">
      <div className="max-w-md mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-agni to-ember flex items-center justify-center shadow-[0_0_30px_rgba(255,87,34,0.5)]">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-agni to-ember" data-testid="settings-title">
            {t('settingsTitle', language)}
          </h1>
          <p className="text-[#cca891] font-hindi">{t('settingsSubtitle', language)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Theme Toggle */}
          <div className="bg-obsidian-card/80 border border-agni/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-agni" />
              ) : (
                <Sun className="w-5 h-5 text-agni" />
              )}
              <h2 className="text-xl font-heading text-[#ffebd6]">{t('theme', language)}</h2>
            </div>
            
            <button
              onClick={toggleTheme}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-agni to-ember text-white font-bold transition-all shadow-[0_0_15px_rgba(255,87,34,0.4)] flex items-center justify-between"
              data-testid="theme-toggle"
            >
              <span className="font-hindi">
                {theme === 'dark' ? 'डार्क मोड (अनुशंसित)' : 'लाइट मोड'}
              </span>
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <p className="text-xs text-[#8a6a5c] font-hindi">
              नोट: हनुमान GPT डार्क थीम के लिए डिज़ाइन किया गया है
            </p>
          </div>

          {/* Language Selection */}
          <div className="bg-obsidian-card/80 border border-agni/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Languages className="w-5 h-5 text-agni" />
              <h2 className="text-xl font-heading text-[#ffebd6]">Language / भाषा</h2>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setLanguage('hi')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  language === 'hi'
                    ? 'bg-gradient-to-r from-agni to-ember text-white font-bold shadow-[0_0_15px_rgba(255,87,34,0.4)]'
                    : 'bg-black/40 border border-agni/20 text-[#cca891] hover:border-agni/50'
                }`}
                data-testid="language-hindi"
              >
                <div className="font-hindi">हिंदी (Hindi)</div>
              </button>
              
              <button
                onClick={() => setLanguage('en')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-agni to-ember text-white font-bold shadow-[0_0_15px_rgba(255,87,34,0.4)]'
                    : 'bg-black/40 border border-agni/20 text-[#cca891] hover:border-agni/50'
                }`}
                data-testid="language-english"
              >
                <div>English (अंग्रेजी)</div>
              </button>
            </div>
          </div>

          <div className="bg-obsidian-card/80 border border-agni/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="w-5 h-5 text-agni" />
              <h2 className="text-xl font-heading text-[#ffebd6]">Voice / आवाज़</h2>
            </div>
            
            <div className="space-y-2">
              {voiceOptions.map((voice) => (
                <button
                  key={voice.value}
                  onClick={() => setVoiceType(voice.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    voiceType === voice.value
                      ? 'bg-gradient-to-r from-agni to-ember text-white font-bold shadow-[0_0_15px_rgba(255,87,34,0.4)]'
                      : 'bg-black/40 border border-agni/20 text-[#cca891] hover:border-agni/50'
                  }`}
                  data-testid={`voice-${voice.value}`}
                >
                  <div className="flex justify-between items-center">
                    <span>{voice.label}</span>
                    <span className="text-xs text-ember">{voice.gender}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsScreen
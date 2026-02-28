import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Download, Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import ImageGallery from './ImageGallery'
import { t } from '../utils/translations'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

const ImageGenerator = ({ language }) => {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('कृपया कुछ लिखें')
      return
    }

    setLoading(true)
    toast.info('इमेज बन रही है... कृपया प्रतीक्षा करें')

    try {
      const response = await axios.post(`${API}/image/generate`, {
        prompt: prompt,
        language: language
      }, {
        timeout: 120000
      })

      setGeneratedImage(response.data.image_base64)
      toast.success('इमेज तैयार है! 🎨')
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        toast.error('टाइमआउट! फिर से कोशिश करें।')
      } else {
        toast.error('इमेज बनाने में समस्या। फिर से कोशिश करें।')
      }
      console.error('Image generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = `data:image/png;base64,${generatedImage}`
    link.download = `hanuman-gpt-${Date.now()}.png`
    link.click()
    toast.success('इमेज डाउनलोड हो रही है')
  }

  return (
    <div className="min-h-screen bg-obsidian p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,152,0,0.5)]">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600" data-testid="image-gen-title">
            {t('imageGenTitle', language)}
          </h1>
          <p className="text-[#cca891] font-hindi">{t('imageGenSubtitle', language)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-[#ffebd6] font-hindi block">{t('whatToSee', language)}</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('promptPlaceholder', language)}
              className="w-full bg-black/40 border border-agni/30 focus:border-agni rounded-xl px-4 py-3 text-[#ffebd6] placeholder:text-[#8a6a5c] font-hindi outline-none min-h-[120px] resize-none"
              data-testid="image-prompt-input"
            />
          </div>

          <button
            onClick={generateImage}
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,152,0,0.4)] flex items-center justify-center gap-2"
            data-testid="generate-image-button"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-hindi">{t('generating', language)}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span className="font-hindi">{t('generateImage', language)}</span>
              </>
            )}
          </button>
        </motion.div>

        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="relative bg-obsidian-card border border-agni/30 rounded-2xl p-4 overflow-hidden">
              <img
                src={`data:image/png;base64,${generatedImage}`}
                alt="Generated"
                className="w-full rounded-xl"
                data-testid="generated-image"
              />
            </div>
            
            <button
              onClick={downloadImage}
              className="w-full bg-white/10 border border-agni/30 hover:bg-agni/20 text-agni font-bold py-3 rounded-full transition-all flex items-center justify-center gap-2"
              data-testid="download-image-button"
            >
              <Download className="w-5 h-5" />
              <span className="font-hindi">डाउनलोड करें</span>
            </button>
          </motion.div>
        )}

        <ImageGallery newImage={generatedImage} />
      </div>
    </div>
  )
}

export default ImageGenerator
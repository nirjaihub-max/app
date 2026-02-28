import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Download, Loader2, Eraser, Palette, Sparkles, Maximize2, X } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { t } from '../utils/translations'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

const ImageEditor = ({ language = 'hi' }) => {
  const [activeTab, setActiveTab] = useState('remove-bg')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedBackground, setSelectedBackground] = useState('studio')

  const backgrounds = [
    { id: 'studio', name: 'Studio', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'nature', name: 'Nature', gradient: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)' },
    { id: 'temple', name: 'Temple', gradient: 'linear-gradient(135deg, #f09819 0%, #ff512f 100%)' },
    { id: 'fire', name: 'Fire', gradient: 'linear-gradient(135deg, #ff5722 0%, #d84315 100%)' },
    { id: 'cinematic', name: 'Cinematic', gradient: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)' },
    { id: 'abstract', name: 'Abstract', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  ]

  const tabs = [
    { id: 'remove-bg', name: t('removeBg', language), icon: Eraser },
    { id: 'replace-bg', name: t('replaceBg', language), icon: Palette },
    { id: 'enhance', name: t('enhance', language), icon: Sparkles },
    { id: 'upscale', name: t('upscale', language), icon: Maximize2 },
  ]

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResultImage(null)
    }
  }

  const removeBackground = async () => {
    if (!selectedFile) {
      toast.error('पहले फोटो चुनें!')
      return
    }

    setLoading(true)
    toast.info('बैकग्राउंड हटा रहे हैं...')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await axios.post(`${API}/image/remove-background`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setResultImage(response.data.image_base64)
      toast.success('बैकग्राउंड हटा दिया गया! ✨')
    } catch (error) {
      toast.error('कुछ गड़बड़ हो गई। फिर से कोशिश करें।')
      console.error('Background removal error:', error)
    } finally {
      setLoading(false)
    }
  }

  const replaceBackground = async () => {
    if (!selectedFile) {
      toast.error('पहले फोटो चुनें!')
      return
    }

    setLoading(true)
    toast.info('बैकग्राउंड बदल रहे हैं...')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const bgRemoveResponse = await axios.post(`${API}/image/remove-background`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const reader = new FileReader()
      reader.readAsDataURL(selectedFile)
      reader.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          
          const gradient = backgrounds.find(b => b.id === selectedBackground)?.gradient || backgrounds[0].gradient
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          const resultImg = new Image()
          resultImg.onload = () => {
            ctx.drawImage(resultImg, 0, 0)
            const finalImage = canvas.toDataURL('image/png').split(',')[1]
            setResultImage(finalImage)
            toast.success('बैकग्राउंड बदल दिया गया! 🎨')
            setLoading(false)
          }
          resultImg.src = `data:image/png;base64,${bgRemoveResponse.data.image_base64}`
        }
        img.src = reader.result
      }
    } catch (error) {
      toast.error('कुछ गड़बड़ हो गई। फिर से कोशिश करें।')
      console.error('Background replace error:', error)
      setLoading(false)
    }
  }

  const enhanceImage = async () => {
    if (!selectedFile) {
      toast.error('पहले फोटो चुनें!')
      return
    }

    setLoading(true)
    toast.info('फोटो enhance हो रही है... (1-2 मिनट लग सकते हैं)')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await axios.post(`${API}/image/enhance`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      })

      setResultImage(response.data.image_base64)
      toast.success('फोटो enhance हो गई! ✨')
    } catch (error) {
      toast.error('Enhancement में समस्या। फिर से कोशिश करें।')
      console.error('Enhancement error:', error)
    } finally {
      setLoading(false)
    }
  }

  const upscaleImage = async () => {
    if (!selectedFile) {
      toast.error('पहले फोटो चुनें!')
      return
    }

    setLoading(true)
    toast.info('4K में upscale हो रहा है... (1-2 मिनट लग सकते हैं)')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('scale', 4)

      const response = await axios.post(`${API}/image/upscale`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      })

      setResultImage(response.data.image_base64)
      toast.success('4K में upscale हो गया! 🚀')
    } catch (error) {
      toast.error('Upscaling में समस्या। फिर से कोशिश करें।')
      console.error('Upscale error:', error)
    } finally {
      setLoading(false)
    }
  }

  const processImage = () => {
    switch (activeTab) {
      case 'remove-bg':
        removeBackground()
        break
      case 'replace-bg':
        replaceBackground()
        break
      case 'enhance':
        enhanceImage()
        break
      case 'upscale':
        upscaleImage()
        break
      default:
        break
    }
  }

  const downloadImage = () => {
    if (!resultImage) return

    const link = document.createElement('a')
    link.href = `data:image/png;base64,${resultImage}`
    link.download = `hanuman-gpt-${activeTab}-${Date.now()}.png`
    link.click()
    toast.success('डाउनलोड हो रहा है!')
  }

  const clearAll = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResultImage(null)
  }

  return (
    <div className="min-h-screen bg-obsidian p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-agni to-ember" data-testid="image-editor-title">
            {t('editorTitle', language)}
          </h1>
          <p className="text-[#cca891] font-hindi">{t('editorSubtitle', language)}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-agni to-ember text-white shadow-[0_0_15px_rgba(255,87,34,0.4)]'
                    : 'bg-obsidian-card border border-agni/20 text-[#cca891] hover:border-agni/50'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-hindi text-sm">{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload/Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-obsidian-card/80 border border-agni/20 rounded-2xl p-6 space-y-4">
              <h3 className="font-heading text-[#ffebd6] font-hindi">{t('originalPhoto', language)}</h3>
              
              {!previewUrl ? (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="file-upload-input"
                  />
                  <div className="border-2 border-dashed border-agni/30 rounded-xl p-12 text-center hover:border-agni/60 transition-all">
                    <Upload className="w-12 h-12 text-agni mx-auto mb-4" />
                    <p className="text-[#cca891] font-hindi">{t('uploadPhoto', language)}</p>
                    <p className="text-xs text-[#8a6a5c] mt-2">PNG, JPG, WEBP</p>
                  </div>
                </label>
              ) : (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="w-full rounded-xl" />
                  <button
                    onClick={clearAll}
                    className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-500"
                    data-testid="clear-image-button"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Background Selection (only for replace-bg tab) */}
            {activeTab === 'replace-bg' && previewUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-obsidian-card/80 border border-agni/20 rounded-2xl p-6 space-y-4"
              >
                <h3 className="font-heading text-[#ffebd6] font-hindi">{t('selectBackground', language)}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {backgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBackground(bg.id)}
                      className={`p-4 rounded-xl transition-all ${
                        selectedBackground === bg.id
                          ? 'ring-2 ring-agni ring-offset-2 ring-offset-obsidian'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ background: bg.gradient }}
                      data-testid={`bg-${bg.id}`}
                    >
                      <p className="text-white text-xs font-bold font-hindi">{bg.name}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-obsidian-card/80 border border-agni/20 rounded-2xl p-6 space-y-4">
              <h3 className="font-heading text-[#ffebd6] font-hindi">रिजल्ट</h3>
              
              {loading ? (
                <div className="flex items-center justify-center h-64 rounded-xl bg-black/40">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-agni animate-spin mx-auto" />
                    <p className="text-[#cca891] font-hindi">प्रोसेस हो रहा है...</p>
                  </div>
                </div>
              ) : resultImage ? (
                <div className="relative">
                  <img
                    src={`data:image/png;base64,${resultImage}`}
                    alt="Result"
                    className="w-full rounded-xl"
                    data-testid="result-image"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 rounded-xl bg-black/40 border-2 border-dashed border-agni/20">
                  <p className="text-[#8a6a5c] font-hindi">रिजल्ट यहां दिखेगा</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {previewUrl && (
              <div className="space-y-3">
                <button
                  onClick={processImage}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-agni to-ember hover:from-orange-500 hover:to-amber-500 text-white font-bold py-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,87,34,0.4)] flex items-center justify-center gap-2"
                  data-testid="process-button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-hindi">प्रोसेस हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span className="font-hindi">प्रोसेस करें</span>
                    </>
                  )}
                </button>

                {resultImage && (
                  <button
                    onClick={downloadImage}
                    className="w-full bg-white/10 border border-agni/30 hover:bg-agni/20 text-agni font-bold py-3 rounded-full transition-all flex items-center justify-center gap-2"
                    data-testid="download-result-button"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-hindi">डाउनलोड करें</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ImageEditor

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Trash2, ZoomIn } from 'lucide-react'
import { toast } from 'sonner'

const ImageGallery = ({ newImage, onClose }) => {
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem('hanuman_images') || '[]')
    setImages(savedImages)
  }, [])

  useEffect(() => {
    if (newImage) {
      const imageData = {
        id: Date.now(),
        data: newImage,
        timestamp: new Date().toISOString()
      }
      
      // Keep only last 5 images to avoid quota issues
      const updatedImages = [imageData, ...images].slice(0, 5)
      setImages(updatedImages)
      
      // Save to localStorage with error handling
      try {
        localStorage.setItem('hanuman_images', JSON.stringify(updatedImages))
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          // Clear old images and try again
          const reducedImages = [imageData]
          setImages(reducedImages)
          try {
            localStorage.setItem('hanuman_images', JSON.stringify(reducedImages))
            toast.info('पुरानी इमेज हटा दी गई (Storage limit)')
          } catch (e) {
            toast.error('Gallery में save नहीं हो सका')
            console.error('Storage error:', e)
          }
        }
      }
    }
  }, [newImage])

  const downloadImage = (imageData, id) => {
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${imageData}`
    link.download = `hanuman-gpt-${id}.png`
    link.click()
  }

  const deleteImage = (id) => {
    const updatedImages = images.filter(img => img.id !== id)
    setImages(updatedImages)
    try {
      localStorage.setItem('hanuman_images', JSON.stringify(updatedImages))
    } catch (error) {
      console.error('Failed to update storage:', error)
    }
    if (selectedImage?.id === id) setSelectedImage(null)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-heading text-[#ffebd6] font-hindi">आपकी गैलरी ({images.length}/5)</h3>
          {images.length > 0 && (
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('hanuman_images')
                  setImages([])
                  toast.success('Gallery साफ हो गई')
                } catch (error) {
                  console.error('Failed to clear gallery:', error)
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 font-hindi"
            >
              सभी हटाएं
            </button>
          )}
        </div>

        {images.length === 0 ? (
          <div className="text-center py-8 text-[#8a6a5c] font-hindi">
            अभी तक कोई इमेज नहीं बनाई<br/>
            <span className="text-xs">(अधिकतम 5 इमेज save होंगी)</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {images.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group bg-obsidian-card border border-agni/20 rounded-xl overflow-hidden"
              >
                <img
                  src={`data:image/png;base64,${img.data}`}
                  alt="Generated"
                  className="w-full h-40 object-cover cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedImage(img)}
                    className="p-2 bg-agni/80 hover:bg-agni rounded-full"
                    data-testid="zoom-image-button"
                  >
                    <ZoomIn className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => downloadImage(img.data, img.id)}
                    className="p-2 bg-agni/80 hover:bg-agni rounded-full"
                    data-testid="download-gallery-image"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="p-2 bg-red-600/80 hover:bg-red-600 rounded-full"
                    data-testid="delete-image-button"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 p-2 bg-red-600 rounded-full hover:bg-red-500"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <img
                src={`data:image/png;base64,${selectedImage.data}`}
                alt="Preview"
                className="w-full rounded-xl shadow-2xl"
              />
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  onClick={() => downloadImage(selectedImage.data, selectedImage.id)}
                  className="px-6 py-3 bg-gradient-to-r from-agni to-ember text-white font-bold rounded-full flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ImageGallery
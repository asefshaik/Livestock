import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ImageUploader = ({ images, onImagesChange, maxImages = 10, minImages = 3 }) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFiles = useCallback((files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    const newImages = [...images, ...validFiles].slice(0, maxImages)
    onImagesChange(newImages)
  }, [images, maxImages, onImagesChange])

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index)
    onImagesChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50'
        }`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isDragging ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            <svg className={`w-7 h-7 ${isDragging ? 'text-emerald-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-700">
              {isDragging ? 'Drop images here' : 'Upload Animal Images'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Drag & drop or click to select · PNG, JPG, WEBP · Max 10MB each
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-2">
              Minimum {minImages} images required · {images.length}/{maxImages} uploaded
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview Grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
          >
            {images.map((file, idx) => {
              const url = typeof file === 'string' ? file : URL.createObjectURL(file)
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative group aspect-square rounded-xl overflow-hidden"
                >
                  <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 text-white text-xs text-center py-1 font-medium">Cover</div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemove(idx) }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ImageUploader

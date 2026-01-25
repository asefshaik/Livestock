import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const TestimonialForm = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role === 'farmer' ? 'Dairy Farmer' : 'Livestock Buyer',
    location: user?.location || '',
    rating: 5,
    message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.message) return toast.error('Please write a message')
    
    setLoading(true)
    try {
      await api.post('/testimonials', formData)
      toast.success('Thank you! Your review has been added.')
      onSuccess()
      onClose()
      setFormData({ ...formData, message: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Share Your Experience</h2>
              <p className="text-gray-500 text-sm mt-1">Help others by sharing your PashuBazaar story</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Role / Sector</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  placeholder="e.g. Dairy Farmer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">State / Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                placeholder="e.g. Punjab"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rating</label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`text-2xl transition-all hover:scale-110 ${formData.rating >= star ? 'text-amber-400' : 'text-gray-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Story</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium resize-none"
                placeholder="Tell us about your experience selling or buying on PashuBazaar..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:translate-y-[-2px] active:translate-y-[0] disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Posting...
                </span>
              ) : '📤 Submit Review'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TestimonialForm

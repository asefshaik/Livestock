import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ImageUploader from '../components/ImageUploader'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ANIMAL_TYPES = ['Cattle', 'Goat', 'Sheep', 'Pig', 'Poultry', 'Horse', 'Camel', 'Buffalo', 'Other']

const AddLivestock = () => {
  const navigate = useNavigate()
  const [images, setImages] = useState([]) // {file, url, label}
  const [imageLabels, setImageLabels] = useState({}) // {index: 'front'/'back'/'side'/'extra'}
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    animalType: '',
    breed: '',
    age: '',
    weight: '',
    price: '',
    location: '',
    description: '',
  })

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.map((file, idx) => ({
      file,
      url: URL.createObjectURL(file),
      label: null
    }))
    
    // Auto-assign placeholder labels to first 3 images
    const currentCount = images.length
    const autoLabels = { ...imageLabels }
    newImages.forEach((_, idx) => {
      const totalIdx = currentCount + idx
      if (totalIdx === 0) autoLabels[totalIdx] = 'front'
      else if (totalIdx === 1) autoLabels[totalIdx] = 'side'
      else if (totalIdx === 2) autoLabels[totalIdx] = 'back'
      else autoLabels[totalIdx] = 'extra'
    })
    
    setImageLabels(autoLabels)
    setImages([...images, ...newImages])
    toast.success(`Added ${files.length} image(s) with placeholder labels`)
  }

  const updateImageLabel = (index, label) => {
    setImageLabels(prev => ({
      ...prev,
      [index]: label
    }))
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
    // Reassign remaining labels
    const newLabels = {}
    let labelIdx = 0
    images.forEach((_, i) => {
      if (i !== index) {
        if (labelIdx === 0) newLabels[i] = 'front'
        else if (labelIdx === 1) newLabels[i] = 'side'
        else if (labelIdx === 2) newLabels[i] = 'back'
        else newLabels[i] = imageLabels[i] || 'extra'
        labelIdx++
      }
    })
    setImageLabels(newLabels)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (images.length < 3) {
      toast.error('Please upload at least 3 images')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      
      // Build imageLabels array
      const labels = []
      images.forEach((img, idx) => {
        const label = imageLabels[idx] || 'extra'
        labels.push({ index: idx, label })
      })
      
      // Add images
      images.forEach((img, idx) => {
        formData.append('images', img.file)
      })
      
      // Send labels as JSON string (more reliable than bracket notation)
      formData.append('imageLabels', JSON.stringify(labels))

      await api.post('/livestock', formData)

      toast.success('Livestock listed successfully! 🎉')
      navigate('/dashboard/my-livestock')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900">Add New Livestock</h2>
        <p className="text-gray-500 mt-1">List your animal on the marketplace. Minimum 3 images required.</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Animal Information</h3>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="label">Animal Type *</label>
              <select
                name="animalType"
                id="animalType"
                value={form.animalType}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="">Select type...</option>
                {ANIMAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Breed *</label>
              <input
                type="text"
                name="breed"
                id="breed"
                value={form.breed}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Holstein, Saanen"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="label">Age (years) *</label>
              <input
                type="number"
                name="age"
                id="age"
                value={form.age}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
                min="0"
                step="0.5"
                required
              />
            </div>
            <div>
              <label className="label">Weight (kg) *</label>
              <input
                type="number"
                name="weight"
                id="weight"
                value={form.weight}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <label className="label">Price (₹) *</label>
              <input
                type="number"
                name="price"
                id="price"
                value={form.price}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Location *</label>
            <input
              type="text"
              name="location"
              id="livestock-location"
              value={form.location}
              onChange={handleChange}
              className="input-field"
              placeholder="City, State"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              id="description"
              value={form.description}
              onChange={handleChange}
              className="input-field min-h-24 resize-none"
              placeholder="Describe the animal's health history, diet, temperament, etc."
              rows={4}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3 mb-5 flex items-center gap-3">
            🩺 Animal Images
            <span className="text-sm font-normal text-emerald-600">(min. 3 required)</span>
          </h3>
          <p className="text-gray-600 text-sm mb-5">
            Upload 3-10 photos. Then assign each as Front, Back, Side, or Extra view for AI health analysis.
          </p>
          
          {/* File uploader */}
          <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center mb-6 hover:bg-gray-100 transition-colors">
            <input
              type="file"
              id="multiImageUpload"
              multiple
              accept="image/*"
              onChange={handleImagesUpload}
              className="hidden"
            />
            <label htmlFor="multiImageUpload" className="cursor-pointer block">
              <div className="text-4xl mb-3">📤</div>
              <div className="text-sm font-semibold text-gray-900">Click to upload or drag images</div>
              <div className="text-xs text-gray-500 mt-1">Support: JPG, PNG (max 10 images)</div>
            </label>
          </div>

          {/* Images Grid with Label Selector */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={img.url} 
                    alt={`Image ${idx + 1}`} 
                    className="w-full h-32 object-cover"
                  />
                  
                  {/* Label Selector on Hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <select
                      value={imageLabels[idx] || ''}
                      onChange={(e) => updateImageLabel(idx, e.target.value)}
                      className="bg-white text-gray-900 text-xs px-2 py-1 rounded font-semibold w-full"
                    >
                      <option value="front">📷 Front</option>
                      <option value="side">📷 Side</option>
                      <option value="back">📷 Back</option>
                      <option value="extra">➕ Extra</option>
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold mt-1 flex items-center gap-1"
                    >
                      🗑️ Remove
                    </button>
                  </div>

                  {/* Always visible placeholder label badge */}
                  <div className="absolute top-2 right-2">
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                      imageLabels[idx] === 'front' ? 'bg-blue-500' :
                      imageLabels[idx] === 'side' ? 'bg-purple-500' :
                      imageLabels[idx] === 'back' ? 'bg-orange-500' :
                      'bg-gray-500'
                    } text-white`}>
                      {imageLabels[idx] === 'front' ? '📷 Front' :
                       imageLabels[idx] === 'side' ? '📷 Side' :
                       imageLabels[idx] === 'back' ? '📷 Back' :
                       '➕ Extra'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Status Helper */}
          {images.length > 0 && (
            <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <strong>📊 Status:</strong> {images.length}/3-10 images uploaded
              <div className="text-xs mt-1 text-blue-600">
                🏷️ Placeholders auto-assigned: {imageLabels[0] ? `Front, ${imageLabels[1]}, ${imageLabels[2]}` : 'Add images to see labels'}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-800">
              <strong>💡 Tip:</strong> Images automatically get placeholder labels (Front, Side, Back, Extra). Hover over any image to change its label if needed. For AI health analysis, we'll use the Front and Side views.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            id="submit-livestock"
            disabled={loading || images.length < 3}
            className="btn-primary flex-1 py-4 text-base disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Listing animal...
              </span>
            ) : `📤 List ${form.animalType ? form.animalType : 'Animal'}`}
          </button>
          <Link to="/dashboard/my-livestock" className="btn-secondary py-4 px-6 text-base">
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  )
}

export default AddLivestock

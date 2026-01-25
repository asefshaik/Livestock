import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ImageUploader from '../components/ImageUploader'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ANIMAL_TYPES = ['Cattle', 'Goat', 'Sheep', 'Pig', 'Poultry', 'Horse', 'Camel', 'Buffalo', 'Other']

const AddLivestock = () => {
  const navigate = useNavigate()
  const [images, setImages] = useState([])
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
      images.forEach(img => formData.append('images', img))

      await api.post('/livestock', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

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
          <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3 mb-5">
            Animal Images
            <span className="text-sm font-normal text-gray-400 ml-2">(min. 3 required)</span>
          </h3>
          <ImageUploader images={images} onImagesChange={setImages} minImages={3} maxImages={10} />
        </div>

        {/* Health Score Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">🩺</span>
          <div>
            <p className="font-semibold text-emerald-800">Health Score</p>
            <p className="text-emerald-700 text-sm mt-1">
              After listing your animal, use the <strong>PashuBazaar mobile app</strong> to generate an AI health score.
              This will make your listing stand out and attract more buyers.
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

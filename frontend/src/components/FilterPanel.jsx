import { useState } from 'react'
import { motion } from 'framer-motion'

const ANIMAL_TYPES = ['All Types', 'Cattle', 'Goat', 'Sheep', 'Pig', 'Poultry', 'Horse', 'Camel', 'Buffalo', 'Other']

const FilterPanel = ({ filters, onChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleChange = (key, value) => {
    const updated = { ...localFilters, [key]: value }
    setLocalFilters(updated)
    onChange(updated)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-card p-6 space-y-6 sticky top-24"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
        <button
          onClick={() => {
            const reset = { animalType: '', location: '', minPrice: '', maxPrice: '', healthStatus: '' }
            setLocalFilters(reset)
            onReset()
          }}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Animal Type */}
      <div>
        <label className="label">Animal Type</label>
        <div className="flex flex-wrap gap-2">
          {ANIMAL_TYPES.map(type => (
            <button
              key={type}
              onClick={() => handleChange('animalType', type === 'All Types' ? '' : type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                (localFilters.animalType === '' && type === 'All Types') || localFilters.animalType === type
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="label">Location</label>
        <input
          type="text"
          className="input-field"
          placeholder="Search by city or state..."
          value={localFilters.location}
          onChange={e => handleChange('location', e.target.value)}
        />
      </div>

      {/* Price Range */}
      <div>
        <label className="label">Price Range (₹)</label>
        <div className="flex gap-2">
          <input
            type="number"
            className="input-field"
            placeholder="Min"
            value={localFilters.minPrice}
            onChange={e => handleChange('minPrice', e.target.value)}
          />
          <input
            type="number"
            className="input-field"
            placeholder="Max"
            value={localFilters.maxPrice}
            onChange={e => handleChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {/* Health Status */}
      <div>
        <label className="label">Health Status</label>
        <div className="space-y-2">
          {[
            { label: 'All', value: '', color: 'bg-gray-400' },
            { label: 'Healthy (>85)', value: 'healthy', color: 'bg-emerald-500' },
            { label: 'Moderate (60-85)', value: 'moderate', color: 'bg-yellow-500' },
            { label: 'Risk (<60)', value: 'risk', color: 'bg-red-500' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => handleChange('healthStatus', option.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                localFilters.healthStatus === option.value
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${option.color}`} />
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default FilterPanel

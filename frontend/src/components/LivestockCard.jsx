import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const LivestockCard = ({ livestock }) => {
  const {
    _id,
    animalType,
    breed,
    age,
    weight,
    price,
    location,
    images,
    imageLabels,
    isHealthVerified,
    farmerId,
  } = livestock

  // Get front view image or first image
  const getFrontImage = () => {
    // First, try imageLabels if structured correctly
    if (imageLabels && Array.isArray(imageLabels) && imageLabels.length > 0) {
      const frontImage = imageLabels.find(il => il.label === 'front')
      if (frontImage?.url) return frontImage.url
      // If no front label, return first labeled image
      if (imageLabels[0]?.url) return imageLabels[0].url
    }
    // Fallback to first image
    if (images && images.length > 0) return images[0]
    // Last resort: unsplash placeholder
    return `https://source.unsplash.com/400x300/?${animalType?.toLowerCase()},farm`
  }

  const imageUrl = getFrontImage()

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="card group cursor-pointer"
    >
      <Link to={`/livestock/${_id}`}>
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${breed} ${animalType}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 left-3">
            <span className="badge bg-white/90 text-emerald-700 text-xs font-bold shadow">
              {animalType}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            {isHealthVerified ? (
              <span className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                ✅ Verified by AI
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-gray-700/70 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                • Not Verified
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{breed}</h3>
              <p className="text-sm text-gray-500">{animalType}</p>
            </div>
            <p className="text-emerald-700 font-bold text-lg">
              ₹{price?.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {age} yr{age !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              {weight} kg
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{location}</span>
          </div>

          {farmerId && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-700">
                  {farmerId.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-500">{farmerId.name}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default LivestockCard

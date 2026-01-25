import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HealthScoreBadge from '../components/HealthScoreBadge'
import api from '../api/axios'

const HealthScanModal = ({ livestockId, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📱</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">AI Health Scanning</h3>
          <p className="text-gray-500 leading-relaxed mb-6">
            Open the <strong>PashuBazaar Mobile App</strong> and type this Animal ID manually to start scanning:
            <br/><br/>
            <strong className="text-emerald-800 bg-emerald-100 px-4 py-2 rounded-xl text-lg tracking-wider select-all border border-emerald-200 shadow-sm">{livestockId}</strong>
          </p>
          <div className="bg-emerald-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="text-emerald-600">✓</span> Point your phone camera or upload a video
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="text-emerald-600">✓</span> AI analyses health indicators in real-time
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="text-emerald-600">✓</span> Score (0-100) updates on this listing instantly
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1 py-3">
              📲 Download App
            </button>
            <button onClick={onClose} className="btn-secondary flex-1 py-3">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
)

const LivestockDetails = () => {
  const { id } = useParams()
  const [livestock, setLivestock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    api.get(`/livestock/${id}`)
      .then(res => {
        setLivestock(res.data.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!livestock) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-6xl mb-4">🐄</div>
      <h2 className="text-2xl font-bold text-gray-700">Listing not found</h2>
      <Link to="/browse" className="btn-primary mt-4">Back to Browse</Link>
    </div>
  )

  const images = livestock.images?.length > 0
    ? livestock.images
    : [`https://source.unsplash.com/800x600/?${livestock.animalType?.toLowerCase()},farm`]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {showModal && <HealthScanModal livestockId={livestock._id} onClose={() => setShowModal(false)} />}

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-emerald-600">Home</Link>
            <span>/</span>
            <Link to="/browse" className="hover:text-emerald-600">Browse</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{livestock.breed}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image Gallery */}
            <div>
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl overflow-hidden aspect-[4/3] mb-4 shadow-card"
              >
                <img
                  src={images[activeImage]}
                  alt={`${livestock.breed} - ${livestock.animalType}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                        activeImage === i ? 'border-emerald-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-80'
                      }`}
                    >
                      <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="badge bg-emerald-100 text-emerald-700">{livestock.animalType}</span>
                      <span className="text-xs font-mono text-gray-600 bg-gray-200 px-2 py-0.5 rounded-md select-all">ID: {livestock._id}</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">{livestock.breed}</h1>
                  </div>
                  <HealthScoreBadge
                    score={livestock.healthScore}
                    status={livestock.healthStatus}
                    isVerified={livestock.isHealthVerified}
                    size="md"
                  />
                </div>
                <p className="text-3xl font-black text-emerald-700 mt-3">
                  ₹{livestock.price?.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Quick specs */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Age', value: `${livestock.age} yr${livestock.age !== 1 ? 's' : ''}`, icon: '📅' },
                  { label: 'Weight', value: `${livestock.weight} kg`, icon: '⚖️' },
                  { label: 'Location', value: livestock.location, icon: '📍' },
                ].map(spec => (
                  <div key={spec.label} className="bg-white rounded-2xl p-4 shadow-card">
                    <div className="text-xl mb-1">{spec.icon}</div>
                    <p className="text-xs text-gray-500 font-medium">{spec.label}</p>
                    <p className="font-bold text-gray-900 text-sm truncate">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {livestock.description && (
                <div className="bg-white rounded-2xl p-5 shadow-card">
                  <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{livestock.description}</p>
                </div>
              )}

              {/* Health Score Section */}
              <div className={`rounded-2xl p-5 shadow-card border-2 ${
                livestock.isHealthVerified
                  ? livestock.healthStatus === 'healthy' ? 'bg-emerald-50 border-emerald-200'
                    : livestock.healthStatus === 'moderate' ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  🩺 AI Health Score
                </h3>
                {livestock.isHealthVerified ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      <span className="text-2xl font-black text-emerald-700">{livestock.healthScore}</span>
                    </div>
                    <div>
                      <HealthScoreBadge
                        score={livestock.healthScore}
                        status={livestock.healthStatus}
                        isVerified={livestock.isHealthVerified}
                        size="lg"
                      />
                      <p className="text-sm text-emerald-600 font-bold mt-1">✅ Verified by AI</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 text-sm mb-4">
                      <strong>Status:</strong> Pending AI Scan — This animal has not been health-verified yet.
                    </p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="btn-primary text-sm py-2.5"
                    >
                      Get Health Score
                    </button>
                  </div>
                )}
              </div>

              {/* Farmer info */}
              {livestock.farmerId && (
                <div className="bg-white rounded-2xl p-5 shadow-card">
                  <h3 className="font-bold text-gray-900 mb-3">Listed by</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <span className="text-xl font-bold text-emerald-700">
                        {livestock.farmerId.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{livestock.farmerId.name}</p>
                      <p className="text-sm text-gray-500">{livestock.farmerId.location || 'Location not provided'}</p>
                    </div>
                  </div>
                  {(!user || user._id !== livestock.farmerId._id) && (
                    <div className="flex flex-col gap-3 mt-4">
                      {!livestock.farmerId.phone && (
                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          ℹ️ Seller hasn't added a phone number. Using a demo number.
                        </p>
                      )}
                      <div className="flex gap-3">
                      <a
                        href={`tel:${livestock.farmerId.phone}`}
                        className="btn-primary flex-1 text-center justify-center py-3 flex items-center gap-2"
                      >
                        📞 Call
                      </a>
                      <a
                        href={`https://wa.me/${livestock.farmerId.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center justify-center py-3 flex items-center gap-2 rounded-2xl font-bold transition-all bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm hover:shadow-md"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.369.846.144.072.228.058.311-.036l.36-.453c.104-.131.208-.109.332-.062l2.067.973c.116.058.188.086.217.13.029.043.029.259-.115.664z" />
                          <path d="M12.002 2C6.478 2 2 6.478 2 12c0 1.764.464 3.42 1.275 4.887l-1.396 5.111 5.232-1.372A9.957 9.957 0 0012.002 22c5.524 0 10-4.478 10-10s-4.476-10-10-10zm0 18.232c-1.558 0-3.04-.403-4.329-1.168l-.309-.184-3.21.841.857-3.13-.203-.323A8.225 8.225 0 013.768 12c0-4.545 3.701-8.246 8.234-8.246 4.534 0 8.24 3.701 8.24 8.246 0 4.544-3.706 8.232-8.24 8.232z" />
                        </svg>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default LivestockDetails

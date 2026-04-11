import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Camera, Upload, X, Loader } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HealthScoreBadge from '../components/HealthScoreBadge'
import api from '../api/axios'

const HealthScanModal = ({ livestock, onClose, onComplete }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [images, setImages] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [healthReport, setHealthReport] = useState(null)
  const [step, setStep] = useState('capture') // capture or report

  // Initialize with stored reference photos (only Front and Side)
  useEffect(() => {
    const referencePhotos = []
    
    // Check if livestock has new imageLabels structure (new format)
    if (livestock.imageLabels && Array.isArray(livestock.imageLabels)) {
      const labelMap = {
        'front': '📷 Front View',
        'side': '📷 Side View',
        'back': '📷 Back View',
        'extra': '➕ Extra'
      }
      
      // Only prioritize Front and Side (skip Back)
      livestock.imageLabels.forEach(img => {
        if (['front', 'side'].includes(img.label)) {
          referencePhotos.push({ 
            url: img.url, 
            label: labelMap[img.label],
            isReference: true 
          })
        }
      })
      
      // Add extra images if available
      livestock.imageLabels.forEach(img => {
        if (img.label === 'extra') {
          referencePhotos.push({ 
            url: img.url, 
            label: labelMap[img.label],
            isReference: true 
          })
        }
      })
    }
    // Fallback to old format (photoFront, photoBack, photoSide) for backwards compatibility
    else {
      if (livestock.photoFront) {
        referencePhotos.push({ 
          url: livestock.photoFront, 
          label: '📷 Front View',
          isReference: true 
        })
      }
      if (livestock.photoSide) {
        referencePhotos.push({ 
          url: livestock.photoSide, 
          label: '📷 Side View',
          isReference: true 
        })
      }
    }

    setImages(referencePhotos)
  }, [livestock.imageLabels, livestock.photoFront, livestock.photoBack, livestock.photoSide])

  // Initialize camera - optional feature
  useEffect(() => {
    let isMounted = true
    
    const initCamera = async () => {
      try {
        if (!videoRef.current) return

        // Try to access camera with minimal constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,  // Accept any camera
          audio: false
        })
        
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }
        
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(err => {
          console.warn('Autoplay failed:', err)
        })
        setCameraActive(true)
        setError('')
      } catch (err) {
        console.warn('Camera not available:', err.name)
        setCameraActive(false)
        // Don't show error - camera is optional
      }
    }

    const timer = setTimeout(initCamera, 300)

    return () => {
      isMounted = false
      clearTimeout(timer)
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Capture image
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')
    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    canvasRef.current.toBlob(blob => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages([...images, { url: e.target.result, timestamp: new Date().toLocaleTimeString() }])
      }
      reader.readAsDataURL(blob)
    }, 'image/jpeg', 0.5)
  }

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImages(prev => [...prev, { url: event.target.result, timestamp: new Date().toLocaleTimeString() }])
      }
      reader.readAsDataURL(file)
    })
  }

  // Submit analysis
  const submitAnalysis = async () => {
    if (images.length === 0) {
      setError('Please use the reference photos or capture images')
      return
    }

    if (images.length > 0 && !livestock.animalType) {
      setError('Animal type not specified. Please try again.')
      return
    }

    setAnalyzing(true)
    setError('')

    try {
      // Use ALL images from livestock (not just filtered reference images)
      const allImagesToAnalyze = livestock.imageLabels && livestock.imageLabels.length > 0
        ? livestock.imageLabels.map(il => ({ url: il.url }))
        : images

      const imageBlobs = await Promise.all(
        allImagesToAnalyze.map(img =>
          fetch(img.url)
            .then(r => r.blob())
            .then(blob => new File([blob], 'image.jpg', { type: 'image/jpeg' }))
        )
      )

      const formData = new FormData()
      imageBlobs.forEach((blob, idx) => {
        formData.append('images', blob, `image_${idx}.jpg`)
      })

      const response = await api.post(`/livestock/analyze/${livestock._id}`, formData)

      setHealthReport(response.data.data)
      setStep('report')
      setAnalyzing(false)
      onComplete()
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || 'Analysis failed.'
      
      // Provide specific error messages for common issues
      if (err.response?.status === 403) {
        setError('🔒 Permission denied: Only the livestock owner can request health analysis.')
      } else if (err.response?.status === 422 && errorMessage.includes('Animal mismatch')) {
        setError(`🐄 ${errorMessage}`)
      } else if (errorMessage.includes('does not have access')) {
        setError('🔒 You do not have permission to analyze this livestock.')
      } else {
        setError(errorMessage)
      }
      
      setAnalyzing(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-black text-gray-900">AI Health Scan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'capture' ? (
          <>
            {/* Info Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <span className="text-lg flex-shrink-0">ℹ️</span>
              <div className="text-sm">
                <p className="font-semibold text-emerald-900">📸 All your photos ready for analysis!</p>
                <p className="text-emerald-700 text-xs mt-1">
                  {livestock.imageLabels?.length || 0} image{livestock.imageLabels?.length !== 1 ? 's' : ''} will be used for AI health analysis. 
                  More photos = more accurate results. You can add additional photos to improve accuracy.
                </p>
              </div>
            </div>

            {/* Upload Section - Primary method */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 mb-6 border-2 border-blue-200">
              <div className="text-center">
                <div className="text-5xl mb-3">📤</div>
                <h4 className="font-bold text-gray-900 mb-2">Add More Photos (Optional)</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Add additional photos from different angles for enhanced AI analysis
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={analyzing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold transition-colors"
                >
                  📁 Add More Photos
                </button>
              </div>
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Camera Section - Optional */}
            {cameraActive ? (
              <div className="bg-black rounded-2xl overflow-hidden mb-6">
                <div className="relative w-full" style={{ paddingBottom: '75%', backgroundColor: '#000' }}>
                  <video
                    ref={videoRef}
                    autoPlay={true}
                    playsInline={true}
                    muted={true}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="bg-gray-900 p-4 flex gap-3">
                  <button
                    onClick={captureImage}
                    disabled={analyzing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Capture
                  </button>
                </div>
              </div>
            ) : null}

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3">
                  📸 All Uploaded Images ({livestock.imageLabels?.length || 0} total)
                </h4>
                <p className="text-xs text-gray-600 mb-3">All {livestock.imageLabels?.length || 0} images will be used for AI health analysis:</p>
                <div className="grid grid-cols-3 gap-3">
                  {livestock.imageLabels && livestock.imageLabels.map((img, idx) => (
                    <div key={idx} className="relative bg-white rounded-lg border-2 border-emerald-300 overflow-hidden shadow-sm">
                      <img src={img.url} alt={`${img.label}`} className="w-full h-24 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 text-center font-semibold capitalize">
                        📷 {img.label}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-emerald-700 mt-3 font-medium">✓ All images ready for comprehensive health analysis</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitAnalysis}
                disabled={images.length === 0 || analyzing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                {analyzing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  '🚀 Get Health Report'
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Health Report */}
            {healthReport && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 text-center border-2 border-emerald-200">
                  <div className="text-6xl mb-4">✅</div>
                  <h4 className="text-2xl font-black text-emerald-900 mb-2">Analysis Complete!</h4>
                  <p className="text-emerald-700 font-medium">Health Score Report</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border-2 border-emerald-200 text-center">
                    <div className="text-3xl font-black text-emerald-600 mb-1">{healthReport.healthScore}</div>
                    <p className="text-sm text-gray-600 font-medium">Health Score</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-emerald-200 text-center">
                    <div className="text-2xl mb-1">
                      {healthReport.healthStatus === 'healthy' ? '🟢' : healthReport.healthStatus === 'moderate' ? '🟡' : '🔴'}
                    </div>
                    <p className="text-sm text-gray-600 font-medium capitalize">{healthReport.healthStatus}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-emerald-200 text-center">
                    <div className="text-2xl mb-1">✓</div>
                    <p className="text-sm text-gray-600 font-medium">Verified</p>
                  </div>
                </div>

                {healthReport.healthAnalysis && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h5 className="font-bold text-gray-900 mb-3">Analysis Details</h5>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {healthReport.healthAnalysis}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}

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

  const images = (() => {
    // Show only Front and Side images from imageLabels (if they exist)
    if (livestock.imageLabels && Array.isArray(livestock.imageLabels) && livestock.imageLabels.length > 0) {
      const frontSideImages = livestock.imageLabels
        .filter(il => ['front', 'side'].includes(il.label))
        .map(il => il.url)
      // If we found front/side images, return them
      if (frontSideImages.length > 0) return frontSideImages
      
      // If no front/side labels found but imageLabels exist, return all labeled images
      if (livestock.imageLabels.length > 0) {
        return livestock.imageLabels.map(il => il.url)
      }
    }
    
    // Fallback to all images or placeholder
    return livestock.images?.length > 0
      ? livestock.images
      : [`https://source.unsplash.com/800x600/?${livestock.animalType?.toLowerCase()},farm`]
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {showModal && (
        <HealthScanModal
          livestock={livestock}
          onClose={() => setShowModal(false)}
          onComplete={() => {
            // Refresh livestock data to get updated health score
            api.get(`/livestock/${id}`)
              .then(res => setLivestock(res.data.data))
              .catch(err => console.error('Failed to refresh:', err))
          }}
        />
      )}

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
                    {user && user._id === livestock.farmerId._id ? (
                      <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary text-sm py-2.5"
                      >
                        Get Health Score
                      </button>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                        <p className="font-medium">🔒 Only the livestock owner can request health analysis.</p>
                      </div>
                    )}
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

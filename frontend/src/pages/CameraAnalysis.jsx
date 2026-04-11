import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, Upload, Send, X, Loader } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'

const CameraAnalysis = () => {
  const { livestockId } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [images, setImages] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Initialize camera
  useEffect(() => {
    let isMounted = true
    
    const initCamera = async () => {
      try {
        // Ensure video element exists first
        if (!videoRef.current) {
          console.log('Video ref not ready yet')
          setTimeout(initCamera, 500)
          return
        }

        console.log('Requesting camera access...')
        
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        console.log('Camera stream obtained:', stream)
        
        if (!isMounted) return
        
        // Attach stream to video element
        videoRef.current.srcObject = stream
        
        // Wait for video to be ready and play
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, playing...')
          videoRef.current.play()
            .then(() => {
              console.log('Video is playing')
              if (isMounted) {
                setCameraActive(true)
                setError('')
              }
            })
            .catch(err => {
              console.error('Play error:', err)
              if (isMounted) {
                setError('Video playback failed. Try refreshing the page.')
              }
            })
        }
      } catch (err) {
        console.error('Camera error details:', err)
        if (!isMounted) return
        
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please enable camera access in your browser settings.')
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found on this device. Please use the upload option instead.')
        } else if (err.name === 'NotReadableError') {
          setError('Camera is in use by another application. Please close other apps using the camera.')
        } else {
          setError(`Camera error: ${err.message}. Please use upload instead.`)
        }
        setCameraActive(false)
      }
    }

    // Give DOM time to render the video element
    const timer = setTimeout(initCamera, 500)

    return () => {
      isMounted = false
      clearTimeout(timer)
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind)
          track.stop()
        })
      }
    }
  }, [])

  // Capture image from camera
  const captureImage = async () => {
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

  // Remove image
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // Submit for analysis
  const submitAnalysis = async () => {
    if (images.length === 0) {
      setError('Please capture or upload at least one image')
      return
    }

    setAnalyzing(true)
    setError('')

    try {
      // Convert data URLs to blobs
      const imageBlobs = await Promise.all(
        images.map(img =>
          fetch(img.url)
            .then(r => r.blob())
            .then(blob => new File([blob], 'image.jpg', { type: 'image/jpeg' }))
        )
      )

      const formData = new FormData()
      imageBlobs.forEach((blob, idx) => {
        formData.append('images', blob, `image_${idx}.jpg`)
      })

      const response = await api.post(`/livestock/analyze/${livestockId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccess(true)
      setTimeout(() => {
        navigate(`/livestock/${livestockId}`)
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.')
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-emerald-600 hover:text-emerald-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-black text-gray-900 mb-2">AI Health Analysis</h1>
          <p className="text-gray-600">Capture multiple angles of the livestock for accurate health assessment</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-medium">
            ✓ Analysis submitted successfully! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Disclaimer Banner */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>📸 Tips for best results:</strong> Capture images from different angles - front, side, and rear. Ensure good lighting and clear view of the animal's body. Multiple angles help AI provide accurate health assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Section */}
          <div className="lg:col-span-2">
            {cameraActive ? (
              <div className="bg-black rounded-2xl overflow-hidden shadow-xl">
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
                    Capture Image
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={analyzing}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Upload
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-2xl h-96 flex flex-col items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-5xl mb-4">📷</div>
                  <p className="text-gray-600 font-medium mb-4">Camera not available</p>
                  {error && (
                    <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
                      {error}
                    </p>
                  )}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setError('')
                        setCameraActive(false)
                        setTimeout(() => {
                          const constraints = {
                            video: {
                              facingMode: 'environment',
                              width: { ideal: 1280 },
                              height: { ideal: 720 }
                            },
                            audio: false
                          }
                          navigator.mediaDevices.getUserMedia(constraints)
                            .then(stream => {
                              if (videoRef.current) {
                                videoRef.current.srcObject = stream
                                setCameraActive(true)
                                setError('')
                              }
                            })
                            .catch(err => {
                              console.error('Retry error:', err)
                              setError(`Failed: ${err.message}`)
                            })
                        }, 500)
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition-colors mb-2"
                    >
                      🔄 Try Camera Again
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      📁 Upload Images Instead
                    </button>
                  </div>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Image Gallery */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Captured Images ({images.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {images.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No images captured yet</p>
                </div>
              ) : (
                images.map((img, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img src={img.url} alt={`Capture ${idx + 1}`} className="w-full h-24 object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-600">{img.timestamp}</p>
                      <p className="text-xs font-medium text-gray-700">Angle {idx + 1}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate(-1)}
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
              <>
                <Send className="w-5 h-5" />
                Submit for Analysis
              </>
            )}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CameraAnalysis

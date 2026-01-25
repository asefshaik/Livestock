import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import HealthScoreBadge from '../components/HealthScoreBadge'
import api from '../api/axios'
import toast from 'react-hot-toast'

const DeleteModal = ({ onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="text-center">
          <div className="text-5xl mb-4">🗑️</div>
          <h3 className="font-black text-gray-900 text-xl">Delete Listing?</h3>
          <p className="text-gray-500 text-sm mt-2 mb-6">This action cannot be undone. The animal listing will be permanently removed.</p>
          <div className="flex gap-3">
            <button onClick={onConfirm} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors">Delete</button>
            <button onClick={onCancel} className="flex-1 btn-secondary py-3">Cancel</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
)

const MyLivestock = () => {
  const [livestock, setLivestock] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  const fetchMyListings = async () => {
    try {
      const { data } = await api.get('/livestock/farmer/my-listings')
      setLivestock(data.data)
    } catch (err) {
      toast.error('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMyListings() }, [])

  const handleDelete = async () => {
    try {
      await api.delete(`/livestock/${deleteId}`)
      toast.success('Listing deleted')
      setLivestock(prev => prev.filter(l => l._id !== deleteId))
    } catch {
      toast.error('Failed to delete listing')
    } finally {
      setDeleteId(null)
    }
  }

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      {deleteId && <DeleteModal onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">My Livestock</h2>
          <p className="text-gray-500 mt-1">{livestock.length} listing{livestock.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/dashboard/add" className="btn-primary flex items-center gap-2">
          <span>+</span> Add Animal
        </Link>
      </div>

      {livestock.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🐄</div>
          <h3 className="text-xl font-bold text-gray-700">No listings yet</h3>
          <p className="text-gray-500 mt-2">Start listing your livestock to reach thousands of buyers.</p>
          <Link to="/dashboard/add" className="btn-primary inline-flex mt-6">Add First Animal</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {livestock.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5"
            >
              <div className="flex items-start gap-4">
                {/* Image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.breed} className="w-full h-full object-cover" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">🐄</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{item.breed}</h3>
                      <p className="text-sm text-gray-500">{item.animalType} · {item.age} yr{item.age !== 1 ? 's' : ''} · {item.weight} kg</p>
                    </div>
                    <p className="font-black text-emerald-700 text-lg">₹{item.price?.toLocaleString('en-IN')}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-sm text-gray-500">📍 {item.location}</span>
                    <HealthScoreBadge
                      score={item.healthScore}
                      status={item.healthStatus}
                      isVerified={item.isHealthVerified}
                      size="sm"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <Link
                      to={`/livestock/${item._id}`}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      👁 View
                    </Link>
                    {!item.isHealthVerified && (
                      <Link
                        to="/dashboard"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        🩺 Get Health Score
                      </Link>
                    )}
                    <button
                      onClick={() => setDeleteId(item._id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors ml-auto"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyLivestock

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LivestockCard from '../components/LivestockCard'
import FilterPanel from '../components/FilterPanel'
import api from '../api/axios'

const SORT_OPTIONS = [
  { label: 'Newest First', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Health Score', value: 'health_score' },
]

const defaultFilters = { animalType: '', location: '', minPrice: '', maxPrice: '', healthStatus: '' }

const BrowseLivestock = () => {
  const [livestock, setLivestock] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState('')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const fetchLivestock = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 12, sort, ...filters }
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const { data } = await api.get('/livestock', { params })
      setLivestock(data.data)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters, sort])

  useEffect(() => {
    fetchLivestock(1)
  }, [fetchLivestock])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Browse Livestock</h1>
                <p className="text-gray-500 mt-1">
                  {loading ? 'Loading...' : `${pagination.total} listings found`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  Filters
                </button>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="select-field w-auto pr-10"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Filter sidebar */}
            <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(defaultFilters)}
              />
            </aside>

            {/* Grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card h-80 animate-pulse bg-gray-100" />
                  ))}
                </div>
              ) : livestock.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🐄</div>
                  <h3 className="text-xl font-bold text-gray-700">No livestock found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your filters</p>
                  <button
                    onClick={() => setFilters(defaultFilters)}
                    className="btn-primary mt-6 inline-flex"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {livestock.map((item, i) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <LivestockCard livestock={item} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      {[...Array(pagination.pages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => fetchLivestock(i + 1)}
                          className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                            pagination.page === i + 1
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default BrowseLivestock

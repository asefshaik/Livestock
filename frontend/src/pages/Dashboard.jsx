import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import AddLivestock from './AddLivestock'
import MyLivestock from './MyLivestock'
import api from '../api/axios'
import toast from 'react-hot-toast'

const StatCard = ({ label, value, icon, color }) => (
  <div className={`card p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-3xl font-black text-gray-900 mt-1">{value ?? '—'}</p>
      </div>
      <div className="text-4xl">{icon}</div>
    </div>
  </div>
)

const DashboardOverview = () => {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    api.get('/livestock/farmer/my-listings').then(res => {
      setStats(res.data.stats)
      setRecent(res.data.data.slice(0, 5))
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-gray-500 mt-1">Here's your livestock marketplace overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Listings" value={stats?.total} icon="🐄" color="border-emerald-500" />
        <StatCard label="Verified Listings" value={stats?.verified} icon="✅" color="border-blue-500" />
        <StatCard label="Avg Health Score" value={stats?.avgHealthScore} icon="🩺" color="border-accent-500" />
      </div>

      {recent.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-4">Recent Listings</h3>
          <div className="space-y-3">
            {recent.map(item => (
              <div key={item._id} className="card p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.breed} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🐄</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{item.breed} — {item.animalType}</p>
                  <p className="text-sm text-gray-500">{item.location} · ₹{item.price?.toLocaleString('en-IN')}</p>
                </div>
                <span className={`badge text-xs ${item.isHealthVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.isHealthVerified ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const Analytics = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-black text-gray-900">Analytics</h2>
    <div className="card p-8 text-center">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-bold text-gray-700">Analytics Coming Soon</h3>
      <p className="text-gray-500 mt-2">Detailed insights about your listings, views, and health scores will appear here.</p>
    </div>
  </div>
)

const sidebarItems = [
  { label: 'Overview', path: '/dashboard', icon: '📊', end: true },
  { label: 'My Livestock', path: '/dashboard/my-livestock', icon: '🐄' },
  { label: 'Add Livestock', path: '/dashboard/add', icon: '➕' },
  { label: 'Analytics', path: '/dashboard/analytics', icon: '📈' },
]

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-gray-100 shadow-sm flex-shrink-0 hidden lg:flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                <span className="badge bg-emerald-100 text-emerald-700 text-xs capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-6 lg:p-10">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="my-livestock" element={<MyLivestock />} />
            <Route path="add" element={<AddLivestock />} />
            <Route path="analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default Dashboard

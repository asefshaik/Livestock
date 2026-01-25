import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setProfileOpen(false)
  }

  const isHomepage = location.pathname === '/'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || !isHomepage
        ? 'bg-white/95 backdrop-blur-md shadow-md'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🐄</span>
            </div>
            <span className={`font-bold text-xl ${
              scrolled || !isHomepage ? 'text-gray-900' : 'text-white'
            }`}>
              Pashu<span className="text-emerald-500">Bazaar</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/browse" className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              scrolled || !isHomepage
                ? 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
                : 'text-white/90 hover:text-white hover:bg-white/10'
            }`}>
              Browse Livestock
            </Link>
            {user?.role === 'farmer' && (
              <Link to="/dashboard" className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scrolled || !isHomepage
                  ? 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}>
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className={`font-medium text-sm ${scrolled || !isHomepage ? 'text-gray-900' : 'text-white'}`}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="badge bg-emerald-100 text-emerald-700 text-xs mt-1 capitalize">{user.role}</span>
                      </div>
                      {user.role === 'farmer' && (
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 font-medium transition-colors ${
                    scrolled || !isHomepage ? 'text-gray-700 hover:text-emerald-700' : 'text-white hover:text-emerald-300'
                  }`}
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className={`w-6 h-6 ${scrolled || !isHomepage ? 'text-gray-900' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 py-4 space-y-2">
              <Link to="/browse" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-emerald-50 hover:text-emerald-700">Browse Livestock</Link>
              {user?.role === 'farmer' && (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-emerald-50 hover:text-emerald-700">Dashboard</Link>
              )}
              {user ? (
                <div className="pt-2 border-t border-gray-100">
                  <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full text-center py-3 border-2 border-emerald-600 text-emerald-700 rounded-xl font-semibold">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full text-center py-3 bg-emerald-600 text-white rounded-xl font-semibold">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar

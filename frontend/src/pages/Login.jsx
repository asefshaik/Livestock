import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const queryParams = new URLSearchParams(location.search)
  const redirectPath = queryParams.get('redirect')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      
      if (redirectPath) {
        navigate(redirectPath)
      } else {
        navigate(user.role === 'farmer' ? '/dashboard' : '/browse')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="relative text-white max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">🐄</div>
            <span className="font-bold text-2xl">Pashu<span className="text-emerald-300">Bazaar</span></span>
          </Link>
          <h2 className="text-4xl font-black leading-tight mb-4">
            India's AI-Powered<br />Livestock Marketplace
          </h2>
          <p className="text-white/70 text-lg mb-8">Connect verified farmers with trusted buyers. Every animal comes with an AI health score.</p>
          <div className="space-y-3">
            {['✅ Verified health scores', '🔒 Secure transactions', '📱 Mobile AI scanning', '🌍 Pan-India coverage'].map(item => (
              <div key={item} className="flex items-center gap-2 text-emerald-200 text-sm">{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">🐄</div>
            <span className="font-bold text-xl">Pashu<span className="text-emerald-600">Bazaar</span></span>
          </Link>

          <div className="bg-white rounded-3xl shadow-card p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-gray-900">Welcome back</h1>
              <p className="text-gray-500 mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                id="login-submit"
                disabled={loading}
                className="btn-primary w-full text-center justify-center py-3.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700">
                Register here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login

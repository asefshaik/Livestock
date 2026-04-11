import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', location: '', role: 'buyer',
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const redirectPath = queryParams.get('redirect')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Welcome to LiveHub, ${user.name}! 🎉`)
      
      if (redirectPath) {
        navigate(redirectPath)
      } else {
        navigate(user.role === 'farmer' ? '/dashboard' : '/browse')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed'
      if (errorMessage.includes('Phone number is required') || errorMessage.includes('phone number')) {
        toast.error('Please provide a valid phone number')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative text-white max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">🐄</div>
            <span className="font-bold text-2xl">Live<span className="text-emerald-300">Hub</span></span>
          </Link>
          <h2 className="text-4xl font-black leading-tight mb-6">
            Join 800+ Verified<br />Farmers & Buyers
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🌾', label: 'Farmer', desc: 'List animals & earn more' },
              { icon: '🛒', label: 'Buyer', desc: 'Find verified livestock' },
            ].map(r => (
              <div key={r.label} className="glass rounded-2xl p-4">
                <div className="text-3xl mb-2">{r.icon}</div>
                <p className="font-bold text-white">{r.label}</p>
                <p className="text-white/70 text-sm">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md py-8"
        >
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">🐄</div>
            <span className="font-bold text-xl">Live<span className="text-emerald-600">Hub</span></span>
          </Link>

          <div className="bg-white rounded-3xl shadow-card p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-gray-900">Create your account</h1>
              <p className="text-gray-500 mt-1">Join India's livestock marketplace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selector */}
              <div>
                <label className="label">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'buyer', label: 'Buyer', icon: '🛒', desc: 'I want to buy' },
                    { value: 'farmer', label: 'Farmer', icon: '🌾', desc: 'I want to sell' },
                  ].map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: r.value }))}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        form.role === r.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{r.icon}</div>
                      <p className="font-bold text-gray-900 text-sm">{r.label}</p>
                      <p className="text-gray-500 text-xs">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  id="reg-email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  id="reg-password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={form.location}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="City, State"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="register-submit"
                disabled={loading}
                className="btn-primary w-full text-center justify-center py-3.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Register

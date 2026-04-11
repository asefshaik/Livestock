import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LivestockCard from '../components/LivestockCard'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import TestimonialForm from '../components/TestimonialForm'

const features = [
  {
    icon: '🩺',
    title: 'Verified Health Scores',
    desc: 'Every animal gets AI-analysed health scores via mobile scanning so you know exactly what you are buying.',
  },
  {
    icon: '🏪',
    title: 'Transparent Marketplace',
    desc: 'No middlemen. Connect directly with verified farmers and get the best price for quality livestock.',
  },
  {
    icon: '📱',
    title: 'AI-Powered Scanning',
    desc: 'Our mobile app uses computer vision to generate a real-time health assessment for each animal.',
  },
  {
    icon: '🔒',
    title: 'Safe Transactions',
    desc: 'Every listing is verified. Every farmer is authenticated. Trade with complete confidence.',
  },
]

// Static sample just in case, but we will fetch from API
const sampleTestimonials = [
  { name: 'Rajesh Kumar', role: 'Dairy Farmer, Punjab', message: 'LiveHub transformed how I sell my cattle. The AI health scores build trust instantly with buyers!', avatar: 'R' },
  { name: 'Priya Sharma', role: 'Livestock Buyer, Maharashtra', message: "I've bought 3 animals through LiveHub. The verified health scores gave me confidence I never had before.", avatar: 'P' },
  { name: 'Amit Singh', role: 'Goat Farmer, Rajasthan', message: "Listed my goats and got inquiries within hours. The platform is simple, professional, and it actually works.", avatar: 'A' },
]

const animalStats = [
  { label: 'Active Listings', value: '2,400+' },
  { label: 'Verified Farmers', value: '800+' },
  { label: 'Successful Trades', value: '5,000+' },
  { label: 'States Covered', value: '22' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const Home = () => {
  const { user } = useAuth()
  const [featured, setFeatured] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loadingTestimonials, setLoadingTestimonials] = useState(true)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const fetchFeatured = async () => {
    try {
      const res = await api.get('/livestock?limit=6')
      setFeatured(res.data.data || [])
    } catch (err) {}
  }

  const fetchTestimonials = async () => {
    try {
      setLoadingTestimonials(true)
      const res = await api.get('/testimonials')
      setTestimonials(res.data.data || [])
    } catch (err) {
      setTestimonials(sampleTestimonials)
    } finally {
      setLoadingTestimonials(false)
    }
  }

  useEffect(() => {
    fetchFeatured()
    fetchTestimonials()
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center bg-hero-gradient overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Glowing orb */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-white">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-emerald-300 text-sm font-semibold px-4 py-2 rounded-full border border-white/20 mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                AI-Powered Health Verification — Coming Soon
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-black leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Buy & Sell
              <br />
              <span className="text-emerald-400">Verified</span> Livestock
              <br />
              with Confidence
            </motion.h1>

            <motion.p
              className="text-xl text-white/80 mb-10 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              India's first AI-powered livestock marketplace. Every animal comes with a verified health score generated by our mobile scanning technology.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/browse" className="bg-white text-emerald-800 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
                Browse Livestock
              </Link>
              {!user ? (
                <Link to="/register" className="bg-accent-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl active:scale-95">
                  Register as Farmer
                </Link>
              ) : user.role === 'farmer' && (
                <Link to="/dashboard" className="bg-emerald-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl active:scale-95">
                  Farmer Dashboard
                </Link>
              )}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-emerald-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {animalStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-black text-white">{stat.value}</p>
                <p className="text-emerald-300 text-sm font-medium mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why Choose LiveHub?
            </motion.h2>
            <p className="section-subtitle mx-auto">
              We're building the future of livestock trading — transparent, AI-verified, and fraud-free.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((f, i) => (
              <motion.div key={i} variants={itemVariants} className="card p-6 hover:shadow-card-hover">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED LIVESTOCK ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Featured Listings
              </motion.h2>
              <p className="text-gray-500 mt-2">Fresh listings from verified farmers across India</p>
            </div>
            <Link to="/browse" className="btn-secondary hidden md:flex items-center gap-2 text-sm">
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {featured.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {featured.map(item => (
                <motion.div key={item._id} variants={itemVariants}>
                  <LivestockCard livestock={item} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <div className="text-6xl mb-4">🐄</div>
              <h3 className="text-xl font-bold text-gray-700">No listings yet</h3>
              <p className="text-gray-500 mt-2">Be the first farmer to list your livestock!</p>
              {user?.role === 'farmer' ? (
                 <Link to="/dashboard/add" className="btn-primary inline-flex mt-6">List Your Animals</Link>
              ) : !user && (
                <Link to="/register" className="btn-primary inline-flex mt-6">Join as Farmer</Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-emerald-50/50">
        <TestimonialForm 
          isOpen={isReviewModalOpen} 
          onClose={() => setIsReviewModalOpen(false)} 
          onSuccess={fetchTestimonials}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black text-gray-900 mb-4">Trusted by Farmers & Buyers</h2>
              <p className="text-gray-500 text-lg">Real stories from the LiveHub community</p>
            </div>
            {user ? (
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="btn-primary py-4 px-8 text-base shadow-lg shadow-emerald-200"
              >
                ✍️ Write a Review
              </button>
            ) : (
              <Link to="/login" className="btn-secondary py-4 px-8 text-base">
                Log in to Share Your Story
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingTestimonials ? (
               [...Array(3)].map((_, i) => (
                 <div key={i} className="bg-white rounded-3xl p-8 h-64 animate-pulse shadow-sm" />
               ))
            ) : testimonials.length > 0 ? (
              testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow border border-emerald-100/50"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">
                      {t.avatar || t.name?.[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{t.name}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{t.role}{t.location ? `, ${t.location}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating || 5)].map((_, s) => (
                      <svg key={s} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed italic">
                    "{t.message || t.text}"
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">No testimonials yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      {!user && (
        <section className="py-20 bg-hero-gradient">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl font-black mb-4">Ready to Get Started?</h2>
            <p className="text-white/80 text-lg mb-8">Join thousands of farmers and buyers on India's most trusted livestock platform.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register" className="bg-white text-emerald-800 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all shadow-lg">
                Join as Farmer
              </Link>
              <Link to="/browse" className="border-2 border-white text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
                Browse Livestock
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}

export default Home

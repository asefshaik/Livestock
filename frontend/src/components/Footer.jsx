import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Footer = () => {
  const { user } = useAuth()
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🐄</span>
              </div>
              <span className="font-bold text-xl">Pashu<span className="text-emerald-400">Bazaar</span></span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              India's first AI-powered livestock marketplace. Buy and sell verified, healthy animals with complete confidence.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors">
                <span className="text-sm">𝕏</span>
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors">
                <span className="text-sm">in</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Marketplace</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/browse" className="hover:text-emerald-400 transition-colors">Browse Livestock</Link></li>
              {user?.role === 'farmer' ? (
                <li><Link to="/dashboard/add" className="hover:text-emerald-400 transition-colors">Add Listing</Link></li>
              ) : !user && (
                <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Sell Livestock</Link></li>
              )}
              <li><a href="#" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2026 PashuBazaar. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            AI Health Score System — Powered by Mobile Scanning App
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

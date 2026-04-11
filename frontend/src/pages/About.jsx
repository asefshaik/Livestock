import { Award, Users, Target, Lightbulb } from 'lucide-react'

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Mission',
      description: 'Empower farmers with technology to sell verified, healthy livestock with complete transparency.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Using cutting-edge AI and mobile technology to revolutionize livestock trading in India.'
    },
    {
      icon: Award,
      title: 'Trust',
      description: 'Every listing is verified with AI health analysis, protecting both buyers and sellers.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a thriving community of transparent livestock traders across India.'
    }
  ]

  const stats = [
    { number: '5000+', label: 'Active Farmers' },
    { number: '50000+', label: 'Livestock Listed' },
    { number: '₹50Cr+', label: 'GMV' },
    { number: '98%', label: 'Trust Score' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">About LiveHub</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transforming livestock trading in India with AI-powered health verification and transparent pricing.
        </p>
      </div>

      {/* Mission & Impact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-6">Why LiveHub?</h2>
          <p className="text-lg text-gray-600 mb-4 leading-relaxed">
            Traditional livestock markets are plagued with fraud, disease transmission, and unfair pricing. Farmers struggle to prove their animals' health, while buyers face the risk of purchasing sick livestock.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            LiveHub uses AI-powered health analysis to create a transparent marketplace where trust is verified, not assumed. We're building the future of livestock trading in India.
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🐄</div>
            <p className="text-white text-xl font-bold">AI-Verified Livestock</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-emerald-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl md:text-5xl font-black mb-2">{stat.number}</div>
                <div className="text-emerald-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-black text-gray-900 mb-12 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, idx) => {
            const Icon = value.icon
            return (
              <div key={idx} className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Team CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Join the Revolution</h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Be part of transforming livestock trading in India. Whether you're a farmer or a buyer, LiveHub is your trusted partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Get Started Today
            </a>
            <a href="/contact" className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

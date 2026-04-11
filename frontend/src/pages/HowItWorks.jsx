import { ArrowRight, Camera, Shield, TrendingUp, Zap } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: Camera,
      title: 'Capture Images',
      description: 'Farmers capture multiple angles of their livestock using our mobile app or web camera.'
    },
    {
      icon: Zap,
      title: 'AI Analysis',
      description: 'Our advanced YOLOv8 model analyzes physical traits and health indicators in seconds.'
    },
    {
      icon: Shield,
      title: 'Health Verification',
      description: 'Get an instant AI-powered health score and detailed analysis with certification.'
    },
    {
      icon: TrendingUp,
      title: 'List & Sell',
      description: 'Create verified listings with health certification to attract serious buyers.'
    },
    {
      icon: ArrowRight,
      title: 'Connect with Buyers',
      description: 'Buyers browse verified livestock with confidence knowing health status.'
    },
    {
      icon: Shield,
      title: 'Safe Transaction',
      description: 'Complete transactions with built-in escrow and dispute resolution.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">How LiveHub Works</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          Step-by-step guide to buying and selling verified livestock with AI health certification.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Start Selling
            </a>
            <a href="/browse" className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
              Browse Livestock
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks

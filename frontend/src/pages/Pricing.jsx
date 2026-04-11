import { Check } from 'lucide-react'

const Pricing = () => {
  const plans = [
    {
      name: 'Buyer',
      price: 'Free',
      description: 'Browse and purchase verified livestock',
      features: [
        'Browse all listings',
        'AI health score verification',
        'Advanced filters',
        'Direct messaging',
        'Purchase protection'
      ]
    },
    {
      name: 'Seller Basic',
      price: '₹999',
      period: '/month',
      description: 'List and sell livestock online',
      features: [
        'Up to 10 active listings',
        'AI health analysis',
        'Analytics dashboard',
        'Email support',
        'Featured badge (2 listings)'
      ]
    },
    {
      name: 'Seller Premium',
      price: '₹2,999',
      period: '/month',
      description: 'Professional seller account',
      features: [
        'Unlimited listings',
        'Priority AI analysis',
        'Advanced analytics',
        'Phone + email support',
        'Featured badge (all listings)',
        'API access',
        'Custom branding'
      ],
      highlight: true
    }
  ]

  const faqs = [
    {
      q: 'Is there a charge to browse?',
      a: 'No! Browsing and purchasing livestock is completely free. You only pay when you make a transaction.'
    },
    {
      q: 'How long does AI analysis take?',
      a: 'Most analyses complete within 30 seconds. Results are instant and provide detailed health metrics.'
    },
    {
      q: 'Can I cancel my seller plan anytime?',
      a: 'Yes, you can cancel anytime. No long-term contracts required.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards, debit cards, UPI, and bank transfers.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Simple, fair pricing with no hidden fees. Choose the plan that fits your needs.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-8 transition-all ${
                plan.highlight
                  ? 'bg-emerald-600 text-white shadow-2xl scale-105'
                  : 'bg-white border border-gray-100 hover:shadow-lg'
              }`}
            >
              <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`mb-6 ${plan.highlight ? 'text-emerald-100' : 'text-gray-600'}`}>
                {plan.description}
              </p>
              <div className="mb-8">
                <span className={`text-5xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-sm ${plan.highlight ? 'text-emerald-100' : 'text-gray-600'}`}>
                    {plan.period}
                  </span>
                )}
              </div>
              <button
                className={`w-full py-3 rounded-lg font-bold mb-8 transition-colors ${
                  plan.highlight
                    ? 'bg-white text-emerald-600 hover:bg-gray-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                Get Started
              </button>
              <ul className="space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span className={plan.highlight ? 'text-emerald-50' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing

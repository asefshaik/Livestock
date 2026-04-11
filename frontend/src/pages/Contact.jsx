import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' })
      setSubmitted(false)
    }, 3000)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@livehub.com',
      action: 'mailto:support@livehub.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 1800-LIVEHUB',
      action: 'tel:+91-1800-5483482'
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'Bangalore, India',
      action: '#'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Have questions? Get in touch with our team. We're here to help!
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
            <div className="space-y-6">
              {contactInfo.map((info, idx) => {
                const Icon = info.icon
                return (
                  <a
                    key={idx}
                    href={info.action}
                    className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                      <p className="text-gray-600">{info.value}</p>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* FAQ Quick Links */}
            <div className="mt-12 bg-emerald-50 rounded-xl p-8 border border-emerald-200">
              <h3 className="font-bold text-gray-900 mb-4">Quick Answers</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">How do I list livestock?</a></li>
                <li><a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">How long does AI analysis take?</a></li>
                <li><a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">What payment methods accepted?</a></li>
                <li><a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Is my data secure?</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-xl border border-gray-100 p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Your name"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Tell us more..."
                  />
                </div>

                {submitted && (
                  <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-medium">
                    ✓ Thank you! We'll get back to you soon.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact

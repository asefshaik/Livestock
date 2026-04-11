const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-12">Last updated: April 11, 2026</p>

        <div className="bg-white rounded-xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              LiveHub ("we", "us", "our", or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We collect information in the following ways:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Personal identification information (name, email, phone number)</li>
              <li>Account credentials and farmer/business information</li>
              <li>Livestock images and health analysis data</li>
              <li>Transaction and payment information</li>
              <li>Device and browsing information via cookies</li>
              <li>Location data with your consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use collected information to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Provide and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Perform AI health analysis on livestock images</li>
              <li>Send emails about your account or marketplace activity</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Analyze usage patterns and optimize platform performance</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Sharing of Information</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell, trade, or rent your personal information. We may share information with third-party service providers who assist in our operations, including payment processors and cloud hosting providers, under strict confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies to enhance your experience. You can choose to disable cookies through your browser settings, though this may limit some platform features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at: privacy@livehub.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy

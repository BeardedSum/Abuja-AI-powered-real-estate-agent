import { Routes, Route } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Abuja Realty AI</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#properties" className="text-gray-700 hover:text-primary-600">Properties</a>
              <a href="#about" className="text-gray-700 hover:text-primary-600">About</a>
              <a href="#contact" className="text-gray-700 hover:text-primary-600">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Home in Abuja
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              AI-powered property search with 90% lower fees
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#search" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Search Properties
              </a>
              <a href="https://wa.me/YOUR_WHATSAPP_NUMBER" target="_blank" rel="noopener noreferrer"
                 className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Abuja Realty AI?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-xl font-semibold mb-2">Save 90% on Fees</h4>
              <p className="text-gray-600">
                Just 0.5-1% transaction fee vs. traditional 5-10% agent commission
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-xl font-semibold mb-2">AI-Powered Search</h4>
              <p className="text-gray-600">
                Smart recommendations based on your preferences and budget
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="text-xl font-semibold mb-2">WhatsApp First</h4>
              <p className="text-gray-600">
                Search, schedule viewings, and make offers all via WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Search</h4>
              <p className="text-sm text-gray-600">Tell us what you're looking for via WhatsApp or web</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">View</h4>
              <p className="text-sm text-gray-600">Schedule property viewings at your convenience</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">Offer</h4>
              <p className="text-sm text-gray-600">Make offers with AI-powered pricing insights</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="font-semibold mb-2">Close</h4>
              <p className="text-sm text-gray-600">We handle paperwork and closing</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-3xl font-bold mb-4">Ready to Find Your Home?</h3>
          <p className="text-xl mb-8">
            Start your property search today on WhatsApp
          </p>
          <a
            href="https://wa.me/YOUR_WHATSAPP_NUMBER?text=Hi%2C%20I%27m%20looking%20for%20a%20property%20in%20Abuja"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg"
          >
            Start on WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Abuja Realty AI</h4>
              <p className="text-gray-400 text-sm">
                AI-powered real estate platform making property buying easy and affordable in Abuja.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="#properties" className="hover:text-white">Properties</a></li>
                <li><a href="#about" className="hover:text-white">About Us</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>WhatsApp: +234 XXX XXX XXXX</li>
                <li>Email: info@abujarealty.ai</li>
                <li>Abuja, Nigeria</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Abuja Realty AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, IndianRupee, MousePointer2, Phone, Mail, MessageCircle, Instagram, Send, Mountain, ArrowRight } from 'lucide-react';
import { Package } from '../types';
import { packageService } from '../services/packageService';

export const HomePage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await packageService.getAllPackages();
      setPackages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const galleryImages = [
  { url: '/advanjer2.jpg' },
  { url: '/kolukumalai4.jpg' },
  { url: '/advanter 6.jpg' },
  { url: '/meeshapulimala_header11.jpg' },
  { url: '/meeshapulimala_header1.jpg' },
  { url: '/kolukumalai7.jpg' },
];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGalleryIndex((prev) => (prev + 1) % galleryImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-700 font-medium">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Your Next
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Adventure
                </span>
                Starts Here
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Embark on unforgettable trekking experiences across stunning landscapes. Book your perfect adventure today and create memories that last a lifetime.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    const packagesSection = document.getElementById('packages');
                    packagesSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Explore Packages</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    const contactSection = document.getElementById('contact');
                    contactSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-white text-emerald-700 border-2 border-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 hover:scale-105 transition-all duration-300"
                >
                  Contact Us
                </button>
              </div>
            </div>
            <div className="relative animate-fade-in-right">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                  <img
                    src="/header image.jpg"
                    alt="Adventure"
                    className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <MousePointer2 className="h-6 w-6 animate-bounce" />
                      <span className="text-sm font-medium">Click to explore</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our carefully curated selection of adventure packages
            </p>
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-20">
              <Mountain className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No packages available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/package/${pkg.id}`)}
                >
                  <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
                    <img
                      src={pkg.image_url || 'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg'}
                      alt={pkg.title}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center text-white mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">{pkg.destination}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">{pkg.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                        <span className="text-sm font-medium">{pkg.duration_days} Days</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Users className="h-4 w-4 mr-2 text-emerald-600" />
                        <span className="text-sm font-medium">Max {pkg.max_capacity}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center text-3xl font-bold text-emerald-600">
                          <IndianRupee className="h-7 w-7" />
                          <span>{pkg.price_per_head}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">per person</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/package/${pkg.id}`);
                        }}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Makes Us Special
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Why Choose TrekBooking
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mountain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Official Tourism Promoter</h3>
              <p className="text-gray-600 leading-relaxed">
                Kerala Forest Development Corporation authorized partner
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Curated Trekking Adventures</h3>
              <p className="text-gray-600 leading-relaxed">
                Handpicked trails for all experience levels
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Expert Local Guides</h3>
              <p className="text-gray-600 leading-relaxed">
                Safe and insightful journeys with knowledgeable leaders
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Small Group Experiences</h3>
              <p className="text-gray-600 leading-relaxed">
                More personal and immersive adventures
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Hassle-Free Planning</h3>
              <p className="text-gray-600 leading-relaxed">
                We handle permits, accommodation, and logistics
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mountain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Safety First Approach</h3>
              <p className="text-gray-600 leading-relaxed">
                Your well-being is our top priority
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Adventure Gallery
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Moments captured from our incredible journeys
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="group relative h-48 sm:h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-xl font-bold mb-1">{image.title}</h3>
                  <p className="text-sm text-gray-300">{image.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions? We're here to help you plan your perfect adventure
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8 animate-fade-in-left">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 group cursor-pointer hover:translate-x-2 transition-transform">
                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                      <Phone className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                      <p className="text-gray-600">+91 7592049934</p>
                      <p className="text-gray-600">+91 9495919934</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 group cursor-pointer hover:translate-x-2 transition-transform">
                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                      <Mail className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                      <p className="text-gray-600">info@vaorutrippadikkam.com</p>
                      <p className="text-gray-600">support@vaorutrippadikkam.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 group cursor-pointer hover:translate-x-2 transition-transform">
                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                      <MapPin className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                      <p className="text-gray-600">Munnar,suryanelli,Chinnakanal panchayathu </p>
                      <p className="text-gray-600">Kerala, India 685618</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Follow Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-14 h-14 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-xl flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg hover:shadow-2xl"
                  >
                    <Instagram className="h-7 w-7 text-white" />
                  </a>
                  <a
                    href="https://wa.me/911234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg hover:shadow-2xl"
                  >
                    <MessageCircle className="h-7 w-7 text-white" />
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-right">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your adventure plans..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Send Message</span>
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <Mountain className="h-8 w-8 text-emerald-500" />
                <span className="ml-2 text-2xl font-bold">TrekBooking</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted partner for unforgettable trekking adventures across India.
              </p>
              <div className="flex space-x-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-lg flex items-center justify-center hover:scale-110 hover:rotate-12 transition-all duration-300"
                >
                  <Instagram className="h-5 w-5 text-white" />
                </a>
                <a
                  href="https://wa.me/911234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center hover:scale-110 hover:rotate-12 transition-all duration-300"
                >
                  <MessageCircle className="h-5 w-5 text-white" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate('/packages')}
                    className="text-gray-400 hover:text-emerald-500 transition-colors hover:translate-x-1 inline-block"
                  >
                    Packages
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/bookings')}
                    className="text-gray-400 hover:text-emerald-500 transition-colors hover:translate-x-1 inline-block"
                  >
                    My Bookings
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2 hover:text-emerald-500 transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>+91 7592049934</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-emerald-500 transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>info@vaorutrippadikkam.com</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to get updates on new packages and offers
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-emerald-600 transition-colors"
                />
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-r-lg transition-colors">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 TrekBooking. All rights reserved. Made with passion for adventure.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

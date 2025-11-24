import { useEffect, useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { Package } from '../types';
import { packageService } from '../services/packageService';
import { useAuth } from '../contexts/AuthContext';

interface PackageDetailsPageProps {
  packageId: string;
  onNavigate: (page: string, packageId?: string) => void;
}

export const PackageDetailsPage = ({ packageId, onNavigate }: PackageDetailsPageProps) => {
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    loadPackage();
  }, [packageId]);

  const loadPackage = async () => {
    try {
      const data = await packageService.getPackageById(packageId);
      setPkg(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Package not found</p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 text-emerald-600 hover:text-emerald-700"
          >
            Go back to packages
          </button>
        </div>
      </div>
    );
  }

  const images = pkg.gallery_images && pkg.gallery_images.length > 0 ? pkg.gallery_images : [pkg.image_url || ''];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWhatsAppContact = () => {
    const message = Hi, I'm interested in booking ${pkg.title}. Can you provide more details?;
    const whatsappUrl = https://wa.me/${pkg.contact_info?.phone}?text=${encodeURIComponent(message)};
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Packages
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="relative h-96 bg-gray-200">
            <img
              src={images[currentImageIndex]}
              alt={pkg.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-gray-800" />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{pkg.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{pkg.destination}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{pkg.duration_days} Days</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>Max {pkg.max_capacity} people</span>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 p-6 rounded-lg">
                <div className="flex items-center text-3xl font-bold text-emerald-600 mb-2">
                  <IndianRupee className="h-8 w-8" />
                  {pkg.price_per_head}
                </div>
                <p className="text-sm text-gray-600 mb-4">per person</p>
                <p className="text-sm text-gray-600 mb-4">
                  Advance: ₹{pkg.advance_payment}
                </p>
                {user ? (
                  <button
                    onClick={() => onNavigate('booking', pkg.id)}
                    className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Book Now
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('auth')}
                    className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Sign In to Book
                  </button>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{pkg.description}</p>
            </div>

            {pkg.inclusions && pkg.inclusions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Inclusions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pkg.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                      <span className="text-2xl">{inclusion.icon}</span>
                      <span className="text-gray-700">{inclusion.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pkg.facilities && pkg.facilities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Facilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pkg.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                      <span className="text-2xl">{facility.icon}</span>
                      <span className="text-gray-700">{facility.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Itinerary</h2>
                <div className="space-y-6">
                  {pkg.itinerary.map((day) => (
                    <div key={day.day} className="border-l-4 border-emerald-600 pl-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{day.title}</h3>
                      <div className="space-y-3">
                        {day.activities.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <Clock className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-900">{activity.time}</span>
                              <span className="text-gray-600"> - {activity.activity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pkg.contact_info && (
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{pkg.contact_info.note}</h2>
                <button
                  onClick={handleWhatsAppContact}
                  className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Contact via WhatsApp: {pkg.contact_info.phone}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
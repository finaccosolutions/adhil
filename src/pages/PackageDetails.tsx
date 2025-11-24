import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  IndianRupee,
  Clock,
  ChevronLeft,
  MapPin,
  Users,
  Check,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { supabase, Package } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function PackageDetails() {
  const { id: packageId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pkg, setPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (packageId) fetchPackageDetails();
  }, [packageId]);

  const fetchPackageDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', packageId)
        .maybeSingle();
      if (error) throw error;
      setPackage(data);

      // Load gallery images if available
      if (data?.gallery_images && Array.isArray(data.gallery_images)) {
        setGalleryImages(data.gallery_images);
      }
    } catch (err) {
      console.error('Error fetching package:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedDate) {
      alert('Please select your travel date');
      return;
    }

    navigate(`/booking/${packageId}`, {
      state: { package: pkg, date: selectedDate },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 text-center">
        <p className="text-gray-600 text-lg">Package not found</p>
        <Link to="/packages" className="mt-4 text-blue-600 hover:underline inline-block">
          Back to Packages
        </Link>
      </div>
    );
  }

  const inclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions : [];
  const facilities = Array.isArray(pkg.facilities) ? pkg.facilities : [];
  const itinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
  const contactInfo = pkg.contact_info || {};

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/packages" className="text-blue-600 hover:text-blue-700 mb-6 flex items-center">
          <ChevronLeft className="h-5 w-5" />
          Back to Packages
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-200">
            {pkg.image_url ? (
              <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover" />
      
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-400 to-blue-600">
                <Calendar className="h-20 w-20 text-white opacity-60" />
              </div>
            )}
          </div>

          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{pkg.title}</h1>

           <div className="flex flex-wrap items-center gap-8 mb-8 text-gray-800">

  {/* Destination */}
  <div className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-300">
    <MapPin className="h-6 w-6 text-blue-600" />
    <span className="font-medium text-lg">{pkg.destination}</span>
  </div>

  {/* Duration */}
  <div className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-300">
    <Clock className="h-6 w-6 text-blue-600" />
    <span className="font-medium text-lg">{pkg.duration_days} days</span>
  </div>

  {/* Price */}
  <div className="flex items-center text-blue-700 font-extrabold text-2xl">
    <IndianRupee className="h-6 w-6" />
    <span className="ml-1">{pkg.price_per_head?.toLocaleString()}</span>
  </div>

              
</div>

{/* Description */}
<p className="text-gray-700 text-lg leading-relaxed tracking-wide mb-6">
  {pkg.description}
</p>

            {/* Date Picker Section */}
          <div className="mb-8">
  <label className="block text-blue-900 font-extrabold mb-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
  Select Your Travel Date
</label>


  <div className=" max-w-[460px] relative group">
    <input
      id="travelDateInput"
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="w-full max-w-[460px] px-5 py-4 pr-14 rounded-2xl
                 border border-gray-300 bg-white text-gray-800 text-lg
                 shadow-md transition-all duration-300
                 focus:ring-4 focus:ring-blue-300 focus:border-blue-600
                 group-hover:shadow-xl group-hover:border-blue-400"
    />

    {/* Calendar Icon */}
   
    {/* Glow Effect */}
    <span
      className="absolute inset-0 rounded-2xl pointer-events-none
                 transition-all duration-500
                 group-hover:shadow-[0_0_18px_4px_rgba(0,123,255,0.4)]"
    ></span>
  </div>
</div>

         
       {/* Inclusion Section */}
{inclusions.length > 0 && (
  <div className="mb-8 bg-green-50 rounded-xl p-6 shadow-sm 
                  transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
    <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center tracking-wide">
      <Check className="h-7 w-7 mr-2 text-green-600" />
      What's Included
    </h2>

    <ul className="space-y-3 text-gray-800">
      {inclusions.map((inc, i) => (
        <li
          key={i}
          className="flex items-start text-lg transition-all duration-300 
                     hover:text-green-700 hover:translate-x-1"
        >
          <Check className="h-6 w-6 mr-3 text-green-600 flex-shrink-0" />
          {typeof inc === 'object' ? inc.text : inc}
        </li>
      ))}
    </ul>
  </div>
)}

{/* Facilities */}
{facilities.length > 0 && (
  <div className="mb-8 bg-blue-50 rounded-xl p-6 shadow-sm 
                  transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
    <h2 className="text-2xl font-bold text-gray-900 mb-5 tracking-wide">
      Facilities
    </h2>

    <ul className="space-y-3 text-gray-800">
      {facilities.map((f, i) => (
        <li
          key={i}
          className="flex items-start text-lg transition-all duration-300
                     hover:text-blue-700 hover:translate-x-1"
        >
          <Check className="h-6 w-6 mr-3 text-blue-600 flex-shrink-0" />
          {typeof f === 'object' ? f.text : f}
        </li>
      ))}
    </ul>
  </div>
)}


            {/* Itinerary */}
      {itinerary.length > 0 && (
  <div className="mb-8">
    <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-wide">
      Day-by-Day Itinerary
    </h2>

    <div className="space-y-7">
      {itinerary.map((day, i) => (
        <div
          key={i}
          className="border-l-4 border-blue-600 pl-5 py-4 bg-blue-50/40 rounded-xl
                     shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
        >
          <h3 className="font-bold text-gray-900 text-xl mb-2 tracking-wide">
            Day {day.day}: {day.title}
          </h3>

          {day.activities?.map((act, j) => (
            <p
              key={j}
              className="text-gray-800 ml-7 flex items-center gap-2 py-1 text-lg
                         transition-all duration-300 hover:text-blue-700 hover:translate-x-1"
            >
              <span className="text-blue-700 text-xl">🕒</span>
              {act.time} — {act.activity}
            </p>
          ))}
        </div>
      ))}
    </div>
  </div>
)}


            {/* Gallery Section */}
            {galleryImages.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Photo Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryImages.map((imageUrl: string, index: number) => (
                    <div key={index} className="relative h-64 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
                      <img
                        src={imageUrl}
                        alt={`${pkg.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {(contactInfo.phone || contactInfo.email || contactInfo.website) && (
              <div className="mb-8 bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                {contactInfo.phone && (
                  <p className="text-gray-700 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-blue-600" /> {contactInfo.phone}
                  </p>
                )}
                {contactInfo.email && (
                  <p className="text-gray-700 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-blue-600" /> {contactInfo.email}
                  </p>
                )}
                {contactInfo.website && (
                  <p className="text-gray-700 flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-600" /> {contactInfo.website}
                  </p>
                )}
              </div>
            )}

            {/* Booking Button */}
            <button
              onClick={handleBookNow}
              className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

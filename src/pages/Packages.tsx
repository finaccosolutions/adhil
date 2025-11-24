import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Package } from '../lib/supabase';

export function Packages() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Packages</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect package that suits your needs. All packages include premium features and dedicated support.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No packages available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100"
              >
                {pkg.image_url && (
                  <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden">
                    <img
                      src={pkg.image_url}
                      alt={pkg.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{pkg.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline mb-2">
                      <span className="text-3xl font-bold text-blue-600">₹{pkg.price_per_head}</span>
                      <span className="ml-2 text-gray-500">per person</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Duration: {pkg.duration_days} Days</div>
                      <div>Destination: {pkg.destination}</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/package/${pkg.id}`)}
                      className="flex-1 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </button>
                    <button
                      onClick={() => navigate(`/booking/${pkg.id}`)}
                      className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Packages;

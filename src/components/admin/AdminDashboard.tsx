import { useState, useEffect } from 'react';
import { supabase, Package, Booking } from '../../lib/supabase';
import { PackageForm } from './PackageForm';
import { BookingsList } from './BookingsList';
import { Package as PackageIcon, Calendar, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'packages' | 'bookings'>('packages');
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<(Booking & { package: Package })[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut, profile } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: packagesData } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, package:packages(*)')
        .order('created_at', { ascending: false });

      setPackages(packagesData || []);
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <PackageIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">{profile?.full_name}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition ${
                activeTab === 'packages'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Packages</span>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition ${
                activeTab === 'bookings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Bookings</span>
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            ) : activeTab === 'packages' ? (
              <div>
                <PackageForm onSuccess={loadData} />
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Packages</h3>
                  <div className="grid gap-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="border rounded-lg p-4 hover:border-blue-300 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{pkg.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{pkg.destination}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>{pkg.duration_days} days</span>
                              <span>₹{pkg.price_per_head}/person</span>
                              <span>Max: {pkg.max_capacity}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {pkg.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <BookingsList bookings={bookings} onUpdate={loadData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

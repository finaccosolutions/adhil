import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Package, Booking } from '../../lib/supabase';
import { PackageCard } from './PackageCard';
import { BookingModal } from './BookingModal';
import { MyBookings } from './MyBookings';
import { Plane, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'packages' | 'my-bookings'>('packages');
  const [packages, setPackages] = useState<Package[]>([]);
  const [myBookings, setMyBookings] = useState<(Booking & { package: Package })[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
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
        .eq('is_active', true)
        .order('start_date', { ascending: true });

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, package:packages(*)')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      setPackages(packagesData || []);
      setMyBookings(bookingsData || []);
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
              <Plane className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Trip Booking</h1>
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
              <Plane className="w-5 h-5" />
              <span>Available Packages</span>
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition ${
                activeTab === 'my-bookings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>My Bookings</span>
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            ) : activeTab === 'packages' ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packages.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No packages available at the moment</p>
                  </div>
                ) : (
                  packages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      package={pkg}
                      onViewDetails={() => navigate(`/package/${pkg.id}`)}
                      onBook={() => navigate(`/booking/${pkg.id}`)}
                    />
                  ))
                )}
              </div>
            ) : (
              <MyBookings bookings={myBookings} />
            )}
          </div>
        </div>
      </div>

      {selectedPackage && (
        <BookingModal
          package={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onSuccess={() => {
            setSelectedPackage(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

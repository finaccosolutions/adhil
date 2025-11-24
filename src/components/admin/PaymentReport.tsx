import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Calendar, Users } from 'lucide-react';
import { supabase, Booking } from '../../lib/supabase';

interface PaymentReportProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

export function PaymentReport({ showToast }: PaymentReportProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast('Failed to load payment data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_amount, 0);
    const totalAdvance = bookings.reduce((sum, booking) => sum + booking.advance_amount, 0);
    const totalPending = totalRevenue - totalAdvance;
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

    return {
      totalRevenue,
      totalAdvance,
      totalPending,
      confirmedBookings,
      pendingBookings,
      totalBookings: bookings.length,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payment Reports & Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <IndianRupee className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">
            ₹{stats.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Advance Collected</h3>
          <p className="text-2xl font-bold text-gray-900">
            ₹{stats.totalAdvance.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Amount</h3>
          <p className="text-2xl font-bold text-gray-900">
            ₹{stats.totalPending.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Bookings</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Confirmed Bookings</span>
              <span className="font-bold text-green-600">{stats.confirmedBookings}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">Pending Bookings</span>
              <span className="font-bold text-yellow-600">{stats.pendingBookings}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Collection Rate</span>
              <span className="font-bold text-blue-600">
                {stats.totalRevenue > 0
                  ? Math.round((stats.totalAdvance / stats.totalRevenue) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Average Booking Value</span>
              <span className="font-bold text-gray-900">
                ₹
                {stats.totalBookings > 0
                  ? Math.round(stats.totalRevenue / stats.totalBookings).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Advance Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.slice(0, 10).map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.booking_date).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{booking.total_amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-600">
                      ₹{booking.advance_amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-orange-600">
                      ₹{(booking.total_amount - booking.advance_amount).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

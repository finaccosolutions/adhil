import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, ExternalLink } from 'lucide-react';
import { supabase, Booking, Package, Profile } from '../../lib/supabase';

interface BookingManagementProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

type BookingWithDetails = Booking & {
  package?: Package;
  profile?: Profile;
};

export function BookingManagement({ showToast }: BookingManagementProps) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const bookingsWithDetails = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const [packageRes, profileRes] = await Promise.all([
            supabase.from('packages').select('*').eq('id', booking.package_id).maybeSingle(),
            supabase.from('profiles').select('*').eq('id', booking.user_id).maybeSingle(),
          ]);

          return {
            ...booking,
            package: packageRes.data || undefined,
            profile: profileRes.data || undefined,
          };
        })
      );

      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);

      if (error) throw error;
      showToast(`Booking ${status} successfully`, 'success');
      fetchBookings();
      setSelectedBooking(null);
    } catch (error: any) {
      console.error('Error updating booking:', error);
      showToast(error.message || 'Failed to update booking', 'error');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
        <div className="flex space-x-2">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travel Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {booking.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.profile?.username || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">{booking.profile?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.package?.title || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.travel_date).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ₹{booking.total_amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Advance: ₹{booking.advance_amount.toLocaleString()}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-blue-600 hover:text-blue-700"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">User Details</h4>
                    <p className="text-gray-900">{selectedBooking.profile?.username}</p>
                    <p className="text-sm text-gray-600">{selectedBooking.profile?.phone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Package</h4>
                    <p className="text-gray-900">{selectedBooking.package?.title}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Travel Date</h4>
                    <p className="text-gray-900">
                      {new Date(selectedBooking.travel_date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Booking Date</h4>
                    <p className="text-gray-900">
                      {new Date(selectedBooking.booking_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Travelers</h4>
                  <div className="space-y-2">
                    {selectedBooking.members.map((member, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">
                          Age: {member.age} | Phone: {member.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h4>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{selectedBooking.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Advance Paid</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{selectedBooking.advance_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedBooking.advance_utr && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">UTR/Transaction ID</h4>
                    <p className="text-gray-900 font-mono">{selectedBooking.advance_utr}</p>
                  </div>
                )}

                {selectedBooking.advance_receipt_url && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Receipt</h4>
                    <a
                      href={selectedBooking.advance_receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      View Receipt <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                )}

                {selectedBooking.status === 'pending' && (
                  <div className="flex space-x-4 pt-4 border-t">
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                      className="flex-1 flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                      className="flex-1 flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

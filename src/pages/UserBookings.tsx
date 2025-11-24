import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, IndianRupee, Package } from 'lucide-react';

interface BookingWithPackage {
  id: string;
  travel_date: string;
  total_amount: number;
  advance_paid: boolean;
  advance_amount: number;
  remaining_amount: number;
  remaining_paid: boolean;
  full_payment_done: boolean;
  status: string;
  created_at: string;
  package: {
    title: string;
  } | null;
}

export default function UserBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  async function loadBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          package:packages(title)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">You haven't made any bookings yet.</p>
            <Link
              to="/packages"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Browse Packages
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {booking.package?.title || 'Package'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Travel: {new Date(booking.travel_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        <span>Total: ₹{booking.total_amount}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          Advance Payment: {booking.advance_paid ? '✓ Paid ₹' + booking.advance_amount : '✗ Not Paid ₹' + booking.advance_amount}
                        </p>
                        {booking.advance_paid && (
                          <p className="text-sm text-gray-600">
                            Remaining Balance: {booking.remaining_paid ? '✓ Paid' : '✗ Pending'} ₹{booking.remaining_amount}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!booking.advance_paid && booking.status === 'pending' && (
                          <Link
                            to={`/payment/${booking.id}`}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                          >
                            Pay Advance
                          </Link>
                        )}
                        {booking.advance_paid && !booking.remaining_paid && booking.status !== 'cancelled' && (
                          <Link
                            to={`/remaining-payment/${booking.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                          >
                            Pay Remaining
                          </Link>
                        )}
                      </div>
                    </div>
                    {booking.full_payment_done && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
                        <p className="text-sm font-medium text-emerald-800">
                          ✓ Full payment completed. Your booking is confirmed!
                        </p>
                      </div>
                    )}
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

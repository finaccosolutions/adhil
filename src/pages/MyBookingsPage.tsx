import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, IndianRupee, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Booking } from '../types';
import { bookingService } from '../services/bookingService';

interface MyBookingsPageProps {
  onNavigate: (page: string, packageId?: string) => void;
}

export const MyBookingsPage = ({ onNavigate }: MyBookingsPageProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getUserBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="h-4 w-4 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Loader className="h-4 w-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No bookings yet</h2>
            <p className="text-gray-600 mb-6">Start your adventure by booking a package</p>
            <button
              onClick={() => onNavigate('home')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Browse Packages
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={booking.package?.image_url || 'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg'}
                      alt={booking.package?.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {booking.package?.title}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{booking.package?.destination}</span>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                        <div>
                          <p className="text-xs text-gray-500">Booking Date</p>
                          <p className="font-medium">
                            {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <Users className="h-5 w-5 mr-2 text-emerald-600" />
                        <div>
                          <p className="text-xs text-gray-500">Members</p>
                          <p className="font-medium">{booking.number_of_members} people</p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                        <div>
                          <p className="text-xs text-gray-500">Group Name</p>
                          <p className="font-medium">{booking.travel_group_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <IndianRupee className="h-5 w-5 mr-2 text-emerald-600" />
                        <div>
                          <p className="text-xs text-gray-500">Total Price</p>
                          <p className="font-medium">₹{booking.total_price}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Advance Paid:</span>
                          <span className="font-medium text-gray-900 ml-1">₹{booking.advance_paid}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Payment Status:</span>
                          <span className={`font-medium ml-1 ${
                            booking.payment_status === 'fully_paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {booking.payment_status === 'fully_paid' ? 'Fully Paid' : 'Advance Paid'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Booked on:</span>
                          <span className="font-medium text-gray-900 ml-1">
                            {new Date(booking.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {booking.members && booking.members.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Participants:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {booking.members.map((member, index) => (
                              <div key={member.id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {index + 1}. {member.member_name} - {member.member_phone}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

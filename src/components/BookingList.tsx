import React from 'react';
import { Booking, Package } from '../lib/supabase';
import { CheckCircle2, Clock, Phone, Users, Calendar, IndianRupee } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sendConfirmationToUser } from '../lib/whatsapp';

interface BookingListProps {
  bookings: Booking[];
  packages: Package[];
}

const BookingList: React.FC<BookingListProps> = ({ bookings, packages }) => {
  const { confirmBooking } = useApp();

  const getPackageById = (id: string) => {
    return packages.find(pkg => pkg.id === id);
  };

  const handleConfirm = async (booking: Booking) => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      try {
        await confirmBooking(booking.id);
        const pkg = getPackageById(booking.package_id);
        if (pkg) {
          sendConfirmationToUser(booking.phone, pkg.title, booking.booking_date);
        }
        alert('Booking confirmed! Confirmation message will be sent to customer via WhatsApp.');
      } catch (error) {
        alert('Failed to confirm booking');
      }
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-xl text-gray-600">No bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const pkg = getPackageById(booking.package_id);
        const totalPrice = pkg ? pkg.price * booking.members.length : 0;

        return (
          <div
            key={booking.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    {pkg?.title || 'Unknown Package'}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-5 w-5 mr-2 text-emerald-600" />
                    <div>
                      <p className="font-semibold">{booking.name}</p>
                      <p className="text-sm">{booking.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                    <div>
                      <p className="font-semibold">Booking Date</p>
                      <p className="text-sm">
                        {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-2 text-emerald-600" />
                    <div>
                      <p className="font-semibold">{booking.members.length} Members</p>
                      <p className="text-sm">
                        {booking.members.map((m) => m.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <IndianRupee className="h-5 w-5 mr-2 text-emerald-600" />
                    <div>
                      <p className="font-semibold">Total Amount</p>
                      <p className="text-sm text-emerald-600 font-bold">₹{totalPrice}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Member Details:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {booking.members.map((member, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {member.name} ({member.age}y)
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Booked on: {new Date(booking.created_at).toLocaleString('en-IN')}
                </p>
              </div>

              {booking.status === 'pending' && (
                <button
                  onClick={() => handleConfirm(booking)}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Confirm Booking
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookingList;

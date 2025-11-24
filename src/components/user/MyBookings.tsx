import { Booking, Package } from '../../lib/supabase';
import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react';

type MyBookingsProps = {
  bookings: (Booking & { package: Package })[];
};

export function MyBookings({ bookings }: MyBookingsProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You haven't made any bookings yet</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="border rounded-lg p-5 hover:border-blue-300 transition">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {booking.package.title}
              </h3>
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{booking.package.destination}</span>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {booking.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Travel Dates</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(booking.package.start_date)} - {formatDate(booking.package.end_date)}
              </p>
            </div>

            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Users className="w-4 h-4 mr-1" />
                <span>Travelers</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {booking.number_of_people} {booking.number_of_people === 1 ? 'person' : 'people'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Booking Date</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(booking.created_at)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">₹{booking.total_amount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Advance Paid</p>
                <p className="text-lg font-bold text-green-600">₹{booking.advance_paid}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Remaining</p>
                <p className="text-lg font-bold text-orange-600">₹{booking.remaining_amount}</p>
              </div>
            </div>
          </div>

          {booking.payment_proof_url && (
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Payment Proof Uploaded</p>
              <a
                href={booking.payment_proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <span>View</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {booking.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{booking.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

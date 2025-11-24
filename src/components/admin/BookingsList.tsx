import { useState } from 'react';
import { supabase, Booking, Package } from '../../lib/supabase';
import { ExternalLink, Check, X, MessageCircle } from 'lucide-react';

type BookingsListProps = {
  bookings: (Booking & { package: Package })[];
  onUpdate: () => void;
};

export function BookingsList({ bookings, onUpdate }: BookingsListProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    setUpdating(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
      onUpdate();
    } catch (error: any) {
      alert('Error updating booking: ' + error.message);
    } finally {
      setUpdating(null);
    }
  };

  const shareOnWhatsApp = (booking: Booking & { package: Package }) => {
    const message = `*Booking Confirmation*%0A%0A` +
      `Package: ${booking.package.title}%0A` +
      `Customer: ${booking.user_name}%0A` +
      `Phone: ${booking.user_phone}%0A` +
      `People: ${booking.number_of_people}%0A` +
      `Total Amount: ₹${booking.total_amount}%0A` +
      `Advance Paid: ₹${booking.advance_paid}%0A` +
      `Remaining: ₹${booking.remaining_amount}%0A` +
      `Status: ${booking.status.toUpperCase()}%0A` +
      `%0AThank you for booking with us!`;

    window.open(`https://wa.me/${booking.user_phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bookings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="border rounded-lg p-4 hover:border-blue-300 transition">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{booking.package.title}</h4>
              <p className="text-sm text-gray-600">
                {booking.user_name} • {booking.user_phone}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
            <div>
              <p className="text-gray-500">People</p>
              <p className="font-semibold text-gray-900">{booking.number_of_people}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Amount</p>
              <p className="font-semibold text-gray-900">₹{booking.total_amount}</p>
            </div>
            <div>
              <p className="text-gray-500">Advance Paid</p>
              <p className="font-semibold text-green-600">₹{booking.advance_paid}</p>
            </div>
            <div>
              <p className="text-gray-500">Remaining</p>
              <p className="font-semibold text-orange-600">₹{booking.remaining_amount}</p>
            </div>
          </div>

          {booking.payment_proof_url && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Payment Proof:</p>
              <a
                href={booking.payment_proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Payment Proof</span>
              </a>
            </div>
          )}

          {booking.notes && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{booking.notes}</p>
            </div>
          )}

          <div className="flex space-x-2 pt-3 border-t">
            <button
              onClick={() => shareOnWhatsApp(booking)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>

            {booking.status === 'pending' && (
              <>
                <button
                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                  disabled={updating === booking.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm</span>
                </button>
                <button
                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                  disabled={updating === booking.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Calendar,
  Users,
  IndianRupee,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Save,
} from 'lucide-react';
import { Booking } from '../../types';
import { bookingService } from '../../services/bookingService';

interface AdminBookingsProps {
  onNavigate: (page: string) => void;
}

export const AdminBookings = ({ onNavigate }: AdminBookingsProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.admin_notes || '');
    setWhatsappLink(booking.whatsapp_conversation_link || '');
    setShowDetails(true);
  };

  const handleUpdateStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      loadBookings();
      if (selectedBooking?.id === bookingId) {
        setShowDetails(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;

    try {
      await bookingService.updateBookingStatus(
        selectedBooking.id,
        selectedBooking.status,
        adminNotes,
        whatsappLink
      );
      alert('Notes saved successfully');
      loadBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to save notes');
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
            <Clock className="h-4 w-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (showDetails && selectedBooking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setShowDetails(false)}
            className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Bookings
          </button>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Details</h2>
                <p className="text-gray-600">ID: {selectedBooking.id}</p>
              </div>
              {getStatusBadge(selectedBooking.status)}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Package Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-lg">{selectedBooking.package?.title}</p>
                  <p className="text-gray-600">{selectedBooking.package?.destination}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Booking Date</h4>
                  <p className="text-gray-900">
                    {new Date(selectedBooking.booking_date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Travel Group</h4>
                  <p className="text-gray-900">{selectedBooking.travel_group_name}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Number of Members</h4>
                  <p className="text-gray-900">{selectedBooking.number_of_members}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Total Price</h4>
                  <p className="text-gray-900 font-bold">₹{selectedBooking.total_price}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Advance Paid</h4>
                  <p className="text-gray-900">₹{selectedBooking.advance_paid}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Payment Status</h4>
                  <p className="text-gray-900">
                    {selectedBooking.payment_status === 'fully_paid' ? 'Fully Paid' : 'Advance Paid'}
                  </p>
                </div>
              </div>

              {selectedBooking.members && selectedBooking.members.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Participants</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedBooking.members.map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <span className="text-gray-900">
                          {index + 1}. {member.member_name}
                        </span>
                        <span className="text-gray-600">{member.member_phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-bold text-gray-900 mb-3">WhatsApp Conversation Link</h3>
                <input
                  type="url"
                  value={whatsappLink}
                  onChange={(e) => setWhatsappLink(e.target.value)}
                  placeholder="https://wa.me/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about this booking..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </button>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Update Status</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                    disabled={selectedBooking.status === 'confirmed'}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Confirm
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'pending')}
                    disabled={selectedBooking.status === 'pending'}
                    className="flex-1 bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Set Pending
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                    disabled={selectedBooking.status === 'cancelled'}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 border-t pt-4">
                <p>Booked on: {new Date(selectedBooking.created_at).toLocaleString('en-IN')}</p>
                <p>Last updated: {new Date(selectedBooking.updated_at).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bookings yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {booking.package?.title}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-medium">
                              {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Users className="h-4 w-4 mr-2 text-emerald-600" />
                          <div>
                            <p className="text-xs text-gray-500">Members</p>
                            <p className="font-medium">{booking.number_of_members}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <IndianRupee className="h-4 w-4 mr-2 text-emerald-600" />
                          <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="font-medium">₹{booking.total_price}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Group</p>
                          <p className="font-medium">{booking.travel_group_name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-600">
                      Booked on: {new Date(booking.created_at).toLocaleDateString('en-IN')}
                    </div>
                    <div className="flex gap-2">
                      {booking.whatsapp_conversation_link && (
                        <a
                          href={booking.whatsapp_conversation_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center text-sm"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </a>
                      )}
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm"
                      >
                        View Details
                      </button>
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

import React, { useEffect, useState } from 'react';
import { Calendar, Package, DollarSign, Clock, Upload, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/supabase';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  packages: Database['public']['Tables']['packages']['Row'];
  payments: Database['public']['Tables']['payments']['Row'][];
};

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPayment, setUploadingPayment] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState('');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          packages (*),
          payments (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data as Booking[] || []);
    } catch (err: any) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPaymentProof = async (bookingId: string, paymentId: string) => {
    if (!paymentProof.trim()) {
      alert('Please enter a payment proof URL');
      return;
    }

    setUploadingPayment(bookingId);
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          payment_proof_url: paymentProof,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      alert('Payment proof uploaded successfully!');
      setPaymentProof('');
      setUploadingPayment(null);
      loadBookings();
    } catch (err: any) {
      alert('Error uploading payment proof: ' + err.message);
    } finally {
      setUploadingPayment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      verified: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage all your package bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600">Start by browsing our packages and make your first booking!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const payment = booking.payments?.[0];
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {booking.packages.name}
                        </h3>
                        <p className="text-gray-600 mb-4">{booking.packages.description}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {getStatusBadge(booking.status)}
                        {booking.requested_date && getStatusBadge(booking.date_status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-bold text-gray-900">${booking.total_amount}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Booked On</p>
                          <p className="font-bold text-gray-900">
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {booking.requested_date && (
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Requested Date</p>
                            <p className="font-bold text-gray-900">
                              {new Date(booking.requested_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {payment && (
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {payment.payment_status === 'verified' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : payment.payment_status === 'rejected' ? (
                              <XCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Payment</p>
                            <p className="font-bold text-gray-900">
                              {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {booking.special_requests && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Special Requests:</p>
                        <p className="text-gray-800">{booking.special_requests}</p>
                      </div>
                    )}

                    {payment && payment.payment_status === 'rejected' && payment.admin_notes && (
                      <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600 font-semibold mb-1">Admin Notes:</p>
                        <p className="text-red-800">{payment.admin_notes}</p>
                      </div>
                    )}

                    {payment && payment.payment_status === 'pending' && !payment.payment_proof_url && (
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <Upload className="h-5 w-5" />
                          <span>Upload Payment Proof</span>
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="url"
                            placeholder="Enter image URL (e.g., https://example.com/receipt.jpg)"
                            value={uploadingPayment === booking.id ? paymentProof : ''}
                            onChange={(e) => {
                              setUploadingPayment(booking.id);
                              setPaymentProof(e.target.value);
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => handleUploadPaymentProof(booking.id, payment.id)}
                            disabled={!paymentProof.trim() || uploadingPayment === booking.id}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Upload
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Please upload your payment receipt or proof of payment
                        </p>
                      </div>
                    )}

                    {payment && payment.payment_proof_url && (
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Payment Proof</h4>
                        <a
                          href={payment.payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          View Payment Proof
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;

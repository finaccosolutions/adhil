import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, PaymentSettings } from '../lib/supabase';
import { Upload, Smartphone, CheckCircle } from 'lucide-react';

export default function RemainingPaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings[]>([]);
  const [utr, setUtr] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadBooking();
      loadPaymentSettings();
    }
  }, [id]);

  async function loadBooking() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          package:packages(title)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error('Error loading booking:', error);
    }
  }

  async function loadPaymentSettings() {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*');

      if (error) throw error;
      setPaymentSettings(data || []);
    } catch (error) {
      console.error('Error loading payment settings:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          remaining_paid: true,
          remaining_utr: utr,
          remaining_receipt_url: receiptUrl,
          full_payment_done: true,
          status: 'confirmed',
        })
        .eq('id', id);

      if (error) throw error;

      alert('Remaining payment submitted successfully! Your booking is now confirmed.');
      navigate('/bookings');
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to submit payment details');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (booking.full_payment_done) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Complete</h1>
            <p className="text-gray-600 mb-6">
              Your booking is fully paid and confirmed. Thank you!
            </p>
            <button
              onClick={() => navigate('/bookings')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking.advance_paid) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Advance Payment Required</h1>
            <p className="text-gray-600 mb-6">
              Please complete the advance payment first before paying the remaining balance.
            </p>
            <button
              onClick={() => navigate(`/payment/${id}`)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              Pay Advance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Pay Remaining Balance</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {booking.package?.title || 'Package'}
            </h2>
            <p className="text-gray-600 mb-2">
              Travel Date: {new Date(booking.travel_date).toLocaleDateString()}
            </p>
            <div className="space-y-1 mt-4">
              <p className="text-gray-700">
                Total Amount: <span className="font-semibold">₹{booking.total_amount}</span>
              </p>
              <p className="text-emerald-600">
                Advance Paid: <span className="font-semibold">₹{booking.advance_amount}</span>
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                Remaining Balance: ₹{booking.remaining_amount || (booking.total_amount - booking.advance_amount)}
              </p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              Payment Instructions
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <p className="text-sm font-medium text-gray-700 mb-1">Payment Methods:</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">GPay:</span> {paymentSettings.find(s => s.setting_key === 'gpay_number')?.setting_value || '8129464465'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">PhonePe:</span> {paymentSettings.find(s => s.setting_key === 'phonepe_number')?.setting_value || '8129464465'}
                  </p>
                </div>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Pay ₹{booking.remaining_amount || (booking.total_amount - booking.advance_amount)} to the above GPay or PhonePe number</li>
                <li>Take a screenshot of the payment confirmation</li>
                <li>Enter the UTR/Transaction ID below</li>
                <li>Upload or paste the screenshot URL</li>
              </ol>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UTR / Transaction ID
              </label>
              <input
                type="text"
                required
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter UTR or Transaction ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Receipt URL
              </label>
              <input
                type="url"
                required
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://example.com/receipt.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload your receipt to a service like Imgur or use any image hosting service
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {loading ? 'Submitting...' : 'Submit Payment & Complete Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

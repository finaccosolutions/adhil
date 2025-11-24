import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, PaymentSettings } from '../lib/supabase';
import { Upload, Smartphone } from 'lucide-react';

export default function PaymentPage() {
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
    const { data, error } = await supabase
      .from('bookings')
      .select('*, package:packages(title, advance_payment)')
      .eq('id', id)
      .maybeSingle();
    if (error) console.error(error);
    else setBooking(data);
  }

  async function loadPaymentSettings() {
    const { data, error } = await supabase.from('payment_settings').select('*');
    if (error) console.error(error);
    else setPaymentSettings(data || []);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('bookings').update({
        advance_paid: true,
        advance_utr: utr,
        advance_receipt_url: receiptUrl,
      }).eq('id', id);
      alert('Payment submitted!');
      navigate('/bookings');
    } catch (err) {
      console.error(err);
      alert('Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen py-12 bg-gray-50 flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Pay Advance</h1>
        <h2 className="text-xl mb-2">{booking.package?.title}</h2>
        <p className="mb-2">Travel Date: {booking.travel_date}</p>
        <p className="text-2xl font-bold text-emerald-600 mb-6">Advance Amount: ₹{booking.package?.advance_payment}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">UTR / Transaction ID</label>
            <input type="text" required value={utr} onChange={(e) => setUtr(e.target.value)} className="w-full border px-3 py-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm mb-1">Receipt URL</label>
            <input type="url" required value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} className="w-full border px-3 py-2 rounded-lg" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">{loading ? 'Submitting...' : 'Submit Payment'}</button>
        </form>
      </div>
    </div>
  );
}

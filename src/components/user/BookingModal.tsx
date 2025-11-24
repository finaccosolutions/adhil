import { useState } from 'react';
import { supabase, Package } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, Upload, AlertCircle } from 'lucide-react';

type BookingModalProps = {
  package: Package;
  onClose: () => void;
  onSuccess: () => void;
};

export function BookingModal({ package: pkg, onClose, onSuccess }: BookingModalProps) {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    number_of_people: 1,
    user_name: profile?.full_name || '',
    user_phone: profile?.phone || '',
    notes: '',
    payment_proof_url: '',
  });

  const totalAmount = pkg.price_per_head * formData.number_of_people;
  const advancePaid = pkg.advance_payment * formData.number_of_people;
  const remainingAmount = totalAmount - advancePaid;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bookings')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('bookings')
        .getPublicUrl(filePath);

      setFormData({ ...formData, payment_proof_url: data.publicUrl });
    } catch (error: any) {
      alert('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.payment_proof_url) {
      alert('Please upload payment proof');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        package_id: pkg.id,
        user_id: profile?.id,
        number_of_people: formData.number_of_people,
        total_amount: totalAmount,
        advance_paid: advancePaid,
        remaining_amount: remainingAmount,
        payment_proof_url: formData.payment_proof_url,
        payment_proof_type: 'image',
        user_name: formData.user_name,
        user_phone: formData.user_phone,
        notes: formData.notes,
        status: 'pending',
      });

      if (error) throw error;

      alert('Booking submitted successfully! Admin will confirm soon.');
      onSuccess();
    } catch (error: any) {
      alert('Error creating booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Book Package</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{pkg.title}</h3>
            <p className="text-sm text-gray-600">{pkg.destination}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of People
              </label>
              <input
                type="number"
                min="1"
                max={pkg.max_capacity}
                value={formData.number_of_people}
                onChange={(e) => setFormData({ ...formData, number_of_people: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.user_phone}
                onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-gray-900">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Advance Payment:</span>
                <span className="font-semibold text-green-600">₹{advancePaid}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-600">Remaining Amount:</span>
                <span className="font-semibold text-orange-600">₹{remainingAmount}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Payment Instructions:</p>
                  <p>Please pay the advance amount of ₹{advancePaid} and upload the payment proof below.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Proof *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="payment-proof"
                  disabled={uploading}
                />
                <label
                  htmlFor="payment-proof"
                  className="cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : formData.payment_proof_url ? 'Uploaded successfully! Click to change' : 'Click to upload payment proof'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </label>
              </div>
              {formData.payment_proof_url && (
                <img
                  src={formData.payment_proof_url}
                  alt="Payment proof"
                  className="mt-3 rounded-lg max-h-40 mx-auto"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading || uploading || !formData.payment_proof_url}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : `Pay ₹${advancePaid} & Book Now`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

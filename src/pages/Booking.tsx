import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, IndianRupee } from 'lucide-react';
import { supabase, Package, PackageDate, Member } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface BookingProps {
  packageData: Package;
  dateData: PackageDate;
  onNavigate: (page: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export function Booking({ packageData, dateData, onNavigate, showToast }: BookingProps) {
  const { user, profile } = useAuth();
  const [members, setMembers] = useState<Member[]>([{ name: '', age: 0, phone: '' }]);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [utrId, setUtrId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setMembers([{ name: profile.username, age: 0, phone: profile.phone }]);
    }
  }, [profile]);

  const addMember = () => {
    setMembers([...members, { name: '', age: 0, phone: '' }]);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: keyof Member, value: string | number) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const uploadReceipt = async (): Promise<string | null> => {
    if (!receiptFile || !user) return null;

    setUploading(true);
    try {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, receiptFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      showToast('Failed to upload receipt', 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Please login to continue', 'error');
      return;
    }

    if (members.some((m) => !m.name || !m.age || !m.phone)) {
      showToast('Please fill in all member details', 'error');
      return;
    }

    if (advanceAmount <= 0) {
      showToast('Please enter a valid advance amount', 'error');
      return;
    }

    if (!utrId.trim()) {
      showToast('Please enter UTR/Transaction ID', 'error');
      return;
    }

    if (!receiptFile) {
      showToast('Please upload payment receipt', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const receiptUrl = await uploadReceipt();
      if (!receiptUrl) {
        throw new Error('Failed to upload receipt');
      }

      const totalAmount = packageData.price * members.length;

      const { error } = await supabase.from('bookings').insert({
        package_id: packageData.id,
        user_id: user.id,
        travel_date: dateData.available_date,
        members: members,
        total_amount: totalAmount,
        advance_paid: true,
        advance_amount: advanceAmount,
        advance_utr: utrId,
        advance_receipt_url: receiptUrl,
        status: 'pending',
      });

      if (error) throw error;

      showToast('Booking submitted successfully! Waiting for admin confirmation.', 'success');
      onNavigate('packages');
    } catch (error) {
      console.error('Error creating booking:', error);
      showToast('Failed to create booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = packageData.price * members.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Complete Your Booking</h1>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-gray-800 mb-2">{packageData.title}</h2>
            <p className="text-sm text-gray-600">
              Travel Date: {new Date(dateData.available_date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-gray-600">
              Price per person: ₹{packageData.price.toLocaleString()}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Traveler Details</h3>
                <button
                  type="button"
                  onClick={addMember}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-5 w-5 mr-1" />
                  Add Member
                </button>
              </div>

              {members.map((member, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Member {index + 1}</h4>
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={member.name}
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={member.age || ''}
                      onChange={(e) => updateMember(index, 'age', parseInt(e.target.value) || 0)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="1"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={member.phone}
                      onChange={(e) => updateMember(index, 'phone', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between text-lg font-semibold text-gray-800">
                <span>Total Amount:</span>
                <div className="flex items-center text-blue-600">
                  <IndianRupee className="h-6 w-6" />
                  <span>{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please make the advance payment via UPI/Google Pay and upload the payment screenshot.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={advanceAmount || ''}
                    onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="1"
                    max={totalAmount}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UTR/Transaction ID
                  </label>
                  <input
                    type="text"
                    value={utrId}
                    onChange={(e) => setUtrId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Screenshot
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <Upload className="h-5 w-5 mr-2 text-gray-600" />
                      <span className="text-gray-700">
                        {receiptFile ? receiptFile.name : 'Choose File'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => onNavigate('packages')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Upload } from 'lucide-react';
import { Package, Member } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { sendBookingToWhatsApp } from '../lib/whatsapp';

interface BookingFormProps {
  package: Package;
  onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ package: pkg, onClose }) => {
  const { addBooking, fetchAvailableDates, availableDates } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [members, setMembers] = useState<Member[]>([{ name: '', age: 0 }]);
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailableDates(pkg.id);
  }, [pkg.id]);

  const addMember = () => {
    setMembers([...members, { name: '', age: 0 }]);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: 'name' | 'age', value: string | number) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !bookingDate || members.some(m => !m.name || m.age <= 0)) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await addBooking({
        package_id: pkg.id,
        name,
        phone,
        members,
        booking_date: bookingDate,
        payment_screenshot: paymentScreenshot || undefined,
      });

      const totalPrice = pkg.price * members.length;
      sendBookingToWhatsApp(pkg.title, name, phone, members, bookingDate, totalPrice);

      alert('Booking submitted successfully! You will be redirected to WhatsApp to complete the booking.');
      onClose();
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = pkg.price * members.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Book Your Adventure</h2>
            <p className="text-emerald-100">{pkg.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
              Select Date *
            </label>
            {availableDates.length > 0 ? (
              <select
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="">Choose a date</option>
                {availableDates.map((date) => (
                  <option key={date.id} value={date.date}>
                    {new Date(date.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {' '}
                    ({date.max_bookings - date.current_bookings} spots left)
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Member Details * ({members.length} {members.length === 1 ? 'member' : 'members'})
              </label>
              <button
                type="button"
                onClick={addMember}
                className="flex items-center text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Member
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {members.map((member, index) => (
                <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-2"
                      placeholder={`Member ${index + 1} name`}
                      required
                    />
                    <input
                      type="number"
                      value={member.age || ''}
                      onChange={(e) => updateMember(index, 'age', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Age"
                      min="1"
                      required
                    />
                  </div>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Upload className="h-4 w-4 mr-2 text-emerald-600" />
              Payment Screenshot (Optional)
            </label>
            <input
              type="text"
              value={paymentScreenshot}
              onChange={(e) => setPaymentScreenshot(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Paste image URL"
            />
            <p className="text-sm text-gray-500 mt-1">
              You can upload payment screenshot after booking via WhatsApp
            </p>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Price per person:</span>
              <span className="font-semibold text-gray-800">₹{pkg.price}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Number of members:</span>
              <span className="font-semibold text-gray-800">{members.length}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                <span className="text-2xl font-bold text-emerald-600">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Booking via WhatsApp'}
          </button>

          <p className="text-sm text-gray-500 text-center">
            After submitting, you will be redirected to WhatsApp to complete your booking
          </p>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;

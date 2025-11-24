import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ChevronLeft, MessageCircle } from 'lucide-react';
import { supabase, Package, PackageDate } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const BookingPage = () => {
  const { id: packageId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { package: pkgFromState, date: dateFromState } = location.state || {};
  const [pkg, setPkg] = useState<Package | null>(pkgFromState || null);
  const [availableDates, setAvailableDates] = useState<PackageDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(dateFromState || '');
  const [numberOfMembers, setNumberOfMembers] = useState(2);
  const [member1, setMember1] = useState({ name: '', phone: '' });
  const [member2, setMember2] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(!pkgFromState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!pkgFromState && packageId) {
      loadData();
    }
  }, [packageId, user]);

  const loadData = async () => {
    if (!packageId) return;
    try {
      const [pkgResponse, datesResponse] = await Promise.all([
        supabase.from('packages').select('*').eq('id', packageId).maybeSingle(),
        supabase.from('package_dates').select('*').eq('package_id', packageId).order('available_date'),
      ]);

      if (pkgResponse.error) throw pkgResponse.error;
      if (datesResponse.error) throw datesResponse.error;

      setPkg(pkgResponse.data);
      setAvailableDates(datesResponse.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load package details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    if (!member1.name.trim() || !member1.phone.trim()) {
      setError('Please fill in all details for Person 1');
      return;
    }

    if (numberOfMembers >= 2 && (!member2.name.trim() || !member2.phone.trim())) {
      setError('Please fill in all details for Person 2');
      return;
    }

    setSubmitting(true);

    try {
      const totalPrice = pkg!.price_per_head * numberOfMembers;
      const advancePaid = pkg!.advance_payment * numberOfMembers;

      const whatsappMessage = `Hi, I would like to book ${pkg!.title}

Date: ${new Date(selectedDate).toLocaleDateString()}
Number of Members: ${numberOfMembers}
Total Price: ₹${totalPrice}
Advance Payment: ₹${advancePaid}

${numberOfMembers >= 1 ? `Contact Person 1:
Name: ${member1.name}
Phone: ${member1.phone}` : ''}

${numberOfMembers >= 2 ? `Contact Person 2:
Name: ${member2.name}
Phone: ${member2.phone}` : ''}`;

      const whatsappUrl = `https://wa.me/917592049934?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');

      navigate('/bookings');
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pkg || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Package not found</p>
        </div>
      </div>
    );
  }

  const totalPrice = pkg.price_per_head * numberOfMembers;
  const advanceTotal = pkg.advance_payment * numberOfMembers;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/package/${packageId}`)}
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Package Details
        </button>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Adventure</h1>
          <h2 className="text-xl text-gray-600 mb-8">{pkg.title}</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Date Picker */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-full">
                  <p className="text-sm font-medium text-gray-700">Select Date</p>
                  
                  {selectedDate && (
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      Selected: {new Date(selectedDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Number of Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Members <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={numberOfMembers}
                onChange={(e) => setNumberOfMembers(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                You will provide contact details for {Math.min(numberOfMembers, 2)} {Math.min(numberOfMembers, 2) === 1 ? 'person' : 'people'} below
              </p>
            </div>

            {/* Contact Persons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Contact Person Details <span className="text-red-500">*</span>
              </label>

              <div className="space-y-4">
                {/* Person 1 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Person 1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={member1.name}
                      onChange={(e) => setMember1({ ...member1, name: e.target.value })}
                      placeholder="Full Name"
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      value={member1.phone}
                      onChange={(e) => setMember1({ ...member1, phone: e.target.value })}
                      placeholder="Phone Number"
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Person 2 (only if members >= 2) */}
                {numberOfMembers >= 2 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Person 2</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={member2.name}
                        onChange={(e) => setMember2({ ...member2, name: e.target.value })}
                        placeholder="Full Name"
                        required
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        value={member2.phone}
                        onChange={(e) => setMember2({ ...member2, phone: e.target.value })}
                        placeholder="Phone Number"
                        required
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Booking Summary</h3>
              <div className="flex justify-between text-gray-700">
                <span>Number of Members:</span>
                <span className="font-medium">{numberOfMembers}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Price per Person:</span>
                <span className="font-medium">₹{pkg.price_per_head}</span>
              </div>
              <div className="flex justify-between text-gray-700 border-t pt-3">
                <span className="font-medium">Total Price:</span>
                <span className="font-bold text-xl">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-emerald-600 border-t pt-3">
                <span className="font-medium">Advance Payment Required:</span>
                <span className="font-bold text-xl">₹{advanceTotal}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You need to pay ₹{pkg.advance_payment} per person as advance
              </p>
            </div>

            {/* WhatsApp Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">WhatsApp Booking Process</p>
                  <p>
                    After submitting this form, you'll be redirected to WhatsApp with a pre-filled message
                    containing your booking details. Please send this message to complete your booking.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedDate}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : 'Proceed to WhatsApp Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

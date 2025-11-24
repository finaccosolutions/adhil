import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X, Trash2, Image as ImageIcon } from 'lucide-react';

type PackageFormProps = {
  onSuccess: () => void;
};

type ItineraryItem = {
  day: number;
  title: string;
  description: string;
};

export function PackageForm({ onSuccess }: PackageFormProps) {
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    duration_days: 1,
    price_per_head: 0,
    advance_payment: 500,
    max_capacity: 10,
    start_date: '',
    end_date: '',
    image_url: '',
    is_active: true,
  });

  const [inclusions, setInclusions] = useState<string[]>(['']);
  const [facilities, setFacilities] = useState<string[]>(['']);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([
    { day: 1, title: '', description: '' }
  ]);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    website: '',
  });

  const handleAddInclusion = () => {
    setInclusions([...inclusions, '']);
  };

  const handleRemoveInclusion = (index: number) => {
    setInclusions(inclusions.filter((_, i) => i !== index));
  };

  const handleInclusionChange = (index: number, value: string) => {
    const updated = [...inclusions];
    updated[index] = value;
    setInclusions(updated);
  };

  const handleAddFacility = () => {
    setFacilities([...facilities, '']);
  };

  const handleRemoveFacility = (index: number) => {
    setFacilities(facilities.filter((_, i) => i !== index));
  };

  const handleFacilityChange = (index: number, value: string) => {
    const updated = [...facilities];
    updated[index] = value;
    setFacilities(updated);
  };

  const handleAddItineraryDay = () => {
    setItinerary([...itinerary, { day: itinerary.length + 1, title: '', description: '' }]);
  };

  const handleRemoveItineraryDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index);
    updated.forEach((item, i) => {
      item.day = i + 1;
    });
    setItinerary(updated);
  };

  const handleItineraryChange = (index: number, field: keyof ItineraryItem, value: string | number) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const filteredInclusions = inclusions.filter(inc => inc.trim() !== '');
      const filteredFacilities = facilities.filter(fac => fac.trim() !== '');
      const filteredItinerary = itinerary.filter(item => item.title.trim() !== '' || item.description.trim() !== '');

      const { error } = await supabase.from('packages').insert({
        ...formData,
        inclusions: filteredInclusions,
        facilities: filteredFacilities,
        itinerary: filteredItinerary,
        contact_info: contactInfo,
        created_by: profile?.id,
      });

      if (error) throw error;

      setFormData({
        title: '',
        description: '',
        destination: '',
        duration_days: 1,
        price_per_head: 0,
        advance_payment: 500,
        max_capacity: 10,
        start_date: '',
        end_date: '',
        image_url: '',
        is_active: true,
      });
      setInclusions(['']);
      setFacilities(['']);
      setItinerary([{ day: 1, title: '', description: '' }]);
      setContactInfo({ phone: '', email: '', website: '' });
      setShowForm(false);
      onSuccess();
    } catch (error: any) {
      alert('Error creating package: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <Plus className="w-5 h-5" />
        <span>Create New Package</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Create New Package</h3>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination *
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Per Person (₹) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.price_per_head}
                onChange={(e) => setFormData({ ...formData, price_per_head: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advance Payment (₹) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.advance_payment}
                onChange={(e) => setFormData({ ...formData, advance_payment: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Capacity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Package Image
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {formData.image_url && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={formData.image_url}
                  alt="Package preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Inclusions</h4>
          <div className="space-y-2">
            {inclusions.map((inclusion, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={inclusion}
                  onChange={(e) => handleInclusionChange(index, e.target.value)}
                  placeholder="e.g., Breakfast, Lunch, Dinner"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {inclusions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInclusion(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddInclusion}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Inclusion</span>
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Facilities</h4>
          <div className="space-y-2">
            {facilities.map((facility, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={facility}
                  onChange={(e) => handleFacilityChange(index, e.target.value)}
                  placeholder="e.g., Free WiFi, Air Conditioning"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {facilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddFacility}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Facility</span>
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Itinerary</h4>
          <div className="space-y-4">
            {itinerary.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium text-gray-700">Day {item.day}</h5>
                  {itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItineraryDay(index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                  placeholder="Activity title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  value={item.description}
                  onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                  placeholder="Activity description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddItineraryDay}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Day</span>
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                placeholder="+91 1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder="contact@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={contactInfo.website}
                onChange={(e) => setContactInfo({ ...contactInfo, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t flex space-x-3">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Package'}
        </button>
      </div>
    </form>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, Package } from '../../lib/supabase';
import { Plus, Trash2, X } from 'lucide-react';

interface Inclusion {
  icon: string;
  text: string;
}

interface Activity {
  time: string;
  activity: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

interface Facility {
  icon: string;
  text: string;
}

interface ContactInfo {
  note?: string;
  phone?: string;
}

export default function EditPackage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    price_per_head: '',
    advance_payment: '',
    duration_days: '',
    start_date: '',
    end_date: '',
    max_capacity: '',
    image_url: '',
    is_active: true,
  });
  const [inclusions, setInclusions] = useState<Inclusion[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ note: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [loadingPackage, setLoadingPackage] = useState(true);

  useEffect(() => {
    loadPackage();
  }, [id]);

  async function loadPackage() {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title,
          description: data.description || '',
          destination: data.destination || '',
          price_per_head: data.price_per_head?.toString() || '',
          advance_payment: data.advance_payment?.toString() || '',
          duration_days: data.duration_days?.toString() || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          max_capacity: data.max_capacity?.toString() || '',
          image_url: data.image_url || '',
          is_active: data.is_active ?? true,
        });
        setInclusions(data.inclusions || []);
        setItinerary(data.itinerary || []);
        setFacilities(data.facilities || []);
        setContactInfo(data.contact_info || { note: '', phone: '' });
      }
    } catch (error) {
      console.error('Error loading package:', error);
      alert('Failed to load package');
    } finally {
      setLoadingPackage(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('packages')
        .update({
          title: formData.title,
          description: formData.description,
          destination: formData.destination,
          price_per_head: parseFloat(formData.price_per_head),
          advance_payment: parseFloat(formData.advance_payment),
          duration_days: parseInt(formData.duration_days),
          start_date: formData.start_date,
          end_date: formData.end_date,
          max_capacity: parseInt(formData.max_capacity),
          image_url: formData.image_url || null,
          is_active: formData.is_active,
          inclusions,
          itinerary,
          facilities,
          contact_info: contactInfo,
        })
        .eq('id', id);

      if (error) throw error;
      alert('Package updated successfully!');
      navigate('/admin/packages');
    } catch (error: any) {
      console.error('Error updating package:', error);
      alert(error.message || 'Failed to update package');
    } finally {
      setLoading(false);
    }
  };

  const addInclusion = () => {
    setInclusions([...inclusions, { icon: '', text: '' }]);
  };

  const updateInclusion = (index: number, field: keyof Inclusion, value: string) => {
    const updated = [...inclusions];
    updated[index][field] = value;
    setInclusions(updated);
  };

  const removeInclusion = (index: number) => {
    setInclusions(inclusions.filter((_, i) => i !== index));
  };

  const addFacility = () => {
    setFacilities([...facilities, { icon: '', text: '' }]);
  };

  const updateFacility = (index: number, field: keyof Facility, value: string) => {
    const updated = [...facilities];
    updated[index][field] = value;
    setFacilities(updated);
  };

  const removeFacility = (index: number) => {
    setFacilities(facilities.filter((_, i) => i !== index));
  };

  const addItineraryDay = () => {
    const newDay = itinerary.length + 1;
    setItinerary([...itinerary, { day: newDay, title: '', activities: [] }]);
  };

  const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: any) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const removeItineraryDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index);
    updated.forEach((day, i) => {
      day.day = i + 1;
    });
    setItinerary(updated);
  };

  const addActivity = (dayIndex: number) => {
    const updated = [...itinerary];
    updated[dayIndex].activities.push({ time: '', activity: '' });
    setItinerary(updated);
  };

  const updateActivity = (dayIndex: number, activityIndex: number, field: keyof Activity, value: string) => {
    const updated = [...itinerary];
    updated[dayIndex].activities[activityIndex][field] = value;
    setItinerary(updated);
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const updated = [...itinerary];
    updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== activityIndex);
    setItinerary(updated);
  };

  if (loadingPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading package...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Edit Package</h1>
          <button
            onClick={() => navigate('/admin/packages')}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination *
              </label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Head (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price_per_head}
                  onChange={(e) => setFormData({ ...formData, price_per_head: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advance Payment (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.advance_payment}
                  onChange={(e) => setFormData({ ...formData, advance_payment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Days) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Capacity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {formData.image_url && (
                <div className="mt-4">
                  <img
                    src={formData.image_url}
                    alt="Package preview"
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                Package is Active
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Inclusions</h2>
              <button
                type="button"
                onClick={addInclusion}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Inclusion
              </button>
            </div>
            <div className="space-y-3">
              {inclusions.map((inclusion, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Icon (emoji)"
                    value={inclusion.icon}
                    onChange={(e) => updateInclusion(index, 'icon', e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={inclusion.text}
                    onChange={(e) => updateInclusion(index, 'text', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeInclusion(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Facilities</h2>
              <button
                type="button"
                onClick={addFacility}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Facility
              </button>
            </div>
            <div className="space-y-3">
              {facilities.map((facility, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Icon (emoji)"
                    value={facility.icon}
                    onChange={(e) => updateFacility(index, 'icon', e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={facility.text}
                    onChange={(e) => updateFacility(index, 'text', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeFacility(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Itinerary</h2>
              <button
                type="button"
                onClick={addItineraryDay}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Day
              </button>
            </div>
            <div className="space-y-6">
              {itinerary.map((day, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Day {day.day}</h3>
                    <button
                      type="button"
                      onClick={() => removeItineraryDay(dayIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Day Title"
                    value={day.title}
                    onChange={(e) => updateItineraryDay(dayIndex, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4"
                  />
                  <div className="space-y-2">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Time"
                          value={activity.time}
                          onChange={(e) => updateActivity(dayIndex, actIndex, 'time', e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Activity"
                          value={activity.activity}
                          onChange={(e) => updateActivity(dayIndex, actIndex, 'activity', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeActivity(dayIndex, actIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addActivity(dayIndex)}
                    className="mt-3 flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Activity
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  value={contactInfo.note || ''}
                  onChange={(e) => setContactInfo({ ...contactInfo, note: e.target.value })}
                  placeholder="e.g., For Booking & More Details Call/WhatsApp"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone || ''}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  placeholder="e.g., 8129464465"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {loading ? 'Updating...' : 'Update Package'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/packages')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-medium text-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

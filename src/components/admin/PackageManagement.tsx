import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, X, Image as ImageIcon, Check } from 'lucide-react';
import { supabase, Package, PackageDate } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface PackageManagementProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

type ItineraryItem = {
  day: number;
  title: string;
  description: string;
};

export function PackageManagement({ showToast }: PackageManagementProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [selectedPackageForDates, setSelectedPackageForDates] = useState<Package | null>(null);
  const [packageDates, setPackageDates] = useState<PackageDate[]>([]);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    price_per_head: 0,
    advance_payment: 0,
    duration_days: 1,
    start_date: '',
    end_date: '',
    max_capacity: 50,
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

  const [dateFormData, setDateFormData] = useState({
    available_date: '',
    seats: 50,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      showToast('Failed to load packages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageDates = async (packageId: string) => {
    try {
      const { data, error } = await supabase
        .from('package_dates')
        .select('*')
        .eq('package_id', packageId)
        .order('available_date');

      if (error) throw error;
      setPackageDates(data || []);
    } catch (error) {
      console.error('Error fetching dates:', error);
      showToast('Failed to load dates', 'error');
    }
  };

  const openAddModal = () => {
    setEditingPackage(null);
    setFormData({
      title: '',
      description: '',
      destination: '',
      price_per_head: 0,
      advance_payment: 0,
      duration_days: 1,
      start_date: '',
      end_date: '',
      max_capacity: 50,
      image_url: '',
      is_active: true,
    });
    setInclusions(['']);
    setFacilities(['']);
    setItinerary([{ day: 1, title: '', description: '' }]);
    setContactInfo({ phone: '', email: '', website: '' });
    setShowModal(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description,
      destination: pkg.destination,
      price_per_head: pkg.price_per_head,
      advance_payment: pkg.advance_payment,
      duration_days: pkg.duration_days,
      start_date: pkg.start_date,
      end_date: pkg.end_date,
      max_capacity: pkg.max_capacity,
      image_url: pkg.image_url || '',
      is_active: pkg.is_active,
    });

    setInclusions(Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0 ? pkg.inclusions : ['']);
    setFacilities(Array.isArray(pkg.facilities) && pkg.facilities.length > 0 ? pkg.facilities : ['']);
    setItinerary(Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 ? pkg.itinerary : [{ day: 1, title: '', description: '' }]);
    setContactInfo(pkg.contact_info || { phone: '', email: '', website: '' });

    setShowModal(true);
  };

  const openDateModal = (pkg: Package) => {
    setSelectedPackageForDates(pkg);
    setDateFormData({ available_date: '', seats: 50 });
    fetchPackageDates(pkg.id);
    setShowDateModal(true);
  };

  const handleAddInclusion = () => {
    setInclusions([...inclusions, '']);
  };

  const handleRemoveInclusion = (index: number) => {
    if (inclusions.length > 1) {
      setInclusions(inclusions.filter((_, i) => i !== index));
    }
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
    if (facilities.length > 1) {
      setFacilities(facilities.filter((_, i) => i !== index));
    }
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
    if (itinerary.length > 1) {
      const updated = itinerary.filter((_, i) => i !== index);
      updated.forEach((item, i) => {
        item.day = i + 1;
      });
      setItinerary(updated);
    }
  };

  const handleItineraryChange = (index: number, field: keyof ItineraryItem, value: string | number) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filteredInclusions = inclusions.filter(inc => inc.trim() !== '');
    const filteredFacilities = facilities.filter(fac => fac.trim() !== '');
    const filteredItinerary = itinerary.filter(item => item.title.trim() !== '' || item.description.trim() !== '');

    const packageData = {
      title: formData.title,
      description: formData.description,
      destination: formData.destination,
      price_per_head: formData.price_per_head,
      advance_payment: formData.advance_payment,
      duration_days: formData.duration_days,
      start_date: formData.start_date,
      end_date: formData.end_date,
      max_capacity: formData.max_capacity,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
      inclusions: filteredInclusions,
      facilities: filteredFacilities,
      itinerary: filteredItinerary,
      contact_info: contactInfo,
      created_by: user?.id,
    };

    try {
      if (editingPackage) {
        const { error } = await supabase
          .from('packages')
          .update(packageData)
          .eq('id', editingPackage.id);

        if (error) throw error;
        showToast('Package updated successfully', 'success');
      } else {
        const { error } = await supabase.from('packages').insert(packageData);

        if (error) throw error;
        showToast('Package created successfully', 'success');
      }

      setShowModal(false);
      fetchPackages();
    } catch (error: any) {
      console.error('Error saving package:', error);
      showToast(error.message || 'Failed to save package', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const { error } = await supabase.from('packages').delete().eq('id', id);

      if (error) throw error;
      showToast('Package deleted successfully', 'success');
      fetchPackages();
    } catch (error: any) {
      console.error('Error deleting package:', error);
      showToast(error.message || 'Failed to delete package', 'error');
    }
  };

  const handleDateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackageForDates) return;

    try {
      const { error } = await supabase.from('package_dates').insert({
        package_id: selectedPackageForDates.id,
        available_date: dateFormData.available_date,
        seats: dateFormData.seats,
      });

      if (error) throw error;
      showToast('Date added successfully', 'success');
      setDateFormData({ available_date: '', seats: 50 });
      fetchPackageDates(selectedPackageForDates.id);
    } catch (error: any) {
      console.error('Error adding date:', error);
      showToast(error.message || 'Failed to add date', 'error');
    }
  };

  const handleDeleteDate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this date?')) return;

    try {
      const { error } = await supabase.from('package_dates').delete().eq('id', id);

      if (error) throw error;
      showToast('Date deleted successfully', 'success');
      if (selectedPackageForDates) {
        fetchPackageDates(selectedPackageForDates.id);
      }
    } catch (error: any) {
      console.error('Error deleting date:', error);
      showToast(error.message || 'Failed to delete date', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Package Management</h2>
        <button
          onClick={openAddModal}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Package
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{pkg.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{pkg.destination}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(pkg.start_date).toLocaleDateString()} - {new Date(pkg.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{pkg.price_per_head.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openDateModal(pkg)}
                        className="text-green-600 hover:text-green-700"
                        title="Manage Dates"
                      >
                        <CalendarIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingPackage ? 'Edit Package' : 'Add Package'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
                        <input
                          type="text"
                          value={formData.destination}
                          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                          placeholder="e.g., Kerala, India"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days) *</label>
                        <input
                          type="number"
                          value={formData.duration_days || ''}
                          onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Person (₹) *</label>
                        <input
                          type="number"
                          value={formData.price_per_head || ''}
                          onChange={(e) => setFormData({ ...formData, price_per_head: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Advance Payment (₹) *</label>
                        <input
                          type="number"
                          value={formData.advance_payment || ''}
                          onChange={(e) => setFormData({ ...formData, advance_payment: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Capacity *</label>
                        <input
                          type="number"
                          value={formData.max_capacity || ''}
                          onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 50 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                        <select
                          value={formData.is_active ? 'active' : 'inactive'}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Package Image
                    </h4>
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Check className="h-5 w-5 mr-2 text-green-600" />
                      Inclusions
                    </h4>
                    <div className="space-y-2">
                      {inclusions.map((inclusion, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={inclusion}
                            onChange={(e) => handleInclusionChange(index, e.target.value)}
                            placeholder="e.g., Breakfast, Lunch, Dinner"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {inclusions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInclusion(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddInclusion}
                        className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Plus className="h-4 w-4" />
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
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {facilities.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFacility(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddFacility}
                        className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Plus className="h-4 w-4" />
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
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                            placeholder="Activity title"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <textarea
                            value={item.description}
                            onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                            placeholder="Activity description"
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddItineraryDay}
                        className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Day</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          placeholder="+91 1234567890"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={contactInfo.email}
                          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                          placeholder="contact@example.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          value={contactInfo.website}
                          onChange={(e) => setContactInfo({ ...contactInfo, website: e.target.value })}
                          placeholder="https://example.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4 border-t sticky bottom-0 bg-white">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingPackage ? 'Update Package' : 'Create Package'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDateModal && selectedPackageForDates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Manage Dates - {selectedPackageForDates.title}
                </h3>
                <button onClick={() => setShowDateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleDateSubmit} className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={dateFormData.available_date}
                      onChange={(e) => setDateFormData({ ...dateFormData, available_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
                    <input
                      type="number"
                      value={dateFormData.seats || ''}
                      onChange={(e) => setDateFormData({ ...dateFormData, seats: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="1"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Date
                </button>
              </form>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-4">Available Dates</h4>
                <div className="space-y-2">
                  {packageDates.map((date) => (
                    <div
                      key={date.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {new Date(date.available_date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{date.seats} seats available</p>
                      </div>
                      <button
                        onClick={() => handleDeleteDate(date.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  {packageDates.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No dates added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

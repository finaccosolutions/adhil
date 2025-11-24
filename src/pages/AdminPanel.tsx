import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import BookingList from '../components/BookingList';
import { Plus, Edit2, Trash2, Save, X, Calendar } from 'lucide-react';
import { Package, ItineraryDay } from '../lib/supabase';

const AdminPanel: React.FC = () => {
  const { packages, bookings, addPackage, updatePackage, deletePackage, addAvailableDate, fetchAvailableDates, availableDates, deleteAvailableDate } = useApp();
  const [activeTab, setActiveTab] = useState<'bookings' | 'packages' | 'dates'>('bookings');
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [selectedPackageForDates, setSelectedPackageForDates] = useState<string>('');
  const [newDate, setNewDate] = useState('');
  const [maxBookings, setMaxBookings] = useState(50);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    duration: '',
    images: [''],
    inclusions: [''],
    itinerary: [{ day: 1, title: '', activities: [''] }] as ItineraryDay[],
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      duration: '',
      images: [''],
      inclusions: [''],
      itinerary: [{ day: 1, title: '', activities: [''] }],
    });
    setEditingPackage(null);
    setShowPackageForm(false);
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      images: pkg.images.length > 0 ? pkg.images : [''],
      inclusions: pkg.inclusions.length > 0 ? pkg.inclusions : [''],
      itinerary: pkg.itinerary && pkg.itinerary.length > 0 ? pkg.itinerary : [{ day: 1, title: '', activities: [''] }],
    });
    setShowPackageForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      await deletePackage(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const packageData = {
      ...formData,
      images: formData.images.filter(img => img.trim() !== ''),
      inclusions: formData.inclusions.filter(inc => inc.trim() !== ''),
      itinerary: formData.itinerary.filter(day => day.title.trim() !== ''),
    };

    try {
      if (editingPackage) {
        await updatePackage(editingPackage.id, packageData);
      } else {
        await addPackage(packageData);
      }
      resetForm();
    } catch (error) {
      alert('Failed to save package');
    }
  };

  const updateArrayField = (field: 'images' | 'inclusions', index: number, value: string) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const addArrayField = (field: 'images' | 'inclusions') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayField = (field: 'images' | 'inclusions', index: number) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updated.length > 0 ? updated : [''] });
  };

  const updateItinerary = (dayIndex: number, field: 'title' | 'activities', value: string | string[]) => {
    const updated = [...formData.itinerary];
    if (field === 'activities') {
      updated[dayIndex].activities = value as string[];
    } else {
      updated[dayIndex].title = value as string;
    }
    setFormData({ ...formData, itinerary: updated });
  };

  const addItineraryDay = () => {
    setFormData({
      ...formData,
      itinerary: [...formData.itinerary, { day: formData.itinerary.length + 1, title: '', activities: [''] }],
    });
  };

  const addActivity = (dayIndex: number) => {
    const updated = [...formData.itinerary];
    updated[dayIndex].activities.push('');
    setFormData({ ...formData, itinerary: updated });
  };

  const updateActivity = (dayIndex: number, actIndex: number, value: string) => {
    const updated = [...formData.itinerary];
    updated[dayIndex].activities[actIndex] = value;
    setFormData({ ...formData, itinerary: updated });
  };

  const removeActivity = (dayIndex: number, actIndex: number) => {
    const updated = [...formData.itinerary];
    updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== actIndex);
    if (updated[dayIndex].activities.length === 0) {
      updated[dayIndex].activities = [''];
    }
    setFormData({ ...formData, itinerary: updated });
  };

  const handleAddDate = async () => {
    if (!selectedPackageForDates || !newDate) {
      alert('Please select a package and date');
      return;
    }

    try {
      await addAvailableDate({
        package_id: selectedPackageForDates,
        date: newDate,
        max_bookings: maxBookings,
        current_bookings: 0,
      });
      setNewDate('');
      alert('Date added successfully');
    } catch (error) {
      alert('Failed to add date');
    }
  };

  const handleDeleteDate = async (dateId: string) => {
    if (window.confirm('Are you sure you want to delete this date?')) {
      await deleteAvailableDate(dateId);
      if (selectedPackageForDates) {
        await fetchAvailableDates(selectedPackageForDates);
      }
    }
  };

  const handlePackageSelectForDates = async (packageId: string) => {
    setSelectedPackageForDates(packageId);
    if (packageId) {
      await fetchAvailableDates(packageId);
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Panel</h1>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'bookings'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-emerald-50'
            }`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'packages'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-emerald-50'
            }`}
          >
            Packages ({packages.length})
          </button>
          <button
            onClick={() => setActiveTab('dates')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'dates'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-emerald-50'
            }`}
          >
            Available Dates
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Pending Bookings ({pendingBookings.length})
              </h2>
              <BookingList bookings={pendingBookings} packages={packages} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Confirmed Bookings ({confirmedBookings.length})
              </h2>
              <BookingList bookings={confirmedBookings} packages={packages} />
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Manage Packages</h2>
              <button
                onClick={() => setShowPackageForm(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition-colors shadow-md"
              >
                <Plus className="h-5 w-5" />
                Add Package
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-xl shadow-md p-6">
                  <img
                    src={pkg.images[0] || 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={pkg.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{pkg.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{pkg.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-emerald-600 font-bold text-lg">₹{pkg.price}</span>
                    <span className="text-gray-600">{pkg.duration}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dates' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-emerald-600" />
              Manage Available Dates
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Package
                </label>
                <select
                  value={selectedPackageForDates}
                  onChange={(e) => handlePackageSelectForDates(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Choose a package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPackageForDates && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Bookings
                      </label>
                      <input
                        type="number"
                        value={maxBookings}
                        onChange={(e) => setMaxBookings(parseInt(e.target.value))}
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddDate}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                      >
                        Add Date
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">
                      Available Dates ({availableDates.length})
                    </h3>
                    <div className="space-y-2">
                      {availableDates.map((date) => (
                        <div
                          key={date.id}
                          className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">
                              {new Date(date.date).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-gray-600">
                              {date.current_bookings} / {date.max_bookings} bookings
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteDate(date.id)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      {availableDates.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          No available dates added yet
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showPackageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingPackage ? 'Edit Package' : 'Add New Package'}
              </h2>
              <button
                onClick={resetForm}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration *</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 2 Days 1 Night"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Images (URLs)</label>
                  <button
                    type="button"
                    onClick={() => addArrayField('images')}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                  >
                    + Add Image
                  </button>
                </div>
                {formData.images.map((img, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => updateArrayField('images', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('images', index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Inclusions</label>
                  <button
                    type="button"
                    onClick={() => addArrayField('inclusions')}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                  >
                    + Add Inclusion
                  </button>
                </div>
                {formData.inclusions.map((inc, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={inc}
                      onChange={(e) => updateArrayField('inclusions', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., Breakfast included"
                    />
                    {formData.inclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('inclusions', index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Itinerary</label>
                  <button
                    type="button"
                    onClick={addItineraryDay}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                  >
                    + Add Day
                  </button>
                </div>
                {formData.itinerary.map((day, dayIndex) => (
                  <div key={dayIndex} className="bg-gray-50 p-4 rounded-lg mb-3">
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => updateItinerary(dayIndex, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-2"
                      placeholder={`Day ${day.day} - Title`}
                    />
                    <div className="space-y-2">
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={activity}
                            onChange={(e) => updateActivity(dayIndex, actIndex, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Activity description"
                          />
                          <button
                            type="button"
                            onClick={() => removeActivity(dayIndex, actIndex)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addActivity(dayIndex)}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                      >
                        + Add Activity
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <Save className="h-5 w-5" />
                {editingPackage ? 'Update Package' : 'Add Package'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

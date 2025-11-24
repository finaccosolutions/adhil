import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Calendar, ChevronLeft, Save, X } from 'lucide-react';
import { Package, PackageAvailableDate } from '../../types';
import { packageService } from '../../services/packageService';

interface AdminPackagesProps {
  onNavigate: (page: string) => void;
}

export const AdminPackages = ({ onNavigate }: AdminPackagesProps) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showDateManager, setShowDateManager] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<PackageAvailableDate[]>([]);
  const [newDate, setNewDate] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    price_per_head: '',
    advance_payment: '',
    duration_days: '',
    max_capacity: '',
    image_url: '',
    gallery_images: '',
    inclusions: '',
    itinerary: '',
    facilities: '',
    contact_phone: '',
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await packageService.getAllPackages();
      setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDates = async (packageId: string) => {
    try {
      const dates = await packageService.getAvailableDates(packageId);
      setAvailableDates(dates);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDate = async () => {
    if (!newDate || !showDateManager) return;

    try {
      await packageService.addAvailableDate(showDateManager, newDate);
      setNewDate('');
      loadAvailableDates(showDateManager);
    } catch (err) {
      console.error(err);
      alert('Failed to add date');
    }
  };

  const handleRemoveDate = async (dateId: string) => {
    if (!confirm('Remove this date?')) return;

    try {
      await packageService.removeAvailableDate(dateId);
      if (showDateManager) {
        loadAvailableDates(showDateManager);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to remove date');
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description || '',
      destination: pkg.destination || '',
      price_per_head: pkg.price_per_head.toString(),
      advance_payment: pkg.advance_payment.toString(),
      duration_days: pkg.duration_days.toString(),
      max_capacity: pkg.max_capacity.toString(),
      image_url: pkg.image_url || '',
      gallery_images: pkg.gallery_images ? JSON.stringify(pkg.gallery_images) : '',
      inclusions: pkg.inclusions ? JSON.stringify(pkg.inclusions) : '',
      itinerary: pkg.itinerary ? JSON.stringify(pkg.itinerary) : '',
      facilities: pkg.facilities ? JSON.stringify(pkg.facilities) : '',
      contact_phone: pkg.contact_info?.phone || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      await packageService.deletePackage(id);
      loadPackages();
    } catch (err) {
      console.error(err);
      alert('Failed to delete package');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const packageData = {
        title: formData.title,
        description: formData.description,
        destination: formData.destination,
        price_per_head: parseFloat(formData.price_per_head),
        advance_payment: parseFloat(formData.advance_payment),
        duration_days: parseInt(formData.duration_days),
        max_capacity: parseInt(formData.max_capacity),
        image_url: formData.image_url,
        gallery_images: formData.gallery_images ? JSON.parse(formData.gallery_images) : [],
        inclusions: formData.inclusions ? JSON.parse(formData.inclusions) : [],
        itinerary: formData.itinerary ? JSON.parse(formData.itinerary) : [],
        facilities: formData.facilities ? JSON.parse(formData.facilities) : [],
        contact_info: { note: 'For Booking & More Details Call/WhatsApp', phone: formData.contact_phone },
        is_active: true,
      };

      if (editingPackage) {
        await packageService.updatePackage(editingPackage.id, packageData);
      } else {
        await packageService.createPackage(packageData);
      }

      setShowForm(false);
      setEditingPackage(null);
      loadPackages();
    } catch (err) {
      console.error(err);
      alert('Failed to save package. Please check your JSON formatting.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      destination: '',
      price_per_head: '',
      advance_payment: '',
      duration_days: '',
      max_capacity: '',
      image_url: '',
      gallery_images: '',
      inclusions: '',
      itinerary: '',
      facilities: '',
      contact_phone: '',
    });
    setEditingPackage(null);
    setShowForm(false);
  };

  if (showDateManager) {
    const pkg = packages.find(p => p.id === showDateManager);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => {
              setShowDateManager(null);
              setAvailableDates([]);
            }}
            className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Packages
          </button>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Manage Dates - {pkg?.title}
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Available Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleAddDate}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Available Dates</h3>
              {availableDates.length === 0 ? (
                <p className="text-gray-600">No dates available</p>
              ) : (
                <div className="space-y-2">
                  {availableDates.map((date) => (
                    <div
                      key={date.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="font-medium">
                        {new Date(date.available_date).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <button
                        onClick={() => handleRemoveDate(date.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={resetForm}
            className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Packages
          </button>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPackage ? 'Edit Package' : 'Add New Package'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Head *</label>
                  <input
                    type="number"
                    required
                    value={formData.price_per_head}
                    onChange={(e) => setFormData({ ...formData, price_per_head: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advance Payment *</label>
                  <input
                    type="number"
                    required
                    value={formData.advance_payment}
                    onChange={(e) => setFormData({ ...formData, advance_payment: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity *</label>
                  <input
                    type="number"
                    required
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://images.pexels.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="8129464465"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images (JSON Array)</label>
                <textarea
                  value={formData.gallery_images}
                  onChange={(e) => setFormData({ ...formData, gallery_images: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                  placeholder='["url1", "url2"]'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inclusions (JSON Array)</label>
                <textarea
                  value={formData.inclusions}
                  onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                  placeholder='[{"icon": "🌅", "text": "Sunrise trekking"}]'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facilities (JSON Array)</label>
                <textarea
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                  placeholder='[{"icon": "🌿", "text": "Free WiFi"}]'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Itinerary (JSON Array)</label>
                <textarea
                  value={formData.itinerary}
                  onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                  placeholder='[{"day": 1, "title": "Day 1", "activities": [{"time": "10:00 AM", "activity": "Check in"}]}]'
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Package
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center text-emerald-600 hover:text-emerald-700 mb-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Manage Packages</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Package
          </button>
        </div>

        {packages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600">No packages yet. Add your first package!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/4">
                    <img
                      src={pkg.image_url || 'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg'}
                      alt={pkg.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-3/4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                        <p className="text-gray-600 mb-4">{pkg.destination}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium text-gray-900 ml-1">₹{pkg.price_per_head}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Advance:</span>
                            <span className="font-medium text-gray-900 ml-1">₹{pkg.advance_payment}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium text-gray-900 ml-1">{pkg.duration_days} Days</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Capacity:</span>
                            <span className="font-medium text-gray-900 ml-1">{pkg.max_capacity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => {
                            setShowDateManager(pkg.id);
                            loadAvailableDates(pkg.id);
                          }}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                          title="Manage Dates"
                        >
                          <Calendar className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Settings, Image, Save, Loader, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/supabase';

type SiteSettings = Database['public']['Tables']['site_settings']['Row'];
type Package = Database['public']['Tables']['packages']['Row'];
type PackageDate = Database['public']['Tables']['package_dates']['Row'];

interface SiteSettingsProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

export function SiteSettings({ showToast }: SiteSettingsProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [packageDates, setPackageDates] = useState<PackageDate[]>([]);
  const [newDate, setNewDate] = useState('');

  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [trekkingImages, setTrekkingImages] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
    loadPackages();
  }, []);

  useEffect(() => {
    if (selectedPackage) {
      loadPackageDates(selectedPackage);
    }
  }, [selectedPackage]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setHeroTitle(data.hero_title || '');
        setHeroSubtitle(data.hero_subtitle || '');
        setHeroImageUrl(data.hero_image_url || '');
        setTrekkingImages(Array.isArray(data.trekking_images) ? data.trekking_images : []);
        setGalleryImages(Array.isArray(data.gallery_images) ? data.gallery_images : []);
      }
    } catch (err: any) {
      showToast('Error loading settings: ' + err.message, 'error');
    }
  };

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPackages(data || []);
    } catch (err: any) {
      showToast('Error loading packages: ' + err.message, 'error');
    }
  };

  const loadPackageDates = async (packageId: string) => {
    try {
      const { data, error } = await supabase
        .from('package_dates')
        .select('*')
        .eq('package_id', packageId)
        .order('available_date');

      if (error) throw error;
      setPackageDates(data || []);
    } catch (err: any) {
      showToast('Error loading package dates: ' + err.message, 'error');
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const settingsData = {
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_image_url: heroImageUrl,
        trekking_images: trekkingImages,
        gallery_images: galleryImages,
        updated_at: new Date().toISOString(),
        updated_by: profile?.id,
      };

      if (settings) {
        const { error } = await supabase
          .from('site_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert(settingsData);

        if (error) throw error;
      }

      showToast('Settings saved successfully!', 'success');
      loadSettings();
    } catch (err: any) {
      showToast('Error saving settings: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateTrekkingImage = (index: number, field: string, value: string) => {
    const updated = [...trekkingImages];
    updated[index] = { ...updated[index], [field]: value };
    setTrekkingImages(updated);
  };

  const updateGalleryImage = (index: number, field: string, value: string) => {
    const updated = [...galleryImages];
    updated[index] = { ...updated[index], [field]: value };
    setGalleryImages(updated);
  };

  const handleAddPackageDate = async () => {
    if (!selectedPackage || !newDate) {
      showToast('Please select a package and date', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('package_dates')
        .insert({
          package_id: selectedPackage,
          available_date: newDate,
        });

      if (error) throw error;
      showToast('Package date added successfully!', 'success');
      setNewDate('');
      loadPackageDates(selectedPackage);
    } catch (err: any) {
      showToast('Error adding package date: ' + err.message, 'error');
    }
  };

  const handleDeletePackageDate = async (dateId: string) => {
    if (!confirm('Are you sure you want to delete this date?')) return;

    try {
      const { error } = await supabase
        .from('package_dates')
        .delete()
        .eq('id', dateId);

      if (error) throw error;
      showToast('Package date deleted successfully!', 'success');
      loadPackageDates(selectedPackage);
    } catch (err: any) {
      showToast('Error deleting package date: ' + err.message, 'error');
    }
  };

  const handleToggleDateAvailability = async (dateId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('package_dates')
        .update({ is_available: !currentStatus })
        .eq('id', dateId);

      if (error) throw error;
      showToast('Date availability updated!', 'success');
      loadPackageDates(selectedPackage);
    } catch (err: any) {
      showToast('Error updating date: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Site Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Title
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Welcome to PackTrack"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Subtitle
            </label>
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Your trusted partner for package booking and tracking"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Background Image URL
            </label>
            <input
              type="url"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/hero-image.jpg"
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Trekking Adventure Images</h3>
            </div>
            <div className="space-y-4">
              {trekkingImages.map((img, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={img.title || ''}
                    onChange={(e) => updateTrekkingImage(index, 'title', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Title"
                  />
                  <input
                    type="url"
                    value={img.image_url || ''}
                    onChange={(e) => updateTrekkingImage(index, 'image_url', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Image URL"
                  />
                  <input
                    type="text"
                    value={img.description || ''}
                    onChange={(e) => updateTrekkingImage(index, 'description', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Description"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Package Gallery Images</h3>
            </div>
            <div className="space-y-4">
              {galleryImages.map((img, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={img.title || ''}
                    onChange={(e) => updateGalleryImage(index, 'title', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Title"
                  />
                  <input
                    type="url"
                    value={img.image_url || ''}
                    onChange={(e) => updateGalleryImage(index, 'image_url', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Image URL"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Package Available Dates</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Package
              </label>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a package...</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedPackage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Date
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddPackageDate}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedPackage && packageDates.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bookings</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {packageDates.map((date) => (
                    <tr key={date.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        {new Date(date.available_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            date.is_available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {date.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {date.current_bookings} / {date.max_bookings}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleDateAvailability(date.id, date.is_available)}
                            className={`px-4 py-2 rounded-lg font-semibold ${
                              date.is_available
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {date.is_available ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeletePackageDate(date.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedPackage && packageDates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No dates available for this package. Add one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

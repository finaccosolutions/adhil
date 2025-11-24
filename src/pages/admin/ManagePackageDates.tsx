import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Package } from '../../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

interface PackageDate {
  id: string;
  package_id: string;
  available_date: string;
  max_bookings: number;
  current_bookings: number;
}

export default function ManagePackageDates() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [dates, setDates] = useState<PackageDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState('');
  const [newSeats, setNewSeats] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadPackageAndDates();
  }, [id]);

  async function loadPackageAndDates() {
    try {
      const { data: packageData, error: pkgError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (pkgError) throw pkgError;
      setPkg(packageData);

      const { data: datesData, error: datesError } = await supabase
        .from('package_dates')
        .select('*')
        .eq('package_id', id)
        .order('available_date', { ascending: true });

      if (datesError) throw datesError;
      setDates(datesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load package dates');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDate(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);

    try {
      const { error } = await supabase.from('package_dates').insert({
        package_id: id,
        available_date: newDate,
        max_bookings: parseInt(newSeats),
        current_bookings: 0,
      });

      if (error) throw error;
      setNewDate('');
      setNewSeats('');
      loadPackageAndDates();
      alert('Date added successfully!');
    } catch (error: any) {
      console.error('Error adding date:', error);
      alert(error.message || 'Failed to add date');
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteDate(dateId: string) {
    if (!confirm('Are you sure you want to delete this date?')) return;

    try {
      const { error } = await supabase
        .from('package_dates')
        .delete()
        .eq('id', dateId);

      if (error) throw error;
      loadPackageAndDates();
    } catch (error) {
      console.error('Error deleting date:', error);
      alert('Failed to delete date');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/packages')}
            className="text-emerald-600 hover:text-emerald-700 mb-4"
          >
            ← Back to Packages
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Available Dates</h1>
          <p className="text-xl text-gray-600">{pkg?.title}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Date</h2>
          <form onSubmit={handleAddDate} className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Seats
              </label>
              <input
                type="number"
                required
                min="1"
                value={newSeats}
                onChange={(e) => setNewSeats(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={adding}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {adding ? 'Adding...' : 'Add Date'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Available Dates</h2>
          </div>
          {dates.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No dates added yet. Add your first available date above.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {dates.map((date) => {
                const availableSeats = date.max_bookings - date.current_bookings;
                return (
                  <div key={date.id} className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium text-gray-800">
                        {new Date(date.available_date + 'T00:00:00').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {availableSeats} of {date.max_bookings} seats available ({date.current_bookings} booked)
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteDate(date.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

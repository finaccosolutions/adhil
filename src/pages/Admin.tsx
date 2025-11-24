import React, { useEffect, useState } from 'react';
import { Package, Users, CreditCard, Calendar, Plus, Edit2, Trash2, Check, X, Loader, Settings, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SiteSettings } from '../components/admin/SiteSettings';
import type { Database } from '../lib/supabase';

type Package = Database['public']['Tables']['packages']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'] & {
  packages: Database['public']['Tables']['packages']['Row'];
  profiles: Database['public']['Tables']['profiles']['Row'];
  payments: Database['public']['Tables']['payments']['Row'][];
};
type Payment = Database['public']['Tables']['payments']['Row'] & {
  bookings: Database['public']['Tables']['bookings']['Row'] & {
    packages: Database['public']['Tables']['packages']['Row'];
  };
  profiles: Database['public']['Tables']['profiles']['Row'];
};

interface AdminProps {
  onNavigate: (page: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const Admin: React.FC<AdminProps> = ({ onNavigate, showToast }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'packages' | 'users' | 'bookings' | 'payments' | 'settings'>('packages');
  const [loading, setLoading] = useState(false);

  const [packages, setPackages] = useState<Package[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    features: '',
    image_url: '',
  });

  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user');
    if (adminUser) {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [activeTab, isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'packages':
          await loadPackages();
          break;
        case 'users':
          await loadUsers();
          break;
        case 'bookings':
          await loadBookings();
          break;
        case 'payments':
          await loadPayments();
          break;
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPackages(data || []);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setUsers(data || []);
  };

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        packages (*),
        profiles (*),
        payments (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setBookings(data as Booking[] || []);
  };

  const loadPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        bookings (
          *,
          packages (*)
        ),
        profiles (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPayments(data as Payment[] || []);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const featuresArray = packageForm.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const packageData = {
        name: packageForm.name,
        description: packageForm.description,
        price: parseFloat(packageForm.price),
        duration: packageForm.duration,
        features: featuresArray,
        image_url: packageForm.image_url || null,
        updated_at: new Date().toISOString(),
      };

      if (editingPackage) {
        const { error } = await supabase
          .from('packages')
          .update(packageData)
          .eq('id', editingPackage.id);

        if (error) throw error;
        alert('Package updated successfully!');
      } else {
        const { error } = await supabase
          .from('packages')
          .insert(packageData);

        if (error) throw error;
        alert('Package created successfully!');
      }

      setShowPackageForm(false);
      setEditingPackage(null);
      setPackageForm({ name: '', description: '', price: '', duration: '', features: '', image_url: '' });
      loadPackages();
    } catch (err: any) {
      alert('Error saving package: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Package deleted successfully!');
      loadPackages();
    } catch (err: any) {
      alert('Error deleting package: ' + err.message);
    }
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price.toString(),
      duration: pkg.duration,
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
      image_url: pkg.image_url || '',
    });
    setShowPackageForm(true);
  };

  const handleUpdateBookingDateStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ date_status: status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;
      alert(`Date request ${status}!`);
      loadBookings();
    } catch (err: any) {
      alert('Error updating date status: ' + err.message);
    }
  };

  const handleUpdatePaymentStatus = async (
    paymentId: string,
    status: 'verified' | 'rejected',
    adminNotes: string = ''
  ) => {
    try {
      const adminUser = localStorage.getItem('admin_user');
      const admin = adminUser ? JSON.parse(adminUser) : null;

      const { error } = await supabase
        .from('payments')
        .update({
          payment_status: status,
          admin_notes: adminNotes,
          verified_at: status === 'verified' ? new Date().toISOString() : null,
          verified_by: admin?.admin_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;
      alert(`Payment ${status}!`);
      loadPayments();
    } catch (err: any) {
      alert('Error updating payment: ' + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    localStorage.removeItem('admin_user');
    showToast('Signed out successfully', 'success');
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('home')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                View Site
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: 'packages', label: 'Packages', icon: Package },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'packages' && (
              <div>
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setEditingPackage(null);
                      setPackageForm({ name: '', description: '', price: '', duration: '', features: '', image_url: '' });
                      setShowPackageForm(true);
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add New Package</span>
                  </button>
                </div>

                {showPackageForm && (
                  <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {editingPackage ? 'Edit Package' : 'Create New Package'}
                    </h2>
                    <form onSubmit={handleSavePackage} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
                        <input
                          type="text"
                          value={packageForm.name}
                          onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={packageForm.description}
                          onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={packageForm.price}
                            onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                          <input
                            type="text"
                            value={packageForm.duration}
                            onChange={(e) => setPackageForm({ ...packageForm, duration: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., per month, per week"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                        <input
                          type="url"
                          value={packageForm.image_url}
                          onChange={(e) => setPackageForm({ ...packageForm, image_url: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Features (one per line)
                        </label>
                        <textarea
                          value={packageForm.features}
                          onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={5}
                          placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPackageForm(false);
                            setEditingPackage(null);
                          }}
                          className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                          {editingPackage ? 'Update Package' : 'Create Package'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {pkg.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{pkg.description}</p>
                        <p className="text-2xl font-bold text-blue-600 mb-4">${pkg.price}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPackage(pkg)}
                            className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.is_admin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.packages.name}</h3>
                        <p className="text-gray-600 mb-4">User: {booking.profiles.name}</p>
                        <p className="text-gray-600 mb-2">Email: {booking.profiles.email}</p>
                        <p className="text-gray-600">Phone: {booking.profiles.phone}</p>
                      </div>
                      <div>
                        <div className="space-y-2 mb-4">
                          <p className="text-gray-700"><span className="font-semibold">Amount:</span> ${booking.total_amount}</p>
                          <p className="text-gray-700"><span className="font-semibold">Status:</span> {booking.status}</p>
                          {booking.requested_date && (
                            <p className="text-gray-700">
                              <span className="font-semibold">Requested Date:</span> {new Date(booking.requested_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {booking.requested_date && booking.date_status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateBookingDateStatus(booking.id, 'approved')}
                              className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                              <span>Approve Date</span>
                            </button>
                            <button
                              onClick={() => handleUpdateBookingDateStatus(booking.id, 'rejected')}
                              className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              <X className="h-4 w-4" />
                              <span>Reject Date</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                {payments.map((payment) => (
                  <div key={payment.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {payment.bookings.packages.name}
                        </h3>
                        <p className="text-gray-600 mb-2">User: {payment.profiles.name}</p>
                        <p className="text-gray-600 mb-2">Email: {payment.profiles.email}</p>
                        <p className="text-2xl font-bold text-blue-600 mb-4">${payment.amount}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.payment_status === 'verified' ? 'bg-green-100 text-green-800' :
                          payment.payment_status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.payment_status}
                        </span>
                      </div>
                      <div>
                        {payment.payment_proof_url && (
                          <div className="mb-4">
                            <p className="font-semibold text-gray-900 mb-2">Payment Proof:</p>
                            <a
                              href={payment.payment_proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              View Proof
                            </a>
                          </div>
                        )}
                        {payment.payment_status === 'pending' && payment.payment_proof_url && (
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Admin notes (optional)"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              id={`notes-${payment.id}`}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  const notes = (document.getElementById(`notes-${payment.id}`) as HTMLInputElement)?.value || '';
                                  handleUpdatePaymentStatus(payment.id, 'verified', notes);
                                }}
                                className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                                <span>Verify</span>
                              </button>
                              <button
                                onClick={() => {
                                  const notes = (document.getElementById(`notes-${payment.id}`) as HTMLInputElement)?.value || '';
                                  if (notes.trim()) {
                                    handleUpdatePaymentStatus(payment.id, 'rejected', notes);
                                  } else {
                                    alert('Please provide a reason for rejection');
                                  }
                                }}
                                className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                <X className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && <SiteSettings showToast={showToast} />}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;

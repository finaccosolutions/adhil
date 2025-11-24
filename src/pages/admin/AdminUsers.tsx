import { useEffect, useState } from 'react';
import { ChevronLeft, Users, Mail, Phone, Calendar, User } from 'lucide-react';
import { Profile } from '../../types';
import { userService } from '../../services/userService';

interface AdminUsersProps {
  onNavigate: (page: string) => void;
}

export const AdminUsers = ({ onNavigate }: AdminUsersProps) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const data = await userService.getUserWithBookings(userId);
      setSelectedUser(data);
      setShowDetails(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load user details');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (showDetails && selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setShowDetails(false)}
            className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Users
          </button>

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Details</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.profile?.full_name || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{selectedUser.profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.profile?.phone || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedUser.profile?.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Total Bookings</p>
                  <p className="font-medium text-gray-900">{selectedUser.bookings?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {selectedUser.bookings && selectedUser.bookings.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Booking History</h3>
              <div className="space-y-4">
                {selectedUser.bookings.map((booking: any) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{booking.package?.title}</h4>
                        <p className="text-sm text-gray-600">{booking.package?.destination}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium">
                          {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Members</p>
                        <p className="font-medium">{booking.number_of_members}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Price</p>
                        <p className="font-medium">₹{booking.total_price}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Booked on</p>
                        <p className="font-medium">
                          {new Date(booking.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!selectedUser.bookings || selectedUser.bookings.length === 0) && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bookings yet</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users registered yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-emerald-600 font-medium">
                                {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(user.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_admin
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="text-emerald-600 hover:text-emerald-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

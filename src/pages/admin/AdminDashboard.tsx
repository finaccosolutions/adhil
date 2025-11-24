import { useEffect, useState } from 'react';
import {
  Package,
  Users,
  Calendar,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { DashboardMetrics } from '../../types';
import { bookingService } from '../../services/bookingService';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboard = ({ onNavigate }: AdminDashboardProps) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await bookingService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your trekking business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.total_bookings || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{metrics?.pending_bookings || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Confirmed</p>
                <p className="text-3xl font-bold text-green-600">{metrics?.confirmed_bookings || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Cancelled</p>
                <p className="text-3xl font-bold text-red-600">{metrics?.cancelled_bookings || 0}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Total Revenue</h3>
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="flex items-center">
              <IndianRupee className="h-8 w-8" />
              <span className="text-4xl font-bold ml-2">
                {metrics?.total_revenue.toLocaleString('en-IN') || 0}
              </span>
            </div>
            <p className="text-emerald-100 text-sm mt-2">From confirmed bookings</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Advance Collected</h3>
              <IndianRupee className="h-6 w-6" />
            </div>
            <div className="flex items-center">
              <IndianRupee className="h-8 w-8" />
              <span className="text-4xl font-bold ml-2">
                {metrics?.advance_revenue.toLocaleString('en-IN') || 0}
              </span>
            </div>
            <p className="text-blue-100 text-sm mt-2">Total advance payments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => onNavigate('admin-packages')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <Package className="h-12 w-12 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Packages</h3>
            <p className="text-gray-600">Add, edit, or remove trekking packages</p>
          </button>

          <button
            onClick={() => onNavigate('admin-bookings')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <Calendar className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Bookings</h3>
            <p className="text-gray-600">View and manage customer bookings</p>
          </button>

          <button
            onClick={() => onNavigate('admin-users')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <Users className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600">View all registered users and their bookings</p>
          </button>
        </div>
      </div>
    </div>
  );
};

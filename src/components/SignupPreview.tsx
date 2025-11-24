import { UserCircle, Mail, Phone, Edit } from 'lucide-react';

interface SignupData {
  username: string;
  email: string;
  password: string;
  phone: string;
  fullName: string;
}

interface SignupPreviewProps {
  data: SignupData;
  onEdit: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export function SignupPreview({ data, onEdit, onConfirm, loading }: SignupPreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Review Your Information</h2>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <UserCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-semibold text-gray-800">{data.fullName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <UserCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-semibold text-gray-800">{data.username}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold text-gray-800">{data.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-semibold text-gray-800">{data.phone}</p>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={onEdit}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Confirm & Create Account'}
        </button>
      </div>
    </div>
  );
}

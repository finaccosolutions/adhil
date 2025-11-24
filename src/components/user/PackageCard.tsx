import { Package } from '../../lib/supabase';
import { Calendar, MapPin, Clock, Users, Check, Eye } from 'lucide-react';

type PackageCardProps = {
  package: Package;
  onViewDetails: () => void;
  onBook: () => void;
};

export function PackageCard({ package: pkg, onViewDetails, onBook }: PackageCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const inclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions : [];
  const facilities = Array.isArray(pkg.facilities) ? pkg.facilities : [];

  return (
    <div className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {pkg.image_url ? (
        <img
          src={pkg.image_url}
          alt={pkg.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
          <MapPin className="w-16 h-16 text-white opacity-50" />
        </div>
      )}

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{pkg.destination}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(pkg.start_date)} - {formatDate(pkg.end_date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{pkg.duration_days} Days</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>Max {pkg.max_capacity} people</span>
          </div>
        </div>

        {inclusions.length > 0 && (
          <div className="mb-4 pb-4 border-b">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Inclusions:</h4>
            <div className="space-y-1">
              {inclusions.slice(0, 3).map((inclusion: string, index: number) => (
                <div key={index} className="flex items-start text-xs text-gray-600">
                  <Check className="w-3 h-3 mr-1 mt-0.5 text-green-600 flex-shrink-0" />
                  <span className="line-clamp-1">{inclusion}</span>
                </div>
              ))}
              {inclusions.length > 3 && (
                <p className="text-xs text-blue-600">+{inclusions.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="text-2xl font-bold text-gray-900">₹{pkg.price_per_head}</p>
              <p className="text-xs text-gray-500">per person</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Advance</p>
              <p className="text-xl font-bold text-green-600">₹{pkg.advance_payment}</p>
              <p className="text-xs text-gray-500">per person</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onViewDetails}
              className="flex-1 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Details
            </button>
            <button
              onClick={onBook}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

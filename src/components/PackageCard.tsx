import React from 'react';
import { Clock, IndianRupee, MapPin } from 'lucide-react';
import { Package } from '../lib/supabase';

interface PackageCardProps {
  package: Package;
  onSelect: (pkg: Package) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, onSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
      <div className="relative h-64 overflow-hidden">
        <img
          src={pkg.images[0] || 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={pkg.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
          <div className="flex items-center gap-1">
            <IndianRupee className="h-4 w-4" />
            <span>{pkg.price}</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-3 text-gray-800">{pkg.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-700">
            <Clock className="h-5 w-5 mr-2 text-emerald-600" />
            <span className="font-medium">{pkg.duration}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
            <span className="font-medium">Kerala</span>
          </div>
        </div>
        <button
          onClick={() => onSelect(pkg)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default PackageCard;

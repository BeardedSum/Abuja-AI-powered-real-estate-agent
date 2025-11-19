import { Link } from 'react-router-dom';
import type { Property } from '../types';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from 'react-icons/fa';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const primaryImage = property.media?.find((m) => m.media_type === 'image')?.url || '/placeholder-property.jpg';

  return (
    <Link to={`/properties/${property.id}`} className="block">
      <div className="card hover:shadow-lg transition-shadow duration-200">
        {/* Image */}
        <div className="relative h-48 rounded-t-lg overflow-hidden">
          <img
            src={primaryImage}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {property.property_type}
          </div>
          {property.status !== 'available' && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {property.status}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {formatPrice(property.price)}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-3">
            <FaMapMarkerAlt className="mr-2 text-primary-500" />
            <span className="text-sm">{property.neighborhood}, Abuja</span>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center">
                <FaBed className="mr-1 text-gray-400" />
                <span>{property.bedrooms} beds</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <FaBath className="mr-1 text-gray-400" />
                <span>{property.bathrooms} baths</span>
              </div>
            )}
            {property.size_sqm && (
              <div className="flex items-center">
                <FaRulerCombined className="mr-1 text-gray-400" />
                <span>{property.size_sqm} m²</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {property.description}
          </p>

          {/* Features Tags */}
          {property.features && property.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {property.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {feature}
                </span>
              ))}
              {property.features.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{property.features.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

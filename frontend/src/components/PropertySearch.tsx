import { useState } from 'react';
import { useProperties } from '../hooks/useProperties';
import { PropertyCard } from './PropertyCard';
import { PropertyType } from '../types';
import { FaSearch, FaFilter } from 'react-icons/fa';

const ABUJA_NEIGHBORHOODS = [
  'Maitama',
  'Asokoro',
  'Gwarinpa',
  'Wuse',
  'Wuse 2',
  'Jabi',
  'Katampe',
  'Lokogoma',
  'Lugbe',
  'Kubwa',
  'Nyanya',
  'Karu',
  'Jikwoyi',
  'Apo',
  'Galadimawa',
  'CBD',
];

export function PropertySearch() {
  const [filters, setFilters] = useState({
    property_type: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    bathrooms: '',
    neighborhood: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useProperties({
    property_type: filters.property_type as PropertyType | undefined,
    min_price: filters.min_price ? parseFloat(filters.min_price) : undefined,
    max_price: filters.max_price ? parseFloat(filters.max_price) : undefined,
    bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : undefined,
    bathrooms: filters.bathrooms ? parseInt(filters.bathrooms) : undefined,
    neighborhood: filters.neighborhood || undefined,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      property_type: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      bathrooms: '',
      neighborhood: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Find Your Property in Abuja
        </h1>
        <p className="text-gray-600">
          Browse {data?.total || 0} available properties
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-4 items-center">
          {/* Neighborhood Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <select
                value={filters.neighborhood}
                onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
                className="input-field pl-10"
              >
                <option value="">All Neighborhoods</option>
                {ABUJA_NEIGHBORHOODS.map((neighborhood) => (
                  <option key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center gap-2"
          >
            <FaFilter />
            Filters
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                value={filters.property_type}
                onChange={(e) => handleFilterChange('property_type', e.target.value)}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="house">House</option>
                <option value="flat">Flat/Apartment</option>
                <option value="duplex">Duplex</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price (₦)
              </label>
              <input
                type="number"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                placeholder="e.g., 10000000"
                className="input-field"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price (₦)
              </label>
              <input
                type="number"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                placeholder="e.g., 100000000"
                className="input-field"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="input-field"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <select
                value={filters.bathrooms}
                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                className="input-field"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end md:col-span-3 lg:col-span-5">
              <button onClick={clearFilters} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-4">Loading properties...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading properties. Please try again.
        </div>
      )}

      {data && data.properties.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No properties found matching your criteria.</p>
          <button onClick={clearFilters} className="btn-primary mt-4">
            Clear Filters
          </button>
        </div>
      )}

      {data && data.properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

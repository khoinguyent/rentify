import React from 'react';

interface Unit {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  available: boolean;
}

interface Property {
  units?: Unit[];
}

interface PropertyUnitsProps {
  property: Property;
}

export function PropertyUnits({ property }: PropertyUnitsProps) {
  if (!property.units || property.units.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Units</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Unit</th>
              <th className="px-4 py-3 text-left font-medium">Bedrooms</th>
              <th className="px-4 py-3 text-left font-medium">Bathrooms</th>
              <th className="px-4 py-3 text-left font-medium">Rent</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {property.units.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-800 font-medium">{unit.name}</td>
                <td className="px-4 py-3 text-gray-600">{unit.bedrooms}</td>
                <td className="px-4 py-3 text-gray-600">{unit.bathrooms}</td>
                <td className="px-4 py-3 text-gray-800 font-medium">
                  ${unit.rent.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {unit.available ? (
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Occupied
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


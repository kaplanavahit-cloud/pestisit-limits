// components/CountrySidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Country {
  id: string;
  name: string;
  flag_emoji?: string;
  limit_count?: number;
}

interface CountrySidebarProps {
  onSelectCountry: (countryId: string) => void;
  selectedCountry: string | null;
}

export default function CountrySidebar({ onSelectCountry, selectedCountry }: CountrySidebarProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    // Ülkeleri ve her ülke için limit sayısını çek
    const { data, error } = await supabase
      .from('countries')
      .select('id, name, flag_emoji')
      .order('name');

    if (error) {
      console.error('Ülkeler yüklenemedi:', error);
      return;
    }

    // Her ülke için limit sayısını ayrı çek
    const countriesWithCounts = await Promise.all(
      (data || []).map(async (country) => {
        const { count, error: countError } = await supabase
          .from('country_limits')
          .select('*', { count: 'exact', head: true })
          .eq('country_id', country.id);

        return {
          ...country,
          limit_count: count || 0,
        };
      })
    );

    setCountries(countriesWithCounts);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="font-bold text-lg mb-4">Ülkeler</h2>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 h-12 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-bold text-lg mb-4 border-b pb-2">Ülkelere Göre Ara</h2>
      <p className="text-sm text-gray-500 mb-4">
        Bir ülkeye tıklayın, o ülkeye özel arama paneli açılır.
      </p>
      
      <div className="space-y-2">
        {countries.map((country) => (
          <button
            key={country.id}
            onClick={() => onSelectCountry(country.id)}
            className={`w-full text-left p-3 rounded-lg transition flex items-center justify-between hover:bg-blue-50 ${
              selectedCountry === country.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{country.flag_emoji || '🌍'}</span>
              <span className="font-medium">{country.name}</span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              {country.limit_count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}